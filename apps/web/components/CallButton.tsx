"use client";

import { Phone, Video } from "lucide-react";

export default function CallButton({ onVoiceCall, onVideoCall, disabled, showVideo }: { onVoiceCall: any; onVideoCall: any; disabled?: boolean; showVideo?: boolean }) {
  return (
    <div className="flex items-center gap-1">
      <button
        onClick={onVoiceCall}
        disabled={disabled}
        className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-green-600 dark:hover:text-green-400 transition-colors"
        title="Voice Call"
      >
        <Phone className="h-5 w-5" />
      </button>
      {showVideo !== false && (
        <button
          onClick={onVideoCall}
          disabled={disabled}
          className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          title="Video Call"
        >
          <Video className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}