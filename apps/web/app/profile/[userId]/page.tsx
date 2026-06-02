"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import BottomNav from "@/components/BottomNav";
import { ArrowLeft, Calendar, User as UserIcon, MessageCircle, UserPlus, UserCheck, Link as LinkIcon } from "lucide-react";
import Link from "next/link";

interface UserProfile {
  id: string;
  name: string | null;
  username: string | null;
  image: string | null;
  bio: string | null;
  website: string | null;
  email: string | null;
  createdAt: string;
  followerCount: number;
  followingCount: number;
  postCount: number;
}

export default function PublicProfilePage() {
  var router = useRouter();
  var params = useParams();
  var userId = params.userId as string;

  var [profile, setProfile] = useState<UserProfile | null>(null);
  var [isLoading, setIsLoading] = useState(true);
  var [userName, setUserName] = useState("");
  var [isFollowing, setIsFollowing] = useState(false);

  useEffect(function() {
    fetchProfile();
    fetchMyData();
  }, [userId]);

  var fetchMyData = async function() {
    try {
      var response = await fetch("/api/auth/session");
      var session = await response.json();
      setUserName(session?.user?.name || "Friend");
    } catch (error) {}
  };

  var fetchProfile = async function() {
    try {
      var [profileRes, followRes] = await Promise.all([
        fetch("/api/users/" + userId),
        fetch("/api/users/" + userId + "/follow"),
      ]);

      if (profileRes.ok) {
        var data = await profileRes.json();
        setProfile(data);
      }
      if (followRes.ok) {
        var data = await followRes.json();
        setIsFollowing(data.following);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  var handleFollow = async function() {
    try {
      var response = await fetch("/api/users/" + userId + "/follow", { method: "POST" });
      if (response.ok) {
        var data = await response.json();
        setIsFollowing(data.following);
        fetchProfile();
      }
    } catch (error) {}
  };

  var formatDate = function(dateString: string) {
    return new Date(dateString).toLocaleDateString("en-US", { year: "numeric", month: "long" });
  };

  if (isLoading) return (
    <div className="min-h-screen bg-[#f8faf9] dark:bg-gray-950 flex items-center justify-center pb-20">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent"></div>
    </div>
  );

  if (!profile) return (
    <div className="min-h-screen bg-[#f8faf9] dark:bg-gray-950 pb-20">
      <div className="sticky top-0 z-20 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-100 dark:border-gray-800">
        <div className="mx-auto max-w-2xl px-4 py-3 flex items-center gap-3">
          <button onClick={function() { router.back(); }} className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Profile</h1>
        </div>
      </div>
      <div className="text-center py-20">
        <UserIcon className="mx-auto h-16 w-16 text-gray-400" />
        <p className="mt-4 text-gray-500 dark:text-gray-400">User not found</p>
      </div>
      <BottomNav />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8faf9] dark:bg-gray-950 pb-20">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-100 dark:border-gray-800">
        <div className="mx-auto max-w-2xl px-4 py-3 flex items-center gap-3">
          <button onClick={function() { router.back(); }} className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">{profile.name || "Profile"}</h1>
        </div>
      </div>

      <main className="mx-auto max-w-2xl px-4 py-6">
        <div className="relative bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
          <div className="h-24 bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500"></div>

          <div className="px-6 pb-6">
            <div className="flex items-end justify-between -mt-10">
              <div className="h-20 w-20 rounded-full border-4 border-white dark:border-gray-900 bg-gradient-to-br from-emerald-400 to-teal-400 flex items-center justify-center text-white text-2xl font-bold shadow-md">
                {profile.name?.charAt(0) || "U"}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleFollow}
                  className={"inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-medium transition-all " +
                    (isFollowing
                      ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-900/50"
                      : "bg-emerald-600 text-white hover:bg-emerald-700")}
                >
                  {isFollowing ? <UserCheck className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
                  {isFollowing ? "Following" : "Follow"}
                </button>
                <Link
                  href={"/messages/" + userId}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
                >
                  <MessageCircle className="h-4 w-4" />
                  Message
                </Link>
              </div>
            </div>

            <div className="mt-3">
              <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">{profile.name || "Anonymous"}</h1>
              {profile.username && <p className="text-sm text-gray-500 dark:text-gray-400">@{profile.username}</p>}

              {profile.bio && <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">{profile.bio}</p>}

              <div className="flex items-center gap-4 mt-3 text-sm text-gray-500 dark:text-gray-400">
                {profile.website && (
                  <span className="flex items-center gap-1">
                    <LinkIcon className="h-3 w-3" />
                    <a href={profile.website.startsWith("http") ? profile.website : "https://" + profile.website} target="_blank" rel="noopener noreferrer" className="text-emerald-600 dark:text-emerald-400 hover:underline">
                      {profile.website.replace(/^https?:\/\//, "")}
                    </a>
                  </span>
                )}
                {profile.createdAt && (
                  <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />Joined {formatDate(profile.createdAt)}</span>
                )}
              </div>

              <div className="flex gap-6 mt-4">
                <span className="text-sm"><strong className="text-gray-900 dark:text-gray-100">{profile.postCount || 0}</strong> <span className="text-gray-500">posts</span></span>
                <span className="text-sm"><strong className="text-gray-900 dark:text-gray-100">{profile.followerCount || 0}</strong> <span className="text-gray-500">followers</span></span>
                <span className="text-sm"><strong className="text-gray-900 dark:text-gray-100">{profile.followingCount || 0}</strong> <span className="text-gray-500">following</span></span>
              </div>
            </div>
          </div>
        </div>
      </main>
      <BottomNav />
    </div>
  );
}