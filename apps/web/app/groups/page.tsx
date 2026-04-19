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
import CreateGroupModal from "@/components/CreateGroupModal";

interface Group {
  id: string;
  name: string;
  description: string | null;
  category: string;
  imageUrl: string | null;
  isPrivate: boolean;
  memberCount: number;
  postCount: number;
  createdAt: string;
}

export default function GroupsPage() {
  const router = useRouter();
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userName, setUserName] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");

  const categories = ["all", "anxiety", "depression", "wellness", "mindfulness", "support", "general"];

  useEffect(() => {
    fetchGroups();
    fetchUserName();
  }, []);

  const fetchUserName = async () => {
    try {
      const response = await fetch("/api/auth/session");
      const session = await response.json();
      setUserName(session?.user?.name || "Friend");
    } catch (error) {
      console.error("Error fetching user:", error);
    }
  };

  const fetchGroups = async () => {
    try {
      const response = await fetch("/api/groups");
      if (response.ok) {
        const data = await response.json();
        setGroups(data);
      } else if (response.status === 401) {
        router.push("/login");
      }
    } catch (error) {
      console.error("Error fetching groups:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGroupCreated = (newGroup: Group) => {
    setGroups([newGroup, ...groups]);
    setShowCreateModal(false);
  };

  const handleJoinGroup = async (groupId: string) => {
    try {
      const response = await fetch(`/api/groups/${groupId}/join`, {
        method: "POST",
      });
      if (response.ok) {
        fetchGroups();
      }
    } catch (error) {
      console.error("Error joining group:", error);
    }
  };

  const filteredGroups = selectedCategory === "all" 
    ? groups 
    : groups.filter(g => g.category === selectedCategory);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
        <Header userName={userName} />
        <main className="mx-auto max-w-7xl px-4 py-8">
          <div className="text-center py-12">
            <p className="text-gray-600">Loading groups...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <Header userName={userName} />
      
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header with Create Button */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Communities</h1>
            <p className="mt-2 text-gray-600">Find your people and join the conversation</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 transition-colors"
          >
            + Create Group
          </button>
        </div>

        {/* Category Filter */}
        <div className="mb-6 flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                selectedCategory === cat
                  ? "bg-green-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>

        {/* Groups Grid */}
        {filteredGroups.length === 0 ? (
          <div className="rounded-2xl bg-white p-12 text-center shadow-md">
            <p className="text-gray-600">No groups yet. Create the first one!</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredGroups.map((group) => (
              <div key={group.id} className="rounded-2xl bg-white p-6 shadow-md hover:shadow-lg transition-shadow">
                <div className="mb-4 flex items-start justify-between">
                  <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-green-400 to-blue-400 flex items-center justify-center text-white text-xl font-bold">
                    {group.name.charAt(0)}
                  </div>
                  {group.isPrivate && (
                    <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">
                      🔒 Private
                    </span>
                  )}
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900">{group.name}</h3>
                <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                  {group.description || "No description yet."}
                </p>
                
                <div className="mt-4 flex items-center gap-4 text-xs text-gray-500">
                  <span>👥 {group.memberCount} members</span>
                  <span>📝 {group.postCount} posts</span>
                </div>
                
                <div className="mt-4">
                  <button
                    onClick={() => handleJoinGroup(group.id)}
                    className="w-full rounded-lg bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-700 transition-colors"
                  >
                    Join Group
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Create Group Modal */}
      {showCreateModal && (
        <CreateGroupModal
          onClose={() => setShowCreateModal(false)}
          onGroupCreated={handleGroupCreated}
        />
      )}
    </div>
  );
}