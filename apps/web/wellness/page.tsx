"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import { BookOpen, Clock, User, ArrowLeft, Search, Filter } from "lucide-react";
import Link from "next/link";

var categories = [
  { id: "all", name: "All", emoji: "📚" },
  { id: "anxiety", name: "Anxiety Relief", emoji: "😰" },
  { id: "grief", name: "Grief Support", emoji: "💙" },
  { id: "stress", name: "Stress Management", emoji: "😮‍💨" },
  { id: "connection", name: "Connection", emoji: "🤝" },
  { id: "self-compassion", name: "Self-Compassion", emoji: "💚" },
  { id: "sleep", name: "Sleep & Rest", emoji: "😴" },
  { id: "mindfulness", name: "Mindfulness", emoji: "🧘" },
];

export default function WellnessLibraryPage() {
  var router = useRouter();
  var [articles, setArticles] = useState<any[]>([]);
  var [isLoading, setIsLoading] = useState(true);
  var [userName, setUserName] = useState("");
  var [activeCategory, setActiveCategory] = useState("all");
  var [selectedArticle, setSelectedArticle] = useState<any>(null);

  useEffect(function() { fetchUser(); }, []);
  useEffect(function() { fetchArticles(); }, [activeCategory]);

  var fetchUser = async function() {
    var r = await fetch("/api/auth/session");
    if (r.ok) { var s = await r.json(); setUserName(s?.user?.name || "Friend"); }
  };

  var fetchArticles = async function() {
    setIsLoading(true);
    var query = activeCategory !== "all" ? "?category=" + activeCategory : "";
    var r = await fetch("/api/wellness" + query);
    if (r.ok) setArticles(await r.json());
    else if (r.status === 401) router.push("/login");
    setIsLoading(false);
  };

  if (isLoading) return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <Header userName={userName} />
      <div className="flex justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-green-600 border-t-transparent"></div>
      </div>
    </div>
  );

  // Article Detail View
  if (selectedArticle) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
        <Header userName={userName} />
        <main className="mx-auto max-w-3xl px-4 py-8">
          <button
            onClick={function() { setSelectedArticle(null); }}
            className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 mb-6"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Library
          </button>

          <article className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 sm:p-8">
            <div className="flex items-center gap-2 mb-4">
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400">
                {categories.find(function(c: any) { return c.id === selectedArticle.category; })?.emoji}{" "}
                {categories.find(function(c: any) { return c.id === selectedArticle.category; })?.name}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">{selectedArticle.title}</h1>

            <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-6">
              <span className="flex items-center gap-1"><Clock className="h-4 w-4" />{selectedArticle.readTime} min read</span>
              <span className="flex items-center gap-1"><User className="h-4 w-4" />{selectedArticle.authorName} · {selectedArticle.authorType}</span>
            </div>

            <div className="prose prose-green dark:prose-invert max-w-none">
              {selectedArticle.content.split("\n").map(function(line: string, i: number) {
                if (line.startsWith("**") && line.endsWith("**")) {
                  return <h3 key={i} className="text-lg font-semibold text-gray-900 dark:text-gray-100 mt-6 mb-2">{line.replace(/\*\*/g, "")}</h3>;
                }
                if (line.startsWith("- ")) {
                  return <li key={i} className="text-gray-700 dark:text-gray-300 ml-4">{line.substring(2)}</li>;
                }
                if (line.match(/^\d\.\s/)) {
                  return <p key={i} className="text-gray-700 dark:text-gray-300 font-medium mt-4 mb-1">{line}</p>;
                }
                if (line.trim() === "") {
                  return <br key={i} />;
                }
                return <p key={i} className="text-gray-700 dark:text-gray-300 mb-2">{line}</p>;
              })}
            </div>
          </article>
        </main>
      </div>
    );
  }

  // Library Grid View
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <Header userName={userName} />
      <main className="mx-auto max-w-5xl px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center justify-center gap-3">
            <BookOpen className="h-8 w-8 text-green-600 dark:text-green-400" />
            Wellness Library
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Curated resources for your wellbeing journey</p>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2 mb-8 justify-center">
          {categories.map(function(cat: any) {
            return (
              <button
                key={cat.id}
                onClick={function() { setActiveCategory(cat.id); }}
                className={"px-4 py-2 rounded-full text-sm font-medium transition-all " +
                  (activeCategory === cat.id
                    ? "bg-green-600 text-white shadow-md"
                    : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700")}
              >
                {cat.emoji} {cat.name}
              </button>
            );
          })}
        </div>

        {articles.length === 0 ? (
          <div className="text-center py-16">
            <BookOpen className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No articles in this category yet.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {articles.map(function(article: any) {
              return (
                <button
                  key={article.id}
                  onClick={function() { setSelectedArticle(article); }}
                  className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-md hover:shadow-lg transition-all text-left border border-gray-100 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-700"
                >
                  <div className="flex items-start justify-between mb-3">
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400">
                      {categories.find(function(c: any) { return c.id === article.category; })?.emoji}{" "}
                      {categories.find(function(c: any) { return c.id === article.category; })?.name}
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 line-clamp-2">{article.title}</h3>
                  <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{article.readTime} min</span>
                    <span className="flex items-center gap-1"><User className="h-3 w-3" />{article.authorType}</span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}