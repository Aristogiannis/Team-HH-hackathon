"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Monitor,
  ClipboardList,
  BookOpen,
  Users,
  Wrench,
} from "lucide-react";

const navItems = [
  { href: "/", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/monitor", icon: Monitor, label: "Live Monitor" },
  { href: "/tasks", icon: ClipboardList, label: "Task Assignments" },
  { href: "/knowledge-base", icon: BookOpen, label: "Knowledge Base" },
  { href: "/engineers", icon: Users, label: "Engineers" },
] as const;

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-screen w-60 bg-slate-950 border-r border-slate-800 flex flex-col z-50">
      <div className="p-5 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Wrench className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="font-semibold text-sm text-slate-100">Weldy</div>
            <div className="text-[11px] text-slate-500">Manager Dashboard</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 py-4 px-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-colors ${
                isActive
                  ? "bg-slate-800 text-slate-100"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
              }`}
            >
              <Icon className="w-4 h-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center text-xs font-medium text-slate-300">
            MG
          </div>
          <div>
            <div className="text-sm font-medium text-slate-300">Manager</div>
            <div className="text-[11px] text-slate-500">Workshop Lead</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
