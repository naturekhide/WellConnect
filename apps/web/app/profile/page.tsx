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


import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import EditProfileModal from "@/components/EditProfileModal";
import { Calendar, Mail, Edit3, Grid, User as UserIcon, Heart, MessageCircle, Users } from "lucide-react";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  bio: string | null;
  image: string | null;
  createdAt: string;
  stats: {
    posts: number;
    comments: number;
    reactions: number;
    groups: number;
  };
  recentPosts: Array<{
    id: string;
    content: string;
    createdAt: string;
    _count: {
      reactions: number;
      comments: number;
    };
  }>;
}

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userName, setUserName] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [activeTab, setActiveTab] = useState<"posts" | "about">("posts");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch("/api/profile");
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
        setUserName(data.name || "Friend");
      } else if (response.status === 401) {
        router.push("/login");
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileUpdated = (updatedProfile: any) => {
    setProfile({ ...profile!, ...updatedProfile });
    setUserName(updatedProfile.name || "Friend");
    setShowEditModal(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
    });
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
        <Header userName={userName} />
        <main className="mx-auto max-w-5xl px-4 py-8">
          <div className="flex items-center justify-center py-20">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-green-600 border-t-transparent"></div>
          </div>
        </main>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
        <Header userName={userName} />
        <main className="mx-auto max-w-5xl px-4 py-8">
          <div className="text-center py-20">
            <UserIcon className="mx-auto h-16 w-16 text-gray-400" />
            <p className="mt-4 text-gray-600">Profile not found</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      <Header userName={userName} />
      
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Profile Header Card */}
        <div className="relative overflow-hidden rounded-3xl bg-white shadow-xl">
          {/* Cover Image */}
          <div className="h-32 bg-gradient-to-r from-green-400 via-blue-400 to-purple-400 sm:h-48"></div>
          
          {/* Profile Info */}
          <div className="px-6 pb-6 sm:px-8 sm:pb-8">
            <div className="relative -mt-16 flex flex-col items-center sm:-mt-20 sm:flex-row sm:items-end sm:gap-6">
              {/* Avatar */}
              <div className="relative">
                <div className="h-24 w-24 rounded-full border-4 border-white bg-gradient-to-br from-green-400 to-blue-400 flex items-center justify-center text-white text-4xl font-bold shadow-lg sm:h-32 sm:w-32 sm:text-5xl">
                  {profile.name?.charAt(0) || "U"}
                </div>
                <button 
                  onClick={() => setShowEditModal(true)}
                  className="absolute bottom-0 right-0 rounded-full bg-white p-1.5 shadow-md hover:bg-gray-50 transition-colors"
                >
                  <Edit3 className="h-4 w-4 text-gray-600" />
                </button>
              </div>
              
              {/* Name and Actions */}
              <div className="mt-4 text-center sm:mt-0 sm:text-left sm:flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                      {profile.name || "Anonymous"}
                    </h1>
                    <div className="mt-2 flex flex-wrap items-center justify-center gap-3 text-sm text-gray-600 sm:justify-start">
                      <span className="flex items-center gap-1">
                        <Mail className="h-4 w-4" />
                        {profile.email}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Joined {formatDate(profile.createdAt)}
                      </span>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => setShowEditModal(true)}
                    className="mt-4 inline-flex items-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition-colors sm:mt-0"
                  >
                    <Edit3 className="h-4 w-4" />
                    Edit Profile
                  </button>
                </div>
                
                {profile.bio && (
                  <p className="mt-4 text-gray-700 max-w-2xl">{profile.bio}</p>
                )}
              </div>
            </div>
            
            {/* Stats Grid */}
            <div className="mt-8 grid grid-cols-4 gap-3 rounded-2xl bg-gradient-to-r from-green-50 to-blue-50 p-4 sm:gap-6 sm:p-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-700 sm:text-3xl">{profile.stats.posts}</p>
                <p className="mt-1 text-xs font-medium text-gray-600 sm:text-sm">Posts</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-700 sm:text-3xl">{profile.stats.comments}</p>
                <p className="mt-1 text-xs font-medium text-gray-600 sm:text-sm">Comments</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-700 sm:text-3xl">{profile.stats.reactions}</p>
                <p className="mt-1 text-xs font-medium text-gray-600 sm:text-sm">Reactions</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-700 sm:text-3xl">{profile.stats.groups}</p>
                <p className="mt-1 text-xs font-medium text-gray-600 sm:text-sm">Groups</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="mt-8">
          <div className="flex gap-8 border-b border-gray-200">
            <button
              onClick={() => setActiveTab("posts")}
              className={`relative pb-3 text-sm font-medium transition-all ${
                activeTab === "posts"
                  ? "text-green-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <div className="flex items-center gap-2">
                <Grid className="h-4 w-4" />
                Recent Posts
              </div>
              {activeTab === "posts" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-green-600"></div>
              )}
            </button>
            <button
              onClick={() => setActiveTab("about")}
              className={`relative pb-3 text-sm font-medium transition-all ${
                activeTab === "about"
                  ? "text-green-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <div className="flex items-center gap-2">
                <UserIcon className="h-4 w-4" />
                About
              </div>
              {activeTab === "about" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-green-600"></div>
              )}
            </button>
          </div>
        </div>
        
        {/* Tab Content */}
        <div className="mt-6">
          {activeTab === "posts" && (
            <div className="space-y-4">
              {profile.recentPosts.length === 0 ? (
                <div className="rounded-3xl bg-white p-12 text-center shadow-sm">
                  <Grid className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-4 text-gray-600 font-medium">No posts yet</p>
                  <p className="mt-1 text-sm text-gray-500">Share your first post with the community!</p>
                  <button
                    onClick={() => router.push("/feed")}
                    className="mt-6 inline-flex items-center gap-2 rounded-full bg-green-600 px-6 py-2.5 text-sm font-medium text-white shadow-md hover:bg-green-700 transition-colors"
                  >
                    Create your first post →
                  </button>
                </div>
              ) : (
                profile.recentPosts.map((post) => (
                  <div key={post.id} className="group rounded-2xl bg-white p-5 shadow-sm transition-all hover:shadow-md">
                    <p className="text-gray-800">{post.content}</p>
                    <div className="mt-4 flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {formatRelativeTime(post.createdAt)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart className="h-3.5 w-3.5 text-pink-500" />
                        {post._count.reactions} reactions
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageCircle className="h-3.5 w-3.5 text-blue-500" />
                        {post._count.comments} comments
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
          
          {activeTab === "about" && (
            <div className="rounded-3xl bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <UserIcon className="h-5 w-5 text-green-600" />
                About Me
              </h3>
              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 rounded-xl bg-gray-50">
                  <Mail className="h-5 w-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Email</p>
                    <p className="text-gray-800 font-medium">{profile.email}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 rounded-xl bg-gray-50">
                  <Calendar className="h-5 w-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Member Since</p>
                    <p className="text-gray-800 font-medium">{formatDate(profile.createdAt)}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 rounded-xl bg-gray-50">
                  <Users className="h-5 w-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Community Impact</p>
                    <p className="text-gray-800 font-medium">
                      {profile.stats.posts} posts • {profile.stats.comments} comments • {profile.stats.reactions} reactions
                    </p>
                  </div>
                </div>
                {profile.bio && (
                  <div className="flex items-start gap-4 p-4 rounded-xl bg-gray-50">
                    <Edit3 className="h-5 w-5 text-gray-500 mt-0.5" />
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Bio</p>
                      <p className="text-gray-800">{profile.bio}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
      
      {/* Edit Profile Modal */}
      {showEditModal && (
        <EditProfileModal
          profile={profile}
          onClose={() => setShowEditModal(false)}
          onProfileUpdated={handleProfileUpdated}
        />
      )}
    </div>
  );
}