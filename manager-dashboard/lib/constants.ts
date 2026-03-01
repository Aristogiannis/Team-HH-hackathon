import type { KBCategory, EngineerStatus, SessionStatus, TaskPriority, AssignmentStatus } from "./types";

export const CATEGORY_COLORS: Record<KBCategory, { bg: string; text: string; border: string }> = {
  engine:         { bg: "bg-orange-500/10", text: "text-orange-400", border: "border-orange-500/20" },
  brakes:         { bg: "bg-red-500/10",    text: "text-red-400",    border: "border-red-500/20" },
  tyres:          { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/20" },
  dashboard:      { bg: "bg-purple-500/10",  text: "text-purple-400",  border: "border-purple-500/20" },
  exterior:       { bg: "bg-sky-500/10",     text: "text-sky-400",     border: "border-sky-500/20" },
  electrical:     { bg: "bg-yellow-500/10",  text: "text-yellow-400",  border: "border-yellow-500/20" },
  "slk-specific": { bg: "bg-blue-500/10",    text: "text-blue-400",    border: "border-blue-500/20" },
};

export const CATEGORY_LABELS: Record<KBCategory, string> = {
  engine: "Engine",
  brakes: "Brakes",
  tyres: "Tyres",
  dashboard: "Dashboard",
  exterior: "Exterior",
  electrical: "Electrical",
  "slk-specific": "SLK Special",
};

export const STATUS_COLORS: Record<EngineerStatus, { bg: string; text: string; dot: string }> = {
  online:  { bg: "bg-green-500/10", text: "text-green-400", dot: "bg-green-400" },
  offline: { bg: "bg-slate-500/10", text: "text-slate-400", dot: "bg-slate-500" },
  busy:    { bg: "bg-amber-500/10", text: "text-amber-400", dot: "bg-amber-400" },
};

export const SESSION_STATUS_COLORS: Record<SessionStatus, { bg: string; text: string }> = {
  active:    { bg: "bg-green-500/10", text: "text-green-400" },
  paused:    { bg: "bg-amber-500/10", text: "text-amber-400" },
  completed: { bg: "bg-blue-500/10",  text: "text-blue-400" },
};

export const PRIORITY_COLORS: Record<TaskPriority, { bg: string; text: string }> = {
  high:   { bg: "bg-red-500/10",   text: "text-red-400" },
  medium: { bg: "bg-amber-500/10", text: "text-amber-400" },
  low:    { bg: "bg-blue-500/10",  text: "text-blue-400" },
};

export const ASSIGNMENT_STATUS_COLORS: Record<AssignmentStatus, { bg: string; text: string }> = {
  pending:       { bg: "bg-slate-500/10", text: "text-slate-400" },
  "in-progress": { bg: "bg-blue-500/10",  text: "text-blue-400" },
  completed:     { bg: "bg-green-500/10", text: "text-green-400" },
  overdue:       { bg: "bg-red-500/10",   text: "text-red-400" },
};
