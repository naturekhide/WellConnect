"use client";

import { useEffect, useState } from "react";

type Circle = {
    id: string;
    name: string;
    emoji: string | null;
    isPrivate: boolean;
    createdAt: string;
    creator: { name: string; email: string };
    _count: { members: number; posts: number };
};

export default function CirclesPage() {
    const [circles, setCircles] = useState<Circle[]>([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const fetchCircles = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/circles");
            const data = await res.json();
            if (res.ok) setCircles(data.circles);
        } catch (error) {
            console.error("Failed to fetch circles");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCircles();
    }, []);

    const deleteCircle = async (id: string, name: string) => {
        const confirmMessage = `🚨 WARNING: Are you sure you want to delete "${name}"?\n\nThis will PERMANENTLY delete all posts, messages, and members inside this circle. This cannot be undone.`;

        if (!confirm(confirmMessage)) return;

        setDeletingId(id);
        try {
            const res = await fetch(`/api/circles/${id}`, { method: "DELETE" });
            if (res.ok) {
                setCircles(circles.filter(c => c.id !== id));
            }
        } catch (error) {
            console.error("Failed to delete circle");
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-800">Circle Oversight</h1>
                <p className="text-gray-500 mt-1">Manage all circles on the platform. Deleting a circle is permanent.</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-100 text-sm font-semibold text-gray-600">
                            <th className="p-4">Circle</th>
                            <th className="p-4">Creator</th>
                            <th className="p-4">Type</th>
                            <th className="p-4">Members</th>
                            <th className="p-4">Posts</th>
                            <th className="p-4">Created</th>
                            <th className="p-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={7} className="p-8 text-center text-gray-500">Loading circles...</td>
                            </tr>
                        ) : circles.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="p-8 text-center text-gray-500">No circles found on the platform.</td>
                            </tr>
                        ) : (
                            circles.map((circle) => (
                                <tr key={circle.id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                                    <td className="p-4 font-medium text-slate-800 flex items-center gap-2">
                                        <span className="text-xl">{circle.emoji || "🌿"}</span>
                                        {circle.name}
                                    </td>
                                    <td className="p-4 text-gray-600">
                                        {circle.creator.name}
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${circle.isPrivate ? "bg-orange-100 text-orange-700" : "bg-emerald-100 text-emerald-700"
                                            }`}>
                                            {circle.isPrivate ? "Private" : "Public"}
                                        </span>
                                    </td>
                                    <td className="p-4 text-gray-600">{circle._count.members}</td>
                                    <td className="p-4 text-gray-600">{circle._count.posts}</td>
                                    <td className="p-4 text-gray-500 text-sm">
                                        {new Date(circle.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="p-4 text-right">
                                        <button
                                            onClick={() => deleteCircle(circle.id, circle.name)}
                                            disabled={deletingId === circle.id}
                                            className="text-sm bg-red-50 text-red-600 hover:bg-red-100 px-3 py-1 rounded-lg font-medium transition disabled:opacity-50"
                                        >
                                            {deletingId === circle.id ? "Deleting..." : "Delete Circle"}
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