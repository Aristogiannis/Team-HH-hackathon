export interface TaskDoc {
  id: string;
  title: string;
  keywords: string[];
  category: string;
  content: string;
}

export const tasks: TaskDoc[] = [
  // Add your car mechanics documentation entries here.
  // Each entry should follow this structure:
  //
  // {
  //   id: "unique-task-id",
  //   title: "Human-Readable Task Name",     ← Fuse.js searches this (weight: 3)
  //   keywords: ["related", "terms", "..."], ← Fuse.js searches this (weight: 2)
  //   category: "category-name",             ← Fuse.js searches this (weight: 1)
  //   content: `...paste your full markdown documentation here...`,
  // },
];
