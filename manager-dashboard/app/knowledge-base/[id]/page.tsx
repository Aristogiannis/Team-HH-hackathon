"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { knowledgeBase } from "@/lib/mock-data";
import type { KBCategory } from "@/lib/types";
import { CATEGORY_COLORS, CATEGORY_LABELS } from "@/lib/constants";
import { renderMarkdown } from "@/lib/utils";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";

export default function KBDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const original = knowledgeBase.find((item) => item.id === id);

  const [title, setTitle] = useState(original?.title || "");
  const [category, setCategory] = useState<KBCategory>(
    original?.category || "engine"
  );
  const [keywords, setKeywords] = useState(
    original?.keywords.join(", ") || ""
  );
  const [content, setContent] = useState(original?.content || "");
  const [estimatedMinutes, setEstimatedMinutes] = useState(
    original?.estimatedMinutes || 10
  );
  const [saved, setSaved] = useState(false);

  if (!original && id !== "new") {
    return (
      <div className="space-y-6">
        <Link
          href="/knowledge-base"
          className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Knowledge Base
        </Link>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center">
          <p className="text-slate-400">Document not found.</p>
        </div>
      </div>
    );
  }

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const categories: KBCategory[] = [
    "engine",
    "brakes",
    "tyres",
    "dashboard",
    "exterior",
    "electrical",
    "slk-specific",
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/knowledge-base"
          className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Knowledge Base
        </Link>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          <Save className="w-4 h-4" />
          {saved ? "Saved!" : "Save Changes"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Edit Form */}
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <h2 className="text-sm font-semibold text-slate-200 mb-4">
              Edit Document
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                  Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as KBCategory)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {CATEGORY_LABELS[cat]}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">
                    Est. Time (min)
                  </label>
                  <input
                    type="number"
                    value={estimatedMinutes}
                    onChange={(e) =>
                      setEstimatedMinutes(parseInt(e.target.value) || 0)
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                  Keywords (comma-separated)
                </label>
                <input
                  type="text"
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <div className="flex flex-wrap gap-1 mt-2">
                  {keywords
                    .split(",")
                    .map((k) => k.trim())
                    .filter(Boolean)
                    .map((kw) => (
                      <span
                        key={kw}
                        className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-[10px] text-slate-400"
                      >
                        {kw}
                      </span>
                    ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                  Content (Markdown)
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={20}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 font-mono focus:outline-none focus:ring-1 focus:ring-blue-500 resize-y"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-200">Preview</h2>
            {category && (
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${CATEGORY_COLORS[category].bg} ${CATEGORY_COLORS[category].text}`}
              >
                {CATEGORY_LABELS[category]}
              </span>
            )}
          </div>
          <div
            className="text-sm text-slate-300 leading-relaxed prose-invert"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
          />
        </div>
      </div>
    </div>
  );
}
