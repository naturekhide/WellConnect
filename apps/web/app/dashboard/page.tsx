import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 px-4">
      <div className="w-full max-w-2xl rounded-2xl bg-white p-8 text-center shadow-xl">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome, {session.user.name || "Friend"}!
        </h1>
        <p className="mt-4 text-lg text-gray-600">
          Your wellness journey starts here.
        </p>
        <div className="mt-6 rounded-lg bg-green-50 p-4">
          <p className="text-sm text-gray-700">
            <span className="font-medium">Email:</span> {session.user.email}
          </p>
        </div>
        <p className="mt-8 text-sm text-gray-500">
          Dashboard is under construction. More features coming soon!
        </p>
      </div>
    </div>
  );
}