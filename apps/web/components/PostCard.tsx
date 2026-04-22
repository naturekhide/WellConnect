"use client";

import { useState } from "react";
import CommentSection from "./CommentSection";

interface PostCardProps {
  post: {
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
  };
  onReactionUpdate: (postId: string, newReactions: any) => void;
  currentUserId?: string;
}

export default function PostCard({ post, onReactionUpdate, currentUserId }: PostCardProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [commentCount, setCommentCount] = useState(post.commentCount || 0);
  
  const totalReactions = 
    post.reactions.hug + 
    post.reactions.growth + 
    post.reactions.strength + 
    post.reactions.grateful;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const handleReaction = async (type: string) => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/posts/${post.id}/reactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type }),
      });

      if (response.ok) {
        const newReactions = await response.json();
        onReactionUpdate(post.id, newReactions);
      }
    } catch (error) {
      console.error("Error adding reaction:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-2xl bg-white p-5 shadow-md transition-shadow hover:shadow-lg">
      {/* Author Info */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-green-400 to-blue-400 flex items-center justify-center text-white font-semibold">
          {post.author.name.charAt(0)}
        </div>
        <div>
          <p className="font-medium text-gray-900">{post.author.name}</p>
          <p className="text-xs text-gray-500">{formatDate(post.createdAt)}</p>
        </div>
      </div>

      {/* Post Content */}
      <p className="mt-4 text-gray-800 whitespace-pre-wrap">{post.content}</p>

      {/* Reactions Bar */}
      <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3">
        <div className="flex items-center gap-1">
          <span className="text-sm text-gray-500">
            {totalReactions > 0 ? `${totalReactions} reactions` : "Be the first to react"}
          </span>
        </div>
        
        <div className="flex gap-1 sm:gap-3">
          <button
            onClick={() => handleReaction("HUG")}
            disabled={isSubmitting}
            className="flex items-center gap-1 rounded-full px-2 sm:px-3 py-1 text-sm text-gray-600 hover:bg-pink-50 hover:text-pink-600 transition-colors disabled:opacity-50"
          >
            🤗 <span className="hidden sm:inline">Hug</span>
            {post.reactions.hug > 0 && <span className="text-xs">({post.reactions.hug})</span>}
          </button>
          <button
            onClick={() => handleReaction("GROWTH")}
            disabled={isSubmitting}
            className="flex items-center gap-1 rounded-full px-2 sm:px-3 py-1 text-sm text-gray-600 hover:bg-green-50 hover:text-green-600 transition-colors disabled:opacity-50"
          >
            🌱 <span className="hidden sm:inline">Growth</span>
            {post.reactions.growth > 0 && <span className="text-xs">({post.reactions.growth})</span>}
          </button>
          <button
            onClick={() => handleReaction("STRENGTH")}
            disabled={isSubmitting}
            className="flex items-center gap-1 rounded-full px-2 sm:px-3 py-1 text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-colors disabled:opacity-50"
          >
            💪 <span className="hidden sm:inline">Strength</span>
            {post.reactions.strength > 0 && <span className="text-xs">({post.reactions.strength})</span>}
          </button>
          <button
            onClick={() => handleReaction("GRATEFUL")}
            disabled={isSubmitting}
            className="flex items-center gap-1 rounded-full px-2 sm:px-3 py-1 text-sm text-gray-600 hover:bg-purple-50 hover:text-purple-600 transition-colors disabled:opacity-50"
          >
            🙏 <span className="hidden sm:inline">Grateful</span>
            {post.reactions.grateful > 0 && <span className="text-xs">({post.reactions.grateful})</span>}
          </button>
        </div>
      </div>

      {/* Comment Section */}
      <CommentSection 
        postId={post.id} 
        currentUserId={currentUserId}
        onCommentCountChange={setCommentCount}
      />
    </div>
  );
}