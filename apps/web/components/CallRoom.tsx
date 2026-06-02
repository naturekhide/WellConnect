"use client";

import { useEffect, useState, useRef } from "react";
import { PhoneOff, Mic, MicOff, Volume2, Video, VideoOff } from "lucide-react";

export default function CallRoom({ call, userId, onEnd }: { call: any; userId: string; onEnd: any }) {
  var [isMuted, setIsMuted] = useState(false);
  var [isSpeaker, setIsSpeaker] = useState(false);
  var [isVideoOn, setIsVideoOn] = useState(call.type === "video");
  var [duration, setDuration] = useState(0);
  var [callStarted, setCallStarted] = useState(false);
  var durationRef = useRef<any>(null);
  var localVideoRef = useRef<HTMLVideoElement>(null);
  var remoteVideoRef = useRef<HTMLVideoElement>(null);
  var pcRef = useRef<RTCPeerConnection | null>(null);
  var streamRef = useRef<MediaStream | null>(null);
  var eventSourceRef = useRef<EventSource | null>(null);

  useEffect(function() {
    startCall();
    listenForCallEnd();

    return function() {
      if (durationRef.current) clearInterval(durationRef.current);
      if (eventSourceRef.current) eventSourceRef.current.close();
      endMedia();
    };
  }, []);

  useEffect(function() {
    if (callStarted) {
      durationRef.current = setInterval(function() {
        setDuration(function(d: number) { return d + 1; });
      }, 1000);
    }
    return function() {
      if (durationRef.current) clearInterval(durationRef.current);
    };
  }, [callStarted]);

  var listenForCallEnd = function() {
    var es = new EventSource("/api/calls/signal?userId=" + userId);
    eventSourceRef.current = es;

    es.onmessage = function(event: any) {
      try {
        var data = JSON.parse(event.data);

        if (data.type === "call-ended" && data.callId === call.id) {
          endMedia();
          onEnd();
          return;
        }

        if (data.type === "call-started" && data.callId === call.id) {
          setCallStarted(true);
          return;
        }

        if (data.type === "offer" && pcRef.current) {
          handleSignal(data);
        }
        if (data.type === "answer" && pcRef.current) {
          handleSignal(data);
        }
        if (data.type === "ice-candidate" && pcRef.current) {
          handleSignal(data);
        }
      } catch (e) {}
    };
  };

  var handleSignal = async function(signal: any) {
    var pc = pcRef.current;
    if (!pc) return;

    try {
      if (signal.type === "offer") {
        await pc.setRemoteDescription(new RTCSessionDescription(signal.sdp));
        var answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        sendSignal({ type: "answer", sdp: answer });
      } else if (signal.type === "answer") {
        await pc.setRemoteDescription(new RTCSessionDescription(signal.sdp));
      } else if (signal.type === "ice-candidate") {
        await pc.addIceCandidate(new RTCIceCandidate(signal.candidate));
      }
    } catch (e) {}
  };

  var startCall = async function() {
    try {
      var constraints: any = { audio: true };
      if (call.type === "video") constraints.video = true;

      var stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (localVideoRef.current && call.type === "video") {
        localVideoRef.current.srcObject = stream;
      }

      var pc = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
      });
      pcRef.current = pc;

      stream.getTracks().forEach(function(track: any) {
        pc.addTrack(track, stream);
      });

      pc.onicecandidate = function(event: any) {
        if (event.candidate) {
          sendSignal({ type: "ice-candidate", candidate: event.candidate });
        }
      };

      pc.ontrack = function(event: any) {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
        }
      };

      // Only start timer if call is already ongoing (not ringing)
      if (call.status === "ongoing") {
        setCallStarted(true);
      }

      // Create and send offer (caller only)
      if (call.callerId === userId && call.status === "ringing") {
        var offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        sendSignal({ type: "offer", sdp: offer });
      }
    } catch (e) {
      console.error("Failed to start call:", e);
    }
  };

  var sendSignal = async function(signal: any) {
    var recipients = call.participants
      .filter(function(p: any) { return p.userId !== userId && (p.status === "joined" || p.status === "ringing"); })
      .map(function(p: any) { return p.userId; });

    for (var i = 0; i < recipients.length; i++) {
      await fetch("/api/calls/signal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: recipients[i], signal: signal }),
      });
    }
  };

  var toggleMute = function() {
    if (streamRef.current) {
      streamRef.current.getAudioTracks().forEach(function(track: any) { track.enabled = !track.enabled; });
      setIsMuted(!isMuted);
    }
  };

  var toggleVideo = function() {
    if (streamRef.current) {
      streamRef.current.getVideoTracks().forEach(function(track: any) { track.enabled = !track.enabled; });
      setIsVideoOn(!isVideoOn);
    }
  };

  var toggleSpeaker = function() {
    setIsSpeaker(!isSpeaker);
  };

  var endMedia = function() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(function(track: any) { track.stop(); });
    }
    if (pcRef.current) {
      pcRef.current.close();
    }
  };

  var handleEnd = async function() {
    var recipients = call.participants
      .filter(function(p: any) { return p.userId !== userId && (p.status === "joined" || p.status === "ringing"); })
      .map(function(p: any) { return p.userId; });

    for (var i = 0; i < recipients.length; i++) {
      await fetch("/api/calls/signal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: recipients[i], signal: { type: "call-ended", callId: call.id } }),
      });
    }

    endMedia();
    await fetch("/api/calls/" + call.id, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "end" }),
    });
    onEnd();
  };

  var formatDuration = function(s: number) {
    var m = Math.floor(s / 60);
    var sec = s % 60;
    return String(m).padStart(2, "0") + ":" + String(sec).padStart(2, "0");
  };

  return (
    <div className="fixed inset-0 z-50 bg-gray-900 flex flex-col">
      {call.type === "video" && (
        <video ref={remoteVideoRef} autoPlay playsInline className="absolute inset-0 w-full h-full object-cover" />
      )}

      {call.type === "video" && isVideoOn && (
        <video ref={localVideoRef} autoPlay playsInline muted className="absolute top-4 right-4 w-32 h-48 rounded-xl object-cover border-2 border-white shadow-lg z-10" />
      )}

      <div className={"relative z-20 flex flex-col items-center " + (call.type === "video" ? "mt-auto pb-8" : "flex-1 justify-center")}>
        {call.type === "voice" && (
          <div className="h-24 w-24 rounded-full bg-gradient-to-br from-green-400 to-blue-400 flex items-center justify-center text-white text-4xl font-bold mb-4 animate-pulse">
            {call.caller?.name?.charAt(0) || "U"}
          </div>
        )}
        <h3 className="text-white text-xl font-bold">
          {call.scope === "group" ? (call.participants?.filter(function(p: any) { return p.status === "joined"; }).length || 0) + " participants" : (call.caller?.name || "Call")}
        </h3>
        <p className="text-gray-400 text-sm mt-1">
          {!callStarted ? "Ringing..." : formatDuration(duration)}
        </p>
      </div>

      <div className="relative z-20 flex items-center justify-center gap-4 pb-8">
        <button onClick={toggleMute} className={"h-12 w-12 rounded-full flex items-center justify-center shadow-lg transition-colors " + (isMuted ? "bg-red-500 text-white" : "bg-gray-600 text-white hover:bg-gray-500")}>
          {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
        </button>
        <button onClick={handleEnd} className="h-14 w-14 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center text-white shadow-lg transition-transform hover:scale-110">
          <PhoneOff className="h-6 w-6" />
        </button>
        <button onClick={toggleSpeaker} className={"h-12 w-12 rounded-full flex items-center justify-center shadow-lg transition-colors " + (isSpeaker ? "bg-green-500 text-white" : "bg-gray-600 text-white hover:bg-gray-500")}>
          <Volume2 className="h-5 w-5" />
        </button>
        {call.type === "video" && (
          <button onClick={toggleVideo} className={"h-12 w-12 rounded-full flex items-center justify-center shadow-lg transition-colors " + (!isVideoOn ? "bg-red-500 text-white" : "bg-gray-600 text-white hover:bg-gray-500")}>
            {isVideoOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
          </button>
        )}
      </div>
    </div>
  );
}