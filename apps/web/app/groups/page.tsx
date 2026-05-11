"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import CreateGroupModal from "@/components/CreateGroupModal";

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

  var handleViewGroup = function(id: string) {
    router.push("/groups/" + id);
  };

  if (isLoading) return <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800"><Header userName={userName} /><div className="flex justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-4 border-green-600 border-t-transparent"></div></div></div>;

  var filtered = selectedCategory === "all" ? groups : groups.filter(function(g: any) { return g.category === selectedCategory; });

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800"><Header userName={userName} /><main className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8 flex items-center justify-between"><div><h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Communities</h1><p className="mt-2 text-gray-600 dark:text-gray-400">Find your people</p></div><button onClick={function() { setShowCreateModal(true); }} className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white">+ Create Group</button></div>
      <div className="mb-6 flex flex-wrap gap-2">{categories.map(function(c: string) { return <button key={c} onClick={function() { setSelectedCategory(c); }} className={"rounded-full px-4 py-2 text-sm font-medium " + (selectedCategory === c ? "bg-green-600 text-white" : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300")}>{c.charAt(0).toUpperCase() + c.slice(1)}</button>; })}</div>
      {filtered.length === 0 ? <div className="rounded-2xl bg-white dark:bg-gray-800 p-12 text-center shadow-md"><p className="text-gray-600 dark:text-gray-400">No groups yet</p></div> : <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{filtered.map(function(g: any) { return <div key={g.id} className="rounded-2xl bg-white dark:bg-gray-800 p-6 shadow-md"><div className="mb-4 flex items-start justify-between"><div className="h-12 w-12 rounded-lg bg-gradient-to-br from-green-400 to-blue-400 flex items-center justify-center text-white text-xl font-bold">{g.name.charAt(0)}</div>{g.isPrivate && <span className="rounded-full bg-gray-100 dark:bg-gray-700 px-2 py-1 text-xs text-gray-600 dark:text-gray-400">🔒</span>}</div><h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{g.name}</h3><p className="mt-2 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{g.description || "No description"}</p><div className="mt-4 flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400"><span>👥 {g.memberCount}</span><span>📝 {g.postCount}</span></div><div className="mt-4">{g.isMember ? <button onClick={function() { handleViewGroup(g.id); }} className="w-full rounded-lg bg-green-600 px-3 py-2 text-sm text-white hover:bg-green-700">View Group</button> : <button onClick={function() { handleJoin(g.id); }} className="w-full rounded-lg bg-green-600 px-3 py-2 text-sm text-white hover:bg-green-700">Join Group</button>}</div></div>; })}</div>}
      {showCreateModal && <CreateGroupModal onClose={function() { setShowCreateModal(false); }} onGroupCreated={function(ng: any) { setGroups([{ ...ng, isMember: true }, ...groups]); setShowCreateModal(false); }} />}
    </main></div>
  );
}