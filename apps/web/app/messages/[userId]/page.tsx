"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import Header from "@/components/Header";
import VoiceRecorder from "@/components/VoiceRecorder";
import EmojiPicker from "@/components/EmojiPicker";
import { Send, Mic, Trash2, Paperclip, Image, FileText, Edit3, Check, X, Search, MessageCircle, Pin, CornerDownRight, Smile, Forward, Settings } from "lucide-react";
import Link from "next/link";

export default function MessagesLayout() {
  var router = useRouter();
  var params = useParams();
  var userId = params?.userId as string;
  var messagesEndRef = useRef<HTMLDivElement>(null);
  var fileInputRef = useRef<HTMLInputElement>(null);
  var [chatUser, setChatUser] = useState<any>(null);
  var [messages, setMessages] = useState<any[]>([]);
  var [newMessage, setNewMessage] = useState("");
  var [isLoading, setIsLoading] = useState(true);
  var [userName, setUserName] = useState("");
  var [currentUserId, setCurrentUserId] = useState("");
  var [showRecorder, setShowRecorder] = useState(false);
  var [showAttach, setShowAttach] = useState(false);
  var [showEmoji, setShowEmoji] = useState(false);
  var [replyTo, setReplyTo] = useState<any>(null);
  var [editingId, setEditingId] = useState<any>(null);
  var [editContent, setEditContent] = useState("");
  var [menuMsgId, setMenuMsgId] = useState<any>(null);
  var [conversations, setConversations] = useState<any[]>([]);
  var [isAtBottom, setIsAtBottom] = useState(true);
  var [pinnedMessages, setPinnedMessages] = useState<any[]>([]);
  var [mutedIds, setMutedIds] = useState<string[]>([]);
  var [showForward, setShowForward] = useState(false);
  var [forwardMsg, setForwardMsg] = useState<any>(null);
  var [showPrivacy, setShowPrivacy] = useState(false);
  var [readReceiptsOn, setReadReceiptsOn] = useState(true);
  var [isTyping, setIsTyping] = useState(false);
  var typingTimeoutRef = useRef<any>(null);
  var touchStartX = useRef(0);
  var touchStartY = useRef(0);
  var swipedMsgId = useRef<string | null>(null);

  useEffect(function() {
    var handleClick = function(e: any) {
      var target = e.target;
      if (target.closest("[data-menu]")) return;
      if (target.closest("[data-privacy]")) return;
      setMenuMsgId(null);
      setShowPrivacy(false);
    };
    document.addEventListener("click", handleClick);
    return function() { document.removeEventListener("click", handleClick); };
  }, []);

  useEffect(function() { fetchUser(); fetchConversations(); fetchMuted(); fetchPrivacy(); }, []);
  useEffect(function() { if (!userId) return; fetchChatUser(); fetchMessages(); var i = setInterval(fetchMessages, 3000); return function() { clearInterval(i); }; }, [userId]);
  useEffect(function() { if (isAtBottom) messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, isTyping]);
  useEffect(function() { setPinnedMessages(messages.filter(function(m: any) { return m.pinned; })); }, [messages]);

  var fetchUser = async function() { var r = await fetch("/api/auth/session"); if (r.ok) { var s = await r.json(); setUserName(s?.user?.name || "Friend"); setCurrentUserId(s?.user?.id || ""); } };
  var fetchConversations = async function() { var r = await fetch("/api/messages"); if (r.ok) setConversations(await r.json()); };
  var fetchMuted = async function() { var r = await fetch("/api/messages/mute"); if (r.ok) { var d = await r.json(); setMutedIds(d.mutedIds); } };
  var fetchPrivacy = async function() { var r = await fetch("/api/settings/privacy"); if (r.ok) { var d = await r.json(); setReadReceiptsOn(d.readReceipts); } };
  var fetchChatUser = async function() { if (!userId) return; var r = await fetch("/api/users/" + userId); if (r.ok) setChatUser(await r.json()); };
  var fetchMessages = async function() { if (!userId) return; var r = await fetch("/api/messages?userId=" + userId); if (r.ok) { var d = await r.json(); if (Array.isArray(d)) setMessages(d); } setIsLoading(false); };

  var handleScroll = function(e: any) { var el = e.target; setIsAtBottom(el.scrollHeight - el.scrollTop - el.clientHeight < 100); };
  var handleTouchStart = function(e: any, msg: any) { touchStartX.current = e.touches[0].clientX; touchStartY.current = e.touches[0].clientY; swipedMsgId.current = msg.id; };
  var handleTouchEnd = function(e: any, msg: any) { if (swipedMsgId.current !== msg.id) return; var dx = e.changedTouches[0].clientX - touchStartX.current; var dy = e.changedTouches[0].clientY - touchStartY.current; if (dx > 80 && Math.abs(dx) > Math.abs(dy) * 1.5) handleReply(msg); swipedMsgId.current = null; };

  var toggleReadReceipts = async function() {
    var r = await fetch("/api/settings/privacy", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ readReceipts: !readReceiptsOn }) });
    if (r.ok) { var d = await r.json(); setReadReceiptsOn(d.readReceipts); }
    setShowPrivacy(false);
  };

  var handleTyping = function(e: any) {
    setNewMessage(e.target.value);
    if (!isTyping) setIsTyping(true);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(function() { setIsTyping(false); }, 2000);
  };

  var handleSend = async function() { if (!newMessage.trim() || !userId) return; setIsTyping(false); if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current); var temp = newMessage; setNewMessage(""); var replyId = replyTo?.id || null; setReplyTo(null); var r = await fetch("/api/messages", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ recipientId: userId, content: temp, replyToId: replyId }) }); if (r.ok) { var d = await r.json(); setMessages(function(p: any) { return [...p, d]; }); fetchConversations(); setIsAtBottom(true); } else { setNewMessage(temp); } };
  var handleSendAudio = async function(audioUrl: string) { if (!userId) return; var r = await fetch("/api/messages", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ recipientId: userId, content: "", audioUrl: audioUrl }) }); if (r.ok) { var d = await r.json(); setMessages(function(p: any) { return [...p, d]; }); fetchConversations(); setIsAtBottom(true); } };
  var handleDelete = async function() { if (!menuMsgId) return; if (!confirm("Delete?")) { setMenuMsgId(null); return; } await fetch("/api/messages/" + menuMsgId, { method: "DELETE" }); setMessages(function(p: any) { return p.filter(function(m: any) { return m.id !== menuMsgId; }); }); setMenuMsgId(null); fetchConversations(); };
  var handleEdit = function(msg: any) { setMenuMsgId(null); setEditingId(msg.id); setEditContent(msg.content); };
  var handleSaveEdit = async function() { if (!editContent.trim() || !editingId) return; var r = await fetch("/api/messages/" + editingId, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ content: editContent }) }); if (r.ok) { var u = await r.json(); setMessages(function(p: any) { return p.map(function(m: any) { return m.id === editingId ? { ...m, content: u.content, edited: true } : m; }); }); setEditingId(null); setEditContent(""); fetchConversations(); } else { alert("Edit window expired"); setEditingId(null); } };
  var cancelEdit = function() { setEditingId(null); setEditContent(""); };
  var handleReply = function(msg: any) { setMenuMsgId(null); setReplyTo({ id: msg.id, content: msg.content || "Media", senderName: msg.senderId === currentUserId ? "You" : (chatUser?.name || "User") }); };
  var handleForward = function(msg: any) { setMenuMsgId(null); setForwardMsg(msg); setShowForward(true); };
  var handleForwardSend = async function(toUserId: string) { if (!forwardMsg) return; var r = await fetch("/api/messages", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ recipientId: toUserId, content: "↗️ Forwarded: " + (forwardMsg.content || ""), audioUrl: forwardMsg.audioUrl || null, imageUrl: forwardMsg.imageUrl || null, fileUrl: forwardMsg.fileUrl || null }) }); if (r.ok) { setShowForward(false); setForwardMsg(null); alert("Message forwarded!"); } };
  var handlePin = async function(msg: any) { setMenuMsgId(null); var r = await fetch("/api/messages/" + msg.id + "/pin", { method: "PUT" }); if (r.ok) { var d = await r.json(); setMessages(function(p: any) { return p.map(function(m: any) { return m.id === msg.id ? { ...m, pinned: d.pinned } : m; }); }); } };
  var handleMute = async function(mutedUserId: string, e: any) { e.stopPropagation(); var r = await fetch("/api/messages/mute", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ mutedUserId }) }); if (r.ok) { var d = await r.json(); if (d.muted) setMutedIds([...mutedIds, mutedUserId]); else setMutedIds(mutedIds.filter(function(id: string) { return id !== mutedUserId; })); } };
  var handleFileSelect = async function(e: any) { if (!userId) return; var file = e.target.files?.[0]; if (!file) return; setShowAttach(false); var fd = new FormData(); fd.append("file", file); var r = await fetch("/api/upload", { method: "POST", body: fd }); if (r.ok) { var d = await r.json(); var msgData: any = { recipientId: userId, content: "", imageUrl: null, fileUrl: null }; if (file.type.startsWith("image/")) msgData.imageUrl = d.url; else msgData.fileUrl = d.url; var sr = await fetch("/api/messages", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(msgData) }); if (sr.ok) { var msg = await sr.json(); setMessages(function(p: any) { return [...p, msg]; }); fetchConversations(); setIsAtBottom(true); } } if (fileInputRef.current) fileInputRef.current.value = ""; };
  var isWithin15Min = function(d: string) { return (Date.now() - new Date(d).getTime()) < 15 * 60 * 1000; };
  var formatTime = function(d: string) { return new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); };
  var formatTimeAgo = function(d: string) { var diff = (Date.now() - new Date(d).getTime()) / 60000; if (diff < 1) return "now"; if (diff < 60) return Math.floor(diff) + "m"; if (diff < 1440) return Math.floor(diff / 60) + "h"; return Math.floor(diff / 1440) + "d"; };

  var getFileName = function(url: string) {
    var parts = url.split("/");
    var name = parts[parts.length - 1];
    if (!name) return "File";
    var di = name.indexOf("-");
    if (di > 0) name = name.substring(di + 1);
    return name.replace(/_/g, " ").replace(/\.[^.]+$/, "") || "File";
  };

  var scrollToMessage = function(msgId: string) {
    var el = document.getElementById("msg-" + msgId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.classList.add("bg-yellow-100", "dark:bg-yellow-900");
      setTimeout(function() {
        if (el) {
          el.classList.remove("bg-yellow-100", "dark:bg-yellow-900");
        }
      }, 2000);
    }
  };

  if (isLoading) return <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800"><Header userName={userName} /><div className="flex justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-4 border-green-600 border-t-transparent"></div></div></div>;

  return (
    <div className="flex h-screen bg-[#efeae2] dark:bg-gray-900">
      {showForward && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={function() { setShowForward(false); }}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 w-[400px] max-h-[500px] overflow-y-auto" onClick={function(e: any) { e.stopPropagation(); }}>
            <div className="flex items-center justify-between mb-4"><h3 className="font-semibold text-gray-900 dark:text-gray-100">Forward Message</h3><button onClick={function() { setShowForward(false); }} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button></div>
            <div className="mb-3 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm text-gray-600 dark:text-gray-300">{forwardMsg?.content?.substring(0, 100) || "Media"}</div>
            <p className="text-xs text-gray-500 mb-3">Select a conversation:</p>
            <div className="space-y-1">{conversations.filter(function(c: any) { return c.user.id !== userId; }).map(function(conv: any) { return <button key={conv.user.id} onClick={function() { handleForwardSend(conv.user.id); }} className="w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg flex items-center gap-3"><div className="h-10 w-10 rounded-full bg-gradient-to-br from-green-400 to-blue-400 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">{conv.user.name?.charAt(0) || "U"}</div><p className="font-medium text-sm text-gray-900 dark:text-gray-100">{conv.user.name}</p></button>; })}</div>
          </div>
        </div>
      )}
      <div className="w-[380px] flex-shrink-0 border-r border-gray-300 dark:border-gray-700 flex flex-col bg-white dark:bg-gray-800">
        <div className="bg-[#f0f2f5] dark:bg-gray-800 px-4 py-2"><p className="font-medium text-gray-900 dark:text-gray-100">{userName || "Messages"}</p></div>
        <div className="flex-1 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-700">
          {conversations.length === 0 ? <div className="flex flex-col items-center justify-center py-20 text-center"><MessageCircle className="h-12 w-12 text-gray-300 dark:text-gray-600 mb-4" /><p className="text-gray-500 dark:text-gray-400">No conversations</p></div> : conversations.map(function(conv: any) { var isActive = userId === conv.user.id; var isMuted = mutedIds.includes(conv.user.id); return <button key={conv.user.id} onClick={function() { router.push("/messages/" + conv.user.id); }} className={"w-full text-left px-4 py-3 hover:bg-[#f0f2f5] dark:hover:bg-gray-700 flex items-center gap-3 " + (isActive ? "bg-[#f0f2f5] dark:bg-gray-700" : "")}><div className="h-12 w-12 rounded-full bg-gradient-to-br from-green-400 to-blue-400 flex items-center justify-center text-white font-semibold text-lg flex-shrink-0">{conv.user.name?.charAt(0) || "U"}</div><div className="flex-1 min-w-0"><div className="flex items-center justify-between"><p className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">{conv.user.name}</p><div className="flex items-center gap-1"><span className="text-xs text-gray-500 dark:text-gray-400">{formatTimeAgo(conv.lastMessage.createdAt)}</span><span onClick={function(e: any) { handleMute(conv.user.id, e); }} className="cursor-pointer text-xs">{isMuted ? "🔕" : "🔔"}</span></div></div><p className="text-xs text-gray-600 dark:text-gray-400 truncate">{conv.lastMessage.content || "Media"}</p></div></button>; })}
        </div>
      </div>
      <div className="flex-1 flex flex-col">
        {!userId ? <div className="flex-1 flex items-center justify-center bg-[#f0f2f5] dark:bg-gray-800"><div className="text-center"><MessageCircle className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" /><p className="text-gray-500 dark:text-gray-400">Select a conversation</p></div></div> : <>
          <div className="flex items-center px-4 py-2 bg-[#f0f2f5] dark:bg-gray-800 border-b dark:border-gray-700 relative">
            {chatUser && <Link href={"/profile/" + chatUser.id} className="flex items-center gap-3"><div className="h-10 w-10 rounded-full bg-gradient-to-br from-green-400 to-blue-400 flex items-center justify-center text-white font-semibold">{chatUser.name?.charAt(0) || "U"}</div><div><p className="font-medium text-sm text-gray-900 dark:text-gray-100">{chatUser.name}</p></div></Link>}
            <button data-privacy onClick={function(e: any) { e.stopPropagation(); setShowPrivacy(!showPrivacy); }} className="text-gray-400 hover:text-gray-600 p-1 ml-auto"><Settings className="h-4 w-4" /></button>
            {showPrivacy && (
              <div data-privacy className="absolute top-12 right-4 bg-white dark:bg-gray-700 rounded-lg shadow-lg p-4 z-30 min-w-[220px]" onClick={function(e: any) { e.stopPropagation(); }}>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">Privacy Settings</p>
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-sm text-gray-700 dark:text-gray-300">Read Receipts</span>
                  <button onClick={toggleReadReceipts} className={"relative w-10 h-6 rounded-full transition-colors " + (readReceiptsOn ? "bg-green-500" : "bg-gray-300 dark:bg-gray-600")}>
                    <span className={"absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform " + (readReceiptsOn ? "translate-x-4" : "")}></span>
                  </button>
                </label>
                <p className="text-xs text-gray-400 mt-2">{readReceiptsOn ? "Others can see when you've read their messages" : "Others cannot see when you've read their messages"}</p>
                <button onClick={function() { setShowPrivacy(false); }} className="w-full text-center text-xs text-gray-400 hover:text-gray-600 mt-3 pt-2 border-t dark:border-gray-600">Close</button>
              </div>
            )}
          </div>
          {pinnedMessages.length > 0 && <div className="px-4 py-2 bg-[#f0f2f5] dark:bg-gray-800 border-b dark:border-gray-700"><div className="flex items-center gap-2 overflow-x-auto"><Pin className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0" />{pinnedMessages.map(function(pm: any) { return <button key={pm.id} onClick={function() { scrollToMessage(pm.id); }} className="flex-shrink-0 bg-white dark:bg-gray-700 rounded-full px-3 py-1 text-xs text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 border dark:border-gray-600">{pm.content?.substring(0, 30) || "Media"}...</button>; })}</div></div>}
          <div className="flex-1 overflow-y-auto p-4 space-y-1 dark:bg-gray-900" onScroll={handleScroll}>
            {messages.map(function(msg: any) { var isMine = msg.senderId === currentUserId; var canEdit = isMine && isWithin15Min(msg.createdAt) && msg.content && !msg.audioUrl && !msg.imageUrl && !msg.fileUrl; return <div key={msg.id} id={"msg-" + msg.id} className={"flex " + (isMine ? "justify-end" : "justify-start")} onTouchStart={function(e: any) { handleTouchStart(e, msg); }} onTouchEnd={function(e: any) { handleTouchEnd(e, msg); }}><div className={"relative group max-w-[60%] " + (isMine ? "order-1" : "")}>{isMine && <button data-menu onClick={function(e: any) { e.stopPropagation(); setMenuMsgId(menuMsgId === msg.id ? null : msg.id); }} className="absolute -top-2 -right-2 bg-white dark:bg-gray-700 rounded-full p-0.5 shadow opacity-0 group-hover:opacity-100 z-10"><span className="text-gray-500 dark:text-gray-300 text-xs px-1">⋮</span></button>}{menuMsgId === msg.id && <div data-menu className="absolute -top-2 right-6 bg-white dark:bg-gray-700 rounded-lg shadow-lg py-1 z-20 min-w-[140px]" onClick={function(e: any) { e.stopPropagation(); }}><button onClick={function() { handleReply(msg); }} className="w-full text-left px-4 py-2 text-sm text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-600">↩️ Reply</button><button onClick={function() { handleForward(msg); }} className="w-full text-left px-4 py-2 text-sm text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-600">↗️ Forward</button><button onClick={function() { handlePin(msg); }} className="w-full text-left px-4 py-2 text-sm text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-600">{msg.pinned ? "📌 Unpin" : "📌 Pin"}</button>{canEdit && <button onClick={function() { handleEdit(msg); }} className="w-full text-left px-4 py-2 text-sm text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-600">✏️ Edit</button>}<button onClick={handleDelete} className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-100 dark:hover:bg-gray-600">🗑️ Delete</button><button onClick={function() { setMenuMsgId(null); }} className="w-full text-left px-4 py-2 text-sm text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600">✕ Cancel</button></div>}<div className={"rounded-lg px-3 py-2 shadow-sm " + (isMine ? "bg-[#d9fdd3] dark:bg-green-800" : "bg-white dark:bg-gray-700")}>{msg.pinned && <div className="flex items-center gap-1 text-[10px] text-green-600 dark:text-green-400 mb-1"><Pin className="h-3 w-3" /> Pinned</div>}{editingId === msg.id ? <div className="flex gap-2"><input type="text" value={editContent} onChange={function(e: any) { setEditContent(e.target.value); }} className="flex-1 rounded px-2 py-1 text-sm border dark:border-gray-600 bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100" onKeyDown={function(e: any) { if (e.key === "Enter") handleSaveEdit(); if (e.key === "Escape") cancelEdit(); }} autoFocus /><button onClick={handleSaveEdit} className="text-green-600"><Check className="h-4 w-4" /></button></div> : <>{msg.replyTo && <div className="border-l-4 border-green-500 pl-2 mb-1 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-600 rounded py-1">{msg.replyTo.content || "Media"}</div>}{msg.content && <p className="text-sm text-gray-900 dark:text-gray-100">{msg.content}{msg.edited && <span className="text-[10px] text-gray-400 ml-1">edited</span>}</p>}{msg.imageUrl && <img src={msg.imageUrl} className="mt-1 max-h-60 rounded-lg" />}{msg.fileUrl && <a href={msg.fileUrl} target="_blank" className="flex items-center gap-3 p-2 mt-1 rounded-lg bg-white dark:bg-gray-600 border dark:border-gray-500"><div className="h-10 w-10 rounded-lg bg-green-100 dark:bg-green-900 flex items-center justify-center"><FileText className="h-5 w-5 text-green-600 dark:text-green-400" /></div><div><p className="text-sm font-medium text-gray-900 dark:text-gray-100">{getFileName(msg.fileUrl)}</p><p className="text-xs text-gray-500 dark:text-gray-400">Document</p></div></a>}{msg.audioUrl && <audio controls className="mt-1 max-w-full h-8"><source src={msg.audioUrl} type="audio/webm" /></audio>}<div className="flex items-center justify-end gap-1 mt-0.5"><span className="text-[10px] text-gray-500 dark:text-gray-400">{formatTime(msg.createdAt)}</span>{isMine && <span className="text-[10px] text-blue-500 dark:text-blue-400">{msg.readAt ? "✓✓" : "✓"}</span>}</div></>}</div></div></div>; })}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white dark:bg-gray-700 border border-gray-100 dark:border-gray-600 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
                  <div className="flex gap-1">
                    <div className="h-2 w-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "0ms" }}></div>
                    <div className="h-2 w-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "150ms" }}></div>
                    <div className="h-2 w-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "300ms" }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          {isTyping && <div className="px-4 py-1 bg-gray-50 dark:bg-gray-800/50"><p className="text-xs text-green-600 dark:text-green-400 italic">Typing...</p></div>}
          {replyTo && <div className="px-4 py-2 bg-[#f0f2f5] dark:bg-gray-800 border-t dark:border-gray-700 flex items-center justify-between"><div><p className="text-xs font-medium text-green-600 dark:text-green-400">Replying to {replyTo.senderName}</p><p className="text-xs text-gray-500 dark:text-gray-400 truncate">{replyTo.content}</p></div><button onClick={function() { setReplyTo(null); }} className="text-gray-400"><X className="h-4 w-4" /></button></div>}
          {showRecorder && <div className="px-4 py-2 bg-[#f0f2f5] dark:bg-gray-800 border-t"><VoiceRecorder onAudioReady={function(url: string) { handleSendAudio(url); setShowRecorder(false); }} onCancel={function() { setShowRecorder(false); }} /></div>}
          {showAttach && <div className="px-4 py-2 bg-[#f0f2f5] dark:bg-gray-800 border-t flex gap-4"><button onClick={function() { fileInputRef.current?.click(); }} className="flex flex-col items-center gap-1 text-sm text-gray-700 dark:text-gray-300"><div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center"><Image className="h-6 w-6 text-green-600 dark:text-green-400" /></div>Image</button><button onClick={function() { fileInputRef.current?.click(); }} className="flex flex-col items-center gap-1 text-sm text-gray-700 dark:text-gray-300"><div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center"><Paperclip className="h-6 w-6 text-blue-600 dark:text-blue-400" /></div>Document</button></div>}
          <input ref={fileInputRef} type="file" accept="image/*,.pdf,.doc,.docx,.txt" onChange={handleFileSelect} className="hidden" />
          {chatUser && (
            <div className="flex items-center gap-2 px-4 py-2 bg-[#f0f2f5] dark:bg-gray-800 border-t dark:border-gray-700 relative">
              <button onClick={function() { setShowEmoji(!showEmoji); setShowAttach(false); }} className="text-gray-500 dark:text-gray-400 hover:text-gray-700 p-2"><Smile className="h-5 w-5" /></button>
              {showEmoji && <EmojiPicker onSelect={function(emoji: string) { setNewMessage(newMessage + emoji); setShowEmoji(false); }} onClose={function() { setShowEmoji(false); }} />}
              <button onClick={function() { setShowAttach(!showAttach); setShowEmoji(false); }} className="text-gray-500 dark:text-gray-400 hover:text-gray-700 p-2"><Paperclip className="h-5 w-5" /></button>
              <input type="text" value={newMessage} onChange={handleTyping} onKeyDown={function(e: any) { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }} placeholder="Type a message" className="flex-1 rounded-full bg-white dark:bg-gray-700 border dark:border-gray-600 px-5 py-2.5 text-sm focus:outline-none text-gray-900 dark:text-gray-100" />
              {newMessage.trim() ? <button onClick={handleSend} className="text-green-600 dark:text-green-400 p-2"><Send className="h-5 w-5" /></button> : <button onClick={function() { setShowRecorder(!showRecorder); setShowEmoji(false); }} className="text-gray-500 dark:text-gray-400 hover:text-gray-700 p-2"><Mic className="h-5 w-5" /></button>}
            </div>
          )}
        </>}
      </div>
    </div>
  );
}