"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

type Post = {
    id: string;
    content: string;
    createdAt: string;
    anonymous: boolean;
    imageUrls: string | null; // <-- Added this
    author: { name: string; email: string };
    circle: { name: string; emoji: string } | null;
    _count: { reactions: number; replies: number };
};

export default function PostsModerationPage() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const fetchPosts = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/posts");
            const data = await res.json();
            if (res.ok) setPosts(data.posts);
        } catch (error) {
            console.error("Failed to fetch posts");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    const deletePost = async (id: string) => {
        if (!confirm("Are you sure you want to delete this post? It will be hidden from the platform.")) return;

        setDeletingId(id);
        try {
            const res = await fetch(`/api/posts/${id}`, { method: "DELETE" });
            if (res.ok) {
                setPosts(posts.filter(p => p.id !== id));
            }
        } catch (error) {
            console.error("Failed to delete post");
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-800">Content Moderation</h1>
                <p className="text-gray-500 mt-1">Review and delete inappropriate posts from the platform.</p>
            </div>

            {loading ? (
                <div className="text-center text-gray-500 py-12">Loading posts...</div>
            ) : posts.length === 0 ? (
                <div className="text-center text-gray-500 py-12 bg-white rounded-xl shadow-sm border border-gray-100">
                    No active posts found.
                </div>
            ) : (
                <div className="space-y-4">
                    {posts.map((post) => (
                        <div key={post.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 font-bold">
                                        {post.anonymous ? "?" : post.author.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="font-medium text-slate-800">
                                            {post.anonymous ? "Anonymous User" : post.author.name}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {new Date(post.createdAt).toLocaleString()}
                                            {post.circle && ` • Posted in ${post.circle.emoji} ${post.circle.name}`}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => deletePost(post.id)}
                                    disabled={deletingId === post.id}
                                    className="text-sm bg-red-50 text-red-600 hover:bg-red-100 px-4 py-2 rounded-lg font-medium transition disabled:opacity-50"
                                >
                                    {deletingId === post.id ? "Deleting..." : "Delete Post"}
                                </button>
                            </div>

                            <p className="text-slate-700 whitespace-pre-wrap mb-4">{post.content}</p>

                            {/* 🖼️ DISPLAY IMAGES */}
                            {post.imageUrls && (
                                <div className="flex gap-2 mb-4 flex-wrap">
                                    {(() => {
                                        try {
                                            // Handle JSON array of URLs
                                            if (post.imageUrls.startsWith('[')) {
                                                const images = JSON.parse(post.imageUrls);
                                                return images.map((img: string, i: number) => (
                                                    <div key={i} className="relative w-32 h-32 rounded-lg overflow-hidden border border-gray-200">
                                                        <Image
                                                            src={img}
                                                            alt="Post attachment"
                                                            fill
                                                            className="object-cover"
                                                        />
                                                    </div>
                                                ));
                                            }
                                            // Handle single URL
                                            return (
                                                <div className="relative w-48 h-48 rounded-lg overflow-hidden border border-gray-200">
                                                    <Image
                                                        src={post.imageUrls}
                                                        alt="Post attachment"
                                                        fill
                                                        className="object-cover"
                                                    />
                                                </div>
                                            );
                                        } catch (e) {
                                            return null;
                                        }
                                    })()}
                                </div>
                            )}

                            <div className="flex gap-4 text-sm text-gray-500 border-t border-gray-100 pt-4">
                                <span>❤️ {post._count.reactions} Reactions</span>
                                <span>💬 {post._count.replies} Replies</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}