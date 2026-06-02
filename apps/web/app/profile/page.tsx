"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import EditProfileModal from "@/components/EditProfileModal";
import MoodCheckin from "@/components/MoodCheckin";
import BottomNav from "@/components/BottomNav";
import PostCard from "@/components/PostCard";
import { Calendar, Link as LinkIcon, Settings, TrendingUp, TrendingDown, Minus } from "lucide-react";

export default function ProfilePage() {
  var router = useRouter();
  var [profile, setProfile] = useState<any>(null);
  var [isLoading, setIsLoading] = useState(true);
  var [userName, setUserName] = useState("");
  var [showEditModal, setShowEditModal] = useState(false);
  var [moodData, setMoodData] = useState<any>(null);
  var [moodHistory, setMoodHistory] = useState<any[]>([]);
  var [activeTab, setActiveTab] = useState("posts");
  var [userPosts, setUserPosts] = useState<any[]>([]);
  var [loadingPosts, setLoadingPosts] = useState(false);

  useEffect(function() { fetchProfile(); fetchMoodData(); }, []);

  var fetchProfile = async function() {
    var r = await fetch("/api/profile");
    if (r.ok) { var d = await r.json(); setProfile(d); setUserName(d.name || "Friend"); }
    else if (r.status === 401) router.push("/login");
    setIsLoading(false);
  };

  var fetchMoodData = async function() {
    try {
      var statsRes = await fetch("/api/mood/stats");
      if (statsRes.ok) setMoodData(await statsRes.json());
      var historyRes = await fetch("/api/mood?days=30");
      if (historyRes.ok) setMoodHistory(await historyRes.json());
    } catch (e) {}
  };

  var fetchUserPosts = async function() {
    setLoadingPosts(true);
    try {
      var r = await fetch("/api/posts?userId=" + profile?.id);
      if (r.ok) setUserPosts(await r.json());
    } catch (e) {}
    setLoadingPosts(false);
  };

  var handleUpdated = function(u: any) { setProfile({ ...profile, ...u }); setUserName(u.name || "Friend"); setShowEditModal(false); };
  var formatDate = function(d: string) { return new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "long" }); };

  var getMoodEmoji = function(label: string) {
    var map: any = { thriving: "🟢", managing: "🟡", struggling: "🟠", crisis: "🔴" };
    return map[label] || "⚪";
  };

  var getMoodColor = function(label: string) {
    var map: any = {
      thriving: "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400",
      managing: "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400",
      struggling: "bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-400",
      crisis: "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400",
    };
    return map[label] || "";
  };

  var getTrendIcon = function() {
    if (!moodData) return null;
    if (moodData.trend === "up") return <TrendingUp className="h-3 w-3 text-emerald-500" />;
    if (moodData.trend === "down") return <TrendingDown className="h-3 w-3 text-orange-500" />;
    return <Minus className="h-3 w-3 text-gray-400" />;
  };

  var getLastNDays = function(n: number) {
    var days = [];
    var today = new Date();
    var todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    var dayOfWeek = todayMidnight.getDay();
    var daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    var thisMonday = new Date(todayMidnight);
    thisMonday.setDate(todayMidnight.getDate() - daysFromMonday);
    var firstDay = new Date(thisMonday);
    firstDay.setDate(thisMonday.getDate() - (n - 1));
    for (var i = 0; i < n; i++) {
      var d = new Date(firstDay);
      d.setDate(firstDay.getDate() + i);
      days.push(d);
    }
    return days;
  };

  var getMoodForDate = function(date: Date) {
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var day = date.getDate();
    var dateStr = year + "-" + String(month).padStart(2, "0") + "-" + String(day).padStart(2, "0");

    var found = moodHistory.find(function(e: any) {
      var ed = new Date(e.createdAt);
      var edYear = ed.getFullYear();
      var edMonth = ed.getMonth() + 1;
      var edDay = ed.getDate();
      var edStr = edYear + "-" + String(edMonth).padStart(2, "0") + "-" + String(edDay).padStart(2, "0");
      return edStr === dateStr;
    });
    return found || null;
  };

  var tabs = [
    { id: "posts", label: "Posts", count: profile?.stats?.posts || 0 },
    { id: "mood", label: "Mood", count: moodData?.totalEntries || 0 },
    { id: "stats", label: "Stats", count: null },
  ];

  if (isLoading) return (
    <div className="min-h-screen bg-[#f8faf9] dark:bg-gray-950 flex items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8faf9] dark:bg-gray-950 pb-20">
      <main className="mx-auto max-w-2xl px-4 py-6">
        <div className="relative bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden mb-4">
          <div className="h-24 bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500"></div>
          <div className="px-6 pb-6">
            <div className="flex items-end justify-between -mt-10">
              <div className="h-20 w-20 rounded-full border-4 border-white dark:border-gray-900 bg-gradient-to-br from-emerald-400 to-teal-400 flex items-center justify-center text-white text-2xl font-bold shadow-md">
                {profile?.name?.charAt(0) || "U"}
              </div>
              <button onClick={function() { setShowEditModal(true); }} className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-all">
                <Settings className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-3">
              <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">{profile?.name}</h1>
              {profile?.username && <p className="text-sm text-gray-500 dark:text-gray-400">@{profile.username}</p>}
              {profile?.bio && <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">{profile.bio}</p>}
              <div className="flex items-center gap-4 mt-3 text-sm text-gray-500 dark:text-gray-400">
                {profile?.website && (
                  <span className="flex items-center gap-1">
                    <LinkIcon className="h-3 w-3" />
                    <a href={profile.website.startsWith("http") ? profile.website : "https://" + profile.website} target="_blank" rel="noopener noreferrer" className="text-emerald-600 dark:text-emerald-400 hover:underline">
                      {profile.website.replace(/^https?:\/\//, "")}
                    </a>
                  </span>
                )}
                <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />Joined {formatDate(profile?.createdAt)}</span>
              </div>
              <div className="flex gap-6 mt-4">
                <span className="text-sm"><strong className="text-gray-900 dark:text-gray-100">{profile?.stats?.posts || 0}</strong> <span className="text-gray-500">posts</span></span>
                <span className="text-sm"><strong className="text-gray-900 dark:text-gray-100">{profile?.stats?.followers || 0}</strong> <span className="text-gray-500">followers</span></span>
                <span className="text-sm"><strong className="text-gray-900 dark:text-gray-100">{profile?.stats?.following || 0}</strong> <span className="text-gray-500">following</span></span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-1 bg-gray-100 dark:bg-gray-900 rounded-xl p-1 mb-4">
          {tabs.map(function(t: any) {
            return (
              <button
                key={t.id}
                onClick={function() { setActiveTab(t.id); if (t.id === "posts") fetchUserPosts(); }}
                className={"flex-1 py-2.5 text-sm font-medium rounded-lg transition-all " +
                  (activeTab === t.id
                    ? "bg-white dark:bg-gray-800 text-emerald-700 dark:text-emerald-400 shadow-sm"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300")}
              >
                {t.label}
                {t.count !== null && t.count > 0 && <span className="ml-1.5 text-xs opacity-60">{t.count}</span>}
              </button>
            );
          })}
        </div>

        {activeTab === "posts" && (
          loadingPosts ? (
            <div className="text-center py-8">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent mx-auto"></div>
            </div>
          ) : userPosts.length === 0 ? (
            <div className="text-center py-16">
              <div className="h-16 w-16 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📝</span>
              </div>
              <p className="text-gray-500 dark:text-gray-400 font-medium">No posts yet</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Share your first post with the community</p>
            </div>
          ) : (
            <div className="space-y-3">
              {userPosts.map(function(p: any) {
                return (
                  <PostCard
                    key={p.id}
                    post={p}
                    currentUserId={profile?.id}
                    onReactionUpdate={function(pid: string, nr: any) {
                      setUserPosts(userPosts.map(function(up: any) { return up.id === pid ? { ...up, reactions: nr } : up; }));
                    }}
                    onPostDelete={function(postId: string) {
                      setUserPosts(userPosts.filter(function(up: any) { return up.id !== postId; }));
                    }}
                  />
                );
              })}
            </div>
          )
        )}

        {activeTab === "mood" && (
          <div className="space-y-4">
            <div className="flex justify-center">
              <MoodCheckin />
            </div>

            {moodData && moodData.totalEntries > 0 ? (
              <>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-white dark:bg-gray-900 rounded-xl p-3 text-center border border-gray-100 dark:border-gray-800">
                    <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{moodData.averageScore}</p>
                    <p className="text-[10px] text-gray-500 mt-0.5">Avg Mood</p>
                  </div>
                  <div className="bg-white dark:bg-gray-900 rounded-xl p-3 text-center border border-gray-100 dark:border-gray-800">
                    <p className="text-xl font-bold text-blue-600 dark:text-blue-400">{moodData.totalEntries}</p>
                    <p className="text-[10px] text-gray-500 mt-0.5">Check-ins</p>
                  </div>
                  <div className="bg-white dark:bg-gray-900 rounded-xl p-3 text-center border border-gray-100 dark:border-gray-800">
                    <p className="text-lg font-bold text-purple-600 dark:text-purple-400 capitalize flex items-center justify-center gap-1">
                      {getMoodEmoji(moodData.dominantMood)} {moodData.dominantMood}
                    </p>
                    <p className="text-[10px] text-gray-500 mt-0.5">Dominant Mood</p>
                  </div>
                  <div className="bg-white dark:bg-gray-900 rounded-xl p-3 text-center border border-gray-100 dark:border-gray-800">
                    <p className="text-xl font-bold text-amber-600 dark:text-amber-400 flex items-center justify-center gap-1">
                      {moodData.recentAvg} {getTrendIcon()}
                    </p>
                    <p className="text-[10px] text-gray-500 mt-0.5">7-Day Trend</p>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Mood Calendar</h3>
                  <div className="grid grid-cols-7 gap-1">
                    {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map(function(day: string) {
                      return <div key={day} className="text-center text-[10px] font-medium text-gray-400 py-1">{day}</div>;
                    })}
                    {getLastNDays(28).map(function(date: Date, i: number) {
                      var entry = getMoodForDate(date);
                      var isToday = new Date().toDateString() === date.toDateString();
                      return (
                        <div key={i} title={entry ? entry.label : "No check-in"}
                          className={"aspect-square rounded-lg flex items-center justify-center text-xs font-medium " +
                            (entry ? getMoodColor(entry.label) : "bg-gray-50 dark:bg-gray-800 text-gray-300 dark:text-gray-600") +
                            (isToday ? " ring-2 ring-emerald-400" : "")}>
                          {entry ? getMoodEmoji(entry.label) : date.getDate()}
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex justify-center gap-4 mt-2 text-[10px] text-gray-500">
                    <span>🟢 Thriving</span><span>🟡 Managing</span><span>🟠 Struggling</span><span>🔴 Crisis</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <div className="h-16 w-16 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🧠</span>
                </div>
                <p className="text-gray-500 dark:text-gray-400 font-medium">No mood data yet</p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Start by checking in above</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "stats" && (
          <div className="space-y-3">
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Activity Overview</h3>
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
                  <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{profile?.stats?.posts || 0}</p>
                  <p className="text-xs text-gray-500 mt-1">Posts</p>
                </div>
                <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{profile?.stats?.comments || 0}</p>
                  <p className="text-xs text-gray-500 mt-1">Comments</p>
                </div>
                <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{profile?.stats?.reactions || 0}</p>
                  <p className="text-xs text-gray-500 mt-1">Reactions</p>
                </div>
              </div>
            </div>

            {moodData && moodData.totalEntries > 0 && (
              <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Mood Breakdown</h3>
                <div className="space-y-2">
                  {Object.entries(moodData.labelCounts).map(function(item: any) {
                    var total = moodData.totalEntries || 1;
                    var pct = Math.round((item[1] / total) * 100);
                    return (
                      <div key={item[0]} className="flex items-center gap-2">
                        <span className="text-xs capitalize w-20 text-gray-600 dark:text-gray-400">{item[0]}</span>
                        <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                          <div className={"h-full rounded-full " + (item[0] === "thriving" ? "bg-emerald-400" : item[0] === "managing" ? "bg-amber-400" : item[0] === "struggling" ? "bg-orange-400" : "bg-red-400")} style={{ width: pct + "%" }}></div>
                        </div>
                        <span className="text-xs text-gray-500 w-8 text-right">{item[1]}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
      <BottomNav />
      {showEditModal && <EditProfileModal profile={profile} onClose={function() { setShowEditModal(false); }} onProfileUpdated={handleUpdated} />}
    </div>
  );
}