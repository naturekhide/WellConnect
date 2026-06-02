"use client";

import { useState, useRef } from "react";
import { Image as ImageIcon, Video, X, Smile } from "lucide-react";
import EmojiPicker from "./EmojiPicker";

interface CreatePostFormProps {
  onPostCreated: (post: any) => void;
  groupId?: string;
}

export default function CreatePostForm({ onPostCreated, groupId }: CreatePostFormProps) {
  var [content, setContent] = useState("");
  var [isExpanded, setIsExpanded] = useState(false);
  var [isSubmitting, setIsSubmitting] = useState(false);
  var [mediaFile, setMediaFile] = useState<File | null>(null);
  var [mediaPreview, setMediaPreview] = useState<string | null>(null);
  var [mediaType, setMediaType] = useState<"image" | "video" | null>(null);
  var [isUploading, setIsUploading] = useState(false);
  var [showEmoji, setShowEmoji] = useState(false);
  var fileInputRef = useRef<HTMLInputElement>(null);

  var handleMediaSelect = function(e: React.ChangeEvent<HTMLInputElement>) {
    var file = e.target.files?.[0];
    if (!file) return;
    var isImage = ["image/jpeg", "image/png", "image/gif", "image/webp"].includes(file.type);
    var isVideo = ["video/mp4", "video/webm", "video/quicktime"].includes(file.type);
    if (!isImage && !isVideo) { alert("Please select an image or video file."); return; }
    var maxSize = isVideo ? 50 * 1024 * 1024 : 5 * 1024 * 1024;
    if (file.size > maxSize) { alert("File too large."); return; }
    setMediaFile(file); setMediaPreview(URL.createObjectURL(file)); setMediaType(isVideo ? "video" : "image"); setIsExpanded(true);
  };

  var removeMedia = function() { setMediaFile(null); setMediaPreview(null); setMediaType(null); if (fileInputRef.current) fileInputRef.current.value = ""; };

  var uploadMedia = async function(): Promise<string | null> {
    if (!mediaFile) return null;
    setIsUploading(true);
    try { var fd = new FormData(); fd.append("file", mediaFile); var r = await fetch("/api/upload", { method: "POST", body: fd }); if (r.ok) { var d = await r.json(); return d.url; } return null; }
    catch (e) { return null; }
    finally { setIsUploading(false); }
  };

  var handleSubmit = async function(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim() && !mediaFile) return;
    if (isSubmitting || isUploading) return;
    setIsSubmitting(true);
    try {
      var mediaUrl = null;
      if (mediaFile) { mediaUrl = await uploadMedia(); if (!mediaUrl) { alert("Failed to upload."); setIsSubmitting(false); return; } }
      var r = await fetch("/api/posts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ content: content.trim() || "", groupId: groupId || null, imageUrl: mediaType === "image" ? mediaUrl : null, videoUrl: mediaType === "video" ? mediaUrl : null }) });
      if (r.ok) { var np = await r.json(); onPostCreated(np); setContent(""); setMediaFile(null); setMediaPreview(null); setMediaType(null); setIsExpanded(false); if (fileInputRef.current) fileInputRef.current.value = ""; }
    } catch (e) { }
    finally { setIsSubmitting(false); }
  };

  var canPost = (content.trim().length > 0 || mediaFile) && !isSubmitting && !isUploading;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
      <form onSubmit={handleSubmit}>
        <div className="flex items-start gap-3 p-4">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-400 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">U</div>
          <div className="flex-1">
            <textarea
              value={content}
              onChange={function(e: any) { setContent(e.target.value); }}
              onFocus={function() { setIsExpanded(true); }}
              placeholder={groupId ? "Share something with this group..." : "Share something with the community..."}
              className="w-full resize-none rounded-xl bg-gray-50 dark:bg-gray-800 p-3 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:bg-white dark:focus:bg-gray-800 transition-all"
              rows={isExpanded ? 3 : 1}
            />
            {mediaPreview && (
              <div className="mt-3 relative inline-block">
                {mediaType === "image" ? <img src={mediaPreview} alt="Preview" className="max-h-48 rounded-xl object-cover" /> : <video src={mediaPreview} controls className="max-h-48 rounded-xl" />}
                <button type="button" onClick={removeMedia} className="absolute -top-2 -right-2 rounded-full bg-red-500 p-1 text-white shadow-md hover:bg-red-600 transition-all">
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}
          </div>
        </div>
        {isExpanded && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-50 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
            <div className="flex gap-1 relative">
              <button type="button" onClick={function() { fileInputRef.current?.click(); }} className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-white dark:hover:bg-gray-700 transition-all">
                <ImageIcon className="h-4 w-4" /> Photo
              </button>
              <button type="button" onClick={function() { fileInputRef.current?.click(); }} className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-white dark:hover:bg-gray-700 transition-all">
                <Video className="h-4 w-4" /> Video
              </button>
              <button type="button" onClick={function() { setShowEmoji(!showEmoji); }} className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-white dark:hover:bg-gray-700 transition-all">
                <Smile className="h-4 w-4" /> Emoji
              </button>
              {showEmoji && <EmojiPicker onSelect={function(emoji: string) { setContent(content + emoji); setShowEmoji(false); }} onClose={function() { setShowEmoji(false); }} />}
            </div>
            <input ref={fileInputRef} type="file" accept="image/*,video/*" onChange={handleMediaSelect} className="hidden" />
            <div className="flex gap-2">
              <button type="button" onClick={function() { setIsExpanded(false); setContent(""); removeMedia(); }} className="rounded-lg px-4 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-700 transition-all">
                Cancel
              </button>
              <button type="submit" disabled={!canPost} className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-medium text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
                {isUploading ? "Uploading..." : isSubmitting ? "Posting..." : "Post"}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}