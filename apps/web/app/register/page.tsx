"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";

export default function RegisterPage() {
  var router = useRouter();
  var [name, setName] = useState("");
  var [username, setUsername] = useState("");
  var [email, setEmail] = useState("");
  var [password, setPassword] = useState("");
  var [error, setError] = useState("");
  var [loading, setLoading] = useState(false);

  var handleSubmit = async function(e: any) {
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
        // Auto-login after registration
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

  return (
    <main style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: "1rem" }}>
      <div style={{ width: "100%", maxWidth: "380px" }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <span style={{ fontSize: "3rem" }}>🌱</span>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginTop: "0.5rem" }}>Join WellConnect</h1>
          <p style={{ color: "#6b7280", fontSize: "0.875rem" }}>Your digital wellbeing companion</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {error && (
            <div style={{ background: "#fee2e2", color: "#dc2626", padding: "0.75rem", borderRadius: "0.75rem", fontSize: "0.875rem" }}>
              {error}
            </div>
          )}

          <input
            type="text"
            value={name}
            onChange={function(e: any) { setName(e.target.value); }}
            placeholder="Full name"
            required
            style={{ padding: "0.875rem", borderRadius: "0.75rem", border: "1px solid #e5e7eb", fontSize: "0.875rem", background: "#fff" }}
          />

          <input
            type="text"
            value={username}
            onChange={function(e: any) { setUsername(e.target.value); }}
            placeholder="Username"
            required
            style={{ padding: "0.875rem", borderRadius: "0.75rem", border: "1px solid #e5e7eb", fontSize: "0.875rem", background: "#fff" }}
          />

          <input
            type="email"
            value={email}
            onChange={function(e: any) { setEmail(e.target.value); }}
            placeholder="Email"
            required
            style={{ padding: "0.875rem", borderRadius: "0.75rem", border: "1px solid #e5e7eb", fontSize: "0.875rem", background: "#fff" }}
          />

          <input
            type="password"
            value={password}
            onChange={function(e: any) { setPassword(e.target.value); }}
            placeholder="Password (min 8 characters)"
            required
            minLength={8}
            style={{ padding: "0.875rem", borderRadius: "0.75rem", border: "1px solid #e5e7eb", fontSize: "0.875rem", background: "#fff" }}
          />

          <button
            type="submit"
            disabled={loading}
            style={{ padding: "0.875rem", borderRadius: "0.75rem", background: "#059669", color: "#fff", border: "none", fontSize: "0.875rem", fontWeight: 600, cursor: "pointer", opacity: loading ? 0.5 : 1 }}
          >
            {loading ? "Creating..." : "Create Account"}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: "1.5rem", fontSize: "0.875rem", color: "#6b7280" }}>
          Already have an account?{" "}
          <Link href="/login" style={{ color: "#059669", textDecoration: "none", fontWeight: 600 }}>
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}