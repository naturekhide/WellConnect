"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import BottomNav from "@/components/BottomNav";
import { BookOpen, Clock, User, ArrowLeft, Sparkles } from "lucide-react";

var categories = [
  { id: "all", name: "All", emoji: "📚", color: "from-emerald-400 to-teal-400" },
  { id: "anxiety", name: "Anxiety Relief", emoji: "😰", color: "from-blue-400 to-indigo-400" },
  { id: "grief", name: "Grief Support", emoji: "💙", color: "from-purple-400 to-pink-400" },
  { id: "stress", name: "Stress", emoji: "😮‍💨", color: "from-amber-400 to-orange-400" },
  { id: "connection", name: "Connection", emoji: "🤝", color: "from-green-400 to-emerald-400" },
  { id: "self-compassion", name: "Self-Compassion", emoji: "💚", color: "from-rose-400 to-pink-400" },
  { id: "sleep", name: "Sleep & Rest", emoji: "😴", color: "from-indigo-400 to-purple-400" },
  { id: "mindfulness", name: "Mindfulness", emoji: "🧘", color: "from-teal-400 to-cyan-400" },
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
    <div className="min-h-screen bg-[#f8faf9] dark:bg-gray-950 flex items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent"></div>
    </div>
  );

  if (selectedArticle) {
    var cat = categories.find(function(c: any) { return c.id === selectedArticle.category; });
    return (
      <div className="min-h-screen bg-[#f8faf9] dark:bg-gray-950 pb-20">
        <div className="mx-auto max-w-2xl px-4 py-6">
          <button onClick={function() { setSelectedArticle(null); }} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 mb-6 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to Library
          </button>
          <article className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
            <div className={"h-2 bg-gradient-to-r " + (cat?.color || "from-emerald-400 to-teal-400")}></div>
            <div className="p-6 sm:p-8">
              <div className="flex items-center gap-2 mb-4">
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                  {cat?.emoji} {cat?.name}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">{selectedArticle.title}</h1>
              <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-8">
                <span className="flex items-center gap-1"><Clock className="h-4 w-4" />{selectedArticle.readTime} min read</span>
                <span className="flex items-center gap-1"><User className="h-4 w-4" />{selectedArticle.authorName} · {selectedArticle.authorType}</span>
              </div>
              <div className="prose prose-gray dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 leading-relaxed space-y-4">
                {selectedArticle.content.split("\n").map(function(line: string, i: number) {
                  if (line.startsWith("**") && line.endsWith("**")) {
                    return <h3 key={i} className="text-lg font-semibold text-gray-900 dark:text-gray-100 mt-6 mb-2">{line.replace(/\*\*/g, "")}</h3>;
                  }
                  if (line.startsWith("- ")) {
                    return <li key={i} className="ml-4 text-gray-600 dark:text-gray-400">{line.substring(2)}</li>;
                  }
                  if (line.match(/^\d\.\s/)) {
                    return <p key={i} className="font-medium text-gray-800 dark:text-gray-200 mt-4 mb-1">{line}</p>;
                  }
                  if (line.trim() === "") {
                    return <br key={i} />;
                  }
                  return <p key={i} className="text-gray-600 dark:text-gray-400">{line}</p>;
                })}
              </div>
            </div>
          </article>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8faf9] dark:bg-gray-950 pb-20">
      <main className="mx-auto max-w-2xl px-4 py-6">
        <div className="text-center mb-8">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 flex items-center justify-center mx-auto mb-4">
            <Sparkles className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">Wellness Library</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Curated resources for your wellbeing journey</p>
        </div>

        <div className="flex flex-wrap gap-2 mb-6 justify-center">
          {categories.map(function(cat: any) {
            return (
              <button
                key={cat.id}
                onClick={function() { setActiveCategory(cat.id); }}
                className={"px-4 py-2 rounded-full text-sm font-medium transition-all " +
                  (activeCategory === cat.id
                    ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-md"
                    : "bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-800")}
              >
                {cat.emoji} {cat.name}
              </button>
            );
          })}
        </div>

        {articles.length === 0 ? (
          <div className="text-center py-16">
            <div className="h-16 w-16 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
              <BookOpen className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-gray-500 dark:text-gray-400 font-medium">No articles in this category yet</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Check back soon for new content</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-3">
            {articles.map(function(article: any) {
              var cat = categories.find(function(c: any) { return c.id === article.category; });
              return (
                <button
                  key={article.id}
                  onClick={function() { setSelectedArticle(article); }}
                  className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-md hover:border-gray-200 dark:hover:border-gray-700 transition-all text-left"
                >
                  <div className={"h-1.5 bg-gradient-to-r " + (cat?.color || "from-emerald-400 to-teal-400")}></div>
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm">{cat?.emoji}</span>
                      <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">{cat?.name}</span>
                    </div>
                    <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100 mb-2 line-clamp-2">{article.title}</h3>
                    <div className="flex items-center gap-3 text-[11px] text-gray-400 dark:text-gray-500">
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{article.readTime} min</span>
                      <span>·</span>
                      <span>{article.authorType}</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </main>
      <BottomNav />
    </div>
  );
}