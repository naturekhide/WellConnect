"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Header from "@/components/Header";
import PostCard from "@/components/PostCard";

export default function HashtagPage() {
  var params = useParams();
  var tag = params.tag as string;
  var [posts, setPosts] = useState<any[]>([]);
  var [isLoading, setIsLoading] = useState(true);
  var [userName, setUserName] = useState("");
  var [currentUserId, setCurrentUserId] = useState("");

  useEffect(function() { fetchUser(); fetchPosts(); }, [tag]);

  var fetchUser = async function() {
    var r = await fetch("/api/auth/session");
    if (r.ok) { var s = await r.json(); setUserName(s?.user?.name || "Friend"); setCurrentUserId(s?.user?.id || ""); }
  };

  var fetchPosts = async function() {
    var r = await fetch("/api/search?q=" + encodeURIComponent("#" + tag) + "&type=posts");
    if (r.ok) { var d = await r.json(); setPosts(d.posts || []); }
    setIsLoading(false);
  };

  if (isLoading) return <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50"><Header userName={userName} /><main className="mx-auto max-w-3xl px-4 py-8"><div className="flex justify-center py-12"><div className="h-8 w-8 animate-spin rounded-full border-4 border-green-600 border-t-transparent"></div></div></main></div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <Header userName={userName} />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <div className="mb-6"><h1 className="text-2xl font-bold text-gray-900">#{tag}</h1><p className="text-gray-600">{posts.length} posts</p></div>
        {posts.length === 0 ? <div className="rounded-2xl bg-white p-8 text-center shadow-md"><p className="text-gray-600">No posts with this hashtag yet</p></div> : <div className="space-y-4">{posts.map(function(post: any) { return <PostCard key={post.id} post={post} currentUserId={currentUserId} onReactionUpdate={function() {}} />; })}</div>}
      </main>
    </div>
  );
}