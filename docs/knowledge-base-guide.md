# Knowledge Base Guide

## Structure

All task documentation lives in `data/knowledge-base.ts`. Each task is a `TaskDoc` object:

```typescript
interface TaskDoc {
  id: string;          // e.g. "check-engine-oil"
  title: string;       // e.g. "Check and Top Up Engine Oil"
  keywords: string[];  // search terms: ["oil", "dipstick", "engine oil", ...]
  category: string;    // "engine" | "brakes" | "tyres" | "dashboard" | "exterior" | "electrical" | "slk-specific"
  content: string;     // Full markdown-style guide with steps, specs, warnings, tips
}
```

## Current Tasks (19)

| Category | Tasks |
|---|---|
| Engine | Check and Top Up Engine Oil, Change Engine Oil and Oil Filter, Check and Top Up Coolant, Replace Engine Air Filter, Replace Spark Plugs, Inspect and Replace Serpentine Belt |
| Brakes | Check Brake Fluid Level, Inspect Brake Pads and Discs |
| Tyres | Check and Adjust Tyre Pressure, Change a Flat Tyre |
| Dashboard | Dashboard Warning Lights Explained, Reset Service Indicator |
| Exterior | Replace Headlight Bulb, Replace Tail Light or Brake Light Bulb |
| Electrical | Fuse Box Locations and Common Fuses, Check Car Battery and Jump Start |
| SLK-specific | Operate the Retractable Vario Roof, SLK 200 Vehicle Specifications and Overview |

## Adding a New Task

1. Add a new `TaskDoc` entry to the `tasks` array in `data/knowledge-base.ts`
2. Use rich content with numbered steps, specs, and warnings
3. Include relevant keywords for search matching
4. Regenerate embeddings:
   ```bash
   bun run scripts/generate-embeddings.ts
   ```
5. Add the task title to the `AVAILABLE_TASKS` array in `app/api/session/route.ts` so the AI knows it exists

## Embedding Generation

The script `scripts/generate-embeddings.ts` creates vector embeddings for each task:

- Model: `text-embedding-3-small` (1536 dimensions)
- Input: concatenation of title, category, keywords, and first 500 chars of content
- Output: `data/task-embeddings.json`
- All tasks are embedded in a single batched API call

## Search Pipeline

`lib/search-tasks.ts` implements a 3-tier search:

1. **Direct match** — checks if the query contains a task title or keyword as a substring. Zero-cost, catches obvious hits.
2. **Vector search** — embeds the query via `/api/embed`, computes cosine similarity against pre-computed task vectors. Threshold: 0.3. Returns top match + up to 3 alternatives.
3. **Fuse.js fuzzy** — weighted fuzzy search (title 3x, keywords 2x, category 1x). Threshold: 0.5. Used as synchronous fallback when embeddings are unavailable.

## Adapting to a New Domain

To use Weldy for a different vehicle or domain:

1. Replace the tasks in `data/knowledge-base.ts` with your domain knowledge
2. Update the system prompt in `app/api/session/route.ts` (change "Mercedes-Benz SLK 200" references)
3. Update `AVAILABLE_TASKS` in the same file
4. Regenerate embeddings: `npm run embed`
5. Update the manager dashboard's mock data in `manager-dashboard/lib/mock-data.ts` if needed
