"use client";

/**
 * Copyright 2026 Ibrahim Aswad Nindow
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *     http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


import { useState } from "react";

interface CreatePostFormProps {
  onPostCreated: (post: any) => void;
}

export default function CreatePostForm({ onPostCreated }: CreatePostFormProps) {
  const [content, setContent] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: content.trim() }),
      });

      if (response.ok) {
        const newPost = await response.json();
        onPostCreated(newPost);
        setContent("");
        setIsExpanded(false);
      }
    } catch (error) {
      console.error("Error creating post:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mb-6 rounded-2xl bg-white p-4 shadow-md">
      <form onSubmit={handleSubmit}>
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-green-400 to-blue-400 flex items-center justify-center text-white font-semibold flex-shrink-0">
            U
          </div>
          <div className="flex-1">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onFocus={() => setIsExpanded(true)}
              placeholder="Share something with the community..."
              className="w-full resize-none rounded-lg border border-gray-200 p-3 text-gray-800 placeholder-gray-400 focus:border-green-400 focus:outline-none focus:ring-2 focus:ring-green-400/20"
              rows={isExpanded ? 3 : 1}
            />
            
            {isExpanded && (
              <div className="mt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsExpanded(false);
                    setContent("");
                  }}
                  className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!content.trim() || isSubmitting}
                  className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? "Posting..." : "Post"}
                </button>
              </div>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}