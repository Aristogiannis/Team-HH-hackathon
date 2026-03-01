"use client";

import { engineers } from "@/lib/mock-data";
import { STATUS_COLORS, CATEGORY_COLORS, CATEGORY_LABELS } from "@/lib/constants";
import { knowledgeBase } from "@/lib/mock-data";
import { Briefcase, Clock, CheckCircle2, TrendingUp } from "lucide-react";

export default function EngineersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Engineers</h1>
        <p className="text-sm text-slate-500 mt-1">
          {engineers.length} engineers in your workshop team
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {engineers.map((eng) => {
          const statusColors = STATUS_COLORS[eng.status];
          const currentTask = eng.currentTaskId
            ? knowledgeBase.find((t) => t.id === eng.currentTaskId)
            : null;
          const completionTarget = 8;
          const completionRate = Math.min(
            100,
            Math.round((eng.tasksCompletedToday / completionTarget) * 100)
          );

          return (
            <div
              key={eng.id}
              className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-colors"
            >
              {/* Header */}
              <div className="flex items-center gap-3 mb-4">
                <div
                  className={`w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold ${
                    eng.status === "online"
                      ? "bg-green-500/20 text-green-400"
                      : eng.status === "busy"
                      ? "bg-amber-500/20 text-amber-400"
                      : "bg-slate-700 text-slate-400"
                  }`}
                >
                  {eng.initials}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-slate-200">
                    {eng.name}
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span
                      className={`w-2 h-2 rounded-full ${statusColors.dot} ${
                        eng.status === "busy" ? "animate-pulse-dot" : ""
                      }`}
                    />
                    <span
                      className={`text-[11px] font-medium capitalize ${statusColors.text}`}
                    >
                      {eng.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Current Task */}
              {currentTask ? (
                <div className="bg-slate-800/50 rounded-lg px-3 py-2 mb-4">
                  <div className="text-[10px] uppercase tracking-wide text-slate-500 mb-1">
                    Working on
                  </div>
                  <div className="text-xs text-slate-300">
                    {currentTask.title}
                  </div>
                </div>
              ) : (
                <div className="bg-slate-800/30 rounded-lg px-3 py-2 mb-4">
                  <div className="text-xs text-slate-500 italic">
                    No active task
                  </div>
                </div>
              )}

              {/* Specialties */}
              <div className="mb-4">
                <div className="text-[10px] uppercase tracking-wide text-slate-500 mb-1.5">
                  Specialties
                </div>
                <div className="flex flex-wrap gap-1">
                  {eng.specialties.map((spec) => {
                    const colors = CATEGORY_COLORS[spec];
                    return (
                      <span
                        key={spec}
                        className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${colors.bg} ${colors.text}`}
                      >
                        {CATEGORY_LABELS[spec]}
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-slate-500 mb-0.5">
                    <CheckCircle2 className="w-3 h-3" />
                  </div>
                  <div className="text-sm font-semibold text-slate-200">
                    {eng.tasksCompletedToday}
                  </div>
                  <div className="text-[10px] text-slate-500">Today</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-slate-500 mb-0.5">
                    <TrendingUp className="w-3 h-3" />
                  </div>
                  <div className="text-sm font-semibold text-slate-200">
                    {eng.totalTasksCompleted}
                  </div>
                  <div className="text-[10px] text-slate-500">Total</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-slate-500 mb-0.5">
                    <Clock className="w-3 h-3" />
                  </div>
                  <div className="text-sm font-semibold text-slate-200">
                    {eng.avgCompletionMinutes}m
                  </div>
                  <div className="text-[10px] text-slate-500">Avg</div>
                </div>
              </div>

              {/* Performance Bar */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] text-slate-500">
                    Daily target ({completionTarget} tasks)
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {completionRate}%
                  </span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      completionRate >= 100
                        ? "bg-green-500"
                        : completionRate >= 50
                        ? "bg-blue-500"
                        : "bg-amber-500"
                    }`}
                    style={{ width: `${completionRate}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
