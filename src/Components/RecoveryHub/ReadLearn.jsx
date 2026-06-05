import { useState, useEffect } from "react";
import { X, Clock, BookOpen } from "lucide-react";
import articles from "../JSON/read_learn_content.json";

const CATEGORIES = ["All", "Grief", "Body", "Mental Health", "Nutrition", "Relationships", "Trying Again", "Pregnancy", "Postnatal"];

const CATEGORY_META = {
  grief:         { pill: { background: "#ede9fe", color: "#6d28d9" }, card: "#f5f3ff", dot: "#7c3aed" },
  body:          { pill: { background: "#fee2e2", color: "#b91c1c" }, card: "#fff1f1", dot: "#dc2626" },
  mental_health: { pill: { background: "#dbeafe", color: "#1d4ed8" }, card: "#eff6ff", dot: "#2563eb" },
  nutrition:     { pill: { background: "#dcfce7", color: "#15803d" }, card: "#f0fdf4", dot: "#16a34a" },
  relationships: { pill: { background: "#ffedd5", color: "#c2410c" }, card: "#fff7ed", dot: "#ea580c" },
  trying_again:  { pill: { background: "#fce7f3", color: "#9d174d" }, card: "#fdf2f8", dot: "#db2777" },
  pregnancy:     { pill: { background: "#cffafe", color: "#0e7490" }, card: "#ecfeff", dot: "#0891b2" },
  postnatal:     { pill: { background: "#f3e8ff", color: "#7e22ce" }, card: "#faf5ff", dot: "#9333ea" },
};

function catKey(label) {
  return label.toLowerCase().replace(/ /g, "_");
}

function getMeta(category) {
  return CATEGORY_META[catKey(category)] || {
    pill: { background: "#f3f4f6", color: "#374151" },
    card: "#f9fafb",
    dot: "#9ca3af",
  };
}

function CategoryPill({ category }) {
  const meta = getMeta(category);
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "3px 10px", borderRadius: 999, fontSize: 10,
      fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase",
      fontFamily: "'Manrope', sans-serif",
      background: meta.pill.background, color: meta.pill.color,
    }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: meta.dot, flexShrink: 0 }} />
      {category}
    </span>
  );
}

function HealiaIntro({ userId, articleId, recoveryPhase }) {
  const [intro, setIntro] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch_() {
      try {
        const res = await fetch("/api/healia/read-learn-intro", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, articleId, recoveryPhase }),
        });
        const data = await res.json();
        setIntro(data.message || data.intro || null);
      } catch { /* silent */ }
      finally { setLoading(false); }
    }
    fetch_();
  }, [userId, articleId, recoveryPhase]);

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
        <div style={{
          width: 30, height: 30, borderRadius: "50%", background: "#111",
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        }}>
          <span style={{ color: "#fff", fontSize: 9, fontWeight: 700, letterSpacing: "0.05em" }}>AI</span>
        </div>
        <div style={{
          display: "flex", gap: 4, alignItems: "center",
          padding: "10px 14px", background: "#fff", border: "1px solid #e8e6e1",
          borderRadius: "4px 18px 18px 18px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
        }}>
          {[0, 150, 300].map(d => (
            <span key={d} style={{
              width: 6, height: 6, borderRadius: "50%", background: "#d1d5db",
              animation: "bounce 1s infinite", animationDelay: d + "ms",
            }} />
          ))}
        </div>
        <style>{`@keyframes bounce { 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-6px)} }`}</style>
      </div>
    );
  }

  if (!intro) return null;

  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 20 }}>
      <div style={{
        width: 30, height: 30, borderRadius: "50%", background: "#111",
        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2,
      }}>
        <span style={{ color: "#fff", fontSize: 9, fontWeight: 700, letterSpacing: "0.05em" }}>AI</span>
      </div>
      <div style={{
        maxWidth: "80%", padding: "12px 16px", background: "#fff",
        border: "1px solid #e8e6e1", borderRadius: "4px 18px 18px 18px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.05)", fontSize: 13,
        lineHeight: 1.65, color: "#111", fontFamily: "'Manrope', sans-serif",
      }}>
        {intro}
      </div>
    </div>
  );
}

