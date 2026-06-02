"use client";

import { useState, useEffect } from "react";
import { X, Check } from "lucide-react";

var moodOptions = [
  { label: "thriving", emoji: "🟢", text: "Thriving", score: 9, color: "bg-green-100 dark:bg-green-900/30 border-green-400" },
  { label: "managing", emoji: "🟡", text: "Managing", score: 6, color: "bg-yellow-100 dark:bg-yellow-900/30 border-yellow-400" },
  { label: "struggling", emoji: "🟠", text: "Struggling", score: 3, color: "bg-orange-100 dark:bg-orange-900/30 border-orange-400" },
  { label: "crisis", emoji: "🔴", text: "In Crisis", score: 1, color: "bg-red-100 dark:bg-red-900/30 border-red-400" },
];

export default function MoodCheckin() {
  var [showWidget, setShowWidget] = useState(false);
  var [selectedMood, setSelectedMood] = useState<any>(null);
  var [note, setNote] = useState("");
  var [submitted, setSubmitted] = useState(false);
  var [checkedToday, setCheckedToday] = useState(false);
  var [isOpen, setIsOpen] = useState(false);

  useEffect(function() {
    checkToday();
  }, []);

  var checkToday = async function() {
    try {
      var res = await fetch("/api/mood/today");
      if (res.ok) {
        var data = await res.json();
        if (data) setCheckedToday(true);
      }
    } catch (e) {}
  };

  var handleSubmit = async function() {
    if (!selectedMood) return;

    try {
      var res = await fetch("/api/mood", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          score: selectedMood.score,
          label: selectedMood.label,
          note: note.trim() || null,
        }),
      });

      if (res.ok) {
        setSubmitted(true);
        setCheckedToday(true);
        setTimeout(function() {
          setIsOpen(false);
          setShowWidget(false);
        }, 2000);
      }
    } catch (e) {}
  };

  var handleOpen = function() {
    if (checkedToday) return;
    setSelectedMood(null);
    setNote("");
    setSubmitted(false);
    setIsOpen(true);
  };

  if (isOpen) {
    return (
      <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40" onClick={function() { setIsOpen(false); }}>
        <div className="bg-white dark:bg-gray-800 rounded-t-2xl shadow-xl p-5 w-full max-w-full max-h-[80vh] overflow-y-auto" onClick={function(e: any) { e.stopPropagation(); }}>
          {submitted ? (
            <div className="text-center py-6">
              <div className="h-14 w-14 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center mx-auto mb-3">
                <Check className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
              </div>
              <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">Thank you for checking in</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Your mood has been recorded</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">How are you feeling?</h3>
                <button onClick={function() { setIsOpen(false); }} className="text-gray-400 hover:text-gray-600 p-1">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-2 mb-4">
                {moodOptions.map(function(mood: any) {
                  return (
                    <button
                      key={mood.label}
                      onClick={function() { setSelectedMood(mood); }}
                      className={"w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border-2 transition-all " +
                        (selectedMood?.label === mood.label
                          ? mood.color + " border-current"
                          : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500")}
                    >
                      <span className="text-xl">{mood.emoji}</span>
                      <p className="font-medium text-sm text-gray-900 dark:text-gray-100">{mood.text}</p>
                    </button>
                  );
                })}
              </div>

              <textarea
                value={note}
                onChange={function(e: any) { setNote(e.target.value); }}
                placeholder="Add a note (optional)..."
                className="w-full rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 px-4 py-2.5 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                rows={2}
              />

              <button
                onClick={handleSubmit}
                disabled={!selectedMood}
                className={"w-full mt-3 py-2.5 rounded-xl font-medium text-sm transition-all " +
                  (selectedMood
                    ? "bg-emerald-600 text-white hover:bg-emerald-700"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed")}
              >
                Submit
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={handleOpen}
      className={"flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all " +
        (checkedToday
          ? "bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-default"
          : "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 border border-emerald-200 dark:border-emerald-800")}
    >
      <span>{checkedToday ? "✅" : "🧠"}</span>
      <span>{checkedToday ? "Done" : "Check in"}</span>
    </button>
  );
}