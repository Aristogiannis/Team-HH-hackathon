"use client";

import { useState, useEffect } from "react";
import {
  engineers,
  sessions,
  assignments,
  knowledgeBase,
} from "@/lib/mock-data";
import type { Engineer, WeldySession, TaskAssignment } from "@/lib/types";
import { formatDurationFromMs } from "@/lib/utils";
import { extractSteps } from "@/lib/utils";
import {
  CATEGORY_COLORS,
  CATEGORY_LABELS,
  STATUS_COLORS,
  PRIORITY_COLORS,
} from "@/lib/constants";
import {
  Clock,
  Filter,
  ArrowRight,
  ChevronRight,
  CircleDot,
  CircleDashed,
  Calendar,
} from "lucide-react";

type ViewFilter = "all" | "active" | "idle" | "offline";

function EngineerPipelineCard({
  engineer,
  now,
  allSessions,
}: {
  engineer: Engineer;
  now: number;
  allSessions: WeldySession[];
}) {
  const activeSession = allSessions.find(
    (s) =>
      s.engineerId === engineer.id &&
      (s.status === "active" || s.status === "paused")
  );

  const pendingAssignments = assignments
    .filter((a) => a.engineerId === engineer.id && a.status === "pending")
    .sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      const pDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (pDiff !== 0) return pDiff;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });

  const nextTask: TaskAssignment | undefined = pendingAssignments[0];

  // If no active session, render a compact idle/offline card
  if (!activeSession) {
    const statusColors = STATUS_COLORS[engineer.status];
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-colors">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
              engineer.status === "online"
                ? "bg-green-500/20 text-green-400"
                : "bg-slate-700 text-slate-400"
            }`}
          >
            {engineer.initials}
          </div>
          <div className="flex-1">
            <div className="text-sm font-semibold text-slate-200">
              {engineer.name}
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span
                className={`w-2 h-2 rounded-full ${statusColors.dot}`}
              />
              <span
                className={`text-[11px] font-medium capitalize ${statusColors.text}`}
              >
                {engineer.status}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-3 text-xs text-slate-500 italic">
          No active session
        </div>

        {nextTask && (
          <div className="mt-3 pt-3 border-t border-slate-800">
            <div className="text-[10px] uppercase tracking-wide text-slate-500 mb-1.5">
              Up Next
            </div>
            <NextTaskRow task={nextTask} />
          </div>
        )}
      </div>
    );
  }

  // Active session — full pipeline card
  // Prefer dynamic step text from live sessions, fall back to KB lookup for mock data
  const kbItem = knowledgeBase.find((kb) => kb.id === activeSession.taskId);
  const steps = kbItem ? extractSteps(kbItem.content) : [];
  const currentStepText =
    activeSession.currentStepText || steps[activeSession.currentStep - 1] || "In progress...";
  const nextStepText =
    activeSession.currentStep < activeSession.totalSteps
      ? activeSession.nextStepText || steps[activeSession.currentStep] || "Next step..."
      : null;
  const isLastStep =
    activeSession.currentStep >= activeSession.totalSteps;

  const elapsed = now
    ? now - new Date(activeSession.startTime).getTime()
    : 0;
  const progress =
    (activeSession.currentStep / activeSession.totalSteps) * 100;
  const defaultCatColors = { bg: "bg-slate-500/10", text: "text-slate-400", border: "border-slate-500/20" };
  const catColors = CATEGORY_COLORS[activeSession.taskCategory] || defaultCatColors;
  const catLabel = CATEGORY_LABELS[activeSession.taskCategory] || activeSession.taskCategory;

  const borderColor =
    activeSession.status === "active"
      ? "border-green-500/30"
      : "border-amber-500/30";

  const statusDotColor =
    activeSession.status === "active" ? "bg-green-400" : "bg-amber-400";

  const statusTextColor =
    activeSession.status === "active"
      ? "text-green-400"
      : "text-amber-400";

  return (
    <div
      className={`bg-slate-900 border ${borderColor} rounded-xl p-5 hover:bg-slate-800/30 transition-colors`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-500/20 rounded-full flex items-center justify-center text-sm font-bold text-amber-400">
            {activeSession.engineerName?.slice(0, 2).toUpperCase() || engineer.initials}
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-200">
              {activeSession.engineerName || engineer.name}
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="relative flex h-2 w-2">
                {activeSession.status === "active" && (
                  <span
                    className={`animate-ping absolute inline-flex h-full w-full rounded-full ${statusDotColor} opacity-75`}
                  />
                )}
                <span
                  className={`relative inline-flex rounded-full h-2 w-2 ${statusDotColor}`}
                />
              </span>
              <span
                className={`text-[11px] font-medium ${statusTextColor}`}
              >
                {activeSession.status}
              </span>
            </div>
          </div>
        </div>

        <div className="text-right">
          <div className="flex items-center gap-1.5 text-slate-400 justify-end">
            <Clock className="w-3.5 h-3.5" />
            <span className="text-sm font-mono">
              {formatDurationFromMs(elapsed)}
            </span>
          </div>
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium mt-1 ${catColors.bg} ${catColors.text}`}
          >
            {catLabel}
          </span>
        </div>
      </div>

      {/* Task title */}
      <div className="text-sm font-medium text-slate-200 mb-4">
        {activeSession.taskTitle}
      </div>

      {/* Step Pipeline */}
      <div className="flex items-stretch gap-3 mb-4">
        {/* Current Step */}
        <div className="flex-1 bg-slate-800/60 border-l-2 border-blue-500 rounded-lg p-3">
          <div className="flex items-center gap-1.5 mb-1.5">
            <CircleDot className="w-3 h-3 text-blue-400" />
            <span className="text-[10px] uppercase tracking-wide font-semibold text-blue-400">
              Current Step
            </span>
          </div>
          <div className="text-xs text-slate-200 leading-relaxed">
            <span className="text-blue-400 font-mono font-semibold mr-1.5">
              {activeSession.currentStep}.
            </span>
            {currentStepText.length > 120
              ? currentStepText.slice(0, 120) + "..."
              : currentStepText}
          </div>
        </div>

        {/* Arrow */}
        <div className="flex items-center text-slate-600">
          <ArrowRight className="w-5 h-5" />
        </div>

        {/* Next Step */}
        <div className="flex-1 bg-slate-800/30 border-l-2 border-slate-700 rounded-lg p-3">
          <div className="flex items-center gap-1.5 mb-1.5">
            <CircleDashed className="w-3 h-3 text-slate-500" />
            <span className="text-[10px] uppercase tracking-wide font-semibold text-slate-500">
              Next Step
            </span>
          </div>
          {isLastStep ? (
            <div className="text-xs text-slate-500 italic">
              Final step — completing task
            </div>
          ) : (
            <div className="text-xs text-slate-400 leading-relaxed">
              <span className="text-slate-500 font-mono font-semibold mr-1.5">
                {activeSession.currentStep + 1}.
              </span>
              {nextStepText && nextStepText.length > 120
                ? nextStepText.slice(0, 120) + "..."
                : nextStepText}
            </div>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs text-slate-400">
            Step {activeSession.currentStep} of {activeSession.totalSteps}
          </span>
          <span className="text-xs text-slate-500 font-mono">
            {Math.round(progress)}%
          </span>
        </div>
        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Up Next Task */}
      <div className="pt-3 border-t border-slate-800">
        <div className="text-[10px] uppercase tracking-wide text-slate-500 mb-1.5 flex items-center gap-1">
          <ChevronRight className="w-3 h-3" />
          Up Next
        </div>
        {nextTask ? (
          <NextTaskRow task={nextTask} />
        ) : (
          <div className="text-xs text-slate-600 italic">
            No pending tasks in queue
          </div>
        )}
      </div>
    </div>
  );
}

