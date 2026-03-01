export type EngineerStatus = "online" | "offline" | "busy";
export type SessionStatus = "active" | "completed" | "paused";
export type TaskPriority = "high" | "medium" | "low";
export type AssignmentStatus = "pending" | "in-progress" | "completed" | "overdue";
export type KBCategory = "engine" | "brakes" | "tyres" | "dashboard" | "exterior" | "electrical" | "slk-specific";

export interface Engineer {
  id: string;
  name: string;
  initials: string;
  status: EngineerStatus;
  currentTaskId: string | null;
  phone: string;
  specialties: KBCategory[];
  tasksCompletedToday: number;
  totalTasksCompleted: number;
  avgCompletionMinutes: number;
  joinedDate: string;
}

export interface WeldySession {
  id: string;
  engineerId: string;
  engineerName: string;
  taskId: string;
  taskTitle: string;
  taskCategory: KBCategory;
  startTime: string;
  endTime: string | null;
  status: SessionStatus;
  currentStep: number;
  totalSteps: number;
  lastActivity: string;
  currentStepText?: string;
  nextStepText?: string;
}

export interface TaskAssignment {
  id: string;
  taskId: string;
  taskTitle: string;
  engineerId: string;
  engineerName: string;
  priority: TaskPriority;
  status: AssignmentStatus;
  assignedAt: string;
  dueDate: string;
  completedAt: string | null;
  notes: string;
}

export interface KnowledgeBaseItem {
  id: string;
  title: string;
  category: KBCategory;
  keywords: string[];
  content: string;
  totalSteps: number;
  estimatedMinutes: number;
  lastUpdated: string;
  updatedBy: string;
}

export interface DashboardMetrics {
  activeSessions: number;
  completedToday: number;
  avgCompletionMinutes: number;
  successRate: number;
  engineersOnline: number;
  engineersTotal: number;
  tasksInQueue: number;
  overdueAssignments: number;
}

export interface ActivityEvent {
  id: string;
  type: "session_started" | "session_completed" | "task_assigned" | "engineer_online" | "engineer_offline" | "kb_updated";
  message: string;
  timestamp: string;
  engineerName?: string;
  taskTitle?: string;
}
