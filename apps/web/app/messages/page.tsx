"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import BottomNav from "@/components/BottomNav";
import { MessageCircle, Search, BellOff, Bell } from "lucide-react";

export default function MessagesPage() {
  var router = useRouter();
  var [conversations, setConversations] = useState<any[]>([]);
  var [isLoading, setIsLoading] = useState(true);
  var [userName, setUserName] = useState("");
  var [currentUserId, setCurrentUserId] = useState("");
  var [mutedIds, setMutedIds] = useState<string[]>([]);

  useEffect(function() { fetchUser(); fetchConversations(); fetchMuted(); }, []);

  var fetchUser = async function() {
    var r = await fetch("/api/auth/session");
    if (r.ok) { var s = await r.json(); setUserName(s?.user?.name || "Friend"); setCurrentUserId(s?.user?.id || ""); }
  };

  var fetchConversations = async function() {
    var r = await fetch("/api/messages");
    if (r.ok) setConversations(await r.json());
    setIsLoading(false);
  };

  var fetchMuted = async function() {
    var r = await fetch("/api/messages/mute");
    if (r.ok) { var d = await r.json(); setMutedIds(d.mutedIds || []); }
  };

  var handleMute = async function(mutedUserId: string, e: any) {
    e.stopPropagation();
    var r = await fetch("/api/messages/mute", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mutedUserId }),
    });
    if (r.ok) {
      var d = await r.json();
      if (d.muted) setMutedIds([...mutedIds, mutedUserId]);
      else setMutedIds(mutedIds.filter(function(id: string) { return id !== mutedUserId; }));
    }
  };

  var formatTimeAgo = function(d: string) {
    var diff = (Date.now() - new Date(d).getTime()) / 60000;
    if (diff < 1) return "now";
    if (diff < 60) return Math.floor(diff) + "m";
    if (diff < 1440) return Math.floor(diff / 60) + "h";
    return Math.floor(diff / 1440) + "d";
  };

  if (isLoading) return (
    <div className="min-h-screen bg-[#f8faf9] dark:bg-gray-950 flex items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8faf9] dark:bg-gray-950 pb-20">
      <div className="sticky top-0 z-20 bg-[#f8faf9]/90 dark:bg-gray-950/90 backdrop-blur-md border-b border-gray-100 dark:border-gray-800">
        <div className="mx-auto max-w-2xl px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Messages</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">{conversations.length} conversation{conversations.length !== 1 ? "s" : ""}</p>
          </div>
          <button className="p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all">
            <Search className="h-5 w-5" />
          </button>
        </div>
      </div>

      <main className="mx-auto max-w-2xl px-4 py-4">
        {conversations.length === 0 ? (
          <div className="text-center py-20">
            <div className="h-20 w-20 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-5">
              <MessageCircle className="h-10 w-10 text-emerald-500 dark:text-emerald-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">No messages yet</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Start a conversation with someone from the community.</p>
          </div>
        ) : (
          <div className="space-y-1">
            {conversations.map(function(conv: any) {
              var isMuted = mutedIds.includes(conv.user.id);
              return (
                <button
                  key={conv.user.id}
                  onClick={function() { router.push("/messages/" + conv.user.id); }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-white dark:hover:bg-gray-900 hover:shadow-sm transition-all border border-transparent hover:border-gray-100 dark:hover:border-gray-800"
                >
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-emerald-400 to-teal-400 flex items-center justify-center text-white font-semibold text-lg flex-shrink-0">
                    {conv.user.name?.charAt(0) || "U"}
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">{conv.user.name}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400 dark:text-gray-500">{formatTimeAgo(conv.lastMessage.createdAt)}</span>
                        <span onClick={function(e: any) { handleMute(conv.user.id, e); }} className="cursor-pointer text-xs">
                          {isMuted ? <BellOff className="h-3 w-3 text-gray-400" /> : <Bell className="h-3 w-3 text-gray-300" />}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                      {conv.lastMessage.content || (conv.lastMessage.audioUrl ? "🎤 Voice message" : conv.lastMessage.imageUrl ? "📷 Image" : "Media")}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </main>
      <BottomNav />
    </div>
  );
}