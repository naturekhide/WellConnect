"use client";

import { useState } from "react";
import { X, Camera } from "lucide-react";

export default function EditProfileModal({ profile, onClose, onProfileUpdated }: any) {
  var [name, setName] = useState(profile?.name || "");
  var [username, setUsername] = useState(profile?.username || "");
  var [bio, setBio] = useState(profile?.bio || "");
  var [website, setWebsite] = useState(profile?.website || "");
  var [isSubmitting, setIsSubmitting] = useState(false);
  var [error, setError] = useState("");

  var handleSubmit = async function(e: any) {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      var r = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, username, bio, website }),
      });

      if (r.ok) {
        var d = await r.json();
        onProfileUpdated(d);
      } else {
        var err = await r.json();
        setError(err.error || "Failed to update profile");
      }
    } catch (err) {
      setError("Something went wrong");
    }

    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-md max-h-[85vh] overflow-y-auto" onClick={function(e: any) { e.stopPropagation(); }}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Edit Profile</h2>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          <div className="flex justify-center">
            <div className="relative">
              <div className="h-20 w-20 rounded-full bg-gradient-to-br from-emerald-400 to-teal-400 flex items-center justify-center text-white text-2xl font-bold">
                {name?.charAt(0) || "U"}
              </div>
              <button type="button" className="absolute bottom-0 right-0 h-7 w-7 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-500 hover:text-emerald-600 transition-colors shadow-sm">
                <Camera className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={function(e: any) { setName(e.target.value); }}
              className="w-full rounded-xl bg-gray-50 dark:bg-gray-800 border-0 px-4 py-2.5 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Username</label>
            <input
              type="text"
              value={username}
              onChange={function(e: any) { setUsername(e.target.value); }}
              className="w-full rounded-xl bg-gray-50 dark:bg-gray-800 border-0 px-4 py-2.5 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Bio</label>
            <textarea
              value={bio}
              onChange={function(e: any) { setBio(e.target.value); }}
              rows={3}
              placeholder="Tell the community about yourself..."
              className="w-full rounded-xl bg-gray-50 dark:bg-gray-800 border-0 px-4 py-2.5 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Website</label>
            <input
              type="url"
              value={website}
              onChange={function(e: any) { setWebsite(e.target.value); }}
              placeholder="https://"
              className="w-full rounded-xl bg-gray-50 dark:bg-gray-800 border-0 px-4 py-2.5 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 rounded-xl border border-gray-200 dark:border-gray-700 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="flex-1 rounded-xl bg-emerald-600 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50 transition-all">
              {isSubmitting ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}