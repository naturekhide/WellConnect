"use client";

import { useState, useEffect } from "react";
import { MessageCircle, Trash2, Send, CornerDownRight } from "lucide-react";
import EmojiPicker from "./EmojiPicker";

export default function CommentSection({ postId, currentUserId, onCommentCountChange }: any) {
  var [comments, setComments] = useState<any[]>([]);
  var [newComment, setNewComment] = useState("");
  var [isLoading, setIsLoading] = useState(false);
  var [showComments, setShowComments] = useState(false);
  var [isSubmitting, setIsSubmitting] = useState(false);
  var [replyTo, setReplyTo] = useState<any>(null);
  var [replyContent, setReplyContent] = useState("");
  var [totalCount, setTotalCount] = useState(0);
  var [showEmoji, setShowEmoji] = useState(false);

  useEffect(function() { if (showComments) fetchComments(); }, [showComments]);

  var fetchComments = async function() {
    setIsLoading(true);
    try { var r = await fetch("/api/posts/" + postId + "/comments"); if (r.ok) { var d = await r.json(); setComments(d); var count = d.reduce(function(acc: number, c: any) { return acc + 1 + (c.replies?.length || 0); }, 0); setTotalCount(count); onCommentCountChange?.(count); } }
    catch (e) { }
    finally { setIsLoading(false); }
  };

  var handleSubmit = async function(e: any, parentId: any) {
    e.preventDefault();
    var content = parentId ? replyContent : newComment;
    if (!content.trim() || isSubmitting) return;
    setIsSubmitting(true);
    try { var r = await fetch("/api/posts/" + postId + "/comments", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ content, parentId }) }); if (r.ok) { if (parentId) { setReplyContent(""); setReplyTo(null); } else { setNewComment(""); } fetchComments(); } }
    catch (e) { }
    finally { setIsSubmitting(false); }
  };

  var handleDelete = async function(commentId: string) { var r = await fetch("/api/comments/" + commentId, { method: "DELETE" }); if (r.ok) fetchComments(); };

  var formatTimeAgo = function(d: string) { var diff = (Date.now() - new Date(d).getTime()) / 60000; if (diff < 1) return "just now"; if (diff < 60) return Math.floor(diff) + "m ago"; if (diff < 1440) return Math.floor(diff / 60) + "h ago"; return Math.floor(diff / 1440) + "d ago"; };

  return (
    <div className="mt-3">
      <button onClick={function() { setShowComments(!showComments); }} className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-green-600 transition-colors"><MessageCircle className="h-4 w-4" />{totalCount > 0 ? totalCount + " comments" : "Comment"}</button>
      {showComments && (
        <div className="mt-3 space-y-3">
          <form onSubmit={function(e: any) { handleSubmit(e, null); }} className="flex gap-2">
            <input type="text" value={newComment} onChange={function(e: any) { setNewComment(e.target.value); }} placeholder="Write a comment..." className="flex-1 rounded-full border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 px-4 py-2 text-sm text-gray-900 dark:text-gray-100 focus:border-green-400 focus:outline-none" />
            <div className="relative">
              <button type="button" onClick={function() { setShowEmoji(!showEmoji); }} className="text-gray-400 hover:text-gray-600 p-2">😀</button>
              {showEmoji && <EmojiPicker onSelect={function(emoji: string) { setNewComment(newComment + emoji); setShowEmoji(false); }} onClose={function() { setShowEmoji(false); }} />}
            </div>
            <button type="submit" disabled={!newComment.trim() || isSubmitting} className="rounded-full bg-green-600 p-2 text-white hover:bg-green-700 disabled:opacity-50"><Send className="h-4 w-4" /></button>
          </form>
          {isLoading ? <p className="text-sm text-gray-500 py-2">Loading...</p> : comments.length === 0 ? <p className="text-sm text-gray-500 py-2">No comments yet.</p> : <div className="space-y-3 max-h-80 overflow-y-auto">
            {comments.map(function(comment: any) {
              return (
                <div key={comment.id}>
                  <div className="flex items-start gap-2 rounded-lg bg-gray-50 dark:bg-gray-700 p-3">
                    <div className="h-6 w-6 rounded-full bg-gradient-to-br from-green-400 to-blue-400 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">{comment.user?.name?.charAt(0) || "U"}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2"><span className="text-xs font-medium text-gray-900 dark:text-gray-100">{comment.user?.name}</span>{comment.user?.username && <span className="text-xs text-gray-400">@{comment.user.username}</span>}<span className="text-xs text-gray-400">{formatTimeAgo(comment.createdAt)}</span></div>
                      <p className="text-sm text-gray-700 dark:text-gray-300">{comment.content}</p>
                      <button onClick={function() { setReplyTo(replyTo?.id === comment.id ? null : comment); }} className="text-xs text-green-600 dark:text-green-400 mt-1 flex items-center gap-1"><CornerDownRight className="h-3 w-3" /> Reply</button>
                    </div>
                    {currentUserId === comment.user?.id && <button onClick={function() { handleDelete(comment.id); }} className="text-gray-400 hover:text-red-500"><Trash2 className="h-3.5 w-3.5" /></button>}
                  </div>
                  {replyTo?.id === comment.id && (
                    <form onSubmit={function(e: any) { handleSubmit(e, comment.id); }} className="ml-8 mt-2 flex gap-2">
                      <input type="text" value={replyContent} onChange={function(e: any) { setReplyContent(e.target.value); }} placeholder="Write a reply..." className="flex-1 rounded-full border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 px-3 py-1.5 text-xs focus:border-green-400 focus:outline-none text-gray-900 dark:text-gray-100" />
                      <button type="submit" disabled={!replyContent.trim()} className="rounded-full bg-green-600 p-1.5 text-white disabled:opacity-50"><Send className="h-3 w-3" /></button>
                    </form>
                  )}
                  {comment.replies && comment.replies.length > 0 && <div className="ml-8 mt-2 space-y-2">{comment.replies.map(function(reply: any) { return <div key={reply.id} className="flex items-start gap-2 rounded-lg bg-gray-50 dark:bg-gray-600 p-2"><div className="h-5 w-5 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">{reply.user?.name?.charAt(0) || "U"}</div><div className="flex-1"><div className="flex items-center gap-1"><span className="text-xs font-medium text-gray-900 dark:text-gray-100">{reply.user?.name}</span><span className="text-xs text-gray-400">{formatTimeAgo(reply.createdAt)}</span></div><p className="text-xs text-gray-700 dark:text-gray-300">{reply.content}</p></div>{currentUserId === reply.user?.id && <button onClick={function() { handleDelete(reply.id); }} className="text-gray-400 hover:text-red-500"><Trash2 className="h-3 w-3" /></button>}</div>; })}</div>}
                </div>
              );
            })}
          </div>}
        </div>
      )}
    </div>
  );
}