"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import BottomNav from "@/components/BottomNav";
import CreateGroupModal from "@/components/CreateGroupModal";
import { Users, Plus, Lock } from "lucide-react";

export default function GroupsPage() {
  var router = useRouter();
  var [groups, setGroups] = useState<any[]>([]);
  var [isLoading, setIsLoading] = useState(true);
  var [userName, setUserName] = useState("");
  var [currentUserId, setCurrentUserId] = useState("");
  var [showCreateModal, setShowCreateModal] = useState(false);
  var [selectedCategory, setSelectedCategory] = useState("all");
  var categories = ["all", "anxiety", "depression", "wellness", "mindfulness", "support", "general"];

  useEffect(function() { fetchGroups(); fetchUser(); }, []);

  var fetchUser = async function() { var r = await fetch("/api/auth/session"); if (r.ok) { var s = await r.json(); setUserName(s?.user?.name || "Friend"); setCurrentUserId(s?.user?.id || ""); } };
  var fetchGroups = async function() {
    var gr = await fetch("/api/groups");
    var mr = await fetch("/api/groups/my-memberships");
    if (gr.ok) {
      var gd = await gr.json();
      var mids: string[] = [];
      if (mr.ok) { var md = await mr.json(); mids = md.map(function(m: any) { return m.groupId; }); }
      setGroups(gd.map(function(g: any) { return { ...g, isMember: mids.includes(g.id) }; }));
    }
    setIsLoading(false);
  };

  var handleJoin = async function(id: string) {
    var r = await fetch("/api/groups/" + id + "/join", { method: "POST" });
    if (r.ok) setGroups(groups.map(function(g: any) { return g.id === id ? { ...g, isMember: true, memberCount: g.memberCount + 1 } : g; }));
  };

  var handleViewGroup = function(id: string) { router.push("/groups/" + id); };

  if (isLoading) return (
    <div className="min-h-screen bg-[#f8faf9] dark:bg-gray-950 flex items-center justify-center pb-20">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent"></div>
    </div>
  );

  var filtered = selectedCategory === "all" ? groups : groups.filter(function(g: any) { return g.category === selectedCategory; });

  return (
    <div className="min-h-screen bg-[#f8faf9] dark:bg-gray-950 pb-20">
      <div className="sticky top-0 z-20 bg-[#f8faf9]/90 dark:bg-gray-950/90 backdrop-blur-md border-b border-gray-100 dark:border-gray-800">
        <div className="mx-auto max-w-5xl px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Communities</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">Find your people</p>
          </div>
          <button onClick={function() { setShowCreateModal(true); }} className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 transition-all">
            <Plus className="h-4 w-4" /> Create
          </button>
        </div>
      </div>

      <main className="mx-auto max-w-5xl px-4 py-4">
        <div className="flex flex-wrap gap-1.5 mb-6">
          {categories.map(function(c: string) {
            return (
              <button
                key={c}
                onClick={function() { setSelectedCategory(c); }}
                className={"rounded-full px-4 py-2 text-sm font-medium transition-all " +
                  (selectedCategory === c
                    ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-md"
                    : "bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-800")}
              >
                {c.charAt(0).toUpperCase() + c.slice(1)}
              </button>
            );
          })}
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="h-16 w-16 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-4">
              <Users className="h-8 w-8 text-emerald-500" />
            </div>
            <p className="text-gray-500 dark:text-gray-400 font-medium">No groups yet</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Create one or check back later</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map(function(g: any) {
              return (
                <div key={g.id} className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-400 flex items-center justify-center text-white text-lg font-bold">
                      {g.name.charAt(0)}
                    </div>
                    {g.isPrivate && <Lock className="h-4 w-4 text-gray-400" />}
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">{g.name}</h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{g.description || "No description"}</p>
                  <div className="mt-4 flex items-center gap-4 text-xs text-gray-400 dark:text-gray-500">
                    <span>👥 {g.memberCount}</span>
                    <span>📝 {g.postCount}</span>
                  </div>
                  <div className="mt-4">
                    {g.isMember ? (
                      <button onClick={function() { handleViewGroup(g.id); }} className="w-full rounded-xl bg-emerald-600 px-3 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 transition-all">
                        View Group
                      </button>
                    ) : (
                      <button onClick={function() { handleJoin(g.id); }} className="w-full rounded-xl bg-emerald-600 px-3 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 transition-all">
                        Join Group
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {showCreateModal && <CreateGroupModal onClose={function() { setShowCreateModal(false); }} onGroupCreated={function(ng: any) { setGroups([{ ...ng, isMember: true }, ...groups]); setShowCreateModal(false); }} />}
      <BottomNav />
    </div>
  );
}