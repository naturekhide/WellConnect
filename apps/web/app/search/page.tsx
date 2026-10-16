"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useColors, S, R } from "@/lib/theme";

export default function SearchPage() {
    var C = useColors();
    var router = useRouter();
    var searchParams = useSearchParams();
    var [q, setQ] = useState(searchParams.get("q") || "");
    var [tab, setTab] = useState(searchParams.get("tab") || "all");
    var [results, setResults] = useState<any>({ users: [], posts: [], circles: [], journals: [] });
    var [loading, setLoading] = useState(false);
    var debounceRef = useRef<any>(null);

    useEffect(function () {
        if (debounceRef.current) clearTimeout(debounceRef.current);

        if (q.trim().length < 2) {
            setResults({ users: [], posts: [], circles: [], journals: [] });
            setLoading(false);
            return;
        }

        setLoading(true);
        debounceRef.current = setTimeout(function () { runSearch(); }, 300);

        return function () {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, [q]);

    var handleQChange = function (value: string) {
        setQ(value);
        updateUrl(value, tab);
    };

    var handleTabChange = function (newTab: string) {
        setTab(newTab);
        updateUrl(q, newTab);
    };

    var updateUrl = function (query: string, activeTab: string) {
        var params: string[] = [];
        if (query) params.push("q=" + encodeURIComponent(query));
        if (activeTab && activeTab !== "all") params.push("tab=" + activeTab);
        var url = "/search" + (params.length ? "?" + params.join("&") : "");
        window.history.replaceState(null, "", url);
    };

    var runSearch = async function () {
        try {
            var r = await fetch("/api/search?q=" + encodeURIComponent(q));
            if (r.ok) {
                var data = await r.json();
                setResults(data);
            }
        } catch (e) { }
        setLoading(false);
    };

    var timeAgo = function (d: string) {
        var diff = Date.now() - new Date(d).getTime();
        var mins = Math.floor(diff / 60000);
        var hrs = Math.floor(diff / 3600000);
        var days = Math.floor(diff / 86400000);
        if (mins < 1) return "now";
        if (mins < 60) return mins + "m";
        if (hrs < 24) return hrs + "h";
        return days + "d";
    };

    var tabs = [
        { id: "all", label: "All" },
        { id: "users", label: "Users" },
        { id: "posts", label: "Posts" },
        { id: "circles", label: "Circles" },
        { id: "journals", label: "Journals" },
    ];

    var showUsers = (tab === "all" || tab === "users") && results.users.length > 0;
    var showPosts = (tab === "all" || tab === "posts") && results.posts.length > 0;
    var showCircles = (tab === "all" || tab === "circles") && results.circles.length > 0;
    var showJournals = (tab === "all" || tab === "journals") && results.journals.length > 0;

    var hasAny = showUsers || showPosts || showCircles || showJournals;
    var nothingFound = q.trim().length >= 2 && !loading && !hasAny;

    return (
        <main style={{ background: C.background, minHeight: "100vh" }}>
            <div style={{ maxWidth: 600, margin: "0 auto", paddingBottom: 100 }}>

                <div style={{ padding: S.lg, paddingTop: 60, paddingBottom: S.md, borderBottom: "1px solid " + C.border }}>
                    <div style={{ display: "flex", alignItems: "center", gap: S.md }}>
                        <button onClick={function () { router.back(); }} style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                            <span style={{ fontSize: 22, color: C.textPrimary }}>←</span>
                        </button>
                        <input
                            type="text"
                            value={q}
                            onChange={function (e) { handleQChange(e.target.value); }}
                            placeholder="Search users, posts, circles..."
                            autoFocus
                            style={{
                                flex: 1,
                                padding: S.md,
                                borderRadius: R.full,
                                border: "1px solid " + C.border,
                                background: C.surface,
                                color: C.textPrimary,
                                fontSize: 15,
                                outline: "none",
                                boxSizing: "border-box",
                                fontFamily: "inherit",
                            }}
                        />
                    </div>
                </div>

                <div style={{ display: "flex", padding: "0 " + S.lg + "px", borderBottom: "1px solid " + C.border }}>
                    {tabs.map(function (t) {
                        var active = tab === t.id;
                        return (
                            <button
                                key={t.id}
                                onClick={function () { handleTabChange(t.id); }}
                                style={{
                                    padding: S.md + "px 0",
                                    marginRight: S.lg,
                                    background: "none",
                                    border: "none",
                                    borderBottom: active ? "2px solid " + C.primary : "2px solid transparent",
                                    fontSize: 14,
                                    fontWeight: active ? 700 : 500,
                                    color: active ? C.textPrimary : C.textSecondary,
                                    cursor: "pointer",
                                    position: "relative",
                                    bottom: -1,
                                    whiteSpace: "nowrap",
                                }}
                            >
                                {t.label}
                            </button>
                        );
                    })}
                </div>

                {q.trim().length < 2 ? (
                    <div style={{ textAlign: "center", padding: S.xxl, color: C.textTertiary }}>
                        <div style={{ fontSize: 40, marginBottom: S.md }}>🔍</div>
                        <p style={{ fontSize: 14, margin: 0 }}>Type at least 2 characters to search.</p>
                    </div>
                ) : loading ? (
                    <div style={{ padding: S.xxl, textAlign: "center", color: C.textSecondary }}>Searching...</div>
                ) : nothingFound ? (
                    <div style={{ textAlign: "center", padding: S.xxl }}>
                        <div style={{ fontSize: 40, marginBottom: S.md }}>🌿</div>
                        <p style={{ fontSize: 14, color: C.textSecondary, margin: 0 }}>No results for "{q}"</p>
                    </div>
                ) : (
                    <>
                        {showUsers && (
                            <Section title="Users" C={C}>
                                {results.users.map(function (u: any) {
                                    return (
                                        <Row
                                            key={u.id}
                                            C={C}
                                            onClick={function () { router.push("/users/" + u.id); }}
                                            icon={"👤"}
                                            title={u.name}
                                            subtitle={"@" + (u.username || "user")}
                                        />
                                    );
                                })}
                            </Section>
                        )}

                        {showCircles && (
                            <Section title="Circles" C={C}>
                                {results.circles.map(function (c: any) {
                                    return (
                                        <Row
                                            key={c.id}
                                            C={C}
                                            onClick={function () { router.push("/circles/" + c.id); }}
                                            icon={c.emoji || "🌿"}
                                            title={c.name}
                                            subtitle={c.memberCount + " members · " + c.postCount + " posts"}
                                        />
                                    );
                                })}
                            </Section>
                        )}

                        {showPosts && (
                            <Section title="Posts" C={C}>
                                {results.posts.map(function (p: any) {
                                    return (
                                        <Row
                                            key={p.id}
                                            C={C}
                                            onClick={function () { router.push("/connect/" + p.id); }}
                                            icon={"📝"}
                                            title={p.content?.slice(0, 80) || "(no content)"}
                                            subtitle={(p.author?.name || "User") + " · " + timeAgo(p.createdAt)}
                                        />
                                    );
                                })}
                            </Section>
                        )}

                        {showJournals && (
                            <Section title="Your Journals" C={C}>
                                {results.journals.map(function (j: any) {
                                    return (
                                        <Row
                                            key={j.id}
                                            C={C}
                                            onClick={function () { router.push("/journal"); }}
                                            icon={"💭"}
                                            title={j.content?.slice(0, 80) || "(no content)"}
                                            subtitle={timeAgo(j.createdAt)}
                                        />
                                    );
                                })}
                            </Section>
                        )}
                    </>
                )}

            </div>
        </main>
    );
}

function Section({ title, children, C }: any) {
    return (
        <div>
            <div style={{ padding: S.lg, paddingBottom: S.sm }}>
                <h2 style={{ fontSize: 13, fontWeight: 600, color: C.textSecondary, margin: 0 }}>{title}</h2>
            </div>
            <div>{children}</div>
        </div>
    );
}

function Row({ icon, title, subtitle, onClick, C }: any) {
    return (
        <div
            onClick={onClick}
            style={{
                display: "flex",
                alignItems: "center",
                gap: S.md,
                padding: S.lg,
                borderBottom: "1px solid " + C.border,
                cursor: "pointer",
            }}
        >
            <span style={{ fontSize: 22, flexShrink: 0 }}>{icon}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 14, fontWeight: 600, color: C.textPrimary, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {title}
                </p>
                <p style={{ fontSize: 12, color: C.textSecondary, marginTop: 2, margin: "2px 0 0 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {subtitle}
                </p>
            </div>
            <span style={{ fontSize: 16, color: C.textTertiary }}>›</span>
        </div>
    );
}