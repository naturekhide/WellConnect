"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useColors, S, R } from "@/lib/theme";

var slides = [
    {
        emoji: "🌱",
        title: "Welcome to WellConnect",
        description: "Your safe space for personal growth, reflection, and meaningful connection.",
    },
    {
        emoji: "💬",
        title: "Connect with Circles",
        description: "Join communities built around what matters. Share moments, support each other, and grow together.",
    },
    {
        emoji: "🧠",
        title: "Track Your Wellbeing",
        description: "Check in with your mood, write journal entries, and set goals to understand yourself better.",
    },
];

export default function OnboardingPage() {
    var C = useColors();
    var router = useRouter();
    var [currentSlide, setCurrentSlide] = useState(0);

    var handleNext = function () {
        if (currentSlide < slides.length - 1) {
            setCurrentSlide(currentSlide + 1);
        } else {
            // Finish onboarding
            localStorage.setItem("hasSeenOnboarding", "true");
            router.push("/connect");
        }
    };

    var handleSkip = function () {
        localStorage.setItem("hasSeenOnboarding", "true");
        router.push("/connect");
    };

    var slide = slides[currentSlide];

    return (
        <main style={{ background: C.background, minHeight: "100vh", display: "flex", flexDirection: "column" }}>

            {/* Skip Button */}
            <div style={{ padding: S.lg, paddingTop: 60, display: "flex", justifyContent: "flex-end" }}>
                <button onClick={handleSkip} style={{ background: "none", border: "none", color: C.textSecondary, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
                    Skip
                </button>
            </div>

            {/* Content */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 40px", textAlign: "center" }}>
                <div style={{ fontSize: 80, marginBottom: S.xl }}>{slide.emoji}</div>
                <h1 style={{ fontSize: 28, fontWeight: 800, color: C.textPrimary, margin: "0 0 " + S.md + "px 0" }}>
                    {slide.title}
                </h1>
                <p style={{ fontSize: 16, lineHeight: 1.6, color: C.textSecondary, margin: 0 }}>
                    {slide.description}
                </p>
            </div>

            {/* Footer */}
            <div style={{ padding: 40, paddingBottom: 60 }}>
                {/* Dots */}
                <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: S.xl }}>
                    {slides.map(function (_, index) {
                        return (
                            <div
                                key={index}
                                style={{
                                    width: 10,
                                    height: 10,
                                    borderRadius: 5,
                                    background: index === currentSlide ? C.primary : C.border,
                                    transition: "background 0.3s"
                                }}
                            />
                        );
                    })}
                </div>

                {/* Next / Get Started Button */}
                <button
                    onClick={handleNext}
                    style={{
                        width: "100%",
                        padding: S.md + "px",
                        borderRadius: R.full,
                        background: C.primary,
                        color: "#fff",
                        border: "none",
                        fontSize: 16,
                        fontWeight: 700,
                        cursor: "pointer"
                    }}
                >
                    {currentSlide === slides.length - 1 ? "Get Started" : "Next"}
                </button>
            </div>
        </main>
    );
}