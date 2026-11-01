"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useColors, S, R } from "@/lib/theme";

export default function RegisterPage() {
    var C = useColors();
    var router = useRouter();

    var [name, setName] = useState("");
    var [username, setUsername] = useState("");
    var [email, setEmail] = useState("");
    var [password, setPassword] = useState("");
    var [loading, setLoading] = useState(false);
    var [error, setError] = useState("");

    var handleSubmit = async function (e: any) {
        e.preventDefault();
        if (loading) return;
        setError("");
        setLoading(true);

        try {
            var r = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, username, email, password }),
            });

            if (r.ok) {
                // Redirect to login or directly to feed if auto-logged in
                router.push("/login?registered=true");
            } else {
                var data = await r.json();
                setError(data.error || "Registration failed");
            }
        } catch (err) {
            setError("Something went wrong. Please try again.");
        }
        setLoading(false);
    };

    return (
        <main style={{ background: C.background, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: S.lg }}>
            <div style={{ width: "100%", maxWidth: 400 }}>
                
                {/* Header */}
                <div style={{ textAlign: "center", marginBottom: S.xl }}>
                    <h1 style={{ fontSize: 24, fontWeight: 700, color: C.textPrimary, margin: "0 0 " + S.xs + "px 0" }}>
                        Create an account
                    </h1>
                    <p style={{ fontSize: 14, color: C.textSecondary, margin: 0 }}>
                        Join WellConnect today
                    </p>
                </div>

                {/* Error Message */}
                {error && (
                    <div style={{ background: C.danger + "15", color: C.danger, padding: S.md, borderRadius: R.md, marginBottom: S.md, fontSize: 13, textAlign: "center" }}>
                        {error}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: S.md }}>
                    <div>
                        <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: C.textSecondary, marginBottom: S.xs }}>Full Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={function (e) { setName(e.target.value); }}
                            required
                            style={{ width: "100%", padding: S.md, borderRadius: R.md, border: "1px solid " + C.border, fontSize: 14, background: C.surface, color: C.textPrimary, boxSizing: "border-box", outline: "none", fontFamily: "inherit" }}
                        />
                    </div>

                    <div>
                        <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: C.textSecondary, marginBottom: S.xs }}>Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={function (e) { setUsername(e.target.value); }}
                            required
                            style={{ width: "100%", padding: S.md, borderRadius: R.md, border: "1px solid " + C.border, fontSize: 14, background: C.surface, color: C.textPrimary, boxSizing: "border-box", outline: "none", fontFamily: "inherit" }}
                        />
                    </div>

                    <div>
                        <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: C.textSecondary, marginBottom: S.xs }}>Email address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={function (e) { setEmail(e.target.value); }}
                            required
                            style={{ width: "100%", padding: S.md, borderRadius: R.md, border: "1px solid " + C.border, fontSize: 14, background: C.surface, color: C.textPrimary, boxSizing: "border-box", outline: "none", fontFamily: "inherit" }}
                        />
                    </div>

                    <div>
                        <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: C.textSecondary, marginBottom: S.xs }}>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={function (e) { setPassword(e.target.value); }}
                            required
                            minLength={8}
                            style={{ width: "100%", padding: S.md, borderRadius: R.md, border: "1px solid " + C.border, fontSize: 14, background: C.surface, color: C.textPrimary, boxSizing: "border-box", outline: "none", fontFamily: "inherit" }}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{ padding: S.md, borderRadius: R.full, background: C.primary, color: "#fff", border: "none", fontSize: 15, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", marginTop: S.sm }}
                    >
                        {loading ? "Creating account..." : "Sign Up"}
                    </button>
                </form>

                {/* Footer */}
                <p style={{ textAlign: "center", fontSize: 14, color: C.textSecondary, marginTop: S.xl }}>
                    Already have an account?{" "}
                    <Link href="/login" style={{ color: C.primary, fontWeight: 600, textDecoration: "none" }}>
                        Log in
                    </Link>
                </p>
            </div>
        </main>
    );
}