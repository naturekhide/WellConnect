"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import { Plus, X, ChevronLeft, ChevronRight, Eye, Trash2, Send } from "lucide-react";

export default function StoriesPage() {
  var [groups, setGroups] = useState<any[]>([]);
  var [isLoading, setIsLoading] = useState(true);
  var [userName, setUserName] = useState("");
  var [currentUserId, setCurrentUserId] = useState("");
  var [viewingStory, setViewingStory] = useState<any>(null);
  var [viewingIndex, setViewingIndex] = useState(0);
  var [showUpload, setShowUpload] = useState(false);
  var [uploadFile, setUploadFile] = useState<File | null>(null);
  var [caption, setCaption] = useState("");
  var [replies, setReplies] = useState<any[]>([]);
  var [replyText, setReplyText] = useState("");
  var [showReplies, setShowReplies] = useState(false);
  var [refreshKey, setRefreshKey] = useState(0);
  var [reactions, setReactions] = useState<any>({ HUG: 0, GROWTH: 0, STRENGTH: 0, GRATEFUL: 0 });

  useEffect(function() { fetchUser(); fetchStories(); }, [refreshKey]);
  useEffect(function() { if (!viewingStory) return; var i = setInterval(function() { fetchStories(); }, 5000); return function() { clearInterval(i); }; }, [viewingStory]);

  var fetchUser = async function() { var r = await fetch("/api/auth/session"); if (r.ok) { var s = await r.json(); setUserName(s?.user?.name || "Friend"); setCurrentUserId(s?.user?.id || ""); } };
  var fetchStories = async function() { var r = await fetch("/api/stories"); if (r.ok) setGroups(await r.json()); setIsLoading(false); };
  var handleUpload = async function() { if (!uploadFile) return; var fd = new FormData(); fd.append("file", uploadFile); var r = await fetch("/api/upload", { method: "POST", body: fd }); if (r.ok) { var d = await r.json(); var type = uploadFile.type.startsWith("video/") ? "video" : "image"; await fetch("/api/stories", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ mediaUrl: d.url, type, caption: caption || null }) }); setShowUpload(false); setUploadFile(null); setCaption(""); setRefreshKey(refreshKey + 1); } };
  var handleStoryClick = function(group: any) { setViewingStory(group); setViewingIndex(0); setShowReplies(false); setReactions({ HUG: 0, GROWTH: 0, STRENGTH: 0, GRATEFUL: 0 }); fetch("/api/stories/" + group.stories[0].id + "/view", { method: "POST" }).then(function() { setRefreshKey(refreshKey + 1); }); };
  var nextStory = function() { if (!viewingStory) return; if (viewingIndex < viewingStory.stories.length - 1) { var n = viewingIndex + 1; setViewingIndex(n); fetch("/api/stories/" + viewingStory.stories[n].id + "/view", { method: "POST" }).then(function() { setRefreshKey(refreshKey + 1); }); setShowReplies(false); setReactions({ HUG: 0, GROWTH: 0, STRENGTH: 0, GRATEFUL: 0 }); } else { setViewingStory(null); } };
  var prevStory = function() { if (!viewingStory || viewingIndex === 0) return; setViewingIndex(viewingIndex - 1); setShowReplies(false); setReactions({ HUG: 0, GROWTH: 0, STRENGTH: 0, GRATEFUL: 0 }); };
  var handleDelete = async function(id: string) { if (!confirm("Delete?")) return; await fetch("/api/stories/" + id, { method: "DELETE" }); setViewingStory(null); setRefreshKey(refreshKey + 1); };
  var handleReply = async function() { if (!replyText.trim() || !viewingStory) return; var s = viewingStory.stories[viewingIndex]; var r = await fetch("/api/stories/" + s.id + "/reply", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ content: replyText }) }); if (r.ok) { setReplyText(""); var rr = await fetch("/api/stories/" + s.id + "/reply"); if (rr.ok) setReplies(await rr.json()); } };
  var toggleReplies = async function() { if (!viewingStory) return; var s = viewingStory.stories[viewingIndex]; if (!showReplies) { var r = await fetch("/api/stories/" + s.id + "/reply"); if (r.ok) setReplies(await r.json()); } setShowReplies(!showReplies); };
  var handleReact = async function(type: string) { if (!viewingStory) return; var s = viewingStory.stories[viewingIndex]; var r = await fetch("/api/stories/" + s.id + "/react", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type }) }); if (r.ok) setReactions(await r.json()); };

  if (isLoading) return <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800"><Header userName={userName} /><div className="flex justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-4 border-green-600 border-t-transparent"></div></div></div>;

  var currentStory = viewingStory?.stories?.[viewingIndex];
  var isOwner = currentStory?.userId === currentUserId;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800"><Header userName={userName} /><main className="mx-auto max-w-3xl px-4 py-8">
      <div className="flex items-center justify-between mb-4"><h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Stories</h1><button onClick={function() { setShowUpload(true); }} className="rounded-full bg-green-600 p-2 text-white hover:bg-green-700"><Plus className="h-5 w-5" /></button></div>
      {showUpload && <div className="mb-4 p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-md space-y-3"><input type="file" accept="image/*,video/*" onChange={function(e: any) { setUploadFile(e.target.files[0]); }} /><input type="text" value={caption} onChange={function(e: any) { setCaption(e.target.value); }} placeholder="Add a caption..." className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700 p-2 text-sm text-gray-900 dark:text-gray-100" /><div className="flex gap-2"><button onClick={handleUpload} disabled={!uploadFile} className="rounded-lg bg-green-600 px-4 py-2 text-sm text-white disabled:opacity-50">Upload</button><button onClick={function() { setShowUpload(false); }} className="rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">Cancel</button></div></div>}
      <div className="flex gap-4 overflow-x-auto pb-4">{groups.map(function(g: any) { var unseen = g.stories.some(function(s: any) { return s.views?.length === 0 && s.userId !== currentUserId; }); return <button key={g.user.id} onClick={function() { handleStoryClick(g); }} className="flex flex-col items-center gap-1 flex-shrink-0"><div className={"h-16 w-16 rounded-full p-0.5 " + (unseen ? "bg-gradient-to-br from-green-400 to-blue-400" : "bg-gray-300 dark:bg-gray-600")}><div className="h-full w-full rounded-full bg-white dark:bg-gray-800 p-0.5"><div className="h-full w-full rounded-full bg-gradient-to-br from-green-400 to-blue-400 flex items-center justify-center text-white font-bold text-lg">{g.user.name?.charAt(0) || "U"}</div></div></div><span className="text-xs text-gray-600 dark:text-gray-400 truncate max-w-[64px]">{g.user.username || g.user.name}</span></button>; })}</div>
      {viewingStory && <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
        <button onClick={function() { setViewingStory(null); }} className="absolute top-4 right-4 text-white z-10"><X className="h-6 w-6" /></button>
        <button onClick={prevStory} className="absolute left-4 text-white z-10"><ChevronLeft className="h-8 w-8" /></button>
        <button onClick={nextStory} className="absolute right-4 text-white z-10"><ChevronRight className="h-8 w-8" /></button>
        <div className="absolute top-4 left-4 text-white text-sm z-10 flex items-center gap-3"><span className="flex items-center gap-1"><Eye className="h-4 w-4" /> {currentStory?._count?.views || 0}</span>{isOwner ? <><button onClick={toggleReplies} className="px-3 py-1 rounded-full bg-white/20 hover:bg-white/30">💬 Replies</button><button onClick={function() { handleDelete(currentStory.id); }} className="text-red-400 hover:text-red-300"><Trash2 className="h-4 w-4" /></button></> : <button onClick={toggleReplies} className={"px-3 py-1 rounded-full " + (showReplies ? "bg-green-600" : "bg-white/20 hover:bg-white/30")}>💬 {showReplies ? "Hide" : "Reply"}</button>}</div>
        <div className="absolute top-12 left-1/2 -translate-x-1/2 flex gap-1 z-10">{viewingStory.stories.map(function(_: any, i: number) { return <div key={i} className={"h-1 w-8 rounded-full " + (i <= viewingIndex ? "bg-white" : "bg-gray-500")}></div>; })}</div>
        {currentStory?.type === "video" ? <video src={currentStory.mediaUrl} controls autoPlay className="max-h-screen max-w-full" /> : <img src={currentStory.mediaUrl} alt="Story" className="max-h-screen max-w-full object-contain" />}
        {currentStory?.caption && <div className="absolute bottom-28 left-1/2 -translate-x-1/2 text-white text-sm bg-black/50 px-4 py-2 rounded-full">{currentStory.caption}</div>}
        {!isOwner && <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex gap-4 z-10"><button onClick={function() { handleReact("HUG"); }} className="text-2xl hover:scale-125 transition-transform">🤗 <span className="text-xs text-white">{reactions.HUG || 0}</span></button><button onClick={function() { handleReact("GROWTH"); }} className="text-2xl hover:scale-125 transition-transform">🌱 <span className="text-xs text-white">{reactions.GROWTH || 0}</span></button><button onClick={function() { handleReact("STRENGTH"); }} className="text-2xl hover:scale-125 transition-transform">💪 <span className="text-xs text-white">{reactions.STRENGTH || 0}</span></button><button onClick={function() { handleReact("GRATEFUL"); }} className="text-2xl hover:scale-125 transition-transform">🙏 <span className="text-xs text-white">{reactions.GRATEFUL || 0}</span></button></div>}
        {showReplies && isOwner && <div className="absolute bottom-0 left-0 right-0 bg-black/80 p-4 z-20 max-h-48 overflow-y-auto"><h3 className="text-white text-sm font-medium mb-2">Replies</h3>{replies.length === 0 ? <p className="text-gray-400 text-xs">No replies yet</p> : replies.map(function(r: any) { return <div key={r.id} className="text-white text-sm mb-1"><span className="font-medium">{r.user.name}</span>: {r.content}</div>; })}</div>}
        {showReplies && !isOwner && <div className="absolute bottom-0 left-0 right-0 bg-black/80 p-4 z-20 max-h-48 overflow-y-auto"><h3 className="text-white text-sm font-medium mb-2">Your Reply</h3>{replies.length === 0 ? <div className="flex gap-2"><input type="text" value={replyText} onChange={function(e: any) { setReplyText(e.target.value); }} placeholder="Reply to story..." className="flex-1 rounded-full px-3 py-1 text-sm bg-gray-800 text-white border border-gray-600" /><button onClick={handleReply} className="text-green-400"><Send className="h-4 w-4" /></button></div> : replies.map(function(r: any) { return <div key={r.id} className="text-white text-sm mb-1">{r.content} <span className="text-gray-400 text-xs">✓ Sent</span></div>; })}</div>}
      </div>}
    </main></div>
  );
}