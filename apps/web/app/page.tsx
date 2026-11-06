import Link from "next/link";

export default function HomePage() {
    return (
        <main style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", gap: "1rem", background: "#0a0f0d", color: "#fff" }}>
            
            {/* 👇 Replaced the emoji with your logo */}
            <img 
                src="/wellconnect.png" 
                alt="WellConnect Logo" 
                style={{ width: 100, height: 100, objectFit: "contain", borderRadius: 20, marginBottom: "0.5rem" }} 
            />
            
            <h1 style={{ fontSize: "2rem", fontWeight: 700, margin: 0 }}>WellConnect</h1>
            <p style={{ color: "#6b7280", margin: 0 }}>Your digital wellbeing companion</p>
            
            <Link 
                href="/login" 
                style={{ 
                    marginTop: "1.5rem", 
                    padding: "0.75rem 2rem", 
                    background: "#059669", 
                    color: "#fff", 
                    borderRadius: "9999px", 
                    textDecoration: "none",
                    fontWeight: 600,
                    transition: "background 0.2s"
                }}
            >
                Get Started
            </Link>
        </main>
    );
}