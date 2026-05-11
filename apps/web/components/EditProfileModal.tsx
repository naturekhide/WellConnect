"use client";

import { useState } from "react";
import { X, User, FileText, Link as LinkIcon } from "lucide-react";

export default function EditProfileModal({ profile, onClose, onProfileUpdated }: any) {
  var [name, setName] = useState(profile.name || "");
  var [bio, setBio] = useState(profile.bio || "");
  var [website, setWebsite] = useState(profile.website || "");
  var [isSubmitting, setIsSubmitting] = useState(false);
  var [error, setError] = useState("");

  var handleSubmit = async function(e: any) {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    try {
      var r = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, bio, website }),
      });
      if (r.ok) { var u = await r.json(); onProfileUpdated(u); }
      else { var d = await r.json(); setError(d.error || "Failed"); }
    } catch (e) { setError("Something went wrong"); }
    finally { setIsSubmitting(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white dark:bg-gray-800 shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Edit Profile</h2>
          <button onClick={onClose} className="rounded-full p-1 hover:bg-gray-100 dark:hover:bg-gray-700"><X className="h-5 w-5 text-gray-500" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6">
          {error && <div className="mb-4 rounded-xl bg-red-50 dark:bg-red-900/30 p-4 text-sm text-red-600 dark:text-red-400">{error}</div>}
          <div className="space-y-5">
            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300"><User className="h-4 w-4 text-green-600" /> Display Name</label>
              <input type="text" value={name} onChange={function(e: any) { setName(e.target.value); }} placeholder="Your name" className="w-full rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 px-4 py-3 text-gray-900 dark:text-gray-100 focus:border-green-500 focus:outline-none" />
            </div>
            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300"><FileText className="h-4 w-4 text-green-600" /> Bio</label>
              <textarea value={bio} onChange={function(e: any) { setBio(e.target.value); }} placeholder="Tell us about yourself..." rows={4} className="w-full resize-none rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 px-4 py-3 text-gray-900 dark:text-gray-100 focus:border-green-500 focus:outline-none" />
            </div>
            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300"><LinkIcon className="h-4 w-4 text-green-600" /> Website / Link</label>
              <input type="url" value={website} onChange={function(e: any) { setWebsite(e.target.value); }} placeholder="https://yourwebsite.com" className="w-full rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 px-4 py-3 text-gray-900 dark:text-gray-100 focus:border-green-500 focus:outline-none" />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Add a link to your website, blog, or social profile</p>
            </div>
          </div>
          <div className="mt-6 flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="flex-1 rounded-xl bg-gradient-to-r from-green-600 to-green-700 px-4 py-2.5 text-sm font-medium text-white shadow-md hover:from-green-700 hover:to-green-800 disabled:opacity-50">
              {isSubmitting ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}