import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic"; // Ensures data is fresh on every load

export default async function AdminOverview() {
    // Fetch data directly from the database (no API route needed!)
    const [totalUsers, totalCircles, totalPosts, totalMessages] = await Promise.all([
        prisma.user.count(),
        prisma.circle.count(),
        prisma.feedPost.count(),
        prisma.directMessage.count().then(async (dmCount: number) => {
            const circleMsgCount = await prisma.circleMessage.count();
            return dmCount + circleMsgCount;
        })
    ]);

    const cards = [
        { title: "Total Users", value: totalUsers, icon: "👥", color: "bg-blue-500" },
        { title: "Total Circles", value: totalCircles, icon: "🟢", color: "bg-emerald-500" },
        { title: "Total Posts", value: totalPosts, icon: "📝", color: "bg-purple-500" },
        { title: "Messages Sent", value: totalMessages, icon: "💬", color: "bg-orange-500" },
    ];

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-800">Platform Overview</h1>
                <p className="text-gray-500 mt-1">A high-level view of WellConnect's activity.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

            <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-bold text-slate-800 mb-4">Quick Actions</h2>
                <p className="text-gray-500 text-sm">
                    Welcome to the WellConnect Admin Dashboard. Use the sidebar to manage users, moderate content, and oversee circles.
                </p>
            </div>
        </div>
    );
}