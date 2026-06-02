"use client";

import { useEffect, useState, useRef } from "react";
import { Phone, PhoneOff, Video } from "lucide-react";

export default function IncomingCall({ call, onAccept, onReject }: { call: any; onAccept: any; onReject: any }) {
  var [visible, setVisible] = useState(true);
  var audioCtxRef = useRef<any>(null);
  var intervalRef = useRef<any>(null);

  useEffect(function() {
    // Create a simple ringtone using Web Audio API
    try {
      var audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioCtxRef.current = audioCtx;

      var playRing = function() {
        var osc = audioCtx.createOscillator();
        var gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.type = "sine";
        osc.frequency.setValueAtTime(800, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.8);
        osc.start(audioCtx.currentTime);
        osc.stop(audioCtx.currentTime + 0.8);
      };

      playRing();
      intervalRef.current = setInterval(playRing, 2000);
    } catch (e) {
      console.log("Could not play ringtone:", e);
    }

    return function() {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
      }
    };
  }, []);

  var handleAccept = function() {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (audioCtxRef.current) audioCtxRef.current.close();
    setVisible(false);
    onAccept();
  };

  var handleReject = function() {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (audioCtxRef.current) audioCtxRef.current.close();
    setVisible(false);
    onReject();
  };

  if (!visible) return null;

  return (
    <div className="w-full bg-green-600 dark:bg-green-800 text-white px-4 py-3 flex items-center justify-between flex-shrink-0 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-sm">
          {call.caller?.name?.charAt(0) || "U"}
        </div>
        <div>
          <p className="font-medium text-sm">{call.caller?.name || "Someone"}</p>
          <p className="text-xs text-green-200">
            {call.type === "video" ? "📹 Incoming video call..." : "📞 Incoming voice call..."}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={handleReject}
          className="h-10 w-10 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center text-white transition-colors"
        >
          <PhoneOff className="h-5 w-5" />
        </button>
        <button
          onClick={handleAccept}
          className="h-10 w-10 rounded-full bg-white hover:bg-green-100 flex items-center justify-center text-green-600 transition-colors"
        >
          {call.type === "video" ? <Video className="h-5 w-5" /> : <Phone className="h-5 w-5" />}
        </button>
      </div>
    </div>
  );
}