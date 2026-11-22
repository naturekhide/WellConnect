import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminOverview() {
    // 1. Fetch stats, logs, and users for the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [totalUsers, totalCircles, totalPosts, totalMessages, recentLogs, recentUsers] = await Promise.all([
        prisma.user.count(),
        prisma.circle.count(),
        prisma.feedPost.count(),
        prisma.directMessage.count().then(async (dmCount: number) => {
            const circleMsgCount = await prisma.circleMessage.count();
            return dmCount + circleMsgCount;
        }),
        prisma.adminLog.findMany({ orderBy: { createdAt: "desc" }, take: 10 }),
        prisma.user.findMany({
            where: { createdAt: { gte: sevenDaysAgo } },
            select: { createdAt: true }
        })
    ]);

    const cards = [
        { title: "Total Users", value: totalUsers, icon: "👥", color: "bg-blue-500" },
        { title: "Total Circles", value: totalCircles, icon: "🟢", color: "bg-emerald-500" },
        { title: "Total Posts", value: totalPosts, icon: "📝", color: "bg-purple-500" },
        { title: "Messages Sent", value: totalMessages, icon: "💬", color: "bg-orange-500" },
    ];

    // 2. Process the signups for the chart
    const last7Days = Array.from({ length: 7 }).map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i)); // Get the last 7 days including today
        return d;
    });

    const chartData = last7Days.map(date => {
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
        const dayUsers = recentUsers.filter(u =>
            new Date(u.createdAt).toDateString() === date.toDateString()
        ).length;
        return { dayName, count: dayUsers };
    });

    const maxSignups = Math.max(...chartData.map(d => d.count), 1); // Avoid division by zero

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-800">Platform Overview</h1>
                <p className="text-gray-500 mt-1">A high-level view of WellConnect's activity.</p>
            </div>

            {/* Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {cards.map((card) => (
                    <div key={card.title} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 font-medium">{card.title}</p>
                            <p className="text-3xl font-bold text-slate-800 mt-2">{card.value.toLocaleString()}</p>
                        </div>
                        <div className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl ${card.color} bg-opacity-10`}>
                            {card.icon}
                        </div>
                    </div>
                ))}
            </div>

            {/* 🛑 7-Day Signup Chart */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
                <h2 className="text-lg font-bold text-slate-800 mb-6">New Signups (Last 7 Days)</h2>
                <div className="flex items-end justify-between h-40 gap-2">
                    {chartData.map((data, index) => (
                        <div key={index} className="flex flex-col items-center flex-1 h-full justify-end">

                            {/* The Bar - Only render if > 0 */}
                            <div className="w-full relative flex justify-center items-end flex-1 group">
                                {data.count > 0 && (
                                    <>
                                        {/* Tooltip */}
                                        <div className="absolute -top-8 bg-slate-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                            {data.count} users
                                        </div>
                                        {/* Bar */}
                                        <div
                                            className="w-full max-w-[3rem] bg-emerald-500 rounded-t-md hover:bg-emerald-400 transition-all duration-300"
                                            style={{ height: `${(data.count / maxSignups) * 100}%` }}
                                        />
                                    </>
                                )}
                            </div>

                            <span className="text-xs text-gray-500 mt-4 font-medium">{data.dayName}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Quick Actions */}
                <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h2 className="text-lg font-bold text-slate-800 mb-4">Quick Actions</h2>
                    <p className="text-gray-500 text-sm">
                        Welcome to the WellConnect Admin Dashboard. Use the sidebar to manage users, moderate content, and oversee circles.
                    </p>
                </div>

                {/* Recent Activity */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h2 className="text-lg font-bold text-slate-800 mb-4">Recent Admin Activity</h2>
                    {recentLogs.length === 0 ? (
                        <p className="text-gray-500 text-sm">No admin actions logged yet.</p>
                    ) : (
                        <div className="space-y-3">
                            {recentLogs.map((log) => (
                                <div key={log.id} className="flex justify-between items-center border-b border-gray-50 pb-2">
                                    <div>
                                        <span className={`font-medium text-sm px-2 py-1 rounded-md ${log.action.includes("BAN") ? "bg-red-100 text-red-700" :
                                                log.action.includes("DELETE") ? "bg-orange-100 text-orange-700" :
                                                    "bg-blue-100 text-blue-700"
                                            }`}>
                                            {log.action.replace("_", " ")}
                                        </span>
                                        {log.details && <span className="text-gray-500 text-sm ml-2">{log.details}</span>}
                                    </div>
                                    <span className="text-xs text-gray-400">
                                        {new Date(log.createdAt).toLocaleString()}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}