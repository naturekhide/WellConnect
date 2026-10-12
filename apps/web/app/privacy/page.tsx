"use client";

import { useRouter } from "next/navigation";
import { useColors, S, R } from "@/lib/theme";

export default function PrivacyPage() {
    var C = useColors();
    var router = useRouter();

    var handleDeleteAccount = function () {
        alert("Account deletion will be enabled soon. Contact support@wellconnect.app to request deletion.");
    };

    var handleExportData = function () {
        alert("Data export will be available soon.");
    };

    var sections = [
        {
            title: "What stays private",
            items: [
                { icon: "🔒", label: "Mood check-ins", detail: "Only visible to you. Never shared." },
                { icon: "📝", label: "Journal entries", detail: "Private by default. We never read them without permission." },
                { icon: "🎯", label: "Personal goals", detail: "For your eyes only." },
                { icon: "🤖", label: "AI insights", detail: "Analyzed on your own data only. Not shared." },
            ],
        },
        {
            title: "What we collect",
            items: [
                { icon: "📧", label: "Email and password", detail: "Used to sign you in. Password is hashed." },
                { icon: "📊", label: "Mood, journal, and goal activity", detail: "To give you insights and streaks." },
                { icon: "🔔", label: "Notification preferences", detail: "So we know what to alert you about." },
            ],
        },
        {
            title: "What we never do",
            items: [
                { icon: "🚫", label: "Sell your data", detail: "Never. Your data is not a product." },
                { icon: "🚫", label: "Show ads", detail: "WellConnect is ad-free." },
                { icon: "🚫", label: "Share without consent", detail: "We won't share your data with third parties without your explicit permission." },
            ],
        },
    ];

    return (
        <main style={{ background: C.background, minHeight: "100vh" }}>
            <div style={{ maxWidth: 600, margin: "0 auto", paddingBottom: 100 }}>

                <div style={{ padding: S.lg, paddingTop: 60, paddingBottom: S.md, borderBottom: "1px solid " + C.border }}>
                    <button onClick={function () { router.back(); }} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, color: C.primary, fontSize: 15, fontWeight: 600, marginBottom: S.sm }}>
                        ← Back
                    </button>
                    <h1 style={{ fontSize: 24, fontWeight: 700, color: C.textPrimary, margin: 0 }}>🔒 Privacy Center</h1>
                    <p style={{ color: C.textSecondary, marginTop: 4, fontSize: 14, margin: "4px 0 0 0" }}>
                        Your data, your control.
                    </p>
                </div>

                <div style={{ padding: S.lg }}>

                    {sections.map(function (section: any) {
                        return (
                            <div key={section.title} style={{ marginBottom: S.lg }}>
                                <h2 style={{ fontSize: 13, fontWeight: 600, color: C.textSecondary, marginTop: S.sm, marginBottom: S.sm, margin: S.sm + "px 0" }}>
                                    {section.title}
                                </h2>
                                <div style={{ borderRadius: R.lg, background: C.surface, overflow: "hidden" }}>
                                    {section.items.map(function (item: any, i: number) {
                                        var isLast = i === section.items.length - 1;
                                        return (
                                            <div
                                                key={item.label}
                                                style={{
                                                    display: "flex",
                                                    alignItems: "flex-start",
                                                    gap: S.md,
                                                    padding: S.lg,
                                                    borderBottom: isLast ? "none" : "1px solid " + C.borderLight,
                                                }}
                                            >
                                                <span style={{ fontSize: 20 }}>{item.icon}</span>
                                                <div style={{ flex: 1 }}>
                                                    <p style={{ fontSize: 14, fontWeight: 600, color: C.textPrimary, margin: 0 }}>{item.label}</p>
                                                    <p style={{ fontSize: 12, marginTop: 3, lineHeight: 1.4, color: C.textSecondary, margin: "3px 0 0 0" }}>{item.detail}</p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}

                    <h2 style={{ fontSize: 13, fontWeight: 600, color: C.textSecondary, marginTop: S.sm, marginBottom: S.sm, margin: S.sm + "px 0" }}>
                        Your controls
                    </h2>

                    <button
                        onClick={handleExportData}
                        style={{
                            width: "100%",
                            display: "flex",
                            alignItems: "flex-start",
                            gap: S.md,
                            padding: S.lg,
                            marginBottom: S.md,
                            background: C.surface,
                            border: "1px solid " + C.border,
                            borderRadius: R.lg,
                            cursor: "pointer",
                            textAlign: "left",
                        }}
                    >
                        <span style={{ fontSize: 20 }}>📤</span>
                        <div style={{ flex: 1 }}>
                            <p style={{ fontSize: 14, fontWeight: 600, color: C.textPrimary, margin: 0 }}>Export my data</p>
                            <p style={{ fontSize: 12, marginTop: 3, lineHeight: 1.4, color: C.textSecondary, margin: "3px 0 0 0" }}>
                                Download a copy of everything you've created.
                            </p>
                        </div>
                        <span style={{ fontSize: 22, color: C.textTertiary, alignSelf: "center" }}>›</span>
                    </button>

                    <button
                        onClick={handleDeleteAccount}
                        style={{
                            width: "100%",
                            display: "flex",
                            alignItems: "flex-start",
                            gap: S.md,
                            padding: S.lg,
                            background: C.surface,
                            border: "1px solid " + C.danger,
                            borderRadius: R.lg,
                            cursor: "pointer",
                            textAlign: "left",
                        }}
                    >
                        <span style={{ fontSize: 20 }}>🗑️</span>
                        <div style={{ flex: 1 }}>
                            <p style={{ fontSize: 14, fontWeight: 600, color: C.danger, margin: 0 }}>Delete my account</p>
                            <p style={{ fontSize: 12, marginTop: 3, lineHeight: 1.4, color: C.textSecondary, margin: "3px 0 0 0" }}>
                                Permanently remove your account and all data.
                            </p>
                        </div>
                        <span style={{ fontSize: 22, color: C.textTertiary, alignSelf: "center" }}>›</span>
                    </button>

                    <p style={{ fontSize: 11, textAlign: "center", marginTop: S.lg, color: C.textTertiary }}>
                        Questions? Contact support@wellconnect.app
                    </p>

                </div>
            </div>
        </main>
    );
}