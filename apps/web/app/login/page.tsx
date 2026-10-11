"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { C, S, R } from "@/lib/theme";

export default function LoginPage() {
    var router = useRouter();
    var [identifier, setIdentifier] = useState("");
    var [password, setPassword] = useState("");
    var [error, setError] = useState("");
    var [loading, setLoading] = useState(false);

    var handleSubmit = async function (e: any) {
        e.preventDefault();
        setError("");
        setLoading(true);

        var result = await signIn("credentials", {
            identifier,
            password,
            redirect: false,
        });

        setLoading(false);

        if (result?.error) {
            setError("Invalid email/username or password");
        } else {
            router.push("/dashboard");
            router.refresh();
        }
    };

    return (
        <main style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: S.lg, background: C.background }}>
            <div style={{ width: "100%", maxWidth: 380 }}>
                <div style={{ textAlign: "center", marginBottom: S.xxl }}>
                    <span style={{ fontSize: 48 }}>🌱</span>
                    <h1 style={{ fontSize: 22, fontWeight: 700, marginTop: S.sm, color: C.textPrimary, margin: S.sm + "px 0 0 0" }}>Welcome back</h1>
                    <p style={{ color: C.textSecondary, fontSize: 13, marginTop: 2, margin: "2px 0 0 0" }}>Sign in to WellConnect</p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: S.md }}>
                    {error && (
                        <div style={{ background: C.dangerLight, color: C.danger, padding: S.md, borderRadius: R.md, fontSize: 14 }}>
                            {error}
                        </div>
                    )}

                    <input
                        type="text"
                        value={identifier}
                        onChange={function (e: any) { setIdentifier(e.target.value); }}
                        placeholder="Email or username"
                        required
                        style={{ padding: S.md + "px", borderRadius: R.md, border: "1px solid " + C.border, fontSize: 14, background: C.surface, color: C.textPrimary, fontFamily: "inherit", boxSizing: "border-box", width: "100%" }}
                    />

                    <input
                        type="password"
                        value={password}
                        onChange={function (e: any) { setPassword(e.target.value); }}
                        placeholder="Password"
                        required
                        style={{ padding: S.md + "px", borderRadius: R.md, border: "1px solid " + C.border, fontSize: 14, background: C.surface, color: C.textPrimary, fontFamily: "inherit", boxSizing: "border-box", width: "100%" }}
                    />

                    <button
                        type="submit"
                        disabled={loading}
                        style={{ padding: S.md + "px", borderRadius: R.md, background: C.primary, color: C.textInverse, border: "none", fontSize: 14, fontWeight: 600, cursor: "pointer", opacity: loading ? 0.5 : 1 }}
                    >
                        {loading ? "Signing in..." : "Sign In"}
                    </button>
                </form>

                <p style={{ textAlign: "center", marginTop: S.xl, fontSize: 14, color: C.textSecondary }}>
                    Don't have an account?{" "}
                    <Link href="/register" style={{ color: C.primary, textDecoration: "none", fontWeight: 600 }}>
                        Create one
                    </Link>
                </p>
            </div>
        </main>
    );
}