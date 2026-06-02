"use client";

import { useState } from "react";
import { BarChart3, Plus, X } from "lucide-react";

export default function PollForm({ onPollCreated, groupId, onCancel }: any) {
  var [question, setQuestion] = useState("");
  var [options, setOptions] = useState(["", ""]);
  var [isSubmitting, setIsSubmitting] = useState(false);

  var addOption = function() {
    if (options.length < 5) setOptions([...options, ""]);
  };

  var removeOption = function(index: number) {
    if (options.length > 2) setOptions(options.filter(function(_: any, i: number) { return i !== index; }));
  };

  var updateOption = function(index: number, value: string) {
    var newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  var handleSubmit = async function(e: any) {
    e.preventDefault();
    if (!question.trim()) return;
    var validOptions = options.filter(function(o: string) { return o.trim(); });
    if (validOptions.length < 2) return;

    setIsSubmitting(true);
    try {
      var r = await fetch("/api/polls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, options: validOptions, groupId }),
      });
      if (r.ok) {
        var data = await r.json();
        onPollCreated(data.post);
      }
    } catch (e) {} finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <div className="h-8 w-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
          <BarChart3 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
        </div>
        <h3 className="font-medium text-sm text-gray-900 dark:text-gray-100">Create Poll</h3>
      </div>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={question}
          onChange={function(e: any) { setQuestion(e.target.value); }}
          placeholder="Ask a question..."
          className="w-full rounded-xl bg-gray-50 dark:bg-gray-800 border-0 p-3 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 mb-3"
        />
        {options.map(function(opt: string, i: number) {
          return (
            <div key={i} className="flex gap-2 mb-2">
              <input
                type="text"
                value={opt}
                onChange={function(e: any) { updateOption(i, e.target.value); }}
                placeholder={"Option " + (i + 1)}
                className="flex-1 rounded-xl bg-gray-50 dark:bg-gray-800 border-0 p-2.5 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
              {options.length > 2 && (
                <button type="button" onClick={function() { removeOption(i); }} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          );
        })}
        {options.length < 5 && (
          <button type="button" onClick={addOption} className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 mb-3 transition-colors">
            <Plus className="h-3.5 w-3.5" /> Add option
          </button>
        )}
        <div className="flex gap-2">
          <button type="button" onClick={onCancel} className="flex-1 rounded-xl border border-gray-200 dark:border-gray-700 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">
            Cancel
          </button>
          <button type="submit" disabled={isSubmitting || !question.trim()} className="flex-1 rounded-xl bg-emerald-600 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50 transition-all">
            {isSubmitting ? "Creating..." : "Post Poll"}
          </button>
        </div>
      </form>
    </div>
  );
}