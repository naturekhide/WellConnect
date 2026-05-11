"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Link from "next/link";
import { Search as SearchIcon, X, MessageCircle } from "lucide-react";

export default function SearchPage() {
  var router = useRouter();
  var [query, setQuery] = useState("");
  var [users, setUsers] = useState<any[]>([]);
  var [groups, setGroups] = useState<any[]>([]);
  var [isLoading, setIsLoading] = useState(false);
  var [userName, setUserName] = useState("");
  var [activeTab, setActiveTab] = useState("all");
  var [hasSearched, setHasSearched] = useState(false);

  useEffect(function() { fetchUser(); }, []);

  var fetchUser = async function() { var r = await fetch("/api/auth/session"); if (r.ok) { var s = await r.json(); setUserName(s?.user?.name || "Friend"); } };
  var performSearch = async function(q: string) { if (q.trim().length < 2) return; setIsLoading(true); setHasSearched(true); var r = await fetch("/api/search?q=" + encodeURIComponent(q) + "&type=" + activeTab); if (r.ok) { var d = await r.json(); setUsers(d.users || []); setGroups(d.groups || []); } setIsLoading(false); };
  var handleSubmit = function(e: any) { e.preventDefault(); if (query.trim().length >= 2) performSearch(query); };
  var handleKeyDown = function(e: any) { if (e.key === "Enter") { e.preventDefault(); if (query.trim().length >= 2) performSearch(query); } };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900"><Header userName={userName} /><main className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6"><h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Search</h1><form onSubmit={handleSubmit} className="relative"><SearchIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 dark:text-gray-500" /><input type="text" value={query} onChange={function(e: any) { setQuery(e.target.value); }} onKeyDown={handleKeyDown} placeholder="Search users or groups..." className="w-full rounded-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 py-3 pl-10 pr-10 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:border-green-500 focus:outline-none" />{query && <button type="button" onClick={function() { setQuery(""); setUsers([]); setGroups([]); setHasSearched(false); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>}</form></div>
      <div className="mb-6 flex gap-6 border-b border-gray-200 dark:border-gray-700">{["all","users","groups"].map(function(t: string) { return <button key={t} onClick={function() { setActiveTab(t); if (query.trim().length >= 2) performSearch(query); }} className={"relative pb-2 text-sm font-medium capitalize " + (activeTab === t ? "text-green-600 dark:text-green-400" : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300")}>{t}{activeTab === t && <div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-green-600"></div>}</button>; })}</div>
      {isLoading ? <div className="flex justify-center py-12"><div className="h-8 w-8 animate-spin rounded-full border-4 border-green-600 border-t-transparent"></div></div> : hasSearched && users.length === 0 && groups.length === 0 ? <div className="rounded-2xl bg-white dark:bg-gray-800 p-12 text-center shadow-sm"><SearchIcon className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" /><p className="mt-4 text-gray-600 dark:text-gray-400 font-medium">No results found</p></div> : <div className="space-y-6">
        {activeTab !== "groups" && users.length > 0 && <div><h2 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Users</h2><div className="space-y-2">{users.map(function(u: any) { return <div key={u.id} className="flex items-center justify-between rounded-xl bg-white dark:bg-gray-800 p-4 shadow-sm"><Link href={"/profile/" + u.id} className="flex items-center gap-4 flex-1"><div className="h-12 w-12 rounded-full bg-gradient-to-br from-green-400 to-blue-400 flex items-center justify-center text-white font-bold">{u.name?.charAt(0) || "U"}</div><div><p className="font-medium text-gray-900 dark:text-gray-100">{u.name}{u.username && <span className="text-gray-500 dark:text-gray-400 ml-1">@{u.username}</span>}</p><div className="flex gap-3 text-xs text-gray-500 dark:text-gray-400"><span>{u._count?.posts || 0} posts</span><span>{u._count?.groupMembers || 0} groups</span></div></div></Link><button onClick={function() { router.push("/messages/" + u.id); }} className="ml-3 flex items-center gap-1 rounded-full bg-green-600 px-3 py-1.5 text-xs text-white"><MessageCircle className="h-3 w-3" /> Message</button></div>; })}</div></div>}
        {activeTab !== "users" && groups.length > 0 && <div><h2 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Groups</h2><div className="space-y-2">{groups.map(function(g: any) { return <Link key={g.id} href={"/groups/" + g.id} className="block rounded-xl bg-white dark:bg-gray-800 p-4 shadow-sm hover:shadow-md"><div className="flex items-center gap-4"><div className="h-12 w-12 rounded-lg bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold">{g.name.charAt(0)}</div><div><p className="font-medium text-gray-900 dark:text-gray-100">{g.name}</p><div className="flex gap-3 text-xs text-gray-500 dark:text-gray-400"><span>👥 {g._count?.members || 0}</span><span>📝 {g._count?.posts || 0}</span></div></div></div></Link>; })}</div></div>}
      </div>}
    </main></div>
  );
}