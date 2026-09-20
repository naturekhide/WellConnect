"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  var router = useRouter();
  var [identifier, setIdentifier] = useState("");
  var [password, setPassword] = useState("");
  var [error, setError] = useState("");
  var [loading, setLoading] = useState(false);

  var handleSubmit = async function(e: any) {
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
    <main style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: "1rem" }}>
      <div style={{ width: "100%", maxWidth: "380px" }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <span style={{ fontSize: "3rem" }}>🌱</span>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginTop: "0.5rem" }}>Welcome back</h1>
          <p style={{ color: "#6b7280", fontSize: "0.875rem" }}>Sign in to WellConnect</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {error && (
            <div style={{ background: "#fee2e2", color: "#dc2626", padding: "0.75rem", borderRadius: "0.75rem", fontSize: "0.875rem" }}>
              {error}
            </div>
          )}

          <input
            type="text"
            value={identifier}
            onChange={function(e: any) { setIdentifier(e.target.value); }}
            placeholder="Email or username"
            required
            style={{ padding: "0.875rem", borderRadius: "0.75rem", border: "1px solid #e5e7eb", fontSize: "0.875rem", background: "#fff" }}
          />

          <input
            type="password"
            value={password}
            onChange={function(e: any) { setPassword(e.target.value); }}
            placeholder="Password"
            required
            style={{ padding: "0.875rem", borderRadius: "0.75rem", border: "1px solid #e5e7eb", fontSize: "0.875rem", background: "#fff" }}
          />

          <button
            type="submit"
            disabled={loading}
            style={{ padding: "0.875rem", borderRadius: "0.75rem", background: "#059669", color: "#fff", border: "none", fontSize: "0.875rem", fontWeight: 600, cursor: "pointer", opacity: loading ? 0.5 : 1 }}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: "1.5rem", fontSize: "0.875rem", color: "#6b7280" }}>
          Don't have an account?{" "}
          <Link href="/register" style={{ color: "#059669", textDecoration: "none", fontWeight: 600 }}>
            Create one
          </Link>
        </p>
      </div>
    </main>
  );
}