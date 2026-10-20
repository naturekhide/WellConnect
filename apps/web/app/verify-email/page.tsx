"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useColors, S, R } from "@/lib/theme";

export default function VerifyEmailPage() {
    return (
        <Suspense fallback={<div style={{ minHeight: "100vh", background: "#0a0a0a" }} />}>
            <VerifyEmailContent />
        </Suspense>
    );
}

function VerifyEmailContent() {
    var C = useColors();
    var router = useRouter();
    var searchParams = useSearchParams();
    
    var [email, setEmail] = useState(searchParams.get("email") || "");
    var [password, setPassword] = useState(searchParams.get("password") || "");
    var [code, setCode] = useState("");
    var [loading, setLoading] = useState(false);
    var [error, setError] = useState("");

    var handleSubmit = async function (e: any) {
        e.preventDefault();
        if (!code || code.length < 6) return;
        
        setError("");
        setLoading(true);

        try {
            // 1. Verify the code
            var r = await fetch("/api/auth/verify-email", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: email.trim(), code: code.trim() }),
            });
            
            var data = await r.json();
            
            if (!r.ok) {
                throw new Error(data.error || "Verification failed");
            }

            // 2. Auto-login since they just verified
            var loginResult = await signIn("credentials", {
                identifier: email,
                password: password,
                redirect: false,
            });

            if (loginResult?.error) {
                // If auto-login fails, send to login page
                router.push("/login?verified=success");
            } else {
                // Success! Straight to dashboard
                router.push("/dashboard");
                router.refresh();
            }
        } catch (err: any) {
            setError(err.message);
        }
        setLoading(false);
    };

    return (
        <main style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: S.lg, background: C.background }}>
            <div style={{ width: "100%", maxWidth: 380 }}>
                <div style={{ textAlign: "center", marginBottom: S.xxl }}>
                    <span style={{ fontSize: 48 }}>✉️</span>
                    <h1 style={{ fontSize: 22, fontWeight: 700, color: C.textPrimary, margin: S.sm + "px 0 0 0" }}>Verify your email</h1>
                    <p style={{ color: C.textSecondary, fontSize: 13, margin: "2px 0 0 0" }}>
                        We sent a 6-digit code to <strong>{email}</strong>.
                    </p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: S.md }}>
                    {error && (
                        <div style={{ background: C.dangerLight, color: C.danger, padding: S.md, borderRadius: R.md, fontSize: 14 }}>
                            {error}
                        </div>
                    )}

                    <input
                        type="text"
                        value={code}
                        onChange={function (e) { setCode(e.target.value); }}
                        placeholder="000000"
                        maxLength={6}
                        required
                        style={{
                            padding: S.md + "px",
                            borderRadius: R.md,
                            border: "1px solid " + C.border,
                            fontSize: 24,
                            textAlign: "center",
                            letterSpacing: 8,
                            fontWeight: 700,
                            background: C.surface,
                            color: C.textPrimary,
                            boxSizing: "border-box",
                            width: "100%",
                            fontFamily: "monospace"
                        }}
                    />

                    <button
                        type="submit"
                        disabled={loading || code.length < 6}
                        style={{ 
                            padding: S.md + "px", 
                            borderRadius: R.md, 
                            background: code.length === 6 ? C.primary : C.border, 
                            color: code.length === 6 ? "#fff" : C.textTertiary, 
                            border: "none", 
                            fontSize: 14, 
                            fontWeight: 600, 
                            cursor: loading ? "not-allowed" : "pointer",
                            opacity: loading ? 0.7 : 1
                        }}
                    >
                        {loading ? "Verifying..." : "Verify Email"}
                    </button>
                </form>

                <p style={{ textAlign: "center", marginTop: S.xl, fontSize: 14, color: C.textSecondary }}>
                    Already verified?{" "}
                    <Link href="/login" style={{ color: C.primary, textDecoration: "none", fontWeight: 600 }}>
                        Sign in
                    </Link>
                </p>
            </div>
        </main>
    );
}