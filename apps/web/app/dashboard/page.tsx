import { auth } from "../../lib/auth";
import { redirect } from "next/navigation";
import Header from "@/components/Header";
import Link from "next/link";

export default async function DashboardPage() {
  var session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <Header userName={session.user.name || undefined} />
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-white dark:bg-gray-800 p-8 shadow-xl">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Your Dashboard</h2>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Welcome to WellConnect! Your personalized feed and wellness tools are coming soon.</p>
          <div className="mt-6 rounded-lg bg-green-50 dark:bg-gray-700 p-4">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              <span className="font-medium">Email:</span> {session.user.email}
            </p>
          </div>
          <div className="mt-6 flex gap-4">
            <Link href="/feed" className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 transition-colors">Go to Feed</Link>
            <Link href="/groups" className="rounded-lg border border-green-600 dark:border-green-400 px-4 py-2 text-sm font-medium text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-gray-700 transition-colors">Browse Groups</Link>
          </div>
        </div>
      </main>
    </div>
  );
}