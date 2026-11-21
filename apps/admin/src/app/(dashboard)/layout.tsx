import Link from 'next/link'

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex h-screen bg-gray-50 text-slate-900">
            <aside className="w-64 bg-slate-900 text-white flex flex-col">
                <div className="p-6 text-xl font-bold border-b border-slate-800">
                    WellConnect Admin
                </div>
                <nav className="flex-1 p-4 space-y-2">
                    <Link href="/" className="block px-4 py-3 rounded-lg hover:bg-slate-800 transition-colors">
                        📊 Overview
                    </Link>
                    <Link href="/users" className="block px-4 py-3 rounded-lg hover:bg-slate-800 transition-colors">
                        👥 Users
                    </Link>
                    <Link href="/posts" className="block px-4 py-3 rounded-lg hover:bg-slate-800 transition-colors">
                        📝 Content Moderation
                    </Link>
                    <Link href="/circles" className="block px-4 py-3 rounded-lg hover:bg-slate-800 transition-colors">
                        🟢 Circles
                    </Link>
                </nav>
                <div className="p-4 border-t border-slate-800">
                    <a href="/api/logout" className="text-sm text-red-400 hover:text-red-300">
                        Logout
                    </a>
                </div>
            </aside>
            <main className="flex-1 overflow-y-auto p-8">
                {children}
            </main>
        </div>
    )
}