"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Link from "next/link";
import { Play, Pause, Volume2, VolumeX, Loader2 } from "lucide-react";

export default function ReelsPage() {
  var router = useRouter();
  var [reels, setReels] = useState<any[]>([]);
  var [isLoading, setIsLoading] = useState(true);
  var [userName, setUserName] = useState("");
  var [page, setPage] = useState(1);
  var [hasMore, setHasMore] = useState(false);
  var [isLoadingMore, setIsLoadingMore] = useState(false);
  var [playingId, setPlayingId] = useState<string | null>(null);
  var [muted, setMuted] = useState(true);
  var videoRefs = useRef<Map<string, HTMLVideoElement>>(new Map());

  useEffect(function() { fetchReels(); fetchUser(); }, []);

  var fetchUser = async function() { var r = await fetch("/api/auth/session"); if (r.ok) { var s = await r.json(); setUserName(s?.user?.name || "Friend"); } };
  var fetchReels = async function(p?: number) { var pg = p || page; var r = await fetch("/api/reels?page=" + pg); if (r.ok) { var d = await r.json(); if (pg === 1) setReels(d.posts); else setReels(function(prev: any) { return [...prev, ...d.posts]; }); setHasMore(d.hasMore); setPage(pg); } setIsLoading(false); setIsLoadingMore(false); };
  var loadMore = function() { setIsLoadingMore(true); fetchReels(page + 1); };
  var stopAllExcept = function(id: string) { videoRefs.current.forEach(function(video: HTMLVideoElement, key: string) { if (key !== id) { video.pause(); video.currentTime = 0; } }); };
  var togglePlay = function(id: string) { var video = videoRefs.current.get(id); if (!video) return; if (playingId === id) { video.pause(); setPlayingId(null); } else { stopAllExcept(id); video.play(); setPlayingId(id); } };
  var handleVideoClick = function(id: string) { var video = videoRefs.current.get(id); if (!video) return; if (video.paused) { stopAllExcept(id); video.play(); setPlayingId(id); } else { video.pause(); setPlayingId(null); } };
  var handleEnded = function() { setPlayingId(null); };
  var toggleMute = function() { var nm = !muted; setMuted(nm); videoRefs.current.forEach(function(v: any) { v.muted = nm; }); };

  if (isLoading) return <div className="min-h-screen bg-black"><Header userName={userName} /><div className="flex justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-4 border-green-600 border-t-transparent"></div></div></div>;

  return (
    <div className="min-h-screen bg-black"><Header userName={userName} /><main className="mx-auto max-w-lg px-4 py-4">
      <div className="flex items-center justify-between mb-4"><h1 className="text-xl font-bold text-white">Reels</h1><button onClick={toggleMute} className="text-white">{muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}</button></div>
      <p className="text-xs text-gray-500 mb-4 text-center">Take breaks. Your wellbeing matters. 💚</p>
      {reels.length === 0 ? <div className="text-center py-20"><p className="text-gray-400">No reels yet</p><button onClick={function() { router.push("/feed"); }} className="mt-4 rounded-full bg-green-600 px-4 py-2 text-sm text-white">Go to Feed</button></div> : <div className="space-y-6">{reels.map(function(r: any) { var isPlaying = playingId === r.id; return <div key={r.id} className="relative rounded-2xl overflow-hidden bg-gray-900"><video ref={function(el: any) { if (el) videoRefs.current.set(r.id, el); }} src={r.videoUrl} className="w-full max-h-[500px] object-cover cursor-pointer" muted={muted} loop playsInline preload="metadata" onClick={function() { handleVideoClick(r.id); }} onEnded={handleEnded} />{!isPlaying && <div className="absolute inset-0 flex items-center justify-center bg-black/30 cursor-pointer" onClick={function(e: any) { e.stopPropagation(); togglePlay(r.id); }}><Play className="h-16 w-16 text-white opacity-80 hover:opacity-100 transition-opacity" /></div>}{isPlaying && <div className="absolute inset-0 flex items-center justify-center bg-black/10 cursor-pointer opacity-0 hover:opacity-100 transition-opacity" onClick={function(e: any) { e.stopPropagation(); togglePlay(r.id); }}><Pause className="h-16 w-16 text-white" /></div>}<div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent pointer-events-none"><Link href={"/profile/" + r.author.id} className="flex items-center gap-2 mb-2 pointer-events-auto"><div className="h-8 w-8 rounded-full bg-gradient-to-br from-green-400 to-blue-400 flex items-center justify-center text-white text-xs font-bold">{r.author.name?.charAt(0) || "U"}</div><span className="text-white text-sm font-medium">{r.author.name}</span></Link>{r.content && <p className="text-white text-sm mb-2">{r.content}</p>}</div></div>; })}</div>}
      {hasMore && <div className="text-center py-6"><button onClick={loadMore} disabled={isLoadingMore} className="rounded-full bg-green-600 px-6 py-2.5 text-sm font-medium text-white disabled:opacity-50">{isLoadingMore ? "Loading..." : "Show More"}</button></div>}
      {!hasMore && reels.length > 0 && <p className="text-center text-gray-500 text-sm py-6">You've seen all reels. Take a break! 🌿</p>}
    </main></div>
  );
}