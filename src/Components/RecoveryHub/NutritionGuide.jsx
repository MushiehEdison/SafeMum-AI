import { useState } from "react";
import { ArrowLeft, Leaf, ChevronRight } from "lucide-react";
import nutritionContent from "../JSON/nutrition_content.json";

// ─── Constants ────────────────────────────────────────────────────────────────

const PHASE_ACCENT = {
  early_acute:       "#dc2626",
  processing:        "#7c3aed",
  rebuilding:        "#2563eb",
  stabilised:        "#16a34a",
  active_pregnancy:  "#0891b2",
  postnatal:         "#9333ea",
};

const PHASE_ACCENT_BG = {
  early_acute:       "#fff1f1",
  processing:        "#f5f3ff",
  rebuilding:        "#eff6ff",
  stabilised:        "#f0fdf4",
  active_pregnancy:  "#ecfeff",
  postnatal:         "#faf5ff",
};

const NUTRIENT_META = {
  iron:       { color: "#dc2626", bg: "#fff1f1",  label: "Iron"      },
  folate:     { color: "#16a34a", bg: "#f0fdf4",  label: "Folate"    },
  protein:    { color: "#2563eb", bg: "#eff6ff",  label: "Protein"   },
  calcium:    { color: "#ea580c", bg: "#fff7ed",  label: "Calcium"   },
  vitaminc:   { color: "#d97706", bg: "#fffbeb",  label: "Vitamin C" },
  "vitamin c":{ color: "#d97706", bg: "#fffbeb",  label: "Vitamin C" },
  "b vitamins":{ color: "#0891b2",bg: "#ecfeff",  label: "B Vitamins"},
  zinc:       { color: "#7c3aed", bg: "#f5f3ff",  label: "Zinc"      },
  iodine:     { color: "#059669", bg: "#ecfdf5",  label: "Iodine"    },
  "vitamin a":{ color: "#b45309", bg: "#fffbeb",  label: "Vitamin A" },
  "vitamin d":{ color: "#0284c7", bg: "#f0f9ff",  label: "Vitamin D" },
  "omega-3":  { color: "#0891b2", bg: "#ecfeff",  label: "Omega-3"   },
  water:      { color: "#0369a1", bg: "#eff6ff",  label: "Water"     },
};

const NUTRIENT_FILTERS = ["All", "Iron", "Folate", "Protein", "Vitamin C", "Calcium"];

function getNutrientMeta(key = "") {
  const k = key.toLowerCase().trim();
  return NUTRIENT_META[k] || { color: "#6b7280", bg: "#f3f4f6", label: key };
}

// ─── Shared primitives ────────────────────────────────────────────────────────

function NutrientPill({ nutrient, outlined = false }) {
  const { color, bg, label } = getNutrientMeta(nutrient);
  return (
    <span style={{
      display: "inline-flex", alignItems: "center",
      padding: "3px 9px", borderRadius: 999,
      fontSize: 10, fontWeight: 700, letterSpacing: "0.07em",
      textTransform: "uppercase", fontFamily: "'Manrope', sans-serif",
      background: outlined ? "transparent" : bg,
      color, border: `1.5px solid ${color}`,
    }}>
      {label}
    </span>
  );
}

function SectionLabel({ text }) {
  return (
    <p style={{
      fontSize: 10, fontWeight: 700, letterSpacing: "0.14em",
      textTransform: "uppercase", color: "#aaa",
      fontFamily: "'Manrope', sans-serif", margin: "0 0 12px",
    }}>
      {text}
    </p>
  );
}

function Card({ children, style = {} }) {
  return (
    <div style={{
      background: "#fff", borderRadius: 18, border: "1px solid #e8e6e1",
      padding: "18px 18px 20px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
      ...style,
    }}>
      {children}
    </div>
  );
}

// ─── Section renderers ────────────────────────────────────────────────────────

