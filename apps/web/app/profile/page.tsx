"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import EditProfileModal from "@/components/EditProfileModal";
import { Calendar, Mail, Edit3, User as UserIcon, Link as LinkIcon } from "lucide-react";

export default function ProfilePage() {
  var router = useRouter();
  var [profile, setProfile] = useState<any>(null);
  var [isLoading, setIsLoading] = useState(true);
  var [userName, setUserName] = useState("");
  var [showEditModal, setShowEditModal] = useState(false);

  useEffect(function() { fetchProfile(); }, []);

  var fetchProfile = async function() {
    var r = await fetch("/api/profile");
    if (r.ok) { var d = await r.json(); setProfile(d); setUserName(d.name || "Friend"); }
    else if (r.status === 401) router.push("/login");
    setIsLoading(false);
  };

  var handleUpdated = function(u: any) { setProfile({ ...profile, ...u }); setUserName(u.name || "Friend"); setShowEditModal(false); };
  var formatDate = function(d: string) { return new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "long" }); };

  if (isLoading) return <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900"><Header userName={userName} /><div className="flex justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-4 border-green-600 border-t-transparent"></div></div></div>;
  if (!profile) return <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900"><Header userName={userName} /><div className="text-center py-20"><p className="text-gray-600 dark:text-gray-400">Profile not found</p></div></div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900"><Header userName={userName} /><main className="mx-auto max-w-5xl px-4 py-8">
      <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-gray-800 shadow-xl"><div className="h-32 bg-gradient-to-r from-green-400 via-blue-400 to-purple-400 sm:h-48"></div>
        <div className="px-6 pb-6">
          <div className="relative -mt-16 flex flex-col items-center sm:flex-row sm:items-end sm:gap-6">
            <div className="relative"><div className="h-24 w-24 rounded-full border-4 border-white dark:border-gray-800 bg-gradient-to-br from-green-400 to-blue-400 flex items-center justify-center text-white text-4xl font-bold shadow-lg">{profile.name?.charAt(0) || "U"}</div></div>
            <div className="mt-4 text-center sm:text-left sm:flex-1">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{profile.name}</h1>
              {profile.username && <p className="text-sm text-gray-500 dark:text-gray-400">@{profile.username}</p>}
              {profile.website && (
                <div className="mt-1 flex items-center gap-1 text-sm">
                  <LinkIcon className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <a href={profile.website.startsWith("http") ? profile.website : "https://" + profile.website} target="_blank" rel="noopener noreferrer" className="text-green-600 dark:text-green-400 hover:underline">
                    {profile.website.replace(/^https?:\/\//, "")}
                  </a>
                </div>
              )}
              <div className="mt-2 flex gap-4 text-sm text-gray-900 dark:text-gray-100"><span><strong>{profile.stats?.posts || 0}</strong> posts</span><span><strong>{profile.stats?.followers || 0}</strong> followers</span><span><strong>{profile.stats?.following || 0}</strong> following</span></div>
              <div className="mt-2 flex gap-3 text-sm text-gray-600 dark:text-gray-400"><span className="flex items-center gap-1"><Mail className="h-4 w-4" />{profile.email}</span><span className="flex items-center gap-1"><Calendar className="h-4 w-4" />Joined {formatDate(profile.createdAt)}</span></div>
              <button onClick={function() { setShowEditModal(true); }} className="mt-4 rounded-full border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300">Edit Profile</button>
            </div>
          </div>
          <div className="mt-8 grid grid-cols-4 gap-3 rounded-2xl bg-gradient-to-r from-green-50 to-blue-50 dark:from-gray-700 dark:to-gray-600 p-4">
            <div className="text-center"><p className="text-2xl font-bold text-green-700 dark:text-green-400">{profile.stats?.posts || 0}</p><p className="text-xs text-gray-600 dark:text-gray-400">Posts</p></div>
            <div className="text-center"><p className="text-2xl font-bold text-blue-700 dark:text-blue-400">{profile.stats?.comments || 0}</p><p className="text-xs text-gray-600 dark:text-gray-400">Comments</p></div>
            <div className="text-center"><p className="text-2xl font-bold text-purple-700 dark:text-purple-400">{profile.stats?.reactions || 0}</p><p className="text-xs text-gray-600 dark:text-gray-400">Reactions</p></div>
            <div className="text-center"><p className="text-2xl font-bold text-orange-700 dark:text-orange-400">{profile.stats?.groups || 0}</p><p className="text-xs text-gray-600 dark:text-gray-400">Groups</p></div>
          </div>
        </div>
      </div>
      {showEditModal && <EditProfileModal profile={profile} onClose={function() { setShowEditModal(false); }} onProfileUpdated={handleUpdated} />}
    </main></div>
  );
}