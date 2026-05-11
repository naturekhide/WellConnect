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

  var renderContent = function(text: string) { if (!text) return null; return <p className="mt-4 text-gray-800 dark:text-gray-200 whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: text.replace(/#(\w+)/g, '<a href="/hashtag/$1" class="text-green-600 dark:text-green-400 hover:underline">#$1</a>') }}></p>; };

  return (
    <div className="rounded-2xl bg-white dark:bg-gray-800 p-5 shadow-md transition-shadow hover:shadow-lg relative">
      <div className="absolute top-3 right-3 flex items-center gap-2">
        <button onClick={handleBookmark} className="text-gray-400 hover:text-yellow-500 transition-colors" title={isBookmarked ? "Remove bookmark" : "Bookmark"}>
          {isBookmarked ? <BookmarkCheck className="h-4 w-4 text-yellow-500" /> : <Bookmark className="h-4 w-4" />}
        </button>
        {isOwner && <button onClick={handleDelete} className="text-gray-400 hover:text-red-500 transition-colors" title="Delete post"><Trash2 className="h-4 w-4" /></button>}
      </div>
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-green-400 to-blue-400 flex items-center justify-center text-white font-semibold">{post.author?.name?.charAt(0) || "U"}</div>
        <div><p className="font-medium text-gray-900 dark:text-gray-100">{post.author?.name || "Anonymous"}{post.author?.username && <span className="text-gray-500 dark:text-gray-400 font-normal ml-1">@{post.author?.username}</span>}</p><p className="text-xs text-gray-500 dark:text-gray-400">{formatDate(post.createdAt)}</p></div>
      </div>
      {renderContent(post.content)}
      {post.imageUrl && <img src={post.imageUrl} alt="Post" className="mt-3 max-h-96 w-full rounded-lg object-cover" />}
      {post.videoUrl && <video src={post.videoUrl} controls className="mt-3 max-h-96 w-full rounded-lg" preload="metadata" playsInline />}
      {post.poll && <div className="mt-3 space-y-2">{post.poll.options && post.poll.options.map(function(opt: any) { var total = post.poll.options.reduce(function(s: number, o: any) { return s + (o._count?.votes || 0); }, 0); var pct = total > 0 ? Math.round(((opt._count?.votes || 0) / total) * 100) : 0; var hasVoted = post.poll.options.some(function(o: any) { return o.votes && o.votes.length > 0; }); return <button key={opt.id} onClick={function() { if (!hasVoted) handleVote(post.id, opt.id); }} disabled={hasVoted} className="w-full text-left relative overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-80"><div className="absolute inset-0 bg-green-100 dark:bg-green-900 rounded-lg" style={{ width: pct + "%", opacity: 0.3 }}></div><div className="relative flex justify-between"><span className="text-sm text-gray-900 dark:text-gray-100">{opt.text}</span>{hasVoted && <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{pct}%</span>}</div></button>; })}<p className="text-xs text-gray-500 dark:text-gray-400">{post.poll.options ? post.poll.options.reduce(function(s: number, o: any) { return s + (o._count?.votes || 0); }, 0) : 0} votes</p></div>}
      <div className="mt-4 flex items-center justify-between border-t border-gray-100 dark:border-gray-700 pt-3">
        <span className="text-sm text-gray-500 dark:text-gray-400">{totalReactions > 0 ? totalReactions + " reactions" : "Be the first to react"}</span>
        <div className="flex gap-1 sm:gap-3">
          <button onClick={function() { handleReaction("HUG"); }} disabled={isSubmitting} className="flex items-center gap-1 rounded-full px-2 sm:px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:bg-pink-50 dark:hover:bg-pink-900 hover:text-pink-600 disabled:opacity-50">🤗 {(post.reactions?.hug || 0) > 0 && <span className="text-xs">({post.reactions?.hug || 0})</span>}</button>
          <button onClick={function() { handleReaction("GROWTH"); }} disabled={isSubmitting} className="flex items-center gap-1 rounded-full px-2 sm:px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:bg-green-50 dark:hover:bg-green-900 hover:text-green-600 disabled:opacity-50">🌱 {(post.reactions?.growth || 0) > 0 && <span className="text-xs">({post.reactions?.growth || 0})</span>}</button>
          <button onClick={function() { handleReaction("STRENGTH"); }} disabled={isSubmitting} className="flex items-center gap-1 rounded-full px-2 sm:px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:bg-blue-50 dark:hover:bg-blue-900 hover:text-blue-600 disabled:opacity-50">💪 {(post.reactions?.strength || 0) > 0 && <span className="text-xs">({post.reactions?.strength || 0})</span>}</button>
          <button onClick={function() { handleReaction("GRATEFUL"); }} disabled={isSubmitting} className="flex items-center gap-1 rounded-full px-2 sm:px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:bg-purple-50 dark:hover:bg-purple-900 hover:text-purple-600 disabled:opacity-50">🙏 {(post.reactions?.grateful || 0) > 0 && <span className="text-xs">({post.reactions?.grateful || 0})</span>}</button>
        </div>
      </div>
      <CommentSection postId={post.id} currentUserId={currentUserId} onCommentCountChange={setCommentCount} />
    </div>
  );
}