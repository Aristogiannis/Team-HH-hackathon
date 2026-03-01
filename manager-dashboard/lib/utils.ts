export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export function formatDurationFromMs(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function timeAgo(isoDate: string): string {
  const now = Date.now();
  const then = new Date(isoDate).getTime();
  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function renderMarkdown(md: string): string {
  return md
    .replace(/^## (.+)$/gm, '<h2 class="text-lg font-bold mt-4 mb-2 text-slate-100">$1</h2>')
    .replace(/^### (.+)$/gm, '<h3 class="text-md font-semibold mt-3 mb-1 text-slate-200">$1</h3>')
    .replace(/\*\*(.+?)\*\*/g, '<strong class="text-slate-100">$1</strong>')
    .replace(/`(.+?)`/g, '<code class="bg-slate-800 px-1 rounded text-sm text-blue-300">$1</code>')
    .replace(/^(\d+)\. (.+)$/gm, '<div class="flex gap-3 ml-2 my-1"><span class="text-blue-400 font-mono text-sm min-w-[1.5rem]">$1.</span><span>$2</span></div>')
    .replace(/^- (.+)$/gm, '<div class="flex gap-2 ml-4 my-0.5"><span class="text-slate-500">-</span><span>$1</span></div>')
    .replace(/\n\n/g, '<div class="h-3"></div>');
}

export function countSteps(content: string): number {
  const matches = content.match(/^\d+\./gm);
  return matches ? matches.length : 0;
}

export function extractSteps(content: string): string[] {
  const steps: string[] = [];
  const regex = /^\d+\.\s+(.+)$/gm;
  let match;
  while ((match = regex.exec(content)) !== null) {
    steps.push(match[1]);
  }
  return steps;
}
