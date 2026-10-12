"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useColors, S, R } from "@/lib/theme";

export default function RegisterPage() {
    var C = useColors();
    var router = useRouter();
    var [name, setName] = useState("");
    var [username, setUsername] = useState("");
    var [email, setEmail] = useState("");
    var [password, setPassword] = useState("");
    var [error, setError] = useState("");
    var [loading, setLoading] = useState(false);

    var handleSubmit = async function (e: any) {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            var r = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, username, email, password }),
            });

            if (r.ok) {
                var loginResult = await signIn("credentials", {
                    identifier: email,
                    password: password,
                    redirect: false,
                });

                if (!loginResult?.error) {
                    router.push("/dashboard");
                    router.refresh();
                } else {
                    router.push("/login");
                }
            } else {
                var d = await r.json();
                setError(d.error || "Registration failed");
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
                    <span style={{ fontSize: 48 }}>🌱</span>
                    <h1 style={{ fontSize: 22, fontWeight: 700, color: C.textPrimary, margin: S.sm + "px 0 0 0" }}>Join WellConnect</h1>
                    <p style={{ color: C.textSecondary, fontSize: 13, margin: "2px 0 0 0" }}>Your digital wellbeing companion</p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: S.md }}>
                    {error && (
                        <div style={{ background: C.dangerLight, color: C.danger, padding: S.md, borderRadius: R.md, fontSize: 14 }}>
                            {error}
                        </div>
                    )}

                    <input type="text" value={name} onChange={function (e: any) { setName(e.target.value); }} placeholder="Full name" required style={inputStyle} />
                    <input type="text" value={username} onChange={function (e: any) { setUsername(e.target.value); }} placeholder="Username" required style={inputStyle} />
                    <input type="email" value={email} onChange={function (e: any) { setEmail(e.target.value); }} placeholder="Email" required style={inputStyle} />
                    <input type="password" value={password} onChange={function (e: any) { setPassword(e.target.value); }} placeholder="Password (min 8 characters)" required minLength={8} style={inputStyle} />

                    <button
                        type="submit"
                        disabled={loading}
                        style={{ padding: S.md + "px", borderRadius: R.md, background: C.primary, color: C.textInverse, border: "none", fontSize: 14, fontWeight: 600, cursor: "pointer", opacity: loading ? 0.5 : 1 }}
                    >
                        {loading ? "Creating..." : "Create Account"}
                    </button>
                </form>

                <p style={{ textAlign: "center", marginTop: S.xl, fontSize: 14, color: C.textSecondary }}>
                    Already have an account?{" "}
                    <Link href="/login" style={{ color: C.primary, textDecoration: "none", fontWeight: 600 }}>
                        Sign in
                    </Link>
                </p>
            </div>
        </main>
    );
}