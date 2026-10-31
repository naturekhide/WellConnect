"use client";

import { useState, useRef } from "react";

export default function WebAudioPlayer({ url, isMine }: { url: string, isMine: boolean }) {
    const audioRef = useRef<HTMLAudioElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);

    const togglePlay = () => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const handleTimeUpdate = () => {
        if (audioRef.current) {
            const current = audioRef.current.currentTime;
            const duration = audioRef.current.duration || 1;
            setProgress((current / duration) * 100);
        }
    };

    return (
        <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "8px", background: isMine ? "rgba(0,0,0,0.2)" : "rgba(255,255,255,0.1)", borderRadius: "12px", minWidth: "200px", marginTop: "4px" }}>
            <audio 
                ref={audioRef} 
                src={url} 
                onTimeUpdate={handleTimeUpdate} 
                onEnded={() => { setIsPlaying(false); setProgress(0); }} 
                preload="metadata"
            />
            <button onClick={togglePlay} style={{ width: "32px", height: "32px", borderRadius: "16px", background: isMine ? "#fff" : "#059669", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: isMine ? "#059669" : "#fff" }}>
                {isPlaying ? "⏸" : "▶"}
            </button>
            <div style={{ flex: 1, height: "4px", background: isMine ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)", borderRadius: "2px", overflow: "hidden" }}>
                <div style={{ width: `${progress}%`, height: "100%", background: isMine ? "#fff" : "#059669" }} />
            </div>
        </div>
    );
}