#!/usr/bin/env bun
/**
 * Generate vector embeddings for every task in the knowledge base.
 *
 * Usage:
 *   bun run scripts/generate-embeddings.ts
 *
 * Requires OPENAI_API_KEY in the environment (reads .env automatically via bun).
 * Writes output to data/task-embeddings.json
 */

import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { writeFileSync } from "node:fs";
import OpenAI from "openai";
import { tasks } from "../data/knowledge-base";

const MODEL = "text-embedding-3-small";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const OUT_PATH = resolve(__dirname, "../data/task-embeddings.json");

async function main() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error("❌  OPENAI_API_KEY is not set. Add it to your .env file.");
    process.exit(1);
  }

  const openai = new OpenAI({ apiKey });

  console.log(`📦  Embedding ${tasks.length} tasks with ${MODEL}...\n`);

  // Build a rich text blob for each task that captures what a user might say
  const inputs = tasks.map((task) => {
    const keywordStr = task.keywords.join(", ");
    // Take the first ~500 chars of content so the embedding captures the substance
    const contentSnippet = task.content.slice(0, 500);
    return [
      `Title: ${task.title}`,
      `Category: ${task.category}`,
      `Keywords: ${keywordStr}`,
      `Content: ${contentSnippet}`,
    ].join("\n");
  });

  // OpenAI supports batching — send all at once (well within the limit for 19 items)
  const response = await openai.embeddings.create({
    model: MODEL,
    input: inputs,
  });

  const embeddings = response.data;

  if (embeddings.length !== tasks.length) {
    console.error(
      `❌  Expected ${tasks.length} embeddings but got ${embeddings.length}`,
    );
    process.exit(1);
  }

  // Sort by index to guarantee order matches tasks array
  embeddings.sort((a, b) => a.index - b.index);

  const output = tasks.map((task, i) => ({
    id: task.id,
    title: task.title,
    vector: embeddings[i].embedding,
  }));

  writeFileSync(OUT_PATH, JSON.stringify(output, null, 2), "utf-8");

  const fileSizeKB = (Buffer.byteLength(JSON.stringify(output)) / 1024).toFixed(
    1,
  );
  const dims = embeddings[0].embedding.length;

  console.log(`✅  Wrote ${output.length} embeddings to ${OUT_PATH}`);
  console.log(`    Dimensions: ${dims}`);
  console.log(`    File size:  ${fileSizeKB} KB`);
  console.log(
    `    Tokens used: ${response.usage?.total_tokens ?? "unknown"}\n`,
  );

  // Quick sanity check: print first 5 task titles with their vector norms
  console.log("Sanity check (vector L2 norms):");
  for (const entry of output.slice(0, 5)) {
    const norm = Math.sqrt(
      entry.vector.reduce((sum: number, v: number) => sum + v * v, 0),
    );
    console.log(`  ${norm.toFixed(4)}  ${entry.title}`);
  }
}

main().catch((err) => {
  console.error("❌  Fatal error:", err);
  process.exit(1);
});
