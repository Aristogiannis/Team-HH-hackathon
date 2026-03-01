import Fuse from "fuse.js";
import { type TaskDoc, tasks } from "../data/knowledge-base";
import taskEmbeddings from "../data/task-embeddings.json";

// ── Types ──────────────────────────────────────────────────────────────────

interface TaskEmbedding {
  id: string;
  title: string;
  vector: number[];
}

export interface SearchResult {
  found: boolean;
  title?: string;
  steps: string;
  /** How the match was made — useful for debugging */
  matchMethod?: "vector" | "fuse" | "direct";
  /** Cosine similarity score when vector search was used (0-1, higher=better) */
  similarity?: number;
  /** Extra candidates the model can mention if the first one isn't right */
  alternatives?: string[];
  /** Available task titles so the model knows what it can look up */
  availableTasks?: string[];
}

// ── Pre-computed embeddings ────────────────────────────────────────────────

const embeddings: TaskEmbedding[] = taskEmbeddings as TaskEmbedding[];

// ── Fast lookup: task id → full TaskDoc ────────────────────────────────────

const taskById = new Map<string, TaskDoc>();
for (const t of tasks) {
  taskById.set(t.id, t);
}

// ── Fuse.js index (synchronous fallback) ───────────────────────────────────

const fuse = new Fuse<TaskDoc>(tasks, {
  keys: [
    { name: "title", weight: 3 },
    { name: "keywords", weight: 2 },
    { name: "category", weight: 1 },
  ],
  threshold: 0.5,
  includeScore: true,
  ignoreLocation: true,
  minMatchCharLength: 2,
});

// ── Cosine similarity ──────────────────────────────────────────────────────

function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 0 : dot / denom;
}

// ── Embed a query string via server-side API route ─────────────────────────

