"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Header from "@/components/Header";
import { Calendar, Mail, User as UserIcon, MessageCircle, UserPlus, UserCheck } from "lucide-react";

interface UserProfile {
  id: string;
  name: string | null;
  username: string | null;
  image: string | null;
  bio: string | null;
  createdAt: string;
  followerCount: number;
  followingCount: number;
  postCount: number;
}

export default function PublicProfilePage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.userId as string;
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userName, setUserName] = useState("");
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    fetchProfile();
    fetchMyData();
  }, [userId]);

  const fetchMyData = async () => {
    try {
      const response = await fetch("/api/auth/session");
      const session = await response.json();
      setUserName(session?.user?.name || "Friend");
    } catch (error) {}
  };

  const fetchProfile = async () => {
    try {
      const [profileRes, followRes] = await Promise.all([
        fetch(`/api/users/${userId}`),
        fetch(`/api/users/${userId}/follow`),
      ]);
      
      if (profileRes.ok) {
        const data = await profileRes.json();
        setProfile(data);
      }
      if (followRes.ok) {
        const data = await followRes.json();
        setIsFollowing(data.following);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFollow = async () => {
    try {
      const response = await fetch(`/api/users/${userId}/follow`, { method: "POST" });
      if (response.ok) {
        const data = await response.json();
        setIsFollowing(data.following);
        fetchProfile(); // Refresh counts
      }
    } catch (error) {}
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", { year: "numeric", month: "long" });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
        <Header userName={userName} />
        <main className="mx-auto max-w-3xl px-4 py-8">
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-green-600 border-t-transparent"></div>
          </div>
        </main>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
        <Header userName={userName} />
        <main className="mx-auto max-w-3xl px-4 py-8">
          <div className="text-center py-20">
            <UserIcon className="mx-auto h-16 w-16 text-gray-400" />
            <p className="mt-4 text-gray-600">User not found</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      <Header userName={userName} />
      
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-white shadow-xl overflow-hidden">
          <div className="h-32 bg-gradient-to-r from-green-400 via-blue-400 to-purple-400 sm:h-40"></div>
          
          <div className="px-6 pb-6">
            <div className="flex flex-col items-center -mt-16 sm:flex-row sm:items-end sm:gap-6">
              <div className="h-24 w-24 rounded-full border-4 border-white bg-gradient-to-br from-green-400 to-blue-400 flex items-center justify-center text-white text-4xl font-bold shadow-lg">
                {profile.name?.charAt(0) || "U"}
              </div>
              
              <div className="mt-4 text-center sm:text-left sm:flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">{profile.name || "Anonymous"}</h1>
                    {profile.username && (
                      <p className="text-sm text-gray-500">@{profile.username}</p>
                    )}
                    
                    {/* Follower Stats */}
                    <div className="mt-3 flex gap-4 text-sm">
                      <span><strong>{profile.postCount || 0}</strong> posts</span>
                      <span><strong>{profile.followerCount || 0}</strong> followers</span>
                      <span><strong>{profile.followingCount || 0}</strong> following</span>
                    </div>
                    
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-gray-600">
                      <span className="flex items-center gap-1"><Mail className="h-4 w-4" />{profile.email || "No email"}</span>
                      {profile.createdAt && (
                        <span className="flex items-center gap-1"><Calendar className="h-4 w-4" />Joined {formatDate(profile.createdAt)}</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-2 mt-4 sm:mt-0">
                    <button
                      onClick={handleFollow}
                      className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium shadow-sm transition-colors ${
                        isFollowing 
                          ? "bg-green-100 text-green-700 hover:bg-green-200" 
                          : "bg-green-600 text-white hover:bg-green-700"
                      }`}
                    >
                      {isFollowing ? <UserCheck className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
                      {isFollowing ? "Following" : "Follow"}
                    </button>
                    <button
                      onClick={() => router.push(`/messages/${userId}`)}
                      className="inline-flex items-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition-colors"
                    >
                      <MessageCircle className="h-4 w-4" />
                      Message
                    </button>
                  </div>
                </div>
                
                {profile.bio && (
                  <p className="mt-4 text-gray-700">{profile.bio}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}