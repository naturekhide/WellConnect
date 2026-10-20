"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useColors, S, R } from "@/lib/theme";

export default function LoginPage() {
    return (
        <Suspense fallback={<div style={{ minHeight: "100vh", background: "#0a0a0a" }} />}>
            <LoginContent />
        </Suspense>
    );
}

function LoginContent() {
    var C = useColors();
    var router = useRouter();
    var searchParams = useSearchParams();
    var justReset = searchParams.get("reset") === "success";

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

    var inputStyle = {
        padding: S.md + "px",
        borderRadius: R.md,
        border: "1px solid " + C.border,
        fontSize: 14,
        background: C.surface,
        color: C.textPrimary,
        fontFamily: "inherit",
        boxSizing: "border-box" as const,
        width: "100%",
    };

    return (
        <main style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: S.lg, background: C.background }}>
            <div style={{ width: "100%", maxWidth: 380 }}>
                <div style={{ textAlign: "center", marginBottom: S.xxl }}>
                    <span style={{ fontSize: 48 }}>🌱</span>
                    <h1 style={{ fontSize: 22, fontWeight: 700, color: C.textPrimary, margin: S.sm + "px 0 0 0" }}>Welcome back</h1>
                    <p style={{ color: C.textSecondary, fontSize: 13, margin: "2px 0 0 0" }}>Sign in to WellConnect</p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: S.md }}>
                    {justReset && (
                        <div style={{ background: C.primaryLight, color: C.primary, padding: S.md, borderRadius: R.md, fontSize: 14, textAlign: "center" }}>
                            ✅ Password updated. Please sign in.
                        </div>
                    )}

                    {error && (
                        <div style={{ background: C.dangerLight, color: C.danger, padding: S.md, borderRadius: R.md, fontSize: 14 }}>
                            {error}
                        </div>
                    )}

                    <input
                        type="text"
                        value={identifier}
                        onChange={function (e) { setIdentifier(e.target.value); }}
                        placeholder="Email or username"
                        required
                        style={inputStyle}
                    />

                    <div>
                        <input
                            type="password"
                            value={password}
                            onChange={function (e) { setPassword(e.target.value); }}
                            placeholder="Password"
                            required
                            style={inputStyle}
                        />
                        <div style={{ textAlign: "right", marginTop: S.xs }}>
                            <Link href="/forgot-password" style={{ fontSize: 12, color: C.textSecondary, textDecoration: "none" }}>
                                Forgot password?
                            </Link>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{ padding: S.md + "px", borderRadius: R.md, background: C.primary, color: "#fff", border: "none", fontSize: 14, fontWeight: 600, cursor: "pointer", opacity: loading ? 0.5 : 1 }}
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