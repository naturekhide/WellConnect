"use client";

import { useEffect, useState } from "react";

type User = {
    id: string;
    name: string;
    email: string;
    username: string | null;
    role: string;
    suspended: boolean;
    createdAt: string;
};

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    // Fetch users
    const fetchUsers = async (query: string = "") => {
        setLoading(true);
        try {
            const res = await fetch(`/api/users?q=${query}`);
            const data = await res.json();
            if (res.ok) setUsers(data.users);
        } catch (error) {
            console.error("Failed to fetch users");
        } finally {
            setLoading(false);
        }
    };

    // Initial fetch and debounced search
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchUsers(search);
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [search]);

    // Update user (role or suspension)
    const updateUser = async (id: string, data: { role?: string; suspended?: boolean }) => {
        setUpdatingId(id);
        try {
            const res = await fetch(`/api/users/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (res.ok) {
                // Update the local state so the UI reflects the change instantly
                setUsers(users.map(u => u.id === id ? { ...u, ...data } : u));
            }
        } catch (error) {
            console.error("Failed to update", error);
        } finally {
            setUpdatingId(null);
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">User Management</h1>
                    <p className="text-gray-500 mt-1">View, search, and manage all platform users.</p>
                </div>
            </div>

            {/* Search Bar */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6">
                <input
                    type="text"
                    placeholder="Search by name, email, or username..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                />
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-100 text-sm font-semibold text-gray-600">
                            <th className="p-4">Name</th>
                            <th className="p-4">Email</th>
                            <th className="p-4">Username</th>
                            <th className="p-4">Role</th>
                            <th className="p-4">Status</th>
                            <th className="p-4">Joined</th>
                            <th className="p-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={7} className="p-8 text-center text-gray-500">Loading users...</td>
                            </tr>
                        ) : users.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="p-8 text-center text-gray-500">No users found.</td>
                            </tr>
                        ) : (
                            users.map((user) => (
                                <tr key={user.id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                                    <td className="p-4 font-medium text-slate-800">{user.name}</td>
                                    <td className="p-4 text-gray-600">{user.email}</td>
                                    <td className="p-4 text-gray-500">@{user.username || "none"}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'
                                            }`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.suspended ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
                                            }`}>
                                            {user.suspended ? "Suspended" : "Active"}
                                        </span>
                                    </td>
                                    <td className="p-4 text-gray-500 text-sm">
                                        {new Date(user.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="p-4 text-right flex justify-end gap-2">
                                        {/* Role Dropdown */}
                                        <select
                                            value={user.role}
                                            onChange={(e) => updateUser(user.id, { role: e.target.value })}
                                            disabled={updatingId === user.id}
                                            className="text-sm border border-gray-300 rounded px-2 py-1 outline-none focus:border-emerald-500"
                                        >
                                            <option value="USER">User</option>
                                            <option value="ADMIN">Admin</option>
                                        </select>

                                        {/* Ban/Unban Button */}
                                        <button
                                            onClick={() => updateUser(user.id, { suspended: !user.suspended })}
                                            disabled={updatingId === user.id}
                                            className={`text-sm px-3 py-1 rounded font-medium transition ${user.suspended
                                                    ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                                                    : "bg-red-100 text-red-700 hover:bg-red-200"
                                                }`}
                                        >
                                            {updatingId === user.id ? "..." : user.suspended ? "Unban" : "Ban"}
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}