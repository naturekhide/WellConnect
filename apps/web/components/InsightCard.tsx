"use client";

import { X, TrendingUp, TrendingDown, BookOpen, Users, Activity } from "lucide-react";
import Link from "next/link";

var iconMap: any = {
  mood_shift: TrendingDown,
  positive_trend: TrendingUp,
  connection_gap: Users,
  content_match: BookOpen,
  pattern_nudge: Activity,
};

var colorMap: any = {
  mood_shift: "border-l-amber-400 dark:border-l-amber-500",
  positive_trend: "border-l-emerald-400 dark:border-l-emerald-500",
  connection_gap: "border-l-blue-400 dark:border-l-blue-500",
  content_match: "border-l-purple-400 dark:border-l-purple-500",
  pattern_nudge: "border-l-teal-400 dark:border-l-teal-500",
  crisis_alert: "border-l-red-400 dark:border-l-red-500",
};

var bgMap: any = {
  mood_shift: "bg-amber-50 dark:bg-amber-900/20",
  positive_trend: "bg-emerald-50 dark:bg-emerald-900/20",
  connection_gap: "bg-blue-50 dark:bg-blue-900/20",
  content_match: "bg-purple-50 dark:bg-purple-900/20",
  pattern_nudge: "bg-teal-50 dark:bg-teal-900/20",
  crisis_alert: "bg-red-50 dark:bg-red-900/20",
};

export default function InsightCard({ insight, onDismiss }: { insight: any; onDismiss: any }) {
  var Icon = iconMap[insight.type] || Activity;
  var borderColor = colorMap[insight.type] || "border-l-gray-400";
  var bgColor = bgMap[insight.type] || "bg-gray-50 dark:bg-gray-900/20";

  return (
    <div className={"rounded-2xl border-l-4 p-4 relative shadow-sm border border-gray-100 dark:border-gray-800 " + borderColor + " " + bgColor}>
      <button
        onClick={function() { onDismiss(insight.id); }}
        className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
      <div className="flex items-start gap-3 pr-6">
        <div className="h-9 w-9 rounded-xl bg-white dark:bg-gray-800 flex items-center justify-center flex-shrink-0 shadow-sm">
          <Icon className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div className="flex-1">
          <p className="font-semibold text-sm text-gray-900 dark:text-gray-100">{insight.title}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{insight.description}</p>
          {insight.actionLink && (
            <Link
              href={insight.actionLink}
              className="inline-block mt-2 text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              Learn more →
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}