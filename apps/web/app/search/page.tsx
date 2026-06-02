"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import BottomNav from "@/components/BottomNav";
import { ArrowLeft, Search, Users, MessageCircle } from "lucide-react";
import Link from "next/link";

export default function SearchPage() {
  var router = useRouter();
  var [query, setQuery] = useState("");
  var [results, setResults] = useState<any>({ users: [], groups: [] });
  var [isSearching, setIsSearching] = useState(false);
  var [hasSearched, setHasSearched] = useState(false);
  var searchTimeout = useRef<any>(null);

  var handleSearch = async function(q: string) {
    setQuery(q);
    if (q.trim().length < 2) {
      setResults({ users: [], groups: [] });
      setHasSearched(false);
      return;
    }

    if (searchTimeout.current) clearTimeout(searchTimeout.current);

    searchTimeout.current = setTimeout(async function() {
      setIsSearching(true);
      setHasSearched(true);
      try {
        var r = await fetch("/api/search?q=" + encodeURIComponent(q.trim()));
        if (r.ok) setResults(await r.json());
      } catch (e) {}
      setIsSearching(false);
    }, 300);
  };

  return (
    <div className="min-h-screen bg-[#f8faf9] dark:bg-gray-950 pb-20">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-100 dark:border-gray-800">
        <div className="mx-auto max-w-2xl px-4 py-3 flex items-center gap-3">
          <button onClick={function() { router.back(); }} className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={function(e: any) { handleSearch(e.target.value); }}
              placeholder="Search people and groups..."
              autoFocus
              className="w-full rounded-xl bg-gray-100 dark:bg-gray-800 border-0 pl-9 pr-4 py-2.5 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-2xl px-4 py-4">
        {!hasSearched && query.length < 2 && (
          <div className="text-center py-16">
            <div className="h-20 w-20 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
              <Search className="h-10 w-10 text-gray-400" />
            </div>
            <p className="text-gray-500 dark:text-gray-400 font-medium">Search WellConnect</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Find people and groups by name</p>
          </div>
        )}

        {isSearching && (
          <div className="text-center py-8">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent mx-auto"></div>
          </div>
        )}

        {hasSearched && !isSearching && results.users?.length === 0 && results.groups?.length === 0 && (
          <div className="text-center py-16">
            <div className="h-16 w-16 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
              <Search className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-gray-500 dark:text-gray-400 font-medium">No results for "{query}"</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Try a different search term</p>
          </div>
        )}

        {!isSearching && (
          <div className="space-y-6">
            {/* Users */}
            {results.users?.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2 flex items-center gap-2">
                  <Users className="h-4 w-4" /> People
                </h3>
                <div className="space-y-1">
                  {results.users.map(function(user: any) {
                    return (
                      <Link
                        key={user.id}
                        href={"/profile/" + user.id}
                        className="flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-white dark:hover:bg-gray-900 hover:shadow-sm transition-all border border-transparent hover:border-gray-100 dark:hover:border-gray-800"
                      >
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-400 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                          {user.name?.charAt(0) || "U"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">{user.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">@{user.username} · {user._count?.posts || 0} posts</p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Groups */}
            {results.groups?.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2 flex items-center gap-2">
                  <MessageCircle className="h-4 w-4" /> Groups
                </h3>
                <div className="space-y-1">
                  {results.groups.map(function(group: any) {
                    return (
                      <Link
                        key={group.id}
                        href={"/groups/" + group.id}
                        className="flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-white dark:hover:bg-gray-900 hover:shadow-sm transition-all border border-transparent hover:border-gray-100 dark:hover:border-gray-800"
                      >
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-400 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                          {group.name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">{group.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{group._count?.members || 0} members · {group._count?.posts || 0} posts</p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
      <BottomNav />
    </div>
  );
}