"use client";

/**
 * Copyright 2026 Ibrahim Aswad Nindow
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *     http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import PostCard from "@/components/PostCard";
import CreatePostForm from "@/components/CreatePostForm";

interface Post {
  id: string;
  content: string;
  imageUrl?: string;
  createdAt: string;
  author: {
    name: string;
    image: string | null;
  };
  reactions: {
    hug: number;
    growth: number;
    strength: number;
    grateful: number;
  };
  commentCount: number;
}

export default function FeedPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    fetchPosts();
    fetchUserName();
  }, []);

  const fetchUserName = async () => {
    try {
      const response = await fetch("/api/auth/session");
      const session = await response.json();
      setUserName(session?.user?.name || "Friend");
    } catch (error) {
      console.error("Error fetching user:", error);
    }
  };

  const fetchPosts = async () => {
    try {
      const response = await fetch("/api/posts");
      if (response.ok) {
        const data = await response.json();
        setPosts(data);
      } else if (response.status === 401) {
        router.push("/login");
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePostCreated = (newPost: Post) => {
    setPosts([newPost, ...posts]);
  };

  const handleReactionUpdate = (postId: string, newReactions: Post["reactions"]) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { ...post, reactions: newReactions }
        : post
    ));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
        <Header userName={userName} />
        <main className="mx-auto max-w-3xl px-4 py-8">
          <div className="text-center py-12">
            <p className="text-gray-600">Loading feed...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <Header userName={userName} />
      
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Create Post Form */}
        <CreatePostForm onPostCreated={handlePostCreated} />

        {/* Feed Tabs */}
        <div className="mb-4 flex gap-4 border-b border-gray-200">
          <button className="border-b-2 border-green-600 px-2 py-2 text-sm font-medium text-green-600">
            For You
          </button>
          <button className="px-2 py-2 text-sm font-medium text-gray-500 hover:text-gray-700">
            Following
          </button>
          <button className="px-2 py-2 text-sm font-medium text-gray-500 hover:text-gray-700">
            Trending
          </button>
        </div>

        {/* Posts Feed */}
        {posts.length === 0 ? (
          <div className="rounded-2xl bg-white p-8 text-center shadow-md">
            <p className="text-gray-600">No posts yet. Be the first to share!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <PostCard 
                key={post.id} 
                post={post} 
                onReactionUpdate={handleReactionUpdate}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}