async function embedQuery(text: string): Promise<number[] | null> {
  try {
    const res = await fetch("/api/embed", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    if (!res.ok) {
      console.warn(
        `[search] /api/embed returned ${res.status}:`,
        await res.text().catch(() => ""),
      );
      return null;
    }
    const data = await res.json();
    return data.embedding ?? null;
  } catch (err) {
    console.warn("[search] embedQuery failed, falling back to Fuse.js:", err);
    return null;
  }
}

// ── Strategy 1: Vector search (semantic) ───────────────────────────────────

async function vectorSearch(description: string): Promise<SearchResult | null> {
  if (embeddings.length === 0) return null;

  const queryVec = await embedQuery(description);
  if (!queryVec) return null;

  const scored = embeddings
    .map((entry) => ({
      id: entry.id,
      title: entry.title,
      similarity: cosineSimilarity(queryVec, entry.vector),
    }))
    .sort((a, b) => b.similarity - a.similarity);

  const best = scored[0];

  console.log(
    "[search] Vector results (top 5):",
    scored.slice(0, 5).map((s) => `${s.similarity.toFixed(3)} ${s.title}`),
  );

  // Threshold: text-embedding-3-small typically gives >0.35 for good matches
  if (best.similarity < 0.3) {
    return {
      found: false,
      matchMethod: "vector",
      similarity: best.similarity,
      steps:
        "No matching documentation found via semantic search. Ask the user to describe the task more specifically, or pick one of the available tasks.",
      availableTasks: tasks.map((t) => t.title),
    };
  }

  const task = taskById.get(best.id);
  if (!task) return null; // should never happen

  const alternatives = scored
    .slice(1, 4)
    .filter((s) => s.similarity >= 0.3)
    .map((s) => s.title);

  return {
    found: true,
    matchMethod: "vector",
    similarity: best.similarity,
    title: task.title,
    steps: task.content,
    ...(alternatives.length > 0 ? { alternatives } : {}),
  };
}

// ── Strategy 2: Direct substring match (instant, zero-cost) ────────────────

function directMatch(description: string): TaskDoc | null {
  const lower = description.toLowerCase();
  let bestTask: TaskDoc | null = null;
  let bestMatchLen = 0;

  for (const task of tasks) {
    // Exact title substring — instant win
    if (lower.includes(task.title.toLowerCase())) {
      return task;
    }

    // Keyword substring match — keep the longest (most specific) match
    for (const kw of task.keywords) {
      const kwLower = kw.toLowerCase();
      if (
        kwLower.length > 2 &&
        lower.includes(kwLower) &&
        kwLower.length > bestMatchLen
      ) {
        bestMatchLen = kwLower.length;
        bestTask = task;
      }
    }
  }

  return bestMatchLen >= 4 ? bestTask : null;
}

// ── Strategy 3: Fuse.js fuzzy search (synchronous fallback) ────────────────

function fuseSearch(description: string): SearchResult {
  const results = fuse.search(description);

  // Also search individual meaningful words
  const words = description
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2);

  const scoredMap = new Map<string, { score: number; item: TaskDoc }>();

  for (const r of results) {
    scoredMap.set(r.item.id, { score: r.score ?? 1, item: r.item });
  }

  for (const word of words) {
    for (const r of fuse.search(word).slice(0, 5)) {
      const score = r.score ?? 1;
      const existing = scoredMap.get(r.item.id);
      if (!existing) {
        scoredMap.set(r.item.id, { score: score * 1.1, item: r.item });
      } else {
        // Boost tasks matching multiple words
        scoredMap.set(r.item.id, {
          score: Math.min(existing.score, score) * 0.8,
          item: r.item,
        });
      }
    }
  }

  const candidates = [...scoredMap.values()]
    .sort((a, b) => a.score - b.score)
    .slice(0, 5);

  if (candidates.length === 0 || candidates[0].score > 0.75) {
    return {
      found: false,
      matchMethod: "fuse",
      steps:
        "No matching documentation found. Ask the user to describe what they are working on more specifically, or pick one of the available tasks.",
      availableTasks: tasks.map((t) => t.title),
    };
  }

  const best = candidates[0];
  const alternatives = candidates
    .slice(1, 4)
    .filter((c) => c.score <= 0.75)
    .map((c) => c.item.title);

  return {
    found: true,
    matchMethod: "fuse",
    title: best.item.title,
    steps: best.item.content,
    ...(alternatives.length > 0 ? { alternatives } : {}),
  };
}

// ── Main search function ───────────────────────────────────────────────────
//
// Search order:
//   1. Direct keyword/title substring match (instant, guaranteed accurate)
//   2. Vector cosine similarity via OpenAI embeddings (semantic understanding)
//   3. Fuse.js fuzzy search (synchronous fallback if embeddings are unavailable)
//

export async function searchTaskDocs(
  description: string,
): Promise<SearchResult> {
  if (!description || description.trim().length === 0) {
    return {
      found: false,
      steps:
        "No description provided. Ask the user what task they need help with.",
      availableTasks: tasks.map((t) => t.title),
    };
  }

  const query = description.trim();

  // ── 1. Direct match — zero cost, catches obvious keyword hits ────
  const direct = directMatch(query);
  if (direct) {
    console.log("[search] Direct match hit:", direct.title);
    return {
      found: true,
      matchMethod: "direct",
      title: direct.title,
      steps: direct.content,
    };
  }

  // ── 2. Vector search — semantic understanding ────────────────────
  try {
    const vectorResult = await vectorSearch(query);
    if (vectorResult) {
      console.log(
        `[search] Vector search ${vectorResult.found ? "hit" : "miss"}:`,
        vectorResult.title ?? "(none)",
        `(similarity: ${vectorResult.similarity?.toFixed(3)})`,
      );
      return vectorResult;
    }
  } catch (err) {
    console.warn(
      "[search] Vector search failed, falling back to Fuse.js:",
      err,
    );
  }

  // ── 3. Fuse.js — synchronous fallback ───────────────────────────
  console.log("[search] Using Fuse.js fallback for:", query);
  return fuseSearch(query);
}
