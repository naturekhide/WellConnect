"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Header from "@/components/Header";
import PostCard from "@/components/PostCard";
import CreatePostForm from "@/components/CreatePostForm";

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

  if (isLoading) return <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800"><Header userName={userName} /><div className="text-center py-12"><p className="text-gray-600 dark:text-gray-400">Loading...</p></div></div>;
  if (!group) return <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800"><Header userName={userName} /><div className="text-center py-12"><p className="text-gray-600 dark:text-gray-400">Group not found</p></div></div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800"><Header userName={userName} /><main className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6 rounded-2xl bg-white dark:bg-gray-800 p-6 shadow-md">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-lg bg-gradient-to-br from-green-400 to-blue-400 flex items-center justify-center text-white text-2xl font-bold">{group.name.charAt(0)}</div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{group.name}</h1>
              <p className="text-gray-600 dark:text-gray-400">{group.description || "No description"}</p>
              <div className="mt-2 flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400"><span>👥 {group.memberCount} members</span><span>🏷️ {group.category}</span></div>
            </div>
          </div>
          <div className="flex gap-2">
            {group.isMember && <button onClick={function() { router.push("/groups/" + groupId + "/chat"); }} className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700">💬 Chat</button>}
            {!group.isMember && <button onClick={handleJoin} className="rounded-lg bg-green-600 px-4 py-2 text-sm text-white hover:bg-green-700">Join Group</button>}
          </div>
        </div>
      </div>
      {group.isMember && <CreatePostForm onPostCreated={handlePostCreated} groupId={groupId} />}
      {!group.isMember ? <div className="rounded-2xl bg-white dark:bg-gray-800 p-8 text-center shadow-md"><p className="text-gray-600 dark:text-gray-400">Join this group to see posts</p></div> : posts.length === 0 ? <div className="rounded-2xl bg-white dark:bg-gray-800 p-8 text-center shadow-md"><p className="text-gray-600 dark:text-gray-400">No posts yet</p></div> : <div className="space-y-4">{posts.map(function(p: any) { return <PostCard key={p.id} post={p} onReactionUpdate={handleReactionUpdate} onPostDelete={handlePostDelete} currentUserId={currentUserId} />; })}</div>}
    </main></div>
  );
}