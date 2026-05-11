"use client";

import { useState, useRef } from "react";
import { Image as ImageIcon, Video, X } from "lucide-react";
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
    <div className="mb-6 rounded-2xl bg-white dark:bg-gray-800 p-4 shadow-md">
      <form onSubmit={handleSubmit}>
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-green-400 to-blue-400 flex items-center justify-center text-white font-semibold flex-shrink-0">U</div>
          <div className="flex-1">
            <textarea value={content} onChange={function(e: any) { setContent(e.target.value); }} onFocus={function() { setIsExpanded(true); }} placeholder={groupId ? "Share something with this group..." : "Share something with the community..."} className="w-full resize-none rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 p-3 text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:border-green-400 focus:outline-none focus:ring-2 focus:ring-green-400/20" rows={isExpanded ? 3 : 1} />
            {mediaPreview && (
              <div className="mt-3 relative inline-block">
                {mediaType === "image" ? <img src={mediaPreview} alt="Preview" className="max-h-48 rounded-lg object-cover" /> : <video src={mediaPreview} controls className="max-h-48 rounded-lg" />}
                <button type="button" onClick={removeMedia} className="absolute -top-2 -right-2 rounded-full bg-red-500 p-1 text-white shadow-md hover:bg-red-600"><X className="h-3 w-3" /></button>
              </div>
            )}
            {isExpanded && (
              <div className="mt-3 flex items-center justify-between">
                <div className="flex gap-2 relative">
                  <button type="button" onClick={function() { fileInputRef.current?.click(); }} className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"><ImageIcon className="h-4 w-4" /> Photo</button>
                  <button type="button" onClick={function() { fileInputRef.current?.click(); }} className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"><Video className="h-4 w-4" /> Video</button>
                  <button type="button" onClick={function() { setShowEmoji(!showEmoji); }} className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700">😀 Emoji</button>
                  {showEmoji && <EmojiPicker onSelect={function(emoji: string) { setContent(content + emoji); setShowEmoji(false); }} onClose={function() { setShowEmoji(false); }} />}
                </div>
                <input ref={fileInputRef} type="file" accept="image/*,video/*" onChange={handleMediaSelect} className="hidden" />
                <div className="flex gap-2">
                  <button type="button" onClick={function() { setIsExpanded(false); setContent(""); removeMedia(); }} className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700">Cancel</button>
                  <button type="submit" disabled={!canPost} className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed">{isUploading ? "Uploading..." : isSubmitting ? "Posting..." : "Post"}</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}