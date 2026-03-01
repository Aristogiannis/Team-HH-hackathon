import Fuse from "fuse.js";
import { type TaskDoc, tasks } from "../data/knowledge-base";

const fuse = new Fuse<TaskDoc>(tasks, {
	keys: [
		{ name: "title", weight: 3 },
		{ name: "keywords", weight: 2 },
		{ name: "category", weight: 1 },
	],
	threshold: 0.4,
	includeScore: true,
});

export function searchTaskDocs(description: string): {
	found: boolean;
	title?: string;
	steps: string;
} {
	const results = fuse.search(description);

	if (
		results.length === 0 ||
		(results[0].score !== undefined && results[0].score > 0.6)
	) {
		return {
			found: false,
			steps:
				"No matching documentation found for this task. Ask the user to describe what they are working on more specifically.",
		};
	}

	const task = results[0].item;
	return {
		found: true,
		title: task.title,
		steps: task.content,
	};
}
