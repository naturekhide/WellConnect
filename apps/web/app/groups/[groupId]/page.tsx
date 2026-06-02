"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import BottomNav from "@/components/BottomNav";
import PostCard from "@/components/PostCard";
import CreatePostForm from "@/components/CreatePostForm";
import { ArrowLeft, Users, MessageCircle } from "lucide-react";

export default function GroupDetailPage() {
  var router = useRouter();
  var params = useParams();
  var groupId = params.groupId as string;
  var [group, setGroup] = useState<any>(null);
  var [posts, setPosts] = useState<any[]>([]);
  var [isLoading, setIsLoading] = useState(true);
  var [userName, setUserName] = useState("");
  var [currentUserId, setCurrentUserId] = useState("");

  useEffect(function() { fetchGroupAndPosts(); fetchUserData(); }, [groupId]);

  var fetchUserData = async function() { var r = await fetch("/api/auth/session"); if (r.ok) { var s = await r.json(); setUserName(s?.user?.name || "Friend"); setCurrentUserId(s?.user?.id || ""); } };
  var fetchGroupAndPosts = async function() {
    var gr = await fetch("/api/groups/" + groupId);
    var pr = await fetch("/api/posts?groupId=" + groupId);
    if (gr.ok) setGroup(await gr.json());
    if (pr.ok) setPosts(await pr.json());
    setIsLoading(false);
  };

  var handlePostCreated = function(np: any) { setPosts([np, ...posts]); };
  var handleReactionUpdate = function(pid: string, nr: any) { setPosts(posts.map(function(p: any) { return p.id === pid ? { ...p, reactions: nr } : p; })); };
  var handleJoin = async function() { var r = await fetch("/api/groups/" + groupId + "/join", { method: "POST" }); if (r.ok) fetchGroupAndPosts(); };
  var handlePostDelete = function(postId: string) { setPosts(posts.filter(function(p: any) { return p.id !== postId; })); };

  if (isLoading) return (
    <div className="min-h-screen bg-[#f8faf9] dark:bg-gray-950 flex items-center justify-center pb-20">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent"></div>
    </div>
  );

  if (!group) return (
    <div className="min-h-screen bg-[#f8faf9] dark:bg-gray-950 pb-20">
      <div className="sticky top-0 z-20 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-100 dark:border-gray-800">
        <div className="mx-auto max-w-3xl px-4 py-3 flex items-center gap-3">
          <button onClick={function() { router.back(); }} className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Group</h1>
        </div>
      </div>
      <div className="text-center py-20">
        <p className="text-gray-500 dark:text-gray-400">Group not found</p>
      </div>
      <BottomNav />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8faf9] dark:bg-gray-950 pb-20">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-100 dark:border-gray-800">
        <div className="mx-auto max-w-3xl px-4 py-3 flex items-center gap-3">
          <button onClick={function() { router.back(); }} className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-400 flex items-center justify-center text-white font-bold text-sm">
            {group.name.charAt(0)}
          </div>
          <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">{group.name}</h1>
        </div>
      </div>

      <main className="mx-auto max-w-3xl px-4 py-4">
        {/* Group Info Card */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-5 mb-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-400 flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                {group.name.charAt(0)}
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">{group.name}</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{group.description || "No description"}</p>
                <div className="flex items-center gap-4 mt-2 text-xs text-gray-400 dark:text-gray-500">
                  <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {group.memberCount} members</span>
                  <span>🏷️ {group.category}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            {group.isMember && (
              <button onClick={function() { router.push("/groups/" + groupId + "/chat"); }} className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 transition-all">
                <MessageCircle className="h-4 w-4" /> Chat
              </button>
            )}
            {!group.isMember && (
              <button onClick={handleJoin} className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 transition-all">
                Join Group
              </button>
            )}
          </div>
        </div>

        {/* Posts */}
        {group.isMember && <CreatePostForm onPostCreated={handlePostCreated} groupId={groupId} />}

        {!group.isMember ? (
          <div className="text-center py-16">
            <div className="h-16 w-16 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
              <Users className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-gray-500 dark:text-gray-400 font-medium">Join this group to see posts</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 dark:text-gray-400">No posts yet. Be the first to share!</p>
          </div>
        ) : (
          <div className="space-y-3 mt-4">
            {posts.map(function(p: any) {
              return <PostCard key={p.id} post={p} onReactionUpdate={handleReactionUpdate} onPostDelete={handlePostDelete} currentUserId={currentUserId} />;
            })}
          </div>
        )}
      </main>
      <BottomNav />
    </div>
  );
}