function NextTaskRow({ task }: { task: TaskAssignment }) {
  const priorityColors = PRIORITY_COLORS[task.priority];
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-xs text-slate-300 truncate">
          {task.taskTitle}
        </span>
        <span
          className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium capitalize shrink-0 ${priorityColors.bg} ${priorityColors.text}`}
        >
          {task.priority}
        </span>
      </div>
      <div className="flex items-center gap-1 text-[11px] text-slate-500 shrink-0 ml-2">
        <Calendar className="w-3 h-3" />
        {task.dueDate}
      </div>
    </div>
  );
}

export default function MonitorPage() {
  const [now, setNow] = useState(0);
  const [filter, setFilter] = useState<ViewFilter>("all");
  const [liveSessions, setLiveSessions] = useState<WeldySession[]>([]);

  useEffect(() => {
    setNow(Date.now());
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Poll live sessions from the API
  useEffect(() => {
    const poll = async () => {
      try {
        const res = await fetch("/api/sessions");
        const data = await res.json();
        if (Array.isArray(data)) setLiveSessions(data);
      } catch {}
    };
    poll();
    const timer = setInterval(poll, 3000);
    return () => clearInterval(timer);
  }, []);

  // Merge live sessions with mock sessions — live data takes priority
  const allSessions = [...sessions];
  for (const live of liveSessions) {
    const idx = allSessions.findIndex(
      (s) =>
        s.engineerId === live.engineerId &&
        (s.status === "active" || s.status === "paused")
    );
    if (idx >= 0) {
      allSessions[idx] = live;
    } else {
      allSessions.push(live);
    }
  }

  const filteredEngineers = engineers.filter((eng) => {
    if (filter === "all") return true;
    if (filter === "active") {
      return allSessions.some(
        (s) =>
          s.engineerId === eng.id &&
          (s.status === "active" || s.status === "paused")
      );
    }
    if (filter === "idle") {
      return (
        eng.status === "online" &&
        !allSessions.some(
          (s) =>
            s.engineerId === eng.id &&
            (s.status === "active" || s.status === "paused")
        )
      );
    }
    if (filter === "offline") return eng.status === "offline";
    return true;
  });

  const filters: { label: string; value: ViewFilter }[] = [
    { label: "All", value: "all" },
    { label: "Active", value: "active" },
    { label: "Idle", value: "idle" },
    { label: "Offline", value: "offline" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Live Monitor</h1>
          <p className="text-sm text-slate-500 mt-1">
            Engineer pipelines — current step, next step, and queued tasks
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-500" />
          {filters.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                filter === f.value
                  ? "bg-blue-600/20 text-blue-400"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {filteredEngineers.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center">
          <p className="text-slate-400 text-sm">
            No engineers match this filter.
          </p>
        </div>
      ) : (
        <div className="space-y-4 max-w-4xl">
          {filteredEngineers.map((eng) => (
            <EngineerPipelineCard key={eng.id} engineer={eng} now={now} allSessions={allSessions} />
          ))}
        </div>
      )}
    </div>
  );
}
