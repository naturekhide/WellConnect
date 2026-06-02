"use client";

import { useRouter } from "next/navigation";
import BottomNav from "@/components/BottomNav";
import { ArrowLeft, Bookmark } from "lucide-react";

export default function BookmarksPage() {
  var router = useRouter();

  return (
    <div className="min-h-screen bg-[#f8faf9] dark:bg-gray-950 pb-20">
      <div className="sticky top-0 z-20 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-100 dark:border-gray-800">
        <div className="mx-auto max-w-2xl px-4 py-3 flex items-center gap-3">
          <button onClick={function() { router.back(); }} className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Bookmarks</h1>
        </div>
      </div>

      <main className="mx-auto max-w-2xl px-4 py-8 text-center">
        <div className="h-20 w-20 rounded-2xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mx-auto mb-4">
          <Bookmark className="h-10 w-10 text-amber-500" />
        </div>
        <p className="text-gray-500 dark:text-gray-400 font-medium">No bookmarks yet</p>
        <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Save posts to read later</p>
      </main>
      <BottomNav />
    </div>
  );
}