import Link from "next/link";

export default function HomePage() {
    return (
        <main style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", gap: "1rem" }}>
            <span style={{ fontSize: "3rem" }}>🌱</span>
            <h1 style={{ fontSize: "2rem", fontWeight: 700 }}>WellConnect</h1>
            <p style={{ color: "#6b7280" }}>Your digital wellbeing companion</p>
            <Link href="/login" style={{ marginTop: "1rem", padding: "0.75rem 2rem", background: "#059669", color: "#fff", borderRadius: "9999px", textDecoration: "none" }}>
                Get Started
            </Link>
        </main>
    );
}