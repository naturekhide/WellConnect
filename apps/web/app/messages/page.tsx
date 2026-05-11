"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import VoiceRecorder from "@/components/VoiceRecorder";
import { Send, Mic, Trash2, Paperclip, Image, FileText, Edit3, Check, X, Search, MessageCircle } from "lucide-react";
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
  var [replyTo, setReplyTo] = useState<any>(null);
  var [editingId, setEditingId] = useState<any>(null);
  var [editContent, setEditContent] = useState("");
  var [menuMsgId, setMenuMsgId] = useState<any>(null);
  var [conversations, setConversations] = useState<any[]>([]);

  useEffect(function() { fetchUser(); fetchConversations(); }, []);
  useEffect(function() { if (!userId) return; fetchChatUser(); fetchMessages(); var i = setInterval(fetchMessages, 3000); return function() { clearInterval(i); }; }, [userId]);
  useEffect(function() { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  var fetchUser = async function() { var r = await fetch("/api/auth/session"); if (r.ok) { var s = await r.json(); setUserName(s?.user?.name || "Friend"); setCurrentUserId(s?.user?.id || ""); } };
  var fetchConversations = async function() { var r = await fetch("/api/messages"); if (r.ok) setConversations(await r.json()); };
  var fetchChatUser = async function() { if (!userId) return; var r = await fetch("/api/users/" + userId); if (r.ok) setChatUser(await r.json()); };
  var fetchMessages = async function() { if (!userId) return; var r = await fetch("/api/messages?userId=" + userId); if (r.ok) { var d = await r.json(); if (Array.isArray(d)) setMessages(d); } setIsLoading(false); };

  var handleSend = async function() { if (!newMessage.trim() || !userId) return; var temp = newMessage; setNewMessage(""); var replyId = replyTo?.id || null; setReplyTo(null); var r = await fetch("/api/messages", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ recipientId: userId, content: temp, replyToId: replyId }) }); if (r.ok) { var d = await r.json(); setMessages(function(p: any) { return [...p, d]; }); fetchConversations(); } else { setNewMessage(temp); } };
  var handleSendAudio = async function(audioUrl: string) { if (!userId) return; var r = await fetch("/api/messages", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ recipientId: userId, content: "", audioUrl: audioUrl }) }); if (r.ok) { var d = await r.json(); setMessages(function(p: any) { return [...p, d]; }); fetchConversations(); } };
  var handleDelete = async function() { if (!menuMsgId) return; if (!confirm("Delete?")) { setMenuMsgId(null); return; } await fetch("/api/messages/" + menuMsgId, { method: "DELETE" }); setMessages(function(p: any) { return p.filter(function(m: any) { return m.id !== menuMsgId; }); }); setMenuMsgId(null); fetchConversations(); };
  var handleEdit = function(msg: any) { setMenuMsgId(null); setEditingId(msg.id); setEditContent(msg.content); };
  var handleSaveEdit = async function() { if (!editContent.trim() || !editingId) return; var r = await fetch("/api/messages/" + editingId, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ content: editContent }) }); if (r.ok) { var u = await r.json(); setMessages(function(p: any) { return p.map(function(m: any) { return m.id === editingId ? { ...m, content: u.content, edited: true } : m; }); }); setEditingId(null); setEditContent(""); fetchConversations(); } else { alert("Edit window expired (15 min)"); setEditingId(null); } };
  var cancelEdit = function() { setEditingId(null); setEditContent(""); };
  var handleReply = function(msg: any) { setMenuMsgId(null); setReplyTo({ id: msg.id, content: msg.content || (msg.audioUrl ? "Voice note" : msg.imageUrl ? "Image" : "File"), senderName: msg.senderId === currentUserId ? "You" : (chatUser?.name || "User") }); };
  var handleFileSelect = async function(e: any) { if (!userId) return; var file = e.target.files?.[0]; if (!file) return; setShowAttach(false); var fd = new FormData(); fd.append("file", file); var r = await fetch("/api/upload", { method: "POST", body: fd }); if (r.ok) { var d = await r.json(); var msgData: any = { recipientId: userId, content: "", imageUrl: null, fileUrl: null }; if (file.type.startsWith("image/")) msgData.imageUrl = d.url; else msgData.fileUrl = d.url; var sr = await fetch("/api/messages", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(msgData) }); if (sr.ok) { var msg = await sr.json(); setMessages(function(p: any) { return [...p, msg]; }); fetchConversations(); } } if (fileInputRef.current) fileInputRef.current.value = ""; };
  var isWithin15Min = function(d: string) { return (Date.now() - new Date(d).getTime()) < 15 * 60 * 1000; };
  var formatTime = function(d: string) { return new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); };
  var formatTimeAgo = function(d: string) { var diff = (Date.now() - new Date(d).getTime()) / 60000; if (diff < 1) return "now"; if (diff < 60) return Math.floor(diff) + "m"; if (diff < 1440) return Math.floor(diff / 60) + "h"; return Math.floor(diff / 1440) + "d"; };
  var getFileName = function(url: string) { return url.split("/").pop()?.replace(/^\d+-/, "").replace(/_/g, " ").replace(/\.[^.]+$/, "") || "File"; };

  return (
    <div className="flex h-screen bg-[#efeae2]">
      <div className="w-[380px] flex-shrink-0 border-r border-gray-300 flex flex-col bg-white">
        <div className="bg-[#f0f2f5] px-4 py-2 flex items-center justify-between"><p className="font-medium text-gray-900">{userName || "Messages"}</p></div>
        <div className="bg-[#f0f2f5] px-4 py-2"><div className="flex items-center gap-2 bg-white rounded-full px-4 py-2 border"><Search className="h-4 w-4 text-gray-400" /><input type="text" placeholder="Search or start new chat" className="flex-1 text-sm bg-transparent focus:outline-none" /></div></div>
        <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
          {conversations.length === 0 ? <div className="flex flex-col items-center justify-center py-20 text-center"><MessageCircle className="h-12 w-12 text-gray-300 mb-4" /><p className="text-gray-500">No conversations</p></div> : conversations.map(function(conv: any) { return <button key={conv.user.id} onClick={function() { router.push("/messages/" + conv.user.id); }} className={"w-full text-left px-4 py-3 hover:bg-[#f0f2f5] transition-colors flex items-center gap-3 " + (userId === conv.user.id ? "bg-[#f0f2f5]" : "")}><div className="h-12 w-12 rounded-full bg-gradient-to-br from-green-400 to-blue-400 flex items-center justify-center text-white font-semibold text-lg flex-shrink-0">{conv.user.name?.charAt(0) || "U"}</div><div className="flex-1 min-w-0"><div className="flex items-center justify-between"><p className="font-medium text-sm truncate">{conv.user.name}</p><span className="text-xs text-gray-500">{formatTimeAgo(conv.lastMessage.createdAt)}</span></div><p className="text-xs text-gray-600 truncate">{conv.lastMessage.content || "Media"}</p></div>{conv.unreadCount > 0 && <span className="flex h-5 w-5 items-center justify-center rounded-full bg-green-500 text-[10px] font-bold text-white">{conv.unreadCount}</span>}</button>; })}
        </div>
      </div>
      <div className="flex-1 flex flex-col">
        {!userId ? <div className="flex-1 flex items-center justify-center bg-[#f0f2f5]"><div className="text-center"><MessageCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" /><p className="text-gray-500">Select a conversation</p></div></div> : <>
          <div className="flex items-center px-4 py-2 bg-[#f0f2f5] border-b">{chatUser && <Link href={"/profile/" + chatUser.id} className="flex items-center gap-3"><div className="h-10 w-10 rounded-full bg-gradient-to-br from-green-400 to-blue-400 flex items-center justify-center text-white font-semibold">{chatUser.name?.charAt(0) || "U"}</div><div><p className="font-medium text-sm">{chatUser.name}</p></div></Link>}</div>
          <div className="flex-1 overflow-y-auto p-4 space-y-1" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"%23d4d4d4\" fill-opacity=\"0.1\"%3E%3Cpath d=\"M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4z\"/%3E%3C/g%3E%3C/svg%3E')" }}>
            {messages.map(function(msg: any) { var isMine = msg.senderId === currentUserId; var canEdit = isMine && isWithin15Min(msg.createdAt) && msg.content && !msg.audioUrl && !msg.imageUrl && !msg.fileUrl; return <div key={msg.id} className={"flex " + (isMine ? "justify-end" : "justify-start")}><div className={"relative group max-w-[60%] " + (isMine ? "order-1" : "")}>{isMine && <button onClick={function(e: any) { e.stopPropagation(); setMenuMsgId(menuMsgId === msg.id ? null : msg.id); }} className="absolute -top-2 -right-2 bg-white rounded-full p-0.5 shadow opacity-0 group-hover:opacity-100 z-10"><span className="text-gray-500 text-xs px-1">⋮</span></button>}{menuMsgId === msg.id && <div className="absolute -top-2 right-6 bg-white rounded-lg shadow-lg py-1 z-20 min-w-[140px]" onClick={function(e: any) { e.stopPropagation(); }}><button onClick={function() { handleReply(msg); }} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100">↩️ Reply</button>{canEdit && <button onClick={function() { handleEdit(msg); }} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100">✏️ Edit</button>}<button onClick={handleDelete} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 text-red-500">🗑️ Delete</button><button onClick={function() { setMenuMsgId(null); }} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 text-gray-400">✕ Cancel</button></div>}<div className={"rounded-lg px-3 py-2 shadow-sm " + (isMine ? "bg-[#d9fdd3]" : "bg-white")}>{editingId === msg.id ? <div className="flex gap-2"><input type="text" value={editContent} onChange={function(e: any) { setEditContent(e.target.value); }} className="flex-1 rounded px-2 py-1 text-sm border" onKeyDown={function(e: any) { if (e.key === "Enter") handleSaveEdit(); if (e.key === "Escape") cancelEdit(); }} autoFocus /><button onClick={handleSaveEdit} className="text-green-600"><Check className="h-4 w-4" /></button></div> : <>{msg.replyTo && <div className="border-l-4 border-green-500 pl-2 mb-1 text-xs text-gray-500 bg-gray-50 rounded py-1">{msg.replyTo.content || "Media"}</div>}{msg.content && <p className="text-sm text-gray-900">{msg.content}{msg.edited && <span className="text-[10px] text-gray-400 ml-1">edited</span>}</p>}{msg.imageUrl && <img src={msg.imageUrl} className="mt-1 max-h-60 rounded-lg" />}{msg.fileUrl && <a href={msg.fileUrl} target="_blank" className="flex items-center gap-3 p-2 mt-1 rounded-lg bg-white border"><div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center"><FileText className="h-5 w-5 text-green-600" /></div><div><p className="text-sm font-medium">{getFileName(msg.fileUrl)}</p><p className="text-xs text-gray-500">Document</p></div></a>}{msg.audioUrl && <audio controls className="mt-1 max-w-full h-8"><source src={msg.audioUrl} type="audio/webm" /></audio>}<div className="flex items-center justify-end gap-1 mt-0.5"><span className="text-[10px] text-gray-500">{formatTime(msg.createdAt)}</span>{isMine && <span className="text-[10px] text-blue-500">{msg.readAt ? "✓✓" : "✓"}</span>}</div></>}</div></div></div>; })}
            <div ref={messagesEndRef} />
          </div>
          {replyTo && <div className="px-4 py-2 bg-[#f0f2f5] border-t flex items-center justify-between"><div><p className="text-xs font-medium text-green-600">Replying to {replyTo.senderName}</p><p className="text-xs text-gray-500 truncate">{replyTo.content}</p></div><button onClick={function() { setReplyTo(null); }} className="text-gray-400 hover:text-gray-600"><X className="h-4 w-4" /></button></div>}
          {showRecorder && <div className="px-4 py-2 bg-[#f0f2f5] border-t"><VoiceRecorder onAudioReady={function(url: string) { handleSendAudio(url); setShowRecorder(false); }} onCancel={function() { setShowRecorder(false); }} /></div>}
          {showAttach && <div className="px-4 py-2 bg-[#f0f2f5] border-t flex gap-4"><button onClick={function() { fileInputRef.current?.click(); }} className="flex flex-col items-center gap-1 text-sm"><div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center"><Image className="h-6 w-6 text-green-600" /></div>Image</button><button onClick={function() { fileInputRef.current?.click(); }} className="flex flex-col items-center gap-1 text-sm"><div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center"><Paperclip className="h-6 w-6 text-blue-600" /></div>Document</button></div>}
          <input ref={fileInputRef} type="file" accept="image/*,.pdf,.doc,.docx,.txt" onChange={handleFileSelect} className="hidden" />
          {chatUser && <div className="flex items-center gap-2 px-4 py-2 bg-[#f0f2f5] border-t"><button onClick={function() { setShowAttach(!showAttach); }} className="text-gray-500 hover:text-gray-700 p-2"><Paperclip className="h-5 w-5" /></button><input type="text" value={newMessage} onChange={function(e: any) { setNewMessage(e.target.value); }} onKeyDown={function(e: any) { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }} placeholder="Type a message" className="flex-1 rounded-full bg-white border px-5 py-2.5 text-sm focus:outline-none" />{newMessage.trim() ? <button onClick={handleSend} className="text-green-600 p-2"><Send className="h-5 w-5" /></button> : <button onClick={function() { setShowRecorder(!showRecorder); }} className="text-gray-500 hover:text-gray-700 p-2"><Mic className="h-5 w-5" /></button>}</div>}
        </>}
      </div>
    </div>
  );
}