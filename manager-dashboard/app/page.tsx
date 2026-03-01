"use client";

import { useState, useEffect } from "react";
import {
  Activity,
  CheckCircle2,
  Clock,
  TrendingUp,
  Users,
  AlertTriangle,
  Zap,
  ListChecks,
} from "lucide-react";
import {
  dashboardMetrics,
  sessions,
  activityEvents,
  weeklyCompletions,
} from "@/lib/mock-data";
import type { DashboardMetrics } from "@/lib/types";
import { timeAgo, formatDurationFromMs } from "@/lib/utils";
import { SESSION_STATUS_COLORS } from "@/lib/constants";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function KpiCard({
  icon: Icon,
  label,
  value,
  sub,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  sub: string;
  color: string;
}) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
          {label}
        </span>
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div className="text-2xl font-bold text-slate-100">{value}</div>
      <div className="text-xs text-slate-500 mt-1">{sub}</div>
    </div>
  );
}

function ActiveSessionsTable() {
  const [now, setNow] = useState(0);
  useEffect(() => {
    setNow(Date.now());
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const activeSessions = sessions.filter(
    (s) => s.status === "active" || s.status === "paused"
  );

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl">
      <div className="px-5 py-4 border-b border-slate-800">
        <h2 className="text-sm font-semibold text-slate-200">
          Active Sessions
        </h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-800">
              <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wide px-5 py-3">
                Engineer
              </th>
              <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wide px-5 py-3">
                Task
              </th>
              <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wide px-5 py-3">
                Progress
              </th>
              <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wide px-5 py-3">
                Duration
              </th>
              <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wide px-5 py-3">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {activeSessions.map((session) => {
              const progress =
                (session.currentStep / session.totalSteps) * 100;
              const elapsed = now ? now - new Date(session.startTime).getTime() : 0;
              const sc = SESSION_STATUS_COLORS[session.status];

              return (
                <tr
                  key={session.id}
                  className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors"
                >
                  <td className="px-5 py-3">
                    <span className="text-sm text-slate-200">
                      {session.engineerName}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <span className="text-sm text-slate-300">
                      {session.taskTitle}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full transition-all"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <span className="text-xs text-slate-400 font-mono">
                        {session.currentStep}/{session.totalSteps}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <span className="text-sm font-mono text-slate-300">
                      {formatDurationFromMs(elapsed)}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${sc.bg} ${sc.text}`}
                    >
                      {session.status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const EVENT_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  session_started: Zap,
  session_completed: CheckCircle2,
  task_assigned: ListChecks,
  engineer_online: Users,
  engineer_offline: Users,
  kb_updated: Activity,
};

const EVENT_COLORS: Record<string, string> = {
  session_started: "text-blue-400 bg-blue-500/10",
  session_completed: "text-green-400 bg-green-500/10",
  task_assigned: "text-purple-400 bg-purple-500/10",
  engineer_online: "text-green-400 bg-green-500/10",
  engineer_offline: "text-slate-400 bg-slate-500/10",
  kb_updated: "text-amber-400 bg-amber-500/10",
};

function ActivityFeed() {
  const sortedEvents = [...activityEvents].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl">
      <div className="px-5 py-4 border-b border-slate-800">
        <h2 className="text-sm font-semibold text-slate-200">
          Recent Activity
        </h2>
      </div>
      <div className="p-4 space-y-3 max-h-80 overflow-y-auto">
        {sortedEvents.slice(0, 10).map((event) => {
          const Icon = EVENT_ICONS[event.type] || Activity;
          const color = EVENT_COLORS[event.type] || "text-slate-400 bg-slate-500/10";

          return (
            <div key={event.id} className="flex items-start gap-3">
              <div className={`p-1.5 rounded-lg ${color} mt-0.5`}>
                <Icon className="w-3 h-3" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-300 leading-tight">
                  {event.message}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {timeAgo(event.timestamp)}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CompletionChart() {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl">
      <div className="px-5 py-4 border-b border-slate-800">
        <h2 className="text-sm font-semibold text-slate-200">
          Tasks Completed This Week
        </h2>
      </div>
      <div className="p-4 h-52">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={weeklyCompletions}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis
              dataKey="day"
              tick={{ fontSize: 11, fill: "#64748b" }}
              axisLine={{ stroke: "#1e293b" }}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#64748b" }}
              axisLine={{ stroke: "#1e293b" }}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#0f172a",
                border: "1px solid #1e293b",
                borderRadius: "8px",
                fontSize: "12px",
                color: "#e2e8f0",
              }}
            />
            <Bar
              dataKey="completed"
              fill="#3b82f6"
              radius={[4, 4, 0, 0]}
              maxBarSize={40}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const m: DashboardMetrics = dashboardMetrics;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">
          Workshop overview and real-time monitoring
        </p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          icon={Activity}
          label="Active Sessions"
          value={m.activeSessions}
          sub={`${m.engineersOnline} of ${m.engineersTotal} engineers online`}
          color="bg-blue-500/10 text-blue-400"
        />
        <KpiCard
          icon={CheckCircle2}
          label="Completed Today"
          value={m.completedToday}
          sub="+12% vs yesterday"
          color="bg-green-500/10 text-green-400"
        />
        <KpiCard
          icon={Clock}
          label="Avg Completion"
          value={`${m.avgCompletionMinutes} min`}
          sub="Across all tasks today"
          color="bg-purple-500/10 text-purple-400"
        />
        <KpiCard
          icon={TrendingUp}
          label="Success Rate"
          value={`${m.successRate}%`}
          sub={
            m.overdueAssignments > 0
              ? `${m.overdueAssignments} overdue assignment`
              : "All assignments on track"
          }
          color={
            m.overdueAssignments > 0
              ? "bg-amber-500/10 text-amber-400"
              : "bg-green-500/10 text-green-400"
          }
        />
      </div>

      {/* Active Sessions + Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <ActiveSessionsTable />
        </div>
        <div>
          <ActivityFeed />
        </div>
      </div>

      {/* Chart */}
      <CompletionChart />
    </div>
  );
}
