"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import VoiceRecorder from "@/components/VoiceRecorder";
import EmojiPicker from "@/components/EmojiPicker";
import CallButton from "@/components/CallButton";
import IncomingCall from "@/components/IncomingCall";
import CallRoom from "@/components/CallRoom";
import BottomNav from "@/components/BottomNav";
import { Send, ArrowLeft, Mic, Users, Smile, Paperclip, Image, X } from "lucide-react";

export default function GroupChatPage() {
  var router = useRouter();
  var params = useParams();
  var groupId = params.groupId as string;
  var messagesEndRef = useRef<any>(null);
  var fileInputRef = useRef<any>(null);
  var [group, setGroup] = useState<any>(null);
  var [messages, setMessages] = useState<any[]>([]);
  var [newMessage, setNewMessage] = useState("");
  var [isLoading, setIsLoading] = useState(true);
  var [userName, setUserName] = useState("");
  var [currentUserId, setCurrentUserId] = useState("");
  var [showRecorder, setShowRecorder] = useState(false);
  var [showEmoji, setShowEmoji] = useState(false);
  var [showAttach, setShowAttach] = useState(false);
  var [menuMsgId, setMenuMsgId] = useState<any>(null);
  var [isAtBottom, setIsAtBottom] = useState(true);
  var [showForward, setShowForward] = useState(false);
  var [forwardMsg, setForwardMsg] = useState<any>(null);
  var [conversations, setConversations] = useState<any[]>([]);

  var [incomingCall, setIncomingCall] = useState<any>(null);
  var [activeCall, setActiveCall] = useState<any>(null);
  var callPollRef = useRef<any>(null);

  useEffect(function() {
    fetchAll();
    fetchConversations();
    var i = setInterval(fetchMessages, 3000);
    return function() { clearInterval(i); };
  }, []);

  useEffect(function() {
    if (!currentUserId) return;
    callPollRef.current = setInterval(checkIncomingCalls, 5000);
    return function() { if (callPollRef.current) clearInterval(callPollRef.current); };
  }, [currentUserId]);

  useEffect(function() {
    if (isAtBottom && messagesEndRef.current) messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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
          return (c.status === "ringing" || c.status === "ongoing") && c.scope === "group" && c.groupId === groupId &&
            c.participants.some(function(p: any) { return p.userId === currentUserId && p.status === "ringing"; });
        });
        if (incoming && !incomingCall && !activeCall) setIncomingCall(incoming);
        var ongoing = calls.find(function(c: any) {
          return c.status === "ongoing" && c.scope === "group" && c.groupId === groupId &&
            c.participants.some(function(p: any) { return p.userId === currentUserId && p.status === "ringing"; });
        });
        if (ongoing && !activeCall) handleAcceptGroupCall(ongoing);
      }
    } catch (e) {}
  };

  var handleScroll = function(e: any) { var el = e.target; setIsAtBottom(el.scrollHeight - el.scrollTop - el.clientHeight < 100); };

  var fetchAll = async function() {
    var r = await fetch("/api/auth/session");
    if (r.ok) { var s = await r.json(); setUserName(s.user.name || "Friend"); setCurrentUserId(s.user.id || ""); }
    var gr = await fetch("/api/groups/" + groupId);
    if (gr.ok) setGroup(await gr.json());
    await fetchMessages();
  };

  var fetchConversations = async function() { var r = await fetch("/api/messages"); if (r.ok) setConversations(await r.json()); };
  var fetchMessages = async function() { var r = await fetch("/api/groups/" + groupId + "/chat"); if (r.ok) { var d = await r.json(); if (Array.isArray(d)) setMessages(d); } setIsLoading(false); };

  var handleGroupVoiceCall = async function() {
    if (!groupId || !currentUserId) return;
    var r = await fetch("/api/calls", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ groupId: groupId, type: "voice", scope: "group" }) });
    if (r.ok) setActiveCall(await r.json());
  };

  var handleAcceptCall = async function() {
    if (!incomingCall) return;
    var r = await fetch("/api/calls/" + incomingCall.id, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "accept" }) });
    if (r.ok) { setActiveCall(await r.json()); setIncomingCall(null); }
  };

  var handleAcceptGroupCall = async function(call: any) {
    var r = await fetch("/api/calls/" + call.id, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "accept" }) });
    if (r.ok) setActiveCall(await r.json());
  };

  var handleRejectCall = async function() {
    if (!incomingCall) return;
    await fetch("/api/calls/" + incomingCall.id, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "reject" }) });
    setIncomingCall(null);
  };

  var handleEndCall = function() { setActiveCall(null); };

  var handleSend = async function() {
    if (!newMessage.trim()) return;
    var t = newMessage; setNewMessage("");
    var r = await fetch("/api/groups/" + groupId + "/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ content: t }) });
    if (r.ok) { var d = await r.json(); setMessages(function(p: any) { return p.concat([d]); }); setIsAtBottom(true); } else { setNewMessage(t); }
  };

  var handleSendAudio = async function(url: string) {
    var r = await fetch("/api/groups/" + groupId + "/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ content: "", audioUrl: url }) });
    if (r.ok) { var d = await r.json(); setMessages(function(p: any) { return p.concat([d]); }); setIsAtBottom(true); }
  };

  var handleDelete = async function() {
    if (!menuMsgId) return;
    if (!confirm("Delete this message?")) { setMenuMsgId(null); return; }
    await fetch("/api/groups/" + groupId + "/chat/" + menuMsgId, { method: "DELETE" });
    setMessages(function(p: any) { return p.filter(function(m: any) { return m.id !== menuMsgId; }); });
    setMenuMsgId(null);
  };

  var handleForward = function(msg: any) { setMenuMsgId(null); setForwardMsg(msg); setShowForward(true); };

  var handleForwardSend = async function(toUserId: string) {
    if (!forwardMsg) return;
    var r = await fetch("/api/messages", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ recipientId: toUserId, content: "↗️ Forwarded: " + (forwardMsg.content || ""), audioUrl: forwardMsg.audioUrl || null, imageUrl: forwardMsg.imageUrl || null }) });
    if (r.ok) { setShowForward(false); setForwardMsg(null); alert("Message forwarded!"); }
  };

  var handleFileSelect = async function(e: any) {
    var file = e.target.files[0]; if (!file) return; setShowAttach(false);
    var fd = new FormData(); fd.append("file", file);
    var r = await fetch("/api/upload", { method: "POST", body: fd });
    if (r.ok) {
      var d = await r.json();
      var isImg = file.type.startsWith("image/");
      var body: any = { content: isImg ? "" : file.name, imageUrl: isImg ? d.url : null };
      var sr = await fetch("/api/groups/" + groupId + "/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (sr.ok) { var msg = await sr.json(); setMessages(function(p: any) { return p.concat([msg]); }); setIsAtBottom(true); }
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  var formatTime = function(d: string) { return new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); };

  if (activeCall) return <CallRoom call={activeCall} userId={currentUserId} onEnd={handleEndCall} />;

  if (isLoading) return (
    <div className="min-h-screen bg-[#f8faf9] dark:bg-gray-950 flex items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent"></div>
    </div>
  );

  return (
    <div className="flex flex-col h-screen bg-[#f8faf9] dark:bg-gray-950">
      {/* Forward Modal */}
      {showForward && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={function() { setShowForward(false); }}>
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6 w-[400px] max-h-[500px] overflow-y-auto" onClick={function(e: any) { e.stopPropagation(); }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">Forward Message</h3>
              <button onClick={function() { setShowForward(false); }} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
            </div>
            <div className="mb-3 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm text-gray-600 dark:text-gray-300">
              {forwardMsg && forwardMsg.content ? forwardMsg.content.substring(0, 100) : (forwardMsg && forwardMsg.audioUrl ? "🎤 Voice note" : "Media")}
            </div>
            <p className="text-xs text-gray-500 mb-3">Forward to:</p>
            <div className="space-y-1">
              {conversations.map(function(conv: any) {
                return (
                  <button key={conv.user.id} onClick={function() { handleForwardSend(conv.user.id); }} className="w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-400 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                      {conv.user.name ? conv.user.name.charAt(0) : "U"}
                    </div>
                    <p className="font-medium text-sm text-gray-900 dark:text-gray-100">{conv.user.name}</p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Chat Header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
        <button onClick={function() { router.back(); }} className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-400 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {group && group.name ? group.name.charAt(0) : "G"}
          </div>
          <div className="min-w-0">
            <p className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">{group ? group.name : "Group Chat"}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400"><Users className="h-3 w-3 inline" /> {group ? group.memberCount : 0} members</p>
          </div>
        </div>
        <CallButton onVoiceCall={handleGroupVoiceCall} onVideoCall={function() {}} showVideo={false} />
      </div>

      {/* Incoming Call Banner */}
      {incomingCall && <IncomingCall call={incomingCall} onAccept={handleAcceptCall} onReject={handleRejectCall} />}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3" onScroll={handleScroll}>
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500 dark:text-gray-400 text-sm">No messages yet. Say hello! 👋</p>
          </div>
        ) : (
          messages.map(function(msg: any) {
            var isMine = msg.senderId === currentUserId;
            return (
              <div key={msg.id} className={"flex " + (isMine ? "justify-end" : "justify-start")}>
                <div className={"relative group max-w-[75%] " + (isMine ? "" : "flex gap-2")}>
                  {!isMine && (
                    <div className="h-6 w-6 rounded-full bg-gradient-to-br from-emerald-400 to-teal-400 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0 mt-1">
                      {msg.sender && msg.sender.name ? msg.sender.name.charAt(0) : "U"}
                    </div>
                  )}
                  <div>
                    {!isMine && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">
                        {msg.sender ? msg.sender.name : "Unknown"}
                        {msg.sender && msg.sender.username ? <span className="ml-1">@{msg.sender.username}</span> : null}
                      </p>
                    )}
                    <div className={"rounded-2xl px-4 py-2.5 shadow-sm relative " + (isMine ? "bg-emerald-500 text-white rounded-br-md" : "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-bl-md border border-gray-100 dark:border-gray-700")}>
                      {msg.content ? <p className="text-sm">{msg.content}</p> : null}
                      {msg.imageUrl ? <img src={msg.imageUrl} alt="Shared" className="mt-1 max-h-48 rounded-lg" /> : null}
                      {msg.audioUrl ? <audio controls className="mt-1 max-w-full h-8"><source src={msg.audioUrl} type="audio/webm" /></audio> : null}
                      <p className={"text-[10px] mt-1 " + (isMine ? "text-emerald-100" : "text-gray-400")}>{formatTime(msg.createdAt)}</p>
                      <button data-menu onClick={function(e: any) { e.stopPropagation(); setMenuMsgId(menuMsgId === msg.id ? null : msg.id); }} className="absolute -top-2 -right-2 bg-white dark:bg-gray-700 rounded-full p-0.5 shadow opacity-0 group-hover:opacity-100 z-10">
                        <span className="text-gray-500 text-xs px-1">⋮</span>
                      </button>
                      {menuMsgId === msg.id && (
                        <div data-menu className="absolute -top-2 right-6 bg-white dark:bg-gray-700 rounded-xl shadow-lg py-1 z-20 min-w-[140px] border border-gray-100 dark:border-gray-600" onClick={function(e: any) { e.stopPropagation(); }}>
                          <button onClick={function() { handleForward(msg); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600">↗️ Forward</button>
                          {isMine && <button onClick={handleDelete} className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-50 dark:hover:bg-gray-600">🗑️ Delete</button>}
                          <button onClick={function() { setMenuMsgId(null); }} className="w-full text-left px-4 py-2 text-sm text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600">✕ Cancel</button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Voice Recorder */}
      {showRecorder && (
        <div className="px-4 py-3 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 flex-shrink-0">
          <VoiceRecorder onAudioReady={function(url: string) { handleSendAudio(url); setShowRecorder(false); }} onCancel={function() { setShowRecorder(false); }} />
        </div>
      )}

      {/* Attach Menu */}
      {showAttach && (
        <div className="px-4 py-3 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 flex gap-6 flex-shrink-0">
          <button onClick={function() { fileInputRef.current && fileInputRef.current.click(); }} className="flex flex-col items-center gap-1 text-sm text-gray-600 dark:text-gray-300">
            <div className="h-12 w-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center"><Image className="h-6 w-6 text-emerald-600 dark:text-emerald-400" /></div>
            Image
          </button>
          <button onClick={function() { fileInputRef.current && fileInputRef.current.click(); }} className="flex flex-col items-center gap-1 text-sm text-gray-600 dark:text-gray-300">
            <div className="h-12 w-12 rounded-xl bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center"><Paperclip className="h-6 w-6 text-blue-600 dark:text-blue-400" /></div>
            Document
          </button>
        </div>
      )}
      <input ref={fileInputRef} type="file" accept="image/*,.pdf,.doc,.docx,.txt" onChange={handleFileSelect} className="hidden" />

      {/* Input Bar */}
      <div className="flex items-center gap-2 px-4 py-3 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 flex-shrink-0">
        <button onClick={function() { setShowEmoji(!showEmoji); setShowAttach(false); }} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
          <Smile className="h-5 w-5" />
        </button>
        {showEmoji && <EmojiPicker onSelect={function(emoji: string) { setNewMessage(newMessage + emoji); setShowEmoji(false); }} onClose={function() { setShowEmoji(false); }} />}
        <button onClick={function() { setShowAttach(!showAttach); setShowEmoji(false); }} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
          <Paperclip className="h-5 w-5" />
        </button>
        <button onClick={function() { setShowRecorder(!showRecorder); }} className={"p-2 rounded-full " + (showRecorder ? "bg-red-100 text-red-600" : "text-gray-400 hover:text-emerald-500")}>
          <Mic className="h-5 w-5" />
        </button>
        <input
          type="text"
          value={newMessage}
          onChange={function(e: any) { setNewMessage(e.target.value); }}
          onKeyDown={function(e: any) { if (e.key === "Enter") { e.preventDefault(); handleSend(); } }}
          placeholder="Type a message..."
          className="flex-1 rounded-full bg-gray-100 dark:bg-gray-800 border-0 px-5 py-2.5 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
        />
        <button onClick={handleSend} disabled={!newMessage.trim()} className="rounded-full bg-emerald-500 p-2.5 text-white disabled:opacity-40">
          <Send className="h-4 w-4" />
        </button>
      </div>
      <BottomNav />
    </div>
  );
}