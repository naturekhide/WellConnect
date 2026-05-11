"use client";

import { useState, useRef } from "react";
import { Mic, Square, Play, Pause, Trash2, Loader2, Send } from "lucide-react";

interface VoiceRecorderProps {
  onAudioReady: (audioUrl: string) => void;
  onCancel: () => void;
}

export default function VoiceRecorder({ onAudioReady, onCancel }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [duration, setDuration] = useState(0);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach(track => track.stop());
        if (timerRef.current) clearInterval(timerRef.current);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setDuration(0);
      
      timerRef.current = setInterval(() => setDuration(prev => prev + 1), 1000);
    } catch (error) {
      console.error("Microphone error:", error);
      alert("Microphone access denied. Please allow microphone access to record audio.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleUpload = async () => {
    if (!audioBlob) return;
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", audioBlob, `voice-note-${Date.now()}.webm`);
      const response = await fetch("/api/upload/audio", { method: "POST", body: formData });
      if (response.ok) {
        const data = await response.json();
        onAudioReady(data.url);
      }
    } catch (error) {
      console.error("Upload error:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const togglePlay = () => {
    if (!audioRef.current || !audioUrl) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
      {!audioBlob ? (
        <>
          {isRecording ? (
            <>
              <div className="flex items-center gap-2 flex-1">
                <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-sm text-red-600">Recording... {formatDuration(duration)}</span>
              </div>
              <button onClick={stopRecording} className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600">
                <Square className="h-4 w-4" />
              </button>
            </>
          ) : (
            <button onClick={startRecording} className="p-2 bg-green-600 text-white rounded-full hover:bg-green-700">
              <Mic className="h-4 w-4" />
            </button>
          )}
        </>
      ) : (
        <>
          <button onClick={togglePlay} className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600">
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </button>
          <div className="flex-1 h-2 bg-gray-200 rounded-full">
            <div className="h-full bg-blue-500 rounded-full" style={{ width: `${Math.min(100, (duration / 60) * 100)}%` }} />
          </div>
          <span className="text-xs text-gray-500">{formatDuration(duration)}</span>
          <button onClick={() => { setAudioBlob(null); setAudioUrl(null); onCancel(); }} className="p-1 text-gray-400 hover:text-red-500">
            <Trash2 className="h-4 w-4" />
          </button>
          <button onClick={handleUpload} disabled={isUploading} className="p-2 bg-green-600 text-white rounded-full hover:bg-green-700 disabled:opacity-50">
            {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </button>
        </>
      )}
      {audioUrl && <audio ref={audioRef} src={audioUrl} onEnded={() => setIsPlaying(false)} className="hidden" />}
    </div>
  );
}