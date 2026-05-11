"use client";

import { useEffect, useRef } from "react";

var emojis = ["😀","😂","🤣","😊","😍","🥰","😘","😜","🤪","😎","🤩","😇","🤗","😴","😢","😡","🤬","👍","👎","👏","🙌","💪","🤝","❤️","💔","🔥","⭐","✨","🎉","🎊","🌸","🌺","💐","🍕","🎂","☕","⚽","🏀","🎮","📱","💻","💰","🚀","🌈","☀️","🌙","👋","🙏","💯","✅","❌","🤔","🤯","🥺","😤","😭","🤩","🫶","💀","👀","🫡","🫠","🤌","🫰","🫳","🫲"];

export default function EmojiPicker({ onSelect, onClose }: any) {
  var ref = useRef<any>(null);

  useEffect(function() {
    if (ref.current) {
      ref.current.focus();
    }
  }, []);

  return (
    <div
      ref={ref}
      tabIndex={-1}
      onBlur={function() { setTimeout(function() { onClose(); }, 150); }}
      className="fixed bg-white dark:bg-gray-800 rounded-xl shadow-xl border dark:border-gray-700 p-3 w-[280px] z-[9999]"
      style={{ bottom: "80px", left: "50%", transform: "translateX(-50%)" }}
    >
      <div className="grid grid-cols-8 gap-1 max-h-[200px] overflow-y-auto">
        {emojis.map(function(emoji: string) {
          return (
            <button
              key={emoji}
              onMouseDown={function(e: any) { e.preventDefault(); onSelect(emoji); }}
              className="text-xl hover:bg-gray-100 dark:hover:bg-gray-700 rounded p-1 transition-colors"
            >
              {emoji}
            </button>
          );
        })}
      </div>
      <button
        onMouseDown={function(e: any) { e.preventDefault(); onClose(); }}
        className="w-full text-center text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 mt-2 pt-2 border-t dark:border-gray-700"
      >
        Close
      </button>
    </div>
  );
}