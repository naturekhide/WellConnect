"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useColors, S, R } from "@/lib/theme";

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={<div style={{ minHeight: "100vh", background: "#0a0a0a" }} />}>
            <ResetPasswordContent />
        </Suspense>
    );
}

function ResetPasswordContent() {
    var C = useColors();
    var router = useRouter();
    var searchParams = useSearchParams();

    var [email, setEmail] = useState(searchParams.get("email") || "");
    var [code, setCode] = useState("");
    var [password, setPassword] = useState("");
    var [loading, setLoading] = useState(false);
    var [error, setError] = useState("");

    var handleSubmit = async function (e: any) {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            var r = await fetch("/api/auth/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: email.trim(), code: code.trim(), newPassword: password }),
            });

            var data = await r.json();

            if (r.ok) {
                router.push("/login?reset=success");
            } else {
                setError(data.error || "Something went wrong");
            }
        } catch (err) {
            setError("Connection failed");
        }
        setLoading(false);
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
                    <span style={{ fontSize: 48 }}>🔐</span>
                    <h1 style={{ fontSize: 22, fontWeight: 700, color: C.textPrimary, margin: S.sm + "px 0 0 0" }}>Reset Password</h1>
                    <p style={{ color: C.textSecondary, fontSize: 13, margin: "2px 0 0 0" }}>Enter the code sent to your email.</p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: S.md }}>
                    {error && (
                        <div style={{ background: C.dangerLight, color: C.danger, padding: S.md, borderRadius: R.md, fontSize: 14 }}>
                            {error}
                        </div>
                    )}

                    <input
                        type="email"
                        value={email}
                        onChange={function (e) { setEmail(e.target.value); }}
                        placeholder="Email address"
                        required
                        style={inputStyle}
                    />

                    <input
                        type="text"
                        value={code}
                        onChange={function (e) { setCode(e.target.value); }}
                        placeholder="6-digit code"
                        maxLength={6}
                        required
                        style={{ ...inputStyle, textAlign: "center", letterSpacing: 4, fontSize: 18, fontWeight: 700 }}
                    />

                    <input
                        type="password"
                        value={password}
                        onChange={function (e) { setPassword(e.target.value); }}
                        placeholder="New Password (min 8 characters)"
                        minLength={8}
                        required
                        style={inputStyle}
                    />

                    <button
                        type="submit"
                        disabled={loading}
                        style={{ padding: S.md + "px", borderRadius: R.md, background: C.primary, color: "#fff", border: "none", fontSize: 14, fontWeight: 600, cursor: "pointer", opacity: loading ? 0.5 : 1 }}
                    >
                        {loading ? "Updating..." : "Update Password"}
                    </button>
                </form>

                <p style={{ textAlign: "center", marginTop: S.xl, fontSize: 14, color: C.textSecondary }}>
                    Didn't get a code?{" "}
                    <Link href="/forgot-password" style={{ color: C.primary, textDecoration: "none", fontWeight: 600 }}>
                        Try again
                    </Link>
                </p>
            </div>
        </main>
    );
}