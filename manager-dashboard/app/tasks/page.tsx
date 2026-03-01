"use client";

import { useState } from "react";
import { assignments as initialAssignments, engineers, knowledgeBase } from "@/lib/mock-data";
import type { TaskAssignment, AssignmentStatus, TaskPriority } from "@/lib/types";
import { PRIORITY_COLORS, ASSIGNMENT_STATUS_COLORS, CATEGORY_COLORS, CATEGORY_LABELS } from "@/lib/constants";
import { timeAgo } from "@/lib/utils";
import { Plus, Search, X } from "lucide-react";

function PriorityBadge({ priority }: { priority: TaskPriority }) {
  const colors = PRIORITY_COLORS[priority];
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium capitalize ${colors.bg} ${colors.text}`}
    >
      {priority}
    </span>
  );
}

function StatusBadge({ status }: { status: AssignmentStatus }) {
  const colors = ASSIGNMENT_STATUS_COLORS[status];
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium capitalize ${colors.bg} ${colors.text}`}
    >
      {status}
    </span>
  );
}

function AssignTaskModal({
  onClose,
  onAssign,
}: {
  onClose: () => void;
  onAssign: (assignment: TaskAssignment) => void;
}) {
  const [engineerId, setEngineerId] = useState("");
  const [taskId, setTaskId] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 86400000).toISOString().split("T")[0]
  );
  const [notes, setNotes] = useState("");

  const availableEngineers = engineers.filter((e) => e.status !== "offline");

  const grouped = knowledgeBase.reduce(
    (acc, kb) => {
      const cat = CATEGORY_LABELS[kb.category];
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(kb);
      return acc;
    },
    {} as Record<string, typeof knowledgeBase>
  );

  const handleSubmit = () => {
    if (!engineerId || !taskId) return;
    const eng = engineers.find((e) => e.id === engineerId)!;
    const task = knowledgeBase.find((t) => t.id === taskId)!;
    onAssign({
      id: `asgn-${Date.now()}`,
      taskId: task.id,
      taskTitle: task.title,
      engineerId: eng.id,
      engineerName: eng.name,
      priority,
      status: "pending",
      assignedAt: new Date().toISOString(),
      dueDate,
      completedAt: null,
      notes,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-lg p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-slate-100">
            Assign New Task
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              Engineer
            </label>
            <select
              value={engineerId}
              onChange={(e) => setEngineerId(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Select engineer...</option>
              {availableEngineers.map((eng) => (
                <option key={eng.id} value={eng.id}>
                  {eng.name} ({eng.status})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              Task
            </label>
            <select
              value={taskId}
              onChange={(e) => setTaskId(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Select task...</option>
              {Object.entries(grouped).map(([category, tasks]) => (
                <optgroup key={category} label={category}>
                  {tasks.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.title}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              Priority
            </label>
            <div className="flex gap-2">
              {(["high", "medium", "low"] as TaskPriority[]).map((p) => (
                <button
                  key={p}
                  onClick={() => setPriority(p)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${
                    priority === p
                      ? `${PRIORITY_COLORS[p].bg} ${PRIORITY_COLORS[p].text} ring-1 ring-current`
                      : "text-slate-400 bg-slate-800 hover:bg-slate-700"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              Due Date
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              Notes (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Add any notes..."
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm text-slate-400 hover:text-slate-200 hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!engineerId || !taskId}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Assign Task
          </button>
        </div>
      </div>
    </div>
  );
}

export default function TasksPage() {
  const [tasksList, setTasksList] = useState<TaskAssignment[]>(initialAssignments);
  const [showModal, setShowModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState<"all" | AssignmentStatus>("all");
  const [search, setSearch] = useState("");

  const filtered = tasksList.filter((a) => {
    if (statusFilter !== "all" && a.status !== statusFilter) return false;
    if (
      search &&
      !a.taskTitle.toLowerCase().includes(search.toLowerCase()) &&
      !a.engineerName.toLowerCase().includes(search.toLowerCase())
    )
      return false;
    return true;
  });

  const statusFilters: { label: string; value: "all" | AssignmentStatus }[] = [
    { label: "All", value: "all" },
    { label: "Pending", value: "pending" },
    { label: "In Progress", value: "in-progress" },
    { label: "Completed", value: "completed" },
    { label: "Overdue", value: "overdue" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">
            Task Assignments
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Assign and track maintenance tasks across engineers
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Assign Task
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          {statusFilters.map((f) => (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                statusFilter === f.value
                  ? "bg-blue-600/20 text-blue-400"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="flex-1 max-w-xs relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search tasks or engineers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-800">
              {["Task", "Engineer", "Priority", "Status", "Due Date", "Notes"].map(
                (h) => (
                  <th
                    key={h}
                    className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wide px-5 py-3"
                  >
                    {h}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {filtered.map((a) => (
              <tr
                key={a.id}
                className={`border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors ${
                  a.status === "overdue" ? "bg-red-500/5" : ""
                }`}
              >
                <td className="px-5 py-3 text-sm text-slate-200">
                  {a.taskTitle}
                </td>
                <td className="px-5 py-3 text-sm text-slate-300">
                  {a.engineerName}
                </td>
                <td className="px-5 py-3">
                  <PriorityBadge priority={a.priority} />
                </td>
                <td className="px-5 py-3">
                  <StatusBadge status={a.status} />
                </td>
                <td className="px-5 py-3 text-sm text-slate-400">
                  {a.dueDate}
                </td>
                <td className="px-5 py-3 text-xs text-slate-500 max-w-[200px] truncate">
                  {a.notes || "—"}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-5 py-8 text-center text-sm text-slate-500"
                >
                  No assignments match the current filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <AssignTaskModal
          onClose={() => setShowModal(false)}
          onAssign={(a) => setTasksList((prev) => [a, ...prev])}
        />
      )}
    </div>
  );
}
