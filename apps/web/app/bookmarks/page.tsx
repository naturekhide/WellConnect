"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import PostCard from "@/components/PostCard";
import { Bookmark } from "lucide-react";

export default function BookmarksPage() {
  var [posts, setPosts] = useState<any[]>([]);
  var [isLoading, setIsLoading] = useState(true);
  var [userName, setUserName] = useState("");
  var [currentUserId, setCurrentUserId] = useState("");

  useEffect(function() { fetchUser(); fetchBookmarks(); }, []);

  var fetchUser = async function() { var r = await fetch("/api/auth/session"); if (r.ok) { var s = await r.json(); setUserName(s?.user?.name || "Friend"); setCurrentUserId(s?.user?.id || ""); } };
  var fetchBookmarks = async function() { var r = await fetch("/api/bookmarks"); if (r.ok) setPosts(await r.json()); setIsLoading(false); };
  var handleBookmarkRemove = function(postId: string) { setPosts(posts.filter(function(p: any) { return p.id !== postId; })); };

  if (isLoading) return <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800"><Header userName={userName} /><div className="flex justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-4 border-green-600 border-t-transparent"></div></div></div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800"><Header userName={userName} /><main className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Bookmarks</h1>
      {posts.length === 0 ? <div className="rounded-2xl bg-white dark:bg-gray-800 p-12 text-center shadow-md"><Bookmark className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" /><p className="mt-4 text-gray-600 dark:text-gray-400">No bookmarks yet</p><p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Bookmark posts to save them for later</p></div> : <div className="space-y-4">{posts.map(function(p: any) { return <PostCard key={p.id} post={{ ...p, isBookmarked: true }} onReactionUpdate={function() {}} currentUserId={currentUserId} onBookmarkToggle={function(postId: string, bookmarked: boolean) { if (!bookmarked) handleBookmarkRemove(postId); }} />; })}</div>}
    </main></div>
  );
}