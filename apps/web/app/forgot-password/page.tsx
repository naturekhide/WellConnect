"use client";

import { useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useColors, S, R } from "@/lib/theme";

export default function ForgotPasswordPage() {
    return (
        <Suspense fallback={<div style={{ minHeight: "100vh", background: "#0a0a0a" }} />}>
            <ForgotPasswordContent />
        </Suspense>
    );
}

function ForgotPasswordContent() {
    var C = useColors();
    var router = useRouter();
    
    var [email, setEmail] = useState("");
    var [loading, setLoading] = useState(false);
    var [error, setError] = useState("");
    var [success, setSuccess] = useState(false);

    var handleSubmit = async function (e: any) {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            var r = await fetch("/api/auth/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: email.trim() }),
            });
            
            var data = await r.json();
            
            if (r.ok) {
                setSuccess(true);
            } else {
                setError(data.error || "Something went wrong");
            }
        } catch (err) {
            setError("Connection failed");
        }
        setLoading(false);
    };

    if (success) {
        return (
            <main style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: S.lg, background: C.background }}>
                <div style={{ width: "100%", maxWidth: 380, textAlign: "center" }}>
                    <div style={{ fontSize: 48, marginBottom: S.md }}>📧</div>
                    <h1 style={{ fontSize: 22, fontWeight: 700, color: C.textPrimary, margin: 0 }}>Check your email</h1>
                    <p style={{ color: C.textSecondary, fontSize: 14, marginTop: S.sm, marginBottom: S.xl }}>
                        We sent a 6-digit code to <strong>{email}</strong>.
                    </p>
                    <Link href={"/reset-password?email=" + encodeURIComponent(email)} style={{ display: "block", width: "100%", padding: S.md, borderRadius: R.md, background: C.primary, color: "#fff", textDecoration: "none", fontWeight: 600 }}>
                        Enter Code
                    </Link>
                </div>
            </main>
        );
    }

    return (
        <main style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: S.lg, background: C.background }}>
            <div style={{ width: "100%", maxWidth: 380 }}>
                <div style={{ textAlign: "center", marginBottom: S.xxl }}>
                    <span style={{ fontSize: 48 }}>🔑</span>
                    <h1 style={{ fontSize: 22, fontWeight: 700, color: C.textPrimary, margin: S.sm + "px 0 0 0" }}>Forgot Password</h1>
                    <p style={{ color: C.textSecondary, fontSize: 13, margin: "2px 0 0 0" }}>We'll send you a code to reset it.</p>
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
                        style={{ padding: S.md + "px", borderRadius: R.md, border: "1px solid " + C.border, fontSize: 14, background: C.surface, color: C.textPrimary, fontFamily: "inherit", boxSizing: "border-box" }}
                    />

                    <button
                        type="submit"
                        disabled={loading}
                        style={{ padding: S.md + "px", borderRadius: R.md, background: C.primary, color: "#fff", border: "none", fontSize: 14, fontWeight: 600, cursor: "pointer", opacity: loading ? 0.5 : 1 }}
                    >
                        {loading ? "Sending..." : "Send Reset Code"}
                    </button>
                </form>

                <p style={{ textAlign: "center", marginTop: S.xl, fontSize: 14, color: C.textSecondary }}>
                    Remember it?{" "}
                    <Link href="/login" style={{ color: C.primary, textDecoration: "none", fontWeight: 600 }}>
                        Sign in
                    </Link>
                </p>
            </div>
        </main>
    );
}