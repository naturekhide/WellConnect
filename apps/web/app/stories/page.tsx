"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import BottomNav from "@/components/BottomNav";
import { ArrowLeft, Plus, X, ChevronLeft, ChevronRight } from "lucide-react";

export default function StoriesPage() {
  var router = useRouter();
  var [stories, setStories] = useState<any[]>([]);
  var [isLoading, setIsLoading] = useState(true);
  var [currentUserId, setCurrentUserId] = useState("");
  var [viewingStory, setViewingStory] = useState<any>(null);
  var [viewingIndex, setViewingIndex] = useState(0);
  var [viewingUserStories, setViewingUserStories] = useState<any[]>([]);
  var fileInputRef = useRef<HTMLInputElement>(null);
  var [uploading, setUploading] = useState(false);

  useEffect(function() { fetchStories(); fetchUser(); }, []);

  var fetchUser = async function() {
    var r = await fetch("/api/auth/session");
    if (r.ok) { var s = await r.json(); setCurrentUserId(s?.user?.id || ""); }
  };

  var fetchStories = async function() {
    try {
      var r = await fetch("/api/stories");
      if (r.ok) setStories(await r.json());
    } catch (e) {}
    setIsLoading(false);
  };

  var handleCreateStory = async function(e: any) {
    var file = e.target.files?.[0];
    if (!file) return;

    var isImage = file.type.startsWith("image/");
    var isVideo = file.type.startsWith("video/");
    if (!isImage && !isVideo) { alert("Please select an image or video"); return; }

    setUploading(true);
    try {
      var fd = new FormData();
      fd.append("file", file);
      var uploadRes = await fetch("/api/upload", { method: "POST", body: fd });
      if (!uploadRes.ok) { alert("Upload failed"); return; }

      var uploadData = await uploadRes.json();
      var storyRes = await fetch("/api/stories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mediaUrl: uploadData.url,
          type: isImage ? "image" : "video",
          caption: "",
        }),
      });

      if (storyRes.ok) {
        fetchStories();
      }
    } catch (err) {}
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  var openStory = function(userStories: any[], index: number) {
    setViewingUserStories(userStories);
    setViewingIndex(index);
    setViewingStory(userStories[index]);
    var storyId = userStories[index].id;
    fetch("/api/stories/" + storyId + "/view", { method: "POST" }).catch(function() {});
  };

  var closeStory = function() {
    setViewingStory(null);
    setViewingUserStories([]);
    setViewingIndex(0);
  };

  var nextStory = function() {
    if (viewingIndex < viewingUserStories.length - 1) {
      var nextIdx = viewingIndex + 1;
      setViewingIndex(nextIdx);
      setViewingStory(viewingUserStories[nextIdx]);
      fetch("/api/stories/" + viewingUserStories[nextIdx].id + "/view", { method: "POST" }).catch(function() {});
    } else {
      closeStory();
    }
  };

  var prevStory = function() {
    if (viewingIndex > 0) {
      var prevIdx = viewingIndex - 1;
      setViewingIndex(prevIdx);
      setViewingStory(viewingUserStories[prevIdx]);
    }
  };

  var timeAgo = function(d: string) {
    var diff = (Date.now() - new Date(d).getTime()) / 3600000;
    if (diff < 1) return Math.floor(diff * 60) + "m ago";
    return Math.floor(diff) + "h ago";
  };

  if (isLoading) return (
    <div className="min-h-screen bg-[#f8faf9] dark:bg-gray-950 flex items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8faf9] dark:bg-gray-950 pb-20">
      {/* Story Viewer Overlay */}
      {viewingStory && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col">
          <div className="flex gap-1 px-2 pt-10 pb-2">
            {viewingUserStories.map(function(s: any, i: number) {
              return (
                <div key={i} className="flex-1 h-0.5 rounded-full bg-gray-600 overflow-hidden">
                  <div className={"h-full rounded-full bg-white " + (i < viewingIndex ? "w-full" : i === viewingIndex ? "animate-progress" : "w-0")}></div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-gradient-to-br from-emerald-400 to-teal-400 flex items-center justify-center text-white text-xs font-bold">
                {viewingStory.user?.name?.charAt(0) || "U"}
              </div>
              <div>
                <p className="text-white text-sm font-medium">{viewingStory.user?.name}</p>
                <p className="text-gray-400 text-xs">{timeAgo(viewingStory.createdAt)}</p>
              </div>
            </div>
            <button onClick={closeStory} className="text-white"><X className="h-6 w-6" /></button>
          </div>

          <div className="flex-1 flex items-center justify-center relative" onClick={nextStory}>
            {viewingStory.type === "image" ? (
              <img src={viewingStory.mediaUrl} className="max-h-full max-w-full object-contain" />
            ) : (
              <video src={viewingStory.mediaUrl} autoPlay playsInline className="max-h-full max-w-full" onEnded={nextStory} />
            )}
            {viewingStory.caption && (
              <div className="absolute bottom-4 left-4 right-4 text-white text-sm text-center bg-black/40 rounded-lg py-2 px-4">
                {viewingStory.caption}
              </div>
            )}
          </div>

          {viewingIndex > 0 && (
            <button onClick={prevStory} className="absolute left-2 top-1/2 -translate-y-1/2 text-white/60 hover:text-white">
              <ChevronLeft className="h-10 w-10" />
            </button>
          )}
          {viewingIndex < viewingUserStories.length - 1 && (
            <button onClick={nextStory} className="absolute right-2 top-1/2 -translate-y-1/2 text-white/60 hover:text-white">
              <ChevronRight className="h-10 w-10" />
            </button>
          )}
        </div>
      )}

      {/* Header */}
      <div className="sticky top-0 z-20 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-100 dark:border-gray-800">
        <div className="mx-auto max-w-2xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={function() { router.back(); }} className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Stories</h1>
          </div>
          <button onClick={function() { fileInputRef.current?.click(); }} disabled={uploading} className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-900/60 transition-all disabled:opacity-50">
            <Plus className="h-5 w-5" />
          </button>
        </div>
      </div>

      <main className="mx-auto max-w-2xl px-4 py-4">
        {uploading && (
          <div className="text-center py-2">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent mx-auto"></div>
          </div>
        )}

        {stories.length === 0 ? (
          <div className="text-center py-16">
            <div className="h-20 w-20 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">📸</span>
            </div>
            <p className="text-gray-500 dark:text-gray-400 font-medium">No stories yet</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Follow people to see their stories</p>
          </div>
        ) : (
          <div className="space-y-6">
            {stories.map(function(group: any) {
              var hasUnseen = group.stories.some(function(s: any) { return s.views.length === 0; });
              return (
                <div key={group.user.id}>
                  <div className="flex items-center gap-3 mb-2">
                    <div className={"h-10 w-10 rounded-full p-0.5 " + (hasUnseen ? "bg-gradient-to-br from-emerald-400 to-teal-400" : "bg-gray-300 dark:bg-gray-700")}>
                      <div className="h-full w-full rounded-full bg-white dark:bg-gray-900 flex items-center justify-center">
                        <span className="text-sm font-bold text-gray-700 dark:text-gray-300">{group.user.name?.charAt(0) || "U"}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{group.user.name}</p>
                      <p className="text-xs text-gray-500">{timeAgo(group.stories[group.stories.length - 1].createdAt)}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {group.stories.map(function(story: any, idx: number) {
                      var isSeen = story.views.length > 0;
                      return (
                        <button
                          key={story.id}
                          onClick={function() { openStory(group.stories, idx); }}
                          className={"flex-shrink-0 w-24 h-36 rounded-xl overflow-hidden border-2 transition-all " + (isSeen ? "border-gray-200 dark:border-gray-700 opacity-70" : "border-emerald-400 dark:border-emerald-500")}
                        >
                          {story.type === "image" ? (
                            <img src={story.mediaUrl} className="w-full h-full object-cover" />
                          ) : (
                            <video src={story.mediaUrl} className="w-full h-full object-cover" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
      <input ref={fileInputRef} type="file" accept="image/*,video/*" onChange={handleCreateStory} className="hidden" />
      <BottomNav />
    </div>
  );
}