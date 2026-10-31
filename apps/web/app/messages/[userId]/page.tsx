"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import WebAudioPlayer from "@/components/WebAudioPlayer";
import EmojiPicker from "emoji-picker-react";

var MY_BUBBLE = "#059669";
var THEIR_BUBBLE = "#132a25";
var BG_COLOR = "#0a0f0d";

function formatDate(dateString: string) {
    var d = new Date(dateString);
    var today = new Date();
    var yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    if (d.toDateString() === today.toDateString()) return "Today";
    if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
    return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

// 🚨 Helper to clean up the reply preview text
function getMessagePreview(content: string) {
    if (content.startsWith("🎤 ")) return "🎤 Voice Note";
    if (content.startsWith("🖼️ ")) return "🖼️ Photo";
    if (content.startsWith("📎 ")) {
        var url = content.replace("📎 ", "").toLowerCase();
        if (url.includes(".pdf")) return "📄 PDF Document";
        if (url.includes(".doc") || url.includes(".docx")) return "📝 Word Document";
        return "📎 File Attachment";
    }
    return content;
}

export default function WebChatPage() {
    const params = useParams();
    const router = useRouter();
    const otherId = params.userId as string;

    const [messages, setMessages] = useState<any[]>([]);
    const [text, setText] = useState("");
    const [other, setOther] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [showEmoji, setShowEmoji] = useState(false);
    
    // Recording & Upload
    const [isRecording, setIsRecording] = useState(false);
    const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
    const [pendingFile, setPendingFile] = useState<File | null>(null);

    // Edit, Delete, Reply States
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editText, setEditText] = useState("");
    const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
    const [replyingTo, setReplyingTo] = useState<any>(null);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        loadChat();
        const interval = setInterval(loadChat, 3000);
        return () => clearInterval(interval);
    }, [otherId]);

    const scrollToBottom = (force: boolean = false) => {
        if (!scrollContainerRef.current) return;
        const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
        const isNearBottom = scrollHeight - scrollTop - clientHeight < 150;
        if (force || isNearBottom) {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }
    };

    useEffect(() => {
        if (messages.length > 0 && loading === false) scrollToBottom(true);
    }, [loading]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const loadChat = async () => {
        try {
            const [msgRes, profileRes] = await Promise.all([
                fetch(`/api/dm/${otherId}`),
                fetch(`/api/users/${otherId}`)
            ]);
            if (msgRes.ok) {
                const data = await msgRes.json();
                setMessages(data.messages || []);
            }
            if (profileRes.ok) setOther(await profileRes.json());
        } catch (e) { }
        setLoading(false);
    };

    const handleSend = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!text.trim() && !pendingFile) return;
        let content = text.trim();
        
        if (pendingFile) {
            const formData = new FormData();
            formData.append("files", pendingFile);
            try {
                const res = await fetch("/api/upload/multi", { method: "POST", body: formData });
                const data = await res.json();
                if (data.urls && data.urls.length > 0) {
                    const isAudio = pendingFile.type.startsWith("audio/") || pendingFile.name.endsWith(".m4a") || pendingFile.name.endsWith(".webm");
                    const prefix = pendingFile.type.startsWith("image/") ? "🖼️ " : (isAudio ? "🎤 " : "📎 ");
                    content = `${prefix}${data.urls[0]}\n${content}`;
                }
            } catch (err) { alert("File upload failed"); return; }
        }

        setText("");
        setPendingFile(null);
        setReplyingTo(null);
        
        try {
            await fetch(`/api/dm/${otherId}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content, replyToId: replyingTo?.id || null }),
            });
            loadChat();
            setTimeout(() => scrollToBottom(true), 100);
        } catch (error) {}
    };

    const handleEditSave = async (msgId: string) => {
        if (!editText.trim()) return;
        try {
            await fetch(`/api/dm/${otherId}/edit?messageId=${msgId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content: editText.trim() })
            });
            setEditingId(null);
            loadChat();
        } catch (e) { alert("Edit failed"); }
    };

    const handleDelete = async (msgId: string) => {
        try {
            await fetch(`/api/dm/${otherId}/delete?messageId=${msgId}`, {
                method: "DELETE"
            });
            setDeleteConfirmId(null);
            loadChat();
        } catch (e) { alert("Delete failed"); }
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream);
            const chunks: BlobPart[] = [];

            recorder.ondataavailable = (e) => chunks.push(e.data);
            recorder.onstop = async () => {
                const blob = new Blob(chunks, { type: "audio/webm" });
                const file = new File([blob], "voice-note.webm", { type: "audio/webm" });
                const formData = new FormData();
                formData.append("files", file);
                try {
                    const res = await fetch("/api/upload/multi", { method: "POST", body: formData });
                    const data = await res.json();
                    if (data.urls && data.urls.length > 0) {
                        await fetch(`/api/dm/${otherId}`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ content: `🎤 ${data.urls[0]}` }),
                        });
                        loadChat();
                        setTimeout(() => scrollToBottom(true), 100);
                    }
                } catch (err) { alert("Audio upload failed"); }
            };

            recorder.start();
            setMediaRecorder(recorder);
            setIsRecording(true);
        } catch (err) { alert("Microphone access denied."); }
    };

    const stopRecording = () => {
        if (mediaRecorder) {
            mediaRecorder.stop();
            mediaRecorder.stream.getTracks().forEach(track => track.stop());
            setIsRecording(false);
        }
    };

    if (loading) return <div style={{ color: "white", textAlign: "center", marginTop: "100px" }}>Loading...</div>;

    return (
        <div style={{ display: "flex", flexDirection: "column", height: "100%", background: BG_COLOR, color: "#fff", fontFamily: "sans-serif" }}>
            
            <div style={{ padding: "20px 24px", borderBottom: "1px solid #1e293b", display: "flex", alignItems: "center", gap: "12px", flexShrink: 0 }}>
                <div style={{ width: "40px", height: "40px", borderRadius: "20px", background: MY_BUBBLE, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" }}>
                    {other?.name?.charAt(0) || "U"}
                </div>
                <div>
                    <div style={{ fontWeight: "bold", fontSize: "16px" }}>{other?.name}</div>
                    <div style={{ fontSize: "12px", color: "#64748b" }}>@{other?.username}</div>
                </div>
            </div>

            <div 
                ref={scrollContainerRef}
                className="no-scrollbar"
                style={{ flex: 1, overflowY: "auto", padding: "24px", display: "flex", flexDirection: "column" }}
            >
                {messages.map((m: any, index: number) => {
                    const isMine = m.isMine;
                    const showDate = index === 0 || new Date(messages[index - 1].createdAt).toDateString() !== new Date(m.createdAt).toDateString();
                    const isEditing = editingId === m.id;
                    const isEditable = (Date.now() - new Date(m.createdAt).getTime()) < 15 * 60 * 1000;

                    return (
                        <div key={m.id}>
                            {showDate && (
                                <div style={{ textAlign: "center", margin: "20px 0" }}>
                                    <span style={{ fontSize: "12px", fontWeight: "600", color: "#64748b", background: "#132a25", padding: "4px 12px", borderRadius: "12px" }}>{formatDate(m.createdAt)}</span>
                                </div>
                            )}
                            
                            <div style={{ display: "flex", justifyContent: isMine ? "flex-end" : "flex-start", marginBottom: "12px" }}>
                                
                                {!isEditing && (
                                    <div style={{ position: "relative", display: "flex", alignItems: "center", marginRight: isMine ? "8px" : "0", marginLeft: isMine ? "0" : "8px", order: isMine ? 1 : 2 }}>
                                        <button 
                                            onClick={() => setMenuOpenId(menuOpenId === m.id ? null : m.id)}
                                            style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", fontSize: "20px" }}
                                        >
                                            ···
                                        </button>
                                        {menuOpenId === m.id && (
                                            <div style={{ position: "absolute", bottom: "100%", left: isMine ? "auto" : 0, right: isMine ? 0 : "auto", background: "#1e293b", border: "1px solid #334155", borderRadius: "8px", padding: "4px", display: "flex", flexDirection: "column", zIndex: 10 }}>
                                                <button onClick={() => { setReplyingTo(m); setMenuOpenId(null); }} style={{ background: "none", border: "none", color: "#fff", padding: "8px 16px", textAlign: "left", cursor: "pointer", borderRadius: "4px" }}>Reply</button>
                                                {isMine && isEditable && (
                                                    <button onClick={() => { setEditingId(m.id); setEditText(m.content); setMenuOpenId(null); }} style={{ background: "none", border: "none", color: "#fff", padding: "8px 16px", textAlign: "left", cursor: "pointer", borderRadius: "4px" }}>Edit</button>
                                                )}
                                                {isMine && (
                                                    <button onClick={() => { setDeleteConfirmId(m.id); setMenuOpenId(null); }} style={{ background: "none", border: "none", color: "#ef4444", padding: "8px 16px", textAlign: "left", cursor: "pointer", borderRadius: "4px" }}>Delete</button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div style={{ maxWidth: "70%", background: isMine ? MY_BUBBLE : THEIR_BUBBLE, padding: "12px 16px", borderRadius: "20px", order: isMine ? 0 : 1 }}>
                                    
                                    {m.replyTo && (
                                        <div style={{ background: "rgba(0,0,0,0.2)", padding: "8px", borderRadius: "8px", marginBottom: "8px", borderLeft: "3px solid #34d399" }}>
                                            <div style={{ fontSize: "11px", fontWeight: "bold", color: "#34d399" }}>{m.replyTo.senderName}</div>
                                            <div style={{ fontSize: "12px", color: "#94a3b8", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                                {getMessagePreview(m.replyTo.content)}
                                            </div>
                                        </div>
                                    )}

                                    {isEditing ? (
                                        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                            <textarea 
                                                value={editText} 
                                                onChange={(e) => setEditText(e.target.value)}
                                                style={{ width: "100%", background: "rgba(0,0,0,0.2)", border: "1px solid #059669", borderRadius: "8px", padding: "8px", color: "#fff", outline: "none", resize: "none" }}
                                            />
                                            <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                                                <button onClick={() => setEditingId(null)} style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer" }}>Cancel</button>
                                                <button onClick={() => handleEditSave(m.id)} style={{ background: "#059669", border: "none", color: "#fff", padding: "4px 12px", borderRadius: "4px", cursor: "pointer" }}>Save</button>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            {m.content.startsWith("🎤 ") ? (
                                                <WebAudioPlayer url={m.content.replace("🎤 ", "")} isMine={isMine} />
                                            ) : m.content.startsWith("🖼️ ") ? (
                                                <img src={m.content.replace("🖼️ ", "")} style={{ maxWidth: "100%", borderRadius: "12px", marginTop: "8px" }} />
                                            ) : m.content.startsWith("📎 ") ? (
                                                (() => {
                                                    var rawText = m.content.replace("📎 ", "").trim();
                                                    var url = rawText.split("\n")[0].trim(); 
                                                    var lowerUrl = url.toLowerCase();
                                                    
                                                    if (lowerUrl.includes(".webm") || lowerUrl.includes(".mp3") || lowerUrl.includes(".m4a") || lowerUrl.includes(".wav")) {
                                                        return <WebAudioPlayer url={url} isMine={isMine} />;
                                                    }
                                                    if (lowerUrl.includes(".png") || lowerUrl.includes(".jpg") || lowerUrl.includes(".jpeg")) {
                                                        return <img src={url} style={{ maxWidth: "100%", borderRadius: "12px", marginTop: "8px" }} />;
                                                    }

                                                    return (
                                                        <a href={`/api/upload/download?url=${encodeURIComponent(url)}`} style={{ display: "flex", alignItems: "center", gap: "8px", color: "#fff", textDecoration: "none", background: "rgba(0,0,0,0.2)", padding: "12px", borderRadius: "12px" }}>
                                                            <span style={{ fontSize: "24px" }}>📄</span>
                                                            <span style={{ fontWeight: "600" }}>Download File</span>
                                                        </a>
                                                    );
                                                })()
                                            ) : (
                                                <div style={{ fontSize: "15px", lineHeight: "1.5" }}>{m.content}</div>
                                            )}
                                        </>
                                    )}

                                    <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: "4px", marginTop: "4px" }}>
                                        <span style={{ fontSize: "10px", color: isMine ? "rgba(255,255,255,0.7)" : "#64748b" }}>
                                            {new Date(m.createdAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                                        </span>
                                        {isMine && (
                                            <span style={{ color: m.readAt ? "#34d399" : "rgba(255,255,255,0.7)", fontSize: "12px" }}>
                                                {m.readAt ? "✓✓" : "✓"}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            <div style={{ padding: "20px 24px", borderTop: "1px solid #1e293b", position: "relative", flexShrink: 0 }}>
                
                {replyingTo && (
                    <div style={{ background: "#132a25", padding: "12px", borderRadius: "12px", marginBottom: "12px", display: "flex", justifyContent: "space-between", borderLeft: "4px solid #34d399" }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <span style={{ fontSize: "12px", fontWeight: "bold", color: "#34d399" }}>Replying to {replyingTo.isMine ? "yourself" : other?.name}</span>
                            <div style={{ fontSize: "13px", color: "#94a3b8", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                {getMessagePreview(replyingTo.content)}
                            </div>
                        </div>
                        <button onClick={() => setReplyingTo(null)} style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", padding: "0 8px" }}>✕</button>
                    </div>
                )}

                {pendingFile && (
                    <div style={{ background: "#132a25", padding: "12px", borderRadius: "12px", marginBottom: "12px", display: "flex", justifyContent: "space-between" }}>
                        <span>📎 {pendingFile.name}</span>
                        <button onClick={() => setPendingFile(null)} style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer" }}>✕</button>
                    </div>
                )}

                <form onSubmit={handleSend} style={{ display: "flex", gap: "12px", background: "#132a25", padding: "8px 16px", borderRadius: "30px", alignItems: "center" }}>
                    <button type="button" onClick={() => fileInputRef.current?.click()} style={{ background: "none", border: "none", color: "#94a3b8", fontSize: "24px", cursor: "pointer" }}>+</button>
                    <input type="file" ref={fileInputRef} style={{ display: "none" }} onChange={(e) => { if (e.target.files && e.target.files[0]) setPendingFile(e.target.files[0]); e.target.value = ""; }} />
                    
                    <button type="button" onClick={() => setShowEmoji(!showEmoji)} style={{ background: "none", border: "none", color: "#94a3b8", fontSize: "20px", cursor: "pointer" }}>😊</button>
                    {showEmoji && (
                        <div style={{ position: "absolute", bottom: "80px", right: "20px", zIndex: 10 }}>
                            <EmojiPicker onEmojiClick={(e) => setText(prev => prev + e.emoji)} theme="dark" />
                        </div>
                    )}

                    <input
                        type="text"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder={isRecording ? "Recording..." : "Message..."}
                        disabled={isRecording}
                        style={{ flex: 1, background: "none", border: "none", color: "#fff", fontSize: "15px", outline: "none" }}
                    />
                    
                    <button type="button" onClick={isRecording ? stopRecording : startRecording} style={{ background: "none", border: "none", color: isRecording ? "#ef4444" : "#94a3b8", fontSize: "20px", cursor: "pointer" }}>
                        {isRecording ? "⏹" : "🎤"}
                    </button>

                    <button type="submit" disabled={(!text.trim() && !pendingFile) || isRecording} style={{ width: "36px", height: "36px", borderRadius: "18px", background: (text.trim() || pendingFile) ? MY_BUBBLE : "#1e293b", border: "none", color: "#fff", cursor: (text.trim() || pendingFile) ? "pointer" : "default", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        ↑
                    </button>
                </form>
            </div>

            {deleteConfirmId && (
                <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
                    <div style={{ background: "#132a25", padding: "24px", borderRadius: "16px", width: "320px", textAlign: "center", border: "1px solid #1e293b" }}>
                        <h3 style={{ marginTop: 0, color: "#fff" }}>Delete Message?</h3>
                        <p style={{ color: "#94a3b8", fontSize: "14px", marginBottom: "24px" }}>This action cannot be undone.</p>
                        <div style={{ display: "flex", gap: "12px" }}>
                            <button onClick={() => setDeleteConfirmId(null)} style={{ flex: 1, padding: "10px", background: "none", border: "1px solid #1e293b", color: "#fff", borderRadius: "8px", cursor: "pointer" }}>Cancel</button>
                            <button onClick={() => handleDelete(deleteConfirmId)} style={{ flex: 1, padding: "10px", background: "#ef4444", border: "none", color: "#fff", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" }}>Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}