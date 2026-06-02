"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";
import { Play, Pause, Volume2, VolumeX, ArrowLeft, MessageCircle, Bookmark, Send, X } from "lucide-react";

export default function ReelsPage() {
  var router = useRouter();
  var [reels, setReels] = useState<any[]>([]);
  var [isLoading, setIsLoading] = useState(true);
  var [userName, setUserName] = useState("");
  var [currentUserId, setCurrentUserId] = useState("");
  var [page, setPage] = useState(1);
  var [hasMore, setHasMore] = useState(false);
  var [isLoadingMore, setIsLoadingMore] = useState(false);
  var [playingId, setPlayingId] = useState<string | null>(null);
  var [muted, setMuted] = useState(true);
  var videoRefs = useRef<Map<string, HTMLVideoElement>>(new Map());

  var [commentReelId, setCommentReelId] = useState<string | null>(null);
  var [comments, setComments] = useState<any[]>([]);
  var [commentText, setCommentText] = useState("");
  var [loadingComments, setLoadingComments] = useState(false);

  var [savedIds, setSavedIds] = useState<Record<string, boolean>>({});

  useEffect(function() { fetchReels(); fetchUser(); }, []);

  var fetchUser = async function() {
    var r = await fetch("/api/auth/session");
    if (r.ok) {
      var s = await r.json();
      setUserName(s?.user?.name || "Friend");
      setCurrentUserId(s?.user?.id || "");
    }
  };

  var fetchReels = async function(p?: number) { var pg = p || page; var r = await fetch("/api/reels?page=" + pg); if (r.ok) { var d = await r.json(); if (pg === 1) setReels(d.posts); else setReels(function(prev: any) { return [...prev, ...d.posts]; }); setHasMore(d.hasMore); setPage(pg); } setIsLoading(false); setIsLoadingMore(false); };
  var loadMore = function() { setIsLoadingMore(true); fetchReels(page + 1); };
  var stopAllExcept = function(id: string) { videoRefs.current.forEach(function(video: HTMLVideoElement, key: string) { if (key !== id) { video.pause(); video.currentTime = 0; } }); };
  var togglePlay = function(id: string) { var video = videoRefs.current.get(id); if (!video) return; if (playingId === id) { video.pause(); setPlayingId(null); } else { stopAllExcept(id); video.play(); setPlayingId(id); } };
  var handleVideoClick = function(id: string) { var video = videoRefs.current.get(id); if (!video) return; if (video.paused) { stopAllExcept(id); video.play(); setPlayingId(id); } else { video.pause(); setPlayingId(null); } };
  var handleEnded = function() { setPlayingId(null); };
  var toggleMute = function() { var nm = !muted; setMuted(nm); videoRefs.current.forEach(function(v: any) { v.muted = nm; }); };

  var openComments = async function(reelId: string) {
    setCommentReelId(reelId);
    setLoadingComments(true);
    setComments([]);
    setCommentText("");
    try {
      var r = await fetch("/api/reels/" + reelId + "/comments");
      if (r.ok) {
        var data = await r.json();
        setComments(Array.isArray(data) ? data : []);
      }
    } catch (e) {}
    setLoadingComments(false);
  };

  var closeComments = function() {
    setCommentReelId(null);
    setComments([]);
    setCommentText("");
  };

  var handleAddComment = async function() {
    if (!commentText.trim() || !commentReelId) return;
    var temp = commentText.trim();
    setCommentText("");
    try {
      var r = await fetch("/api/reels/" + commentReelId + "/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: temp }),
      });
      if (r.ok) {
        var newComment = await r.json();
        setComments(function(prev: any) { return [...prev, newComment]; });
      } else {
        setCommentText(temp);
      }
    } catch (e) {
      setCommentText(temp);
    }
  };

  var toggleSave = async function(reelId: string) {
    var r = await fetch("/api/reels/" + reelId + "/save", { method: "POST" });
    if (r.ok) {
      var d = await r.json();
      setSavedIds({ ...savedIds, [reelId]: d.saved });
    }
  };

  var checkSaved = async function(reelId: string) {
    try {
      var r = await fetch("/api/reels/" + reelId + "/save");
      if (r.ok) {
        var d = await r.json();
        setSavedIds(function(prev: any) { return { ...prev, [reelId]: d.saved }; });
      }
    } catch (e) {}
  };

  if (isLoading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-black pb-20">
      <div className="sticky top-0 z-20 bg-black/90 backdrop-blur-md border-b border-gray-800">
        <div className="mx-auto max-w-lg px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={function() { router.back(); }} className="p-1 text-gray-400 hover:text-white transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-lg font-semibold text-white">Reels</h1>
          </div>
          <button onClick={toggleMute} className="p-1 text-gray-400 hover:text-white transition-colors">
            {muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <main className="mx-auto max-w-lg px-4 py-4">
        <p className="text-xs text-gray-500 mb-4 text-center">Take breaks. Your wellbeing matters. 💚</p>

        {reels.length === 0 ? (
          <div className="text-center py-20">
            <div className="h-20 w-20 rounded-2xl bg-purple-900/30 flex items-center justify-center mx-auto mb-4">
              <Play className="h-10 w-10 text-purple-400" />
            </div>
            <p className="text-gray-400 font-medium">No reels yet</p>
            <button onClick={function() { router.push("/feed"); }} className="mt-4 rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 transition-colors">
              Go to Feed
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {reels.map(function(r: any) {
              var isPlaying = playingId === r.id;
              var isSaved = savedIds[r.id] || false;
              if (savedIds[r.id] === undefined) checkSaved(r.id);

              return (
                <div key={r.id} className="relative rounded-2xl overflow-hidden bg-gray-900">
                  <video
                    ref={function(el: any) { if (el) videoRefs.current.set(r.id, el); }}
                    src={r.videoUrl}
                    className="w-full max-h-[500px] object-cover cursor-pointer"
                    muted={muted}
                    loop
                    playsInline
                    preload="metadata"
                    onClick={function() { handleVideoClick(r.id); }}
                    onEnded={handleEnded}
                  />
                  {!isPlaying && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 cursor-pointer" onClick={function(e: any) { e.stopPropagation(); togglePlay(r.id); }}>
                      <Play className="h-16 w-16 text-white opacity-80 hover:opacity-100 transition-opacity" />
                    </div>
                  )}
                  {isPlaying && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/10 cursor-pointer opacity-0 hover:opacity-100 transition-opacity" onClick={function(e: any) { e.stopPropagation(); togglePlay(r.id); }}>
                      <Pause className="h-16 w-16 text-white" />
                    </div>
                  )}

                  <div className="absolute right-3 bottom-20 flex flex-col items-center gap-4 z-10">
                    <button onClick={function() { toggleSave(r.id); }} className="flex flex-col items-center gap-1">
                      <Bookmark className={"h-6 w-6 " + (isSaved ? "text-emerald-400 fill-emerald-400" : "text-white")} />
                      <span className="text-white text-[10px]">Save</span>
                    </button>
                    <button onClick={function() { openComments(r.id); }} className="flex flex-col items-center gap-1">
                      <MessageCircle className="h-6 w-6 text-white" />
                      <span className="text-white text-[10px]">Comment</span>
                    </button>
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent pointer-events-none">
                    <Link href={"/profile/" + r.author.id} className="flex items-center gap-2 mb-2 pointer-events-auto">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-400 flex items-center justify-center text-white text-xs font-bold">
                        {r.author.name?.charAt(0) || "U"}
                      </div>
                      <span className="text-white text-sm font-medium">{r.author.name}</span>
                    </Link>
                    {r.content && <p className="text-white text-sm mb-1">{r.content}</p>}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {hasMore && (
          <div className="text-center py-6">
            <button onClick={loadMore} disabled={isLoadingMore} className="rounded-full bg-emerald-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50 transition-colors">
              {isLoadingMore ? "Loading..." : "Show More"}
            </button>
          </div>
        )}
        {!hasMore && reels.length > 0 && (
          <p className="text-center text-gray-500 text-sm py-6">You've seen all reels. Take a break! 🌿</p>
        )}
      </main>

      {commentReelId && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center" onClick={closeComments}>
          <div className="absolute inset-0 bg-black/50" onClick={closeComments}></div>
          <div className="relative bg-white dark:bg-gray-900 rounded-t-2xl w-full max-w-lg h-[55vh] flex flex-col z-[61]" onClick={function(e: any) { e.stopPropagation(); }}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">Comments</h3>
              <button onClick={closeComments} className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-3 space-y-3">
              {loadingComments ? (
                <div className="flex justify-center py-8">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent"></div>
                </div>
              ) : comments.length === 0 ? (
                <p className="text-center text-gray-500 dark:text-gray-400 text-sm py-8">No comments yet</p>
              ) : (
                comments.map(function(c: any) {
                  return (
                    <div key={c.id} className="flex gap-2">
                      <div className="h-7 w-7 rounded-full bg-gradient-to-br from-emerald-400 to-teal-400 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                        {c.user?.name?.charAt(0) || "U"}
                      </div>
                      <div>
                        <p className="text-sm">
                          <span className="font-semibold text-gray-900 dark:text-gray-100">{c.user?.name || "User"}</span>
                          {" "}<span className="text-gray-600 dark:text-gray-400">{c.content}</span>
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            <div className="px-4 py-3 pb-8 border-t border-gray-100 dark:border-gray-800 flex-shrink-0 bg-white dark:bg-gray-900">
              {reels.find(function(r: any) { return r.id === commentReelId; })?.author?.id === currentUserId ? (
                <p className="text-sm text-gray-400 dark:text-gray-500 text-center">You posted this reel</p>
              ) : (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={commentText}
                    onChange={function(e: any) { setCommentText(e.target.value); }}
                    onKeyDown={function(e: any) { if (e.key === "Enter") handleAddComment(); }}
                    placeholder="Add a comment..."
                    className="flex-1 rounded-full bg-gray-100 dark:bg-gray-800 border-0 px-4 py-2.5 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                  <button onClick={handleAddComment} disabled={!commentText.trim()} className="p-2.5 rounded-full bg-emerald-500 text-white disabled:opacity-40 hover:bg-emerald-600 transition-all">
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      <BottomNav />
    </div>
  );
}