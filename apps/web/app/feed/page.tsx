"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PostCard from "@/components/PostCard";
import CreatePostForm from "@/components/CreatePostForm";
import PollForm from "@/components/PollForm";
import MoodCheckin from "@/components/MoodCheckin";
import InsightCard from "@/components/InsightCard";
import BottomNav from "@/components/BottomNav";
import { Plus, X } from "lucide-react";

export default function FeedPage() {
  var router = useRouter();
  var [posts, setPosts] = useState<any[]>([]);
  var [isLoading, setIsLoading] = useState(true);
  var [userName, setUserName] = useState("");
  var [currentUserId, setCurrentUserId] = useState("");
  var [activeTab, setActiveTab] = useState("for-you");
  var [showComposer, setShowComposer] = useState(false);
  var [showPoll, setShowPoll] = useState(false);
  var [insights, setInsights] = useState<any[]>([]);

  useEffect(function() { fetchPosts(); fetchUserData(); }, [activeTab]);
  useEffect(function() { fetchInsights(); }, []);

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

  var fetchInsights = async function() {
    try {
      await fetch("/api/mood/insights", { method: "POST" });
      var r = await fetch("/api/mood/insights");
      if (r.ok) setInsights(await r.json());
    } catch (e) {}
  };

  var handlePostCreated = function(np: any) { setPosts([np, ...posts]); setShowComposer(false); setShowPoll(false); };
  var handleReactionUpdate = function(pid: string, nr: any) { setPosts(posts.map(function(p: any) { return p.id === pid ? { ...p, reactions: nr } : p; })); };
  var handlePollUpdate = function(pid: string, up: any) { setPosts(posts.map(function(p: any) { return p.id === pid ? { ...p, poll: up } : p; })); };
  var handlePostDelete = function(postId: string) { setPosts(posts.filter(function(p: any) { return p.id !== postId; })); };
  var handleDismissInsight = async function(insightId: string) {
    await fetch("/api/mood/insights", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ insightId: insightId }) });
    setInsights(insights.filter(function(i: any) { return i.id !== insightId; }));
  };

  var tabs = [
    { id: "for-you", label: "For You" },
    { id: "following", label: "Following" },
    { id: "wellness", label: "🌱 Wellness" },
  ];

  if (isLoading) return (
    <div className="min-h-screen bg-[#f8faf9] dark:bg-gray-950 flex items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8faf9] dark:bg-gray-950 pb-20">
      <div className="sticky top-0 z-20 bg-[#f8faf9]/90 dark:bg-gray-950/90 backdrop-blur-md border-b border-gray-100 dark:border-gray-800">
        <div className="mx-auto max-w-2xl px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {getGreeting()}, {userName?.split(" ")[0] || "Friend"}
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">{getSubtitle(activeTab)}</p>
          </div>
          <MoodCheckin />
        </div>
      </div>

      <main className="mx-auto max-w-2xl px-4 py-4 space-y-4">
        {insights.length > 0 && (
          <div className="space-y-2">
            {insights.map(function(insight: any) {
              return <InsightCard key={insight.id} insight={insight} onDismiss={handleDismissInsight} />;
            })}
          </div>
        )}

        {!showComposer ? (
          <button
            onClick={function() { setShowComposer(true); }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400 hover:border-emerald-300 dark:hover:border-emerald-700 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all shadow-sm"
          >
            <div className="h-9 w-9 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
              <Plus className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <span className="text-sm">Share something with the community...</span>
          </button>
        ) : (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100 dark:border-gray-800">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Create Post</span>
              <button onClick={function() { setShowComposer(false); setShowPoll(false); }} className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <X className="h-4 w-4" />
              </button>
            </div>
            {!showPoll ? (
              <>
                <CreatePostForm onPostCreated={handlePostCreated} />
                <button
                  onClick={function() { setShowPoll(true); }}
                  className="w-full px-4 py-2 text-left text-sm text-emerald-600 dark:text-emerald-400 hover:bg-gray-50 dark:hover:bg-gray-800 border-t border-gray-100 dark:border-gray-800"
                >
                  📊 Create a poll instead
                </button>
              </>
            ) : (
              <div className="p-4">
                <PollForm
                  onPollCreated={function(p: any) { handlePostCreated(p); }}
                  onCancel={function() { setShowPoll(false); }}
                />
              </div>
            )}
          </div>
        )}

        <div className="flex gap-1 bg-gray-100 dark:bg-gray-900 rounded-xl p-1">
          {tabs.map(function(t: any) {
            return (
              <button
                key={t.id}
                onClick={function() { setActiveTab(t.id); setIsLoading(true); }}
                className={"flex-1 py-2 text-sm font-medium rounded-lg transition-all " +
                  (activeTab === t.id
                    ? "bg-white dark:bg-gray-800 text-emerald-700 dark:text-emerald-400 shadow-sm"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300")}
              >
                {t.label}
              </button>
            );
          })}
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-16">
            <div className="h-16 w-16 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🌱</span>
            </div>
            <p className="text-gray-500 dark:text-gray-400 font-medium">No posts yet</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
              {activeTab === "following" ? "Follow people to see their posts" : activeTab === "wellness" ? "Check in with your mood to personalize this feed" : "Be the first to share something"}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
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
      <BottomNav />
    </div>
  );
}

function getGreeting() {
  var hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function getSubtitle(tab: string) {
  if (tab === "following") return "Posts from people you follow";
  if (tab === "wellness") return "Curated for your wellbeing";
  return "Your community, your space";
}