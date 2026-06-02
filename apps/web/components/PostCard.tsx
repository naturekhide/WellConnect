"use client";

import { useState } from "react";
import CommentSection from "./CommentSection";
import { Trash2, Bookmark, BookmarkCheck } from "lucide-react";

export default function PostCard({ post, onReactionUpdate, onPollUpdate, currentUserId, onPostDelete, onBookmarkToggle }: any) {
  var [isSubmitting, setIsSubmitting] = useState(false);
  var [commentCount, setCommentCount] = useState(post.commentCount || 0);
  var [isBookmarked, setIsBookmarked] = useState(post.isBookmarked || false);
  var totalReactions = (post.reactions?.hug || 0) + (post.reactions?.growth || 0) + (post.reactions?.strength || 0) + (post.reactions?.grateful || 0);
  var isOwner = currentUserId && post.author?.id === currentUserId;

  var formatDate = function(d: string) { var date = new Date(d); var now = new Date(); var diff = now.getTime() - date.getTime(); var mins = Math.floor(diff / 60000), hrs = Math.floor(diff / 3600000), days = Math.floor(diff / 86400000); if (mins < 1) return "just now"; if (mins < 60) return mins + "m ago"; if (hrs < 24) return hrs + "h ago"; if (days < 7) return days + "d ago"; return date.toLocaleDateString(); };
  var handleReaction = async function(type: string) { if (isSubmitting) return; setIsSubmitting(true); try { var r = await fetch("/api/posts/" + post.id + "/reactions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type }) }); if (r.ok) { var d = await r.json(); onReactionUpdate(post.id, d); } } catch (e) {} finally { setIsSubmitting(false); } };
  var handleVote = async function(postId: string, optionId: string) { var r = await fetch("/api/polls/" + postId + "/vote", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ optionId }) }); if (r.ok) { var d = await r.json(); if (onPollUpdate) onPollUpdate(postId, d); } };
  var handleDelete = async function() { if (!confirm("Delete this post?")) return; var r = await fetch("/api/posts/" + post.id, { method: "DELETE" }); if (r.ok && onPostDelete) onPostDelete(post.id); };
  var handleBookmark = async function() { var r = await fetch("/api/bookmarks", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ postId: post.id }) }); if (r.ok) { var d = await r.json(); setIsBookmarked(d.bookmarked); if (onBookmarkToggle) onBookmarkToggle(post.id, d.bookmarked); } };

  var renderContent = function(text: string) { if (!text) return null; return <p className="mt-3 text-gray-700 dark:text-gray-300 whitespace-pre-wrap text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: text.replace(/#(\w+)/g, '<a href="/hashtag/$1" class="text-emerald-600 dark:text-emerald-400 hover:underline">#$1</a>') }}></p>; };

  var reactions = [
    { type: "HUG", emoji: "🤗", color: "hover:bg-rose-50 dark:hover:bg-rose-900/30 hover:text-rose-500", count: post.reactions?.hug || 0 },
    { type: "GROWTH", emoji: "🌱", color: "hover:bg-emerald-50 dark:hover:bg-emerald-900/30 hover:text-emerald-500", count: post.reactions?.growth || 0 },
    { type: "STRENGTH", emoji: "💪", color: "hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-500", count: post.reactions?.strength || 0 },
    { type: "GRATEFUL", emoji: "🙏", color: "hover:bg-purple-50 dark:hover:bg-purple-900/30 hover:text-purple-500", count: post.reactions?.grateful || 0 },
  ];

  return (
    <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-400 flex items-center justify-center text-white font-semibold text-sm">
            {post.author?.name?.charAt(0) || "U"}
          </div>
          <div>
            <p className="font-medium text-sm text-gray-900 dark:text-gray-100">
              {post.author?.name || "Anonymous"}
              {post.author?.username && <span className="text-gray-400 dark:text-gray-500 font-normal ml-1 text-xs">@{post.author?.username}</span>}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500">{formatDate(post.createdAt)}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={handleBookmark} className="p-1.5 rounded-lg text-gray-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-all" title={isBookmarked ? "Remove bookmark" : "Bookmark"}>
            {isBookmarked ? <BookmarkCheck className="h-4 w-4 text-amber-500 fill-amber-500" /> : <Bookmark className="h-4 w-4" />}
          </button>
          {isOwner && (
            <button onClick={handleDelete} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all" title="Delete post">
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="px-4">
        {renderContent(post.content)}
        {post.imageUrl && <img src={post.imageUrl} alt="Post" className="mt-3 max-h-96 w-full rounded-xl object-cover" />}
        {post.videoUrl && <video src={post.videoUrl} controls className="mt-3 max-h-96 w-full rounded-xl" preload="metadata" playsInline />}
      </div>

      {/* Poll */}
      {post.poll && (
        <div className="px-4 mt-3 space-y-1.5">
          {post.poll.options && post.poll.options.map(function(opt: any) {
            var total = post.poll.options.reduce(function(s: number, o: any) { return s + (o._count?.votes || 0); }, 0);
            var pct = total > 0 ? Math.round(((opt._count?.votes || 0) / total) * 100) : 0;
            var hasVoted = post.poll.options.some(function(o: any) { return o.votes && o.votes.length > 0; });
            return (
              <button key={opt.id} onClick={function() { if (!hasVoted) handleVote(post.id, opt.id); }} disabled={hasVoted} className="w-full text-left relative overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 p-3 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-80 transition-all">
                <div className="absolute inset-0 bg-emerald-100 dark:bg-emerald-900/30" style={{ width: pct + "%" }}></div>
                <div className="relative flex justify-between text-sm">
                  <span className="text-gray-900 dark:text-gray-100">{opt.text}</span>
                  {hasVoted && <span className="font-medium text-gray-900 dark:text-gray-100">{pct}%</span>}
                </div>
              </button>
            );
          })}
          <p className="text-xs text-gray-400 dark:text-gray-500 pt-1">
            {post.poll.options ? post.poll.options.reduce(function(s: number, o: any) { return s + (o._count?.votes || 0); }, 0) : 0} votes
          </p>
        </div>
      )}

      {/* Reactions */}
      <div className="flex items-center justify-between px-4 py-3 mt-2 border-t border-gray-50 dark:border-gray-800">
        <span className="text-xs text-gray-400 dark:text-gray-500">
          {totalReactions > 0 ? totalReactions + " reaction" + (totalReactions !== 1 ? "s" : "") : ""}
        </span>
        <div className="flex gap-0.5">
          {reactions.map(function(r: any) {
            return (
              <button
                key={r.type}
                onClick={function() { handleReaction(r.type); }}
                disabled={isSubmitting}
                className={"flex items-center gap-1 rounded-full px-2.5 py-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 transition-all disabled:opacity-50 " + r.color}
              >
                {r.emoji} {r.count > 0 && <span>{r.count}</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Comments */}
      <CommentSection postId={post.id} currentUserId={currentUserId} onCommentCountChange={setCommentCount} />
    </div>
  );
}