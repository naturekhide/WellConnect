"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";

export default function Register() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            // 1. Create the user in the database via the web API
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, username, email, password }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Registration failed");
            }

            // 2. Auto-login the user using NextAuth
            const loginRes = await signIn("credentials", {
                identifier: email,
                password: password,
                redirect: false,
            });

            if (loginRes?.error) {
                throw new Error(loginRes.error);
            }

            // 3. Redirect to verify page (or dashboard if already verified)
            router.push("/verify-email?email=" + encodeURIComponent(email));

        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-[#0f0f0f] p-4">
            <div className="w-full max-w-md space-y-8 rounded-2xl bg-[#1a1a1a] p-8 border border-[#2a2a2a]">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-white">Create an account</h2>
                    <p className="mt-2 text-sm text-gray-400">Join WellConnect today</p>
                </div>

                {error && (
                    <div className="rounded-lg bg-red-500/10 p-3 text-sm text-red-400 border border-red-500/20">
                        {error}
                    </div>
                )}

                <form className="mt-8 space-y-4" onSubmit={handleRegister}>
                    <input
                        type="text"
                        required
                        placeholder="Full Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full rounded-lg bg-[#0f0f0f] border border-[#2a2a2a] p-3 text-white placeholder-gray-500 focus:border-emerald-500 focus:outline-none"
                    />
                    <input
                        type="text"
                        required
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full rounded-lg bg-[#0f0f0f] border border-[#2a2a2a] p-3 text-white placeholder-gray-500 focus:border-emerald-500 focus:outline-none"
                    />
                    <input
                        type="email"
                        required
                        placeholder="Email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full rounded-lg bg-[#0f0f0f] border border-[#2a2a2a] p-3 text-white placeholder-gray-500 focus:border-emerald-500 focus:outline-none"
                    />
                    <input
                        type="password"
                        required
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full rounded-lg bg-[#0f0f0f] border border-[#2a2a2a] p-3 text-white placeholder-gray-500 focus:border-emerald-500 focus:outline-none"
                    />

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-lg bg-emerald-600 p-3 font-semibold text-white hover:bg-emerald-500 transition disabled:opacity-50"
                    >
                        {loading ? "Creating account..." : "Sign Up"}
                    </button>
                </form>

                <p className="text-center text-sm text-gray-400">
                    Already have an account?{" "}
                    <Link href="/login" className="text-emerald-500 hover:underline">
                        Log in
                    </Link>
                </p>
            </div>
        </div>
    );
}