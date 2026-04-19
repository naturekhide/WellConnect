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

import { auth } from "../../lib/auth";
import { redirect } from "next/navigation";
import Header from "@/components/Header";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <Header userName={session.user.name || undefined} />
      
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-white p-8 shadow-xl">
          <h2 className="text-2xl font-bold text-gray-900">
            Your Dashboard
          </h2>
          <p className="mt-4 text-gray-600">
            Welcome to WellConnect! Your personalized feed and wellness tools are coming soon.
          </p>
          <div className="mt-6 rounded-lg bg-green-50 p-4">
            <p className="text-sm text-gray-700">
              <span className="font-medium">Email:</span> {session.user.email}
            </p>
          </div>
          
          <div className="mt-6 flex gap-4">
            <Link
              href="/feed"
              className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 transition-colors"
            >
              Go to Feed
            </Link>
            <Link
              href="/groups"
              className="rounded-lg border border-green-600 px-4 py-2 text-sm font-medium text-green-600 hover:bg-green-50 transition-colors"
            >
              Browse Groups
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}