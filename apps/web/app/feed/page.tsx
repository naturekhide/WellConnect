"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import PostCard from "@/components/PostCard";
import CreatePostForm from "@/components/CreatePostForm";
import PollForm from "@/components/PollForm";

export default function FeedPage() {
  var router = useRouter();
  var [posts, setPosts] = useState<any[]>([]);
  var [isLoading, setIsLoading] = useState(true);
  var [userName, setUserName] = useState("");
  var [currentUserId, setCurrentUserId] = useState("");
  var [activeTab, setActiveTab] = useState("for-you");
  var [showPoll, setShowPoll] = useState(false);

  useEffect(function() { fetchPosts(); fetchUserData(); }, [activeTab]);

  var fetchUserData = async function() {
    var r = await fetch("/api/auth/session");
    if (r.ok) { var s = await r.json(); setUserName(s?.user?.name || "Friend"); setCurrentUserId(s?.user?.id || ""); }
  };

  var fetchPosts = async function() {
    var r = await fetch("/api/posts?feed=" + activeTab);
    if (r.ok) setPosts(await r.json());
    else if (r.status === 401) router.push("/login");
    setIsLoading(false);
  };

  var handlePostCreated = function(np: any) { setPosts([np, ...posts]); };
  var handleReactionUpdate = function(pid: string, nr: any) { setPosts(posts.map(function(p: any) { return p.id === pid ? { ...p, reactions: nr } : p; })); };
  var handlePollUpdate = function(pid: string, up: any) { setPosts(posts.map(function(p: any) { return p.id === pid ? { ...p, poll: up } : p; })); };
  var handlePostDelete = function(postId: string) { setPosts(posts.filter(function(p: any) { return p.id !== postId; })); };

  if (isLoading) return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <Header userName={userName} />
      <div className="flex justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-green-600 border-t-transparent"></div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <Header userName={userName} />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <CreatePostForm onPostCreated={handlePostCreated} />

        <div className="mb-4">
          {!showPoll ? (
            <button onClick={function() { setShowPoll(true); }} className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 font-medium bg-white dark:bg-gray-800 rounded-2xl px-4 py-3 shadow-sm w-full">
              📊 Create a Poll
            </button>
          ) : (
            <PollForm
              onPollCreated={function(p: any) { handlePostCreated(p); setShowPoll(false); }}
              onCancel={function() { setShowPoll(false); }}
            />
          )}
        </div>

        <div className="mb-4 flex gap-6 border-b border-gray-200 dark:border-gray-700">
          {["for-you", "following", "trending"].map(function(t: string) {
            return (
              <button
                key={t}
                onClick={function() { setActiveTab(t); setIsLoading(true); }}
                className={"relative pb-2 text-sm font-medium capitalize " + (activeTab === t ? "text-green-600 dark:text-green-400" : "text-gray-500 dark:text-gray-400")}
              >
                {t === "for-you" ? "For You" : t}
                {activeTab === t && <div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-green-600"></div>}
              </button>
            );
          })}
        </div>

        {posts.length === 0 ? (
          <div className="rounded-2xl bg-white dark:bg-gray-800 p-8 text-center shadow-md">
            <p className="text-gray-600 dark:text-gray-400">
              {activeTab === "following" ? "Follow some users to see their posts here!" : activeTab === "trending" ? "No trending posts yet." : "No posts yet. Be the first to share!"}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map(function(p: any) {
              return (
                <PostCard
                  key={p.id}
                  post={p}
                  onReactionUpdate={handleReactionUpdate}
                  onPollUpdate={handlePollUpdate}
                  onPostDelete={handlePostDelete}
                  currentUserId={currentUserId}
                />
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}