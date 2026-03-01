"use client";

import { useState } from "react";
import Link from "next/link";
import { knowledgeBase as initialKB } from "@/lib/mock-data";
import type { KnowledgeBaseItem, KBCategory } from "@/lib/types";
import { CATEGORY_COLORS, CATEGORY_LABELS } from "@/lib/constants";
import { timeAgo } from "@/lib/utils";
import { Search, Clock, ListOrdered, Plus, Trash2, Eye } from "lucide-react";

export default function KnowledgeBasePage() {
  const [items, setItems] = useState<KnowledgeBaseItem[]>(initialKB);
  const [categoryFilter, setCategoryFilter] = useState<"all" | KBCategory>("all");
  const [search, setSearch] = useState("");

  const categories: KBCategory[] = [
    "engine",
    "dashboard",
    "tyres",
    "brakes",
    "exterior",
    "electrical",
    "slk-specific",
  ];

  const categoryCounts = categories.reduce(
    (acc, cat) => {
      acc[cat] = items.filter((i) => i.category === cat).length;
      return acc;
    },
    {} as Record<string, number>
  );

  const filtered = items.filter((item) => {
    if (categoryFilter !== "all" && item.category !== categoryFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        item.title.toLowerCase().includes(q) ||
        item.keywords.some((k) => k.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleDelete = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Knowledge Base</h1>
          <p className="text-sm text-slate-500 mt-1">
            {items.length} task documents for Mercedes-Benz SLK 200 (R170)
          </p>
        </div>
        <Link
          href="/knowledge-base/new"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Document
        </Link>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input
          type="text"
          placeholder="Search by title or keyword..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => setCategoryFilter("all")}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            categoryFilter === "all"
              ? "bg-blue-600/20 text-blue-400"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
          }`}
        >
          All ({items.length})
        </button>
        {categories.map((cat) => {
          const colors = CATEGORY_COLORS[cat];
          return (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                categoryFilter === cat
                  ? `${colors.bg} ${colors.text}`
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              }`}
            >
              {CATEGORY_LABELS[cat]} ({categoryCounts[cat]})
            </button>
          );
        })}
      </div>

      {/* Card Grid */}
      {filtered.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center">
          <p className="text-slate-400 text-sm">
            No documents match the current search/filter.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((item) => {
            const catColors = CATEGORY_COLORS[item.category];
            return (
              <div
                key={item.id}
                className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${catColors.bg} ${catColors.text}`}
                  >
                    {CATEGORY_LABELS[item.category]}
                  </span>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="text-slate-600 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <h3 className="text-sm font-semibold text-slate-200 mb-2">
                  {item.title}
                </h3>

                <div className="flex items-center gap-4 text-xs text-slate-500 mb-3">
                  {item.totalSteps > 0 && (
                    <span className="flex items-center gap-1">
                      <ListOrdered className="w-3 h-3" />
                      {item.totalSteps} steps
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />~{item.estimatedMinutes} min
                  </span>
                </div>

                <div className="flex flex-wrap gap-1 mb-4">
                  {item.keywords.slice(0, 4).map((kw) => (
                    <span
                      key={kw}
                      className="px-1.5 py-0.5 bg-slate-800 rounded text-[10px] text-slate-500"
                    >
                      {kw}
                    </span>
                  ))}
                  {item.keywords.length > 4 && (
                    <span className="px-1.5 py-0.5 text-[10px] text-slate-600">
                      +{item.keywords.length - 4}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-slate-600">
                    Updated {timeAgo(item.lastUpdated)}
                  </span>
                  <Link
                    href={`/knowledge-base/${item.id}`}
                    className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 font-medium"
                  >
                    <Eye className="w-3 h-3" />
                    View
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