// Matches sections with title containing "foods that help" — items with food/why/how
function FoodItemList({ items = [] }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {items.map((item, i) => (
        <div key={i} style={{
          background: "#fafafa", borderRadius: 12,
          border: "1px solid #f0eeea", padding: "12px 14px",
        }}>
          <p style={{
            fontFamily: "'Manrope', sans-serif", fontSize: 13,
            fontWeight: 700, color: "#111", margin: "0 0 3px",
          }}>
            {item.food || item.name}
          </p>
          {item.why && (
            <p style={{
              fontFamily: "'Manrope', sans-serif", fontSize: 12.5,
              color: "#4b5563", lineHeight: 1.65, margin: "0 0 3px",
            }}>
              {item.why}
            </p>
          )}
          {item.how && (
            <p style={{
              fontFamily: "'Manrope', sans-serif", fontSize: 12,
              color: "#9ca3af", lineHeight: 1.55, fontStyle: "italic", margin: 0,
            }}>
              {item.how}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

function LimitItemList({ items = [] }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {items.map((item, i) => (
        <div key={i} style={{
          borderLeft: "3px solid #dc2626",
          paddingLeft: 12, paddingTop: 4, paddingBottom: 4,
        }}>
          <p style={{
            fontFamily: "'Manrope', sans-serif", fontSize: 13,
            fontWeight: 700, color: "#111", margin: "0 0 2px",
          }}>
            {item.food || item.name}
          </p>
          {item.why && (
            <p style={{
              fontFamily: "'Manrope', sans-serif", fontSize: 12.5,
              color: "#6b7280", lineHeight: 1.6, margin: "0 0 2px",
            }}>
              {item.why}
            </p>
          )}
          {item.how && (
            <p style={{
              fontFamily: "'Manrope', sans-serif", fontSize: 12,
              color: "#9ca3af", fontStyle: "italic", margin: 0,
            }}>
              {item.how}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

function MealList({ meals = [] }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {meals.map((meal, i) => {
        const text = typeof meal === "string" ? meal : (meal.description || meal.name || "");
        const name = typeof meal === "object" ? meal.name : null;
        return (
          <div key={i} style={{
            background: "#f0fdf4",
            borderLeft: "3px solid #16a34a",
            borderRadius: "0 12px 12px 0",
            padding: "12px 14px",
            display: "flex", gap: 10, alignItems: "flex-start",
          }}>
            <Leaf size={13} strokeWidth={1.8} color="#16a34a" style={{ flexShrink: 0, marginTop: 2 }} />
            <p style={{
              fontFamily: "'Manrope', sans-serif", fontSize: 12.5,
              color: "#374151", lineHeight: 1.65, margin: 0,
            }}>
              {name ? <strong>{name} — </strong> : null}{name ? text : text}
            </p>
          </div>
        );
      })}
    </div>
  );
}

function SignsList({ signs = [] }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {signs.map((sign, i) => {
        const text = typeof sign === "string" ? sign : (sign.label || sign.sign || "");
        return (
          <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
            <div style={{
              width: 6, height: 6, borderRadius: "50%",
              background: "#f59e0b", flexShrink: 0, marginTop: 6,
            }} />
            <p style={{
              fontFamily: "'Manrope', sans-serif", fontSize: 13,
              color: "#4b5563", lineHeight: 1.65, margin: 0,
            }}>
              {text}
            </p>
          </div>
        );
      })}
    </div>
  );
}

// Detects which section type to render based on the title string
function PhaseSection({ section }) {
  const t = (section.title || "").toLowerCase();

  const isLimit    = t.includes("limit") || t.includes("careful") || t.includes("avoid");
  const isMeals    = t.includes("meal");
  const isSigns    = t.includes("sign") || t.includes("watch") || t.includes("attention");
  const isFoods    = t.includes("foods that help") || t.includes("foods that");
  const isContent  = !!section.content && !section.items && !section.meals && !section.signs;

  return (
    <Card>
      <SectionLabel text={section.title} />

      {isContent && (
        <p style={{
          fontFamily: "'Manrope', sans-serif", fontSize: 13.5,
          color: "#374151", lineHeight: 1.78, margin: 0,
        }}>
          {section.content}
        </p>
      )}

      {isFoods && section.items && <FoodItemList items={section.items} />}
      {isLimit  && section.items && <LimitItemList items={section.items} />}
      {isMeals  && section.meals && <MealList meals={section.meals} />}
      {isSigns  && section.signs && <SignsList signs={section.signs} />}

      {/* Fallback: items present but not matched above */}
      {!isContent && !isFoods && !isLimit && !isMeals && !isSigns && section.items && (
        <FoodItemList items={section.items} />
      )}
    </Card>
  );
}

// ─── GUIDE VIEW ───────────────────────────────────────────────────────────────

function GuideView({ phaseData, recoveryPhase, onOpenFood }) {
  const accent   = PHASE_ACCENT[recoveryPhase]    || "#111";
  const accentBg = PHASE_ACCENT_BG[recoveryPhase] || "#f9fafb";

  if (!phaseData) return (
    <div style={{ padding: "40px 0", textAlign: "center" }}>
      <p style={{ fontFamily: "'Manrope', sans-serif", color: "#9ca3af", fontSize: 13 }}>
        No nutrition guide available for this phase yet.
      </p>
    </div>
  );

  const bodyNeeds = phaseData.bodyNeeds || phaseData.body_needs || [];
  const sections  = phaseData.sections  || [];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>

      {/* Phase intro card */}
      <div style={{
        background: accentBg, borderRadius: 18,
        border: `1px solid ${accent}22`,
        padding: "18px 18px 16px",
      }}>
        <p style={{
          fontSize: 10, fontWeight: 700, letterSpacing: "0.14em",
          textTransform: "uppercase", color: accent,
          fontFamily: "'Manrope', sans-serif", margin: "0 0 6px",
        }}>
          {recoveryPhase.replace(/_/g, " ")}
        </p>
        <p style={{
          fontFamily: "'Fraunces', serif", fontSize: 18,
          fontWeight: 600, color: "#111", lineHeight: 1.25, margin: "0 0 8px",
        }}>
          {phaseData.title}
        </p>
        <p style={{
          fontFamily: "'Manrope', sans-serif", fontSize: 13,
          color: "#4b5563", lineHeight: 1.75, margin: 0,
        }}>
          {phaseData.intro}
        </p>
      </div>

      {/* Body needs pills */}
      {bodyNeeds.length > 0 && (
        <Card>
          <SectionLabel text="What your body needs" />
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {bodyNeeds.map((n, i) => <NutrientPill key={i} nutrient={n} />)}
          </div>
        </Card>
      )}

      {/* Dynamic sections */}
      {sections.map((section, i) => (
        <PhaseSection key={i} section={section} />
      ))}

      {/* Food Guide CTA */}
      <button
        onClick={onOpenFood}
        style={{
          width: "100%", padding: "15px 20px", borderRadius: 14,
          background: "#111", color: "#fff",
          border: "none", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          fontFamily: "'Manrope', sans-serif", fontSize: 14, fontWeight: 600,
        }}
      >
        <span>Food Guide</span>
        <ChevronRight size={16} strokeWidth={2.2} />
      </button>

      <div style={{ height: 24 }} />
    </div>
  );
}

// ─── FOOD VIEW ────────────────────────────────────────────────────────────────

function FoodCard({ food }) {
  // JSON uses localNames (camelCase) and howToUse / available
  const localNames = food.localNames || food.local_names || [];
  const nutrients  = food.nutrients  || [];
  const howToUse   = food.howToUse   || food.how_to_use || null;
  const available  = food.available  || food.where_to_find || null;

  return (
    <div style={{
      background: "#fff", borderRadius: 18, border: "1px solid #e8e6e1",
      padding: "16px 16px 18px",
      display: "flex", flexDirection: "column", gap: 10,
      boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
    }}>
      <div>
        <p style={{
          fontFamily: "'Fraunces', serif", fontSize: 18,
          fontWeight: 600, color: "#111", lineHeight: 1.2, margin: "0 0 4px",
        }}>
          {food.name}
        </p>
        {localNames.length > 0 && (
          <p style={{
            fontFamily: "'Manrope', sans-serif", fontSize: 11.5,
            color: "#9ca3af", margin: 0,
          }}>
            {Array.isArray(localNames) ? localNames.join(" · ") : localNames}
          </p>
        )}
      </div>

      {nutrients.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
          {nutrients.map((n, i) => <NutrientPill key={i} nutrient={n} outlined />)}
        </div>
      )}

      {food.benefit && (
        <p style={{
          fontFamily: "'Manrope', sans-serif", fontSize: 13,
          color: "#374151", lineHeight: 1.7, margin: 0,
        }}>
          {food.benefit}
        </p>
      )}

      {howToUse && (
        <div style={{
          background: "#fafafa", borderRadius: 10,
          border: "1px solid #f0eeea", padding: "10px 12px",
        }}>
          <p style={{
            fontSize: 10, fontWeight: 700, letterSpacing: "0.12em",
            textTransform: "uppercase", color: "#aaa",
            fontFamily: "'Manrope', sans-serif", margin: "0 0 4px",
          }}>
            How to use
          </p>
          <p style={{
            fontFamily: "'Manrope', sans-serif", fontSize: 12.5,
            color: "#4b5563", lineHeight: 1.65, fontStyle: "italic", margin: 0,
          }}>
            {howToUse}
          </p>
        </div>
      )}

      {available && (
        <p style={{
          fontFamily: "'Manrope', sans-serif", fontSize: 11.5,
          color: "#9ca3af", margin: 0,
        }}>
          {available}
        </p>
      )}
    </div>
  );
}

function FoodView({ allFoods = [], recoveryPhase, onBack }) {
  const [activeFilter, setActiveFilter] = useState("All");
  const [showAll, setShowAll]           = useState(false);

  const phaseFoods = showAll
    ? allFoods
    : allFoods.filter(f =>
        !f.phases || f.phases.length === 0 || f.phases.includes(recoveryPhase)
      );

  const filtered = phaseFoods.filter(f => {
    if (activeFilter === "All") return true;
    const nutrients = (f.nutrients || []).map(n => n.toLowerCase().trim());
    return nutrients.some(n =>
      n === activeFilter.toLowerCase() ||
      n.replace(/ /g, "") === activeFilter.toLowerCase().replace(/ /g, "")
    );
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* Top bar */}
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <button
          onClick={onBack}
          style={{
            width: 36, height: 36, borderRadius: "50%",
            background: "#fff", border: "1px solid #e5e7eb",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", flexShrink: 0,
          }}
        >
          <ArrowLeft size={15} strokeWidth={2} color="#555" />
        </button>
        <p style={{
          fontFamily: "'Fraunces', serif",
          fontSize: "clamp(20px,5vw,28px)",
          fontWeight: 600, color: "#111",
          lineHeight: 1.1, letterSpacing: "-0.02em", margin: 0,
        }}>
          Foods That Help You Heal
        </p>
      </div>

      {/* Filter pills */}
      <div style={{
        display: "flex", gap: 7, overflowX: "auto",
        paddingBottom: 4, scrollbarWidth: "none",
      }}>
        {NUTRIENT_FILTERS.map(f => {
          const active = activeFilter === f;
          return (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              style={{
                flexShrink: 0, padding: "7px 14px", fontSize: 12,
                fontWeight: active ? 600 : 400,
                border: active ? "1.5px solid #111" : "1.5px solid #e5e7eb",
                borderRadius: 999,
                background: active ? "#111" : "transparent",
                color: active ? "#fff" : "#555",
                cursor: "pointer", fontFamily: "'Manrope', sans-serif",
                transition: "all 0.15s",
              }}
            >
              {f}
            </button>
          );
        })}
      </div>

      {/* Count + toggle */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <p style={{
          fontFamily: "'Manrope', sans-serif", fontSize: 12,
          color: "#9ca3af", margin: 0,
        }}>
          {filtered.length} food{filtered.length !== 1 ? "s" : ""}
        </p>
        <button
          onClick={() => setShowAll(s => !s)}
          style={{
            background: "transparent", border: "none", cursor: "pointer",
            fontFamily: "'Manrope', sans-serif", fontSize: 12,
            color: "#6b7280", fontWeight: 600,
            textDecoration: "underline", textUnderlineOffset: 2,
          }}
        >
          {showAll ? "Show phase-relevant only" : "Show all foods"}
        </button>
      </div>

      {/* Food cards */}
      {filtered.length === 0 ? (
        <div style={{ padding: "40px 0", textAlign: "center" }}>
          <p style={{ fontFamily: "'Manrope', sans-serif", color: "#9ca3af", fontSize: 13 }}>
            No foods match this filter.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {filtered.map((food, i) => <FoodCard key={food.id || food.name || i} food={food} />)}
        </div>
      )}

      <div style={{ height: 40 }} />
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function NutritionGuide({ recoveryPhase, userName }) {

  const [view,    setView]    = useState("guide");
  const [visible, setVisible] = useState(true);

  // JSON has phases as an ARRAY — find by .phase key
  const phasesArr = Array.isArray(nutritionContent.phases)
    ? nutritionContent.phases
    : Object.values(nutritionContent.phases || {});

  const phaseData = phasesArr.find(p => p.phase === recoveryPhase) || null;
  const allFoods  = nutritionContent.foods || [];

  function switchView(next) {
    setVisible(false);
    setTimeout(() => { setView(next); setVisible(true); }, 200);
  }

  return (
    <div style={{ opacity: visible ? 1 : 0, transition: "opacity 200ms ease" }}>
      {view === "guide" ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div>
            <p style={{
              fontFamily: "'Fraunces', serif",
              fontSize: "clamp(26px,5vw,38px)",
              fontWeight: 600, color: "#111",
              lineHeight: 1.1, letterSpacing: "-0.02em", marginBottom: 6,
            }}>
              Nourish Your Recovery
            </p>
            <p style={{
              fontSize: 13, color: "#aaa", fontWeight: 300,
              fontFamily: "'Manrope', sans-serif",
            }}>
              What your body needs right now
            </p>
          </div>
          <GuideView
            phaseData={phaseData}
            recoveryPhase={recoveryPhase}
            onOpenFood={() => switchView("food")}
          />
        </div>
      ) : (
        <FoodView
          allFoods={allFoods}
          recoveryPhase={recoveryPhase}
          onBack={() => switchView("guide")}
        />
      )}
    </div>
  );
}