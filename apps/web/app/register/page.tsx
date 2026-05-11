"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  var router = useRouter();
  var [name, setName] = useState("");
  var [username, setUsername] = useState("");
  var [email, setEmail] = useState("");
  var [password, setPassword] = useState("");
  var [confirmPassword, setConfirmPassword] = useState("");
  var [showPassword, setShowPassword] = useState(false);
  var [showConfirmPassword, setShowConfirmPassword] = useState(false);
  var [error, setError] = useState("");
  var [isLoading, setIsLoading] = useState(false);

  var handleSubmit = async function(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (!name.trim()) { setError("Full name is required"); setIsLoading(false); return; }
    if (!username.trim() || username.length < 3) { setError("Username must be at least 3 characters"); setIsLoading(false); return; }
    if (!email.includes("@")) { setError("Please enter a valid email address"); setIsLoading(false); return; }
    if (password.length < 8) { setError("Password must be at least 8 characters"); setIsLoading(false); return; }
    if (password !== confirmPassword) { setError("Passwords do not match"); setIsLoading(false); return; }

    try {
      var response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, username, email, password }),
      });
      var data = await response.json();
      if (!response.ok) setError(data.error || "Something went wrong");
      else router.push("/login?registered=true");
    } catch (e) { setError("Something went wrong. Please try again."); }
    finally { setIsLoading(false); }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 px-4 py-8">
      <div className="w-full max-w-md space-y-6 rounded-3xl bg-white dark:bg-gray-800 p-8 shadow-xl">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-green-500 to-blue-500">
            <span className="text-2xl font-bold text-white">🌱</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Join WellConnect</h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Start your wellness journey today</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && <div className="rounded-lg bg-red-50 dark:bg-red-900/30 p-3 text-sm text-red-600 dark:text-red-400">{error}</div>}

          <div>
            <label htmlFor="name" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Full name</label>
            <input id="name" name="name" type="text" autoComplete="name" required value={name} onChange={function(e: any) { setName(e.target.value); }}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2.5 px-3 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20"
              placeholder="Ibrahim Aswad Nindow" />
          </div>

          <div>
            <label htmlFor="username" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Username</label>
            <input id="username" name="username" type="text" autoComplete="username" required value={username} onChange={function(e: any) { setUsername(e.target.value.toLowerCase()); }}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2.5 px-3 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20"
              placeholder="ibrahim_nindow" />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Letters, numbers, underscores, and periods only</p>
          </div>

          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Email address</label>
            <input id="email" name="email" type="email" autoComplete="email" required value={email} onChange={function(e: any) { setEmail(e.target.value); }}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2.5 px-3 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20"
              placeholder="you@example.com" />
          </div>

          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
            <div className="relative">
              <input id="password" name="password" type={showPassword ? "text" : "password"} autoComplete="new-password" required value={password} onChange={function(e: any) { setPassword(e.target.value); }}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2.5 px-3 pr-10 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20"
                placeholder="••••••••" />
              <button type="button" onClick={function() { setShowPassword(!showPassword); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300">
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">At least 8 characters</p>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Confirm password</label>
            <div className="relative">
              <input id="confirmPassword" name="confirmPassword" type={showConfirmPassword ? "text" : "password"} autoComplete="new-password" required value={confirmPassword} onChange={function(e: any) { setConfirmPassword(e.target.value); }}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2.5 px-3 pr-10 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20"
                placeholder="••••••••" />
              <button type="button" onClick={function() { setShowConfirmPassword(!showConfirmPassword); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300">
                {showConfirmPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          <button type="submit" disabled={isLoading}
            className="w-full rounded-lg bg-gradient-to-r from-green-600 to-green-700 py-2.5 text-sm font-semibold text-white shadow-md hover:from-green-700 hover:to-green-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:cursor-not-allowed disabled:opacity-50 transition-all">
            {isLoading ? "Creating account..." : "Create account"}
          </button>

          <p className="text-center text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300">Sign in</Link>
          </p>
        </form>

        <p className="text-center text-xs text-gray-500 dark:text-gray-400">
          By joining, you agree to WellConnect&apos;s{" "}
          <a href="#" className="text-green-600 dark:text-green-400 hover:underline">Terms</a>{" "}and{" "}
          <a href="#" className="text-green-600 dark:text-green-400 hover:underline">Privacy Policy</a>.
        </p>
      </div>
    </div>
  );
}