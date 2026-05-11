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
    <div className="bg-white rounded-2xl p-4 shadow-md mb-6">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="h-5 w-5 text-green-600" />
        <h3 className="font-medium text-gray-900">Create Poll</h3>
      </div>
      <form onSubmit={handleSubmit}>
        <input type="text" value={question} onChange={function(e: any) { setQuestion(e.target.value); }} placeholder="Ask a question..." className="w-full rounded-lg border border-gray-200 p-3 text-sm mb-3 focus:border-green-400 focus:outline-none" />
        {options.map(function(opt: string, i: number) {
          return (
            <div key={i} className="flex gap-2 mb-2">
              <input type="text" value={opt} onChange={function(e: any) { updateOption(i, e.target.value); }} placeholder={"Option " + (i + 1)} className="flex-1 rounded-lg border border-gray-200 p-2 text-sm focus:border-green-400 focus:outline-none" />
              {options.length > 2 && <button type="button" onClick={function() { removeOption(i); }} className="text-gray-400 hover:text-red-500"><X className="h-4 w-4" /></button>}
            </div>
          );
        })}
        {options.length < 5 && <button type="button" onClick={addOption} className="flex items-center gap-1 text-sm text-green-600 hover:text-green-700 mb-3"><Plus className="h-4 w-4" /> Add option</button>}
        <div className="flex gap-2">
          <button type="button" onClick={onCancel} className="flex-1 rounded-lg border border-gray-300 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
          <button type="submit" disabled={isSubmitting || !question.trim()} className="flex-1 rounded-lg bg-green-600 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50">{isSubmitting ? "Creating..." : "Post Poll"}</button>
        </div>
      </form>
    </div>
  );
}