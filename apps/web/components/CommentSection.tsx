"use client";

import { useState, useEffect } from "react";
import { MessageCircle, Trash2, Send } from "lucide-react";

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    image: string | null;
  };
}

interface CommentSectionProps {
  postId: string;
  currentUserId?: string;
  onCommentCountChange?: (count: number) => void;
}

export default function CommentSection({ 
  postId, 
  currentUserId, 
  onCommentCountChange 
}: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (showComments) {
      fetchComments();
    }
  }, [showComments]);

  const fetchComments = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/posts/${postId}/comments`);
      if (response.ok) {
        const data = await response.json();
        setComments(data);
        onCommentCountChange?.(data.length);
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newComment }),
      });

      if (response.ok) {
        const comment = await response.json();
        setComments([comment, ...comments]);
        setNewComment("");
        onCommentCountChange?.(comments.length + 1);
      }
    } catch (error) {
      console.error("Error posting comment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        const updatedComments = comments.filter((c) => c.id !== commentId);
        setComments(updatedComments);
        onCommentCountChange?.(updatedComments.length);
      }
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  const formatTimeAgo = (dateString: string) => {
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

  return (
    <div className="mt-3">
      {/* Toggle Comments Button */}
      <button
        onClick={() => setShowComments(!showComments)}
        className="flex items-center gap-1 text-sm text-gray-500 hover:text-green-600 transition-colors"
      >
        <MessageCircle className="h-4 w-4" />
        {comments.length > 0 ? `${comments.length} comments` : "Comment"}
      </button>

      {/* Comments Section */}
      {showComments && (
        <div className="mt-3 space-y-3">
          {/* Comment Input */}
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              className="flex-1 rounded-full border border-gray-200 bg-gray-50 px-4 py-2 text-sm focus:border-green-400 focus:outline-none focus:ring-2 focus:ring-green-400/20"
            />
            <button
              type="submit"
              disabled={!newComment.trim() || isSubmitting}
              className="rounded-full bg-green-600 p-2 text-white hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>

          {/* Comments List */}
          {isLoading ? (
            <p className="text-sm text-gray-500 py-2">Loading comments...</p>
          ) : comments.length === 0 ? (
            <p className="text-sm text-gray-500 py-2">No comments yet. Be the first!</p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {comments.map((comment) => (
                <div key={comment.id} className="flex items-start gap-2 rounded-lg bg-gray-50 p-3">
                  <div className="h-6 w-6 rounded-full bg-gradient-to-br from-green-400 to-blue-400 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {comment.user.name?.charAt(0) || "U"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-gray-900">
                        {comment.user.name || "Anonymous"}
                      </span>
                      <span className="text-xs text-gray-400">
                        {formatTimeAgo(comment.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 break-words">
                      {comment.content}
                    </p>
                  </div>
                  {currentUserId === comment.user.id && (
                    <button
                      onClick={() => handleDelete(comment.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}