function ArticleModal({ article, onClose, userId, recoveryPhase }) {
  const meta = getMeta(article.category);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 50,
      display: "flex", flexDirection: "column", background: "#f4f3f0",
    }}>
      {/* Top bar */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "14px 20px", borderBottom: "1px solid #e8e6e1", background: "#f4f3f0",
        flexShrink: 0,
      }}>
        <CategoryPill category={article.category} />
        <button onClick={onClose} style={{
          width: 34, height: 34, borderRadius: "50%", background: "#fff",
          border: "1px solid #e5e7eb", display: "flex", alignItems: "center",
          justifyContent: "center", cursor: "pointer",
        }}>
          <X size={15} strokeWidth={2} color="#555" />
        </button>
      </div>

      {/* Scrollable body */}
      <div style={{ flex: 1, overflowY: "auto", padding: "24px 20px", display: "flex", flexDirection: "column", gap: 20 }}>

        <HealiaIntro userId={userId} articleId={article.id} recoveryPhase={recoveryPhase} />

        {/* Title block */}
        <div>
          <h2 style={{
            fontFamily: "'Fraunces', serif", fontSize: "clamp(24px,6vw,34px)",
            fontWeight: 600, color: "#111", lineHeight: 1.15,
            letterSpacing: "-0.02em", marginBottom: 8,
          }}>
            {article.title}
          </h2>
          <div style={{ display: "flex", alignItems: "center", gap: 5, color: "#aaa" }}>
            <Clock size={12} strokeWidth={1.5} />
            <span style={{ fontSize: 12, fontFamily: "'Manrope', sans-serif" }}>
              {article.reading_time} min read
            </span>
          </div>
        </div>

        {/* Body */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {(Array.isArray(article.body)
            ? article.body
            : (article.body || "").split(/\n\n+/).filter(Boolean)
          ).map((para, i) => (
            <p key={i} style={{
              fontSize: 14, color: "#374151", lineHeight: 1.75,
              fontFamily: "'Manrope', sans-serif", margin: 0,
            }}>
              {para}
            </p>
          ))}
        </div>

        {/* Key takeaway */}
        {article.key_takeaway && (
          <div style={{
            background: meta.card, borderRadius: 16,
            border: `1px solid ${meta.dot}22`,
            padding: "16px 18px",
          }}>
            <p style={{
              fontSize: 10, fontWeight: 700, letterSpacing: "0.14em",
              textTransform: "uppercase", color: meta.pill.color,
              fontFamily: "'Manrope', sans-serif", marginBottom: 6,
            }}>
              Key takeaway
            </p>
            <p style={{
              fontSize: 14, color: "#111", lineHeight: 1.65,
              fontFamily: "'Manrope', sans-serif", fontWeight: 500, margin: 0,
            }}>
              {article.key_takeaway}
            </p>
          </div>
        )}

        <div style={{ height: 120 }} />
      </div>
    </div>
  );
}

export default function ReadLearn({ recoveryPhase, userName, userId }) {
  const [activeCategory, setActiveCategory] = useState("All");
  const [openArticle, setOpenArticle] = useState(null);

  const filtered = articles.filter(a => {
    const catMatch = activeCategory === "All" || catKey(activeCategory) === catKey(a.category);
    const phaseMatch = !a.phases || a.phases.length === 0 || a.phases.includes(recoveryPhase);
    return catMatch && phaseMatch;
  });

  return (
    <>
      {openArticle && (
        <ArticleModal
          article={openArticle}
          onClose={() => setOpenArticle(null)}
          userId={userId}
          recoveryPhase={recoveryPhase}
        />
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>

        {/* Header */}
        <div>
          <p style={{
            fontFamily: "'Fraunces', serif",
            fontSize: "clamp(26px,5vw,38px)",
            fontWeight: 600, color: "#111",
            lineHeight: 1.1, letterSpacing: "-0.02em", marginBottom: 6,
          }}>
            Read &amp; Learn
          </p>
          <p style={{
            fontSize: 13, color: "#aaa", fontWeight: 300,
            fontFamily: "'Manrope', sans-serif",
          }}>
            Knowledge that helps you heal
          </p>
        </div>

        {/* Category pills — horizontal scroll */}
        <div style={{
          display: "flex", gap: 8, overflowX: "auto",
          paddingBottom: 4, marginLeft: -1, paddingLeft: 1,
          scrollbarWidth: "none", msOverflowStyle: "none",
        }}>
          {CATEGORIES.map(cat => {
            const active = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                style={{
                  flexShrink: 0, padding: "8px 16px", fontSize: 12,
                  fontWeight: active ? 600 : 400,
                  border: active ? "1.5px solid #111" : "1.5px solid #e5e7eb",
                  borderRadius: 999,
                  background: active ? "#111" : "transparent",
                  color: active ? "#fff" : "#555",
                  cursor: "pointer", fontFamily: "'Manrope', sans-serif",
                  transition: "all 0.15s",
                }}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Grid / empty state */}
        {filtered.length === 0 ? (
          <div style={{
            display: "flex", flexDirection: "column", alignItems: "center",
            gap: 12, padding: "56px 0", textAlign: "center",
          }}>
            <BookOpen size={28} strokeWidth={1.2} color="#d1d5db" />
            <p style={{
              fontSize: 13, color: "#9ca3af", maxWidth: 260,
              lineHeight: 1.6, fontFamily: "'Manrope', sans-serif",
            }}>
              No articles here yet for this stage of your journey. Check back soon.
            </p>
          </div>
        ) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(155px, 1fr))",
            gap: 14,
          }}>
            {filtered.map(article => {
              const meta = getMeta(article.category);
              return (
                <button
                  key={article.id}
                  onClick={() => setOpenArticle(article)}
                  style={{
                    textAlign: "left", borderRadius: 18,
                    border: "1px solid #e8e6e1",
                    background: meta.card,
                    padding: "16px 14px",
                    display: "flex", flexDirection: "column", gap: 10,
                    cursor: "pointer", transition: "transform 0.12s, box-shadow 0.12s",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)"; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.04)"; }}
                >
                  <CategoryPill category={article.category} />

                  <p style={{
                    fontFamily: "'Fraunces', serif", fontSize: 15,
                    fontWeight: 600, color: "#111", lineHeight: 1.3,
                    margin: 0, flex: 1,
                  }}>
                    {article.title}
                  </p>

                  {article.subtitle && (
                    <p style={{
                      fontSize: 12, color: "#6b7280", lineHeight: 1.5,
                      fontFamily: "'Manrope', sans-serif", margin: 0,
                      display: "-webkit-box", WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical", overflow: "hidden",
                    }}>
                      {article.subtitle}
                    </p>
                  )}

                  <div style={{
                    display: "flex", alignItems: "center", gap: 4, color: "#bbb",
                  }}>
                    <Clock size={11} strokeWidth={1.5} />
                    <span style={{ fontSize: 11, fontFamily: "'Manrope', sans-serif" }}>
                      {article.reading_time} min
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}