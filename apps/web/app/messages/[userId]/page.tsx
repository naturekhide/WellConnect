"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import VoiceRecorder from "@/components/VoiceRecorder";
import EmojiPicker from "@/components/EmojiPicker";
import CallButton from "@/components/CallButton";
import IncomingCall from "@/components/IncomingCall";
import CallRoom from "@/components/CallRoom";
import BottomNav from "@/components/BottomNav";
import { Send, Mic, Paperclip, Image, Smile, ArrowLeft, Check, X } from "lucide-react";
import Link from "next/link";

export default function ChatPage() {
  var router = useRouter();
  var params = useParams();
  var userId = params?.userId as string;
  var messagesEndRef = useRef<HTMLDivElement>(null);
  var fileInputRef = useRef<HTMLInputElement>(null);
  var [chatUser, setChatUser] = useState<any>(null);
  var [messages, setMessages] = useState<any[]>([]);
  var [newMessage, setNewMessage] = useState("");
  var [isLoading, setIsLoading] = useState(true);
  var [currentUserId, setCurrentUserId] = useState("");
  var [showRecorder, setShowRecorder] = useState(false);
  var [showEmoji, setShowEmoji] = useState(false);
  var [showAttach, setShowAttach] = useState(false);
  var [replyTo, setReplyTo] = useState<any>(null);
  var [editingId, setEditingId] = useState<any>(null);
  var [editContent, setEditContent] = useState("");
  var [menuMsgId, setMenuMsgId] = useState<any>(null);
  var [isAtBottom, setIsAtBottom] = useState(true);

  var [incomingCall, setIncomingCall] = useState<any>(null);
  var [activeCall, setActiveCall] = useState<any>(null);
  var callPollRef = useRef<any>(null);

  useEffect(function() {
    if (!userId) return;
    fetchChatUser();
    fetchMessages();
    var i = setInterval(fetchMessages, 3000);
    return function() { clearInterval(i); };
  }, [userId]);

  useEffect(function() {
    if (!currentUserId) return;
    callPollRef.current = setInterval(checkIncomingCalls, 5000);
    return function() { if (callPollRef.current) clearInterval(callPollRef.current); };
  }, [currentUserId]);

  useEffect(function() { if (isAtBottom) messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);
  useEffect(function() {
    var h = function(e: any) { if (!e.target.closest("[data-menu]")) setMenuMsgId(null); };
    document.addEventListener("click", h);
    return function() { document.removeEventListener("click", h); };
  }, []);

  var checkIncomingCalls = async function() {
    try {
      var r = await fetch("/api/calls");
      if (r.ok) {
        var calls = await r.json();
        var incoming = calls.find(function(c: any) {
          return c.status === "ringing" && c.participants.some(function(p: any) { return p.userId === currentUserId && p.status === "ringing"; });
        });
        if (incoming && !incomingCall && !activeCall) setIncomingCall(incoming);
      }
    } catch (e) {}
  };

  var fetchChatUser = async function() {
    var r = await fetch("/api/users/" + userId);
    if (r.ok) setChatUser(await r.json());
    var sr = await fetch("/api/auth/session");
    if (sr.ok) { var s = await sr.json(); setCurrentUserId(s?.user?.id || ""); }
  };

  var fetchMessages = async function() {
    var r = await fetch("/api/messages?userId=" + userId);
    if (r.ok) { var d = await r.json(); if (Array.isArray(d)) setMessages(d); }
    setIsLoading(false);
  };

  var handleScroll = function(e: any) { var el = e.target; setIsAtBottom(el.scrollHeight - el.scrollTop - el.clientHeight < 100); };

  var handleSend = async function() {
    if (!newMessage.trim() || !userId) return;
    var temp = newMessage; setNewMessage("");
    var replyId = replyTo?.id || null; setReplyTo(null);
    var r = await fetch("/api/messages", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ recipientId: userId, content: temp, replyToId: replyId }) });
    if (r.ok) { var d = await r.json(); setMessages(function(p: any) { return [...p, d]; }); setIsAtBottom(true); } else { setNewMessage(temp); }
  };

  var handleSendAudio = async function(audioUrl: string) {
    var r = await fetch("/api/messages", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ recipientId: userId, content: "", audioUrl: audioUrl }) });
    if (r.ok) { var d = await r.json(); setMessages(function(p: any) { return [...p, d]; }); setIsAtBottom(true); }
  };

  var handleVoiceCall = async function() {
    var r = await fetch("/api/calls", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ recipientId: userId, type: "voice", scope: "dm" }) });
    if (r.ok) setActiveCall(await r.json());
  };

  var handleVideoCall = async function() {
    var r = await fetch("/api/calls", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ recipientId: userId, type: "video", scope: "dm" }) });
    if (r.ok) setActiveCall(await r.json());
  };

  var handleAcceptCall = async function() {
    var r = await fetch("/api/calls/" + incomingCall.id, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "accept" }) });
    if (r.ok) { setActiveCall(await r.json()); setIncomingCall(null); }
  };

  var handleRejectCall = async function() {
    await fetch("/api/calls/" + incomingCall.id, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "reject" }) });
    setIncomingCall(null);
  };

  var handleEndCall = function() { setActiveCall(null); };
  var handleReply = function(msg: any) { setMenuMsgId(null); setReplyTo({ id: msg.id, content: msg.content || "Media", senderName: msg.senderId === currentUserId ? "You" : (chatUser?.name || "User") }); };
  var handleDelete = async function() { if (!menuMsgId) return; if (!confirm("Delete?")) { setMenuMsgId(null); return; } await fetch("/api/messages/" + menuMsgId, { method: "DELETE" }); setMessages(function(p: any) { return p.filter(function(m: any) { return m.id !== menuMsgId; }); }); setMenuMsgId(null); };
  var handleEdit = function(msg: any) { setMenuMsgId(null); setEditingId(msg.id); setEditContent(msg.content); };
  var handleSaveEdit = async function() {
    if (!editContent.trim() || !editingId) return;
    var r = await fetch("/api/messages/" + editingId, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ content: editContent }) });
    if (r.ok) { var u = await r.json(); setMessages(function(p: any) { return p.map(function(m: any) { return m.id === editingId ? { ...m, content: u.content, edited: true } : m; }); }); setEditingId(null); setEditContent(""); } else { alert("Edit window expired"); setEditingId(null); }
  };
  var handleFileSelect = async function(e: any) {
    var file = e.target.files?.[0]; if (!file) return; setShowAttach(false);
    var fd = new FormData(); fd.append("file", file);
    var r = await fetch("/api/upload", { method: "POST", body: fd });
    if (r.ok) {
      var d = await r.json();
      var msgData: any = { recipientId: userId, content: "", imageUrl: null, fileUrl: null };
      if (file.type.startsWith("image/")) msgData.imageUrl = d.url;
      else msgData.fileUrl = d.url;
      var sr = await fetch("/api/messages", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(msgData) });
      if (sr.ok) { var msg = await sr.json(); setMessages(function(p: any) { return [...p, msg]; }); setIsAtBottom(true); }
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  var formatTime = function(d: string) { return new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); };
  var isWithin15Min = function(d: string) { return (Date.now() - new Date(d).getTime()) < 15 * 60 * 1000; };

  if (activeCall) return <CallRoom call={activeCall} userId={currentUserId} onEnd={handleEndCall} />;
  if (isLoading) return (
    <div className="min-h-screen bg-[#f8faf9] dark:bg-gray-950 flex items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent"></div>
    </div>
  );

  return (
    <div className="flex flex-col h-screen bg-[#f8faf9] dark:bg-gray-950">
      {incomingCall && <IncomingCall call={incomingCall} onAccept={handleAcceptCall} onReject={handleRejectCall} />}

      <div className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
        <button onClick={function() { router.push("/messages"); }} className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <Link href={"/profile/" + userId} className="flex items-center gap-3 flex-1 min-w-0">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-400 flex items-center justify-center text-white font-semibold flex-shrink-0">
            {chatUser?.name?.charAt(0) || "U"}
          </div>
          <div className="min-w-0">
            <p className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">{chatUser?.name || "User"}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">@{chatUser?.username || "user"}</p>
          </div>
        </Link>
        <CallButton onVoiceCall={handleVoiceCall} onVideoCall={handleVideoCall} showVideo={true} />
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2" onScroll={handleScroll}>
        {messages.map(function(msg: any) {
          var isMine = msg.senderId === currentUserId;
          var canEdit = isMine && isWithin15Min(msg.createdAt) && msg.content && !msg.audioUrl && !msg.imageUrl && !msg.fileUrl;
          return (
            <div key={msg.id} className={"flex " + (isMine ? "justify-end" : "justify-start")}>
              <div className={"relative group max-w-[75%] " + (isMine ? "" : "flex items-end gap-2")}>
                {!isMine && (
                  <div className="h-7 w-7 rounded-full bg-gradient-to-br from-emerald-400 to-teal-400 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                    {chatUser?.name?.charAt(0) || "U"}
                  </div>
                )}
                <div>
                  {editingId === msg.id ? (
                    <div className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-2xl px-3 py-2 shadow-sm border border-gray-100 dark:border-gray-700">
                      <input type="text" value={editContent} onChange={function(e: any) { setEditContent(e.target.value); }} className="text-sm bg-transparent text-gray-900 dark:text-gray-100 outline-none flex-1" autoFocus onKeyDown={function(e: any) { if (e.key === "Enter") handleSaveEdit(); if (e.key === "Escape") setEditingId(null); }} />
                      <button onClick={handleSaveEdit} className="text-emerald-500"><Check className="h-4 w-4" /></button>
                      <button onClick={function() { setEditingId(null); }} className="text-gray-400"><X className="h-4 w-4" /></button>
                    </div>
                  ) : (
                    <div>
                      {msg.replyTo && (
                        <div className="border-l-2 border-emerald-400 pl-2 mb-1 text-xs text-gray-500 dark:text-gray-400 bg-white/50 dark:bg-gray-800/50 rounded px-2 py-0.5">
                          {msg.replyTo.content?.substring(0, 40) || "Media"}
                        </div>
                      )}
                      <div className={"rounded-2xl px-4 py-2.5 shadow-sm relative " + (isMine ? "bg-emerald-500 text-white rounded-br-md" : "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-bl-md border border-gray-100 dark:border-gray-700")}>
                        {msg.content && <p className="text-sm">{msg.content}{msg.edited && <span className="text-[10px] opacity-60 ml-1">edited</span>}</p>}
                        {msg.imageUrl && <img src={msg.imageUrl} className="mt-1 max-h-48 rounded-lg" />}
                        {msg.audioUrl && <audio controls className="mt-1 max-w-full h-8"><source src={msg.audioUrl} type="audio/webm" /></audio>}
                        <div className="flex items-center justify-end gap-1 mt-0.5">
                          <span className={"text-[10px] " + (isMine ? "text-emerald-100" : "text-gray-400")}>{formatTime(msg.createdAt)}</span>
                          {isMine && <span className="text-[10px] text-emerald-200">{msg.readAt ? "✓✓" : "✓"}</span>}
                        </div>
                        <button data-menu onClick={function(e: any) { e.stopPropagation(); setMenuMsgId(menuMsgId === msg.id ? null : msg.id); }} className="absolute -top-2 -right-2 bg-white dark:bg-gray-700 rounded-full p-0.5 shadow opacity-0 group-hover:opacity-100 z-10">
                          <span className="text-gray-500 text-xs px-1">⋮</span>
                        </button>
                        {menuMsgId === msg.id && (
                          <div data-menu className="absolute -top-2 right-6 bg-white dark:bg-gray-700 rounded-xl shadow-lg py-1 z-20 min-w-[140px] border border-gray-100 dark:border-gray-600" onClick={function(e: any) { e.stopPropagation(); }}>
                            <button onClick={function() { handleReply(msg); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600">↩️ Reply</button>
                            {canEdit && <button onClick={function() { handleEdit(msg); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600">✏️ Edit</button>}
                            <button onClick={handleDelete} className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-50 dark:hover:bg-gray-600">🗑️ Delete</button>
                            <button onClick={function() { setMenuMsgId(null); }} className="w-full text-left px-4 py-2 text-sm text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600">✕ Cancel</button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {replyTo && (
        <div className="px-4 py-2 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Replying to {replyTo.senderName}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{replyTo.content}</p>
          </div>
          <button onClick={function() { setReplyTo(null); }} className="text-gray-400"><X className="h-4 w-4" /></button>
        </div>
      )}

      {showRecorder && (
        <div className="px-4 py-3 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
          <VoiceRecorder onAudioReady={function(url: string) { handleSendAudio(url); setShowRecorder(false); }} onCancel={function() { setShowRecorder(false); }} />
        </div>
      )}

      {showAttach && (
        <div className="px-4 py-3 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 flex gap-6">
          <button onClick={function() { fileInputRef.current?.click(); }} className="flex flex-col items-center gap-1 text-sm text-gray-600 dark:text-gray-300">
            <div className="h-12 w-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center"><Image className="h-6 w-6 text-emerald-600 dark:text-emerald-400" /></div>
            Image
          </button>
          <button onClick={function() { fileInputRef.current?.click(); }} className="flex flex-col items-center gap-1 text-sm text-gray-600 dark:text-gray-300">
            <div className="h-12 w-12 rounded-xl bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center"><Paperclip className="h-6 w-6 text-blue-600 dark:text-blue-400" /></div>
            Document
          </button>
        </div>
      )}
      <input ref={fileInputRef} type="file" accept="image/*,.pdf,.doc,.docx,.txt" onChange={handleFileSelect} className="hidden" />

      <div className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-3 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 flex-shrink-0">
        <button onClick={function() { setShowEmoji(!showEmoji); setShowAttach(false); }} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 flex-shrink-0">
          <Smile className="h-5 w-5" />
        </button>
        {showEmoji && (
          <div className="absolute bottom-16 left-4 z-30">
            <EmojiPicker onSelect={function(emoji: string) { setNewMessage(newMessage + emoji); setShowEmoji(false); }} onClose={function() { setShowEmoji(false); }} />
          </div>
        )}
        <button onClick={function() { setShowAttach(!showAttach); setShowEmoji(false); }} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 flex-shrink-0 hidden sm:block">
          <Paperclip className="h-5 w-5" />
        </button>
        <input
          type="text"
          value={newMessage}
          onChange={function(e: any) { setNewMessage(e.target.value); }}
          onKeyDown={function(e: any) { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
          placeholder="Type a message..."
          className="flex-1 min-w-0 rounded-full bg-gray-100 dark:bg-gray-800 border-0 px-4 py-2.5 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
        />
        {newMessage.trim() ? (
          <button onClick={handleSend} className="p-2 bg-emerald-500 rounded-full text-white flex-shrink-0"><Send className="h-4 w-4" /></button>
        ) : (
          <button onClick={function() { setShowRecorder(!showRecorder); }} className="p-2 text-gray-400 hover:text-emerald-500 flex-shrink-0"><Mic className="h-5 w-5" /></button>
        )}
      </div>
      <BottomNav />
    </div>
  );
}