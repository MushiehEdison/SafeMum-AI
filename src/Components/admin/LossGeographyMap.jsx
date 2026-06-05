import { useState, useRef } from "react";

const TYPE_COLORS = { miscarriage: "#60a5fa", ectopic: "#fb923c", stillbirth: "#f472b6" };
const TYPE_LABELS = { miscarriage: "Miscarriage", ectopic: "Ectopic", stillbirth: "Stillbirth" };

const MAP_BOUNDS = { minLng: -18, maxLng: 52, minLat: -35, maxLat: 18 };
const W = 700, H = 480;

function lngToX(lng) { return ((lng - MAP_BOUNDS.minLng) / (MAP_BOUNDS.maxLng - MAP_BOUNDS.minLng)) * W; }
function latToY(lat) { return ((MAP_BOUNDS.maxLat - lat) / (MAP_BOUNDS.maxLat - MAP_BOUNDS.minLat)) * H; }
function pts(arr) { return arr.map(([lng, lat]) => `${lngToX(lng)},${latToY(lat)}`).join(" "); }

const COUNTRIES = [
  { name: "Cameroon",        highlight: true,  p: [[8.5,12.5],[14.5,13.1],[15.5,9.9],[14.7,7.0],[13.3,5.8],[12.4,3.2],[9.8,2.2],[9.0,3.8],[8.5,4.5],[8.5,7.5],[8.5,12.5]] },
  { name: "Nigeria",         p: [[2.7,6.4],[4.3,7.1],[7.2,8.5],[9.8,9.6],[12.3,9.5],[13.3,8.3],[14.2,7.5],[13.5,6.5],[12.0,5.2],[10.0,4.5],[8.5,4.5],[6.8,5.5],[3.5,6.4],[2.7,6.4]] },
  { name: "Niger",           p: [[2.0,15.0],[5.5,15.5],[12.0,15.5],[14.5,15.0],[15.5,13.0],[14.5,13.1],[8.5,12.5],[7.5,14.0],[4.0,14.5],[2.0,15.0]] },
  { name: "Chad",            p: [[14.5,13.1],[15.5,13.0],[16.0,9.9],[15.5,9.9],[14.7,7.0],[14.5,10.0],[13.5,12.0],[14.5,13.1]] },
  { name: "CAR",             p: [[14.7,7.0],[16.0,7.5],[22.5,6.0],[27.4,5.2],[27.0,4.5],[23.5,4.5],[18.5,5.5],[16.0,5.0],[14.5,6.5],[14.7,7.0]] },
  { name: "DR Congo",        p: [[17.5,5.0],[27.4,5.2],[30.0,3.0],[30.8,1.5],[29.5,-1.0],[28.5,-5.0],[28.0,-7.0],[22.5,-7.0],[20.0,-7.5],[16.5,-3.0],[17.0,-1.0],[17.5,3.0],[17.5,5.0]] },
  { name: "Congo",           p: [[16.0,5.0],[18.5,5.5],[18.0,3.0],[18.5,1.0],[16.0,-1.0],[11.8,-2.5],[11.5,0.0],[11.5,2.0],[14.5,4.5],[16.0,5.0]] },
  { name: "Gabon",           p: [[9.0,2.2],[11.5,2.0],[11.5,0.0],[9.5,-1.5],[8.8,-1.0],[9.0,1.0],[9.0,2.2]] },
  { name: "Sudan",           p: [[24.0,22.0],[37.0,22.0],[37.5,18.0],[36.5,12.0],[34.0,10.5],[33.5,12.5],[31.5,14.5],[24.0,17.5],[24.0,22.0]] },
  { name: "South Sudan",     p: [[24.0,11.5],[27.0,10.5],[31.5,9.0],[33.5,12.5],[34.0,10.5],[36.5,12.0],[33.0,16.0],[27.4,12.5],[24.0,12.5],[24.0,11.5]] },
  { name: "Ethiopia",        p: [[38.0,15.0],[43.0,12.5],[44.5,11.0],[43.5,9.0],[41.0,7.5],[39.0,6.0],[36.0,7.5],[34.0,10.5],[36.5,12.0],[38.0,15.0]] },
  { name: "Somalia",         p: [[43.0,12.5],[50.0,12.0],[51.5,10.0],[50.0,6.0],[44.0,4.5],[41.0,7.5],[43.5,9.0],[44.5,11.0],[43.0,12.5]] },
  { name: "Kenya",           p: [[34.0,4.5],[41.0,4.5],[40.0,-1.0],[38.0,-3.5],[34.5,-1.5],[34.0,1.5],[34.0,4.5]] },
  { name: "Uganda",          p: [[29.5,4.0],[34.0,4.5],[34.0,1.5],[31.5,0.0],[30.4,0.0],[30.0,1.5],[29.5,4.0]] },
  { name: "Tanzania",        p: [[29.5,-4.0],[30.8,1.5],[40.0,-1.0],[40.5,-7.0],[39.0,-11.0],[34.0,-11.5],[32.0,-9.5],[30.0,-7.0],[29.5,-4.0]] },
  { name: "Mozambique",      p: [[32.0,-9.5],[34.0,-11.5],[40.5,-17.0],[35.5,-24.5],[32.5,-22.0],[33.5,-19.0],[34.5,-16.0],[30.0,-12.0],[32.0,-9.5]] },
  { name: "Zimbabwe",        p: [[25.0,-15.5],[30.0,-15.5],[33.0,-14.0],[32.5,-22.0],[29.5,-22.0],[27.0,-20.5],[25.5,-18.0],[25.0,-15.5]] },
  { name: "Zambia",          p: [[22.0,-8.0],[30.0,-7.0],[32.0,-9.5],[30.0,-12.0],[33.0,-14.0],[30.0,-15.5],[25.0,-15.5],[23.0,-14.5],[21.5,-12.0],[22.0,-8.0]] },
  { name: "Angola",          p: [[12.0,-5.0],[16.5,-5.5],[20.0,-7.5],[22.0,-8.0],[21.5,-12.0],[25.0,-15.5],[19.0,-17.5],[14.0,-17.0],[12.0,-16.0],[11.5,-10.0],[12.0,-5.0]] },
  { name: "Namibia",         p: [[11.5,-17.0],[19.0,-17.5],[24.0,-17.5],[27.0,-20.5],[20.0,-24.5],[18.0,-28.5],[14.5,-22.0],[12.5,-18.5],[11.5,-17.0]] },
  { name: "Botswana",        p: [[20.0,-24.5],[27.0,-20.5],[29.5,-22.0],[28.0,-26.5],[25.5,-25.5],[20.0,-22.0],[20.0,-24.5]] },
  { name: "South Africa",    p: [[16.5,-28.5],[18.0,-28.5],[28.0,-32.5],[32.5,-26.0],[29.5,-22.0],[28.0,-26.5],[25.5,-25.5],[20.0,-22.0],[18.0,-28.5],[16.5,-28.5]] },
  { name: "Mali",            p: [[-5.0,15.0],[2.0,15.0],[4.0,14.5],[2.0,12.0],[0.5,11.0],[-2.5,11.5],[-4.5,12.0],[-5.5,13.5],[-5.0,15.0]] },
  { name: "Burkina Faso",    p: [[-5.5,13.5],[-4.5,12.0],[-2.5,11.5],[0.5,11.0],[1.5,10.5],[0.0,9.5],[-2.0,9.5],[-5.0,10.5],[-5.5,13.5]] },
  { name: "Ghana",           p: [[-3.0,11.0],[1.2,11.0],[1.0,7.5],[0.5,5.5],[-3.0,5.0],[-3.5,7.0],[-3.0,11.0]] },
  { name: "Côte d'Ivoire",   p: [[-8.5,7.5],[-5.5,7.0],[-3.5,7.0],[-3.0,11.0],[-5.5,10.5],[-7.5,9.5],[-8.5,7.5]] },
  { name: "Guinea",          p: [[-15.0,11.5],[-11.5,12.5],[-9.5,12.0],[-8.5,10.5],[-8.5,7.5],[-11.0,7.5],[-13.5,9.0],[-15.0,11.5]] },
  { name: "Senegal",         p: [[-17.5,14.5],[-14.5,16.5],[-11.5,15.5],[-11.5,12.5],[-15.0,11.5],[-17.5,14.5]] },
  { name: "Mauritania",      p: [[-17.0,21.0],[-5.0,21.0],[-5.0,15.0],[-8.5,14.5],[-11.5,15.5],[-14.5,16.5],[-17.5,14.5],[-17.0,21.0]] },
  { name: "Madagascar",      p: [[44.0,-12.0],[50.5,-16.0],[50.0,-25.5],[44.0,-25.5],[43.0,-20.0],[44.0,-12.0]] },
  { name: "Benin",           p: [[1.5,10.5],[3.5,12.0],[3.8,9.0],[2.5,6.5],[1.2,7.5],[1.5,10.5]] },
  { name: "Togo",            p: [[0.0,9.5],[1.5,10.5],[1.2,7.5],[0.5,5.5],[0.0,6.5],[0.0,9.5]] },
  { name: "Liberia",         p: [[-11.0,7.5],[-8.5,7.5],[-7.5,5.5],[-10.0,5.5],[-11.5,7.0],[-11.0,7.5]] },
  { name: "Eritrea",         p: [[36.5,12.0],[43.0,12.5],[43.5,9.0],[40.0,10.0],[38.0,12.0],[36.5,12.0]] },
  { name: "Malawi",          p: [[33.0,-9.5],[35.0,-9.0],[35.5,-11.0],[35.0,-14.0],[33.5,-14.5],[33.0,-13.0],[32.5,-11.0],[33.0,-9.5]] },
];

export default function LossGeographyMap({ data, loading, error }) {
  const rows = data?.lossGeography || [];
  const [activeType, setActiveType] = useState("miscarriage");
  const [hovered, setHovered] = useState(null);
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef(null);
  const svgRef = useRef(null);

  if (loading) {
    return (
      <div style={{ background: "#fff", border: "1px solid #f3f4f6", borderRadius: 16, padding: 20, fontFamily: "system-ui,sans-serif" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 0" }}>
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-400"></div>
          <span style={{ marginLeft: 8, fontSize: 13, color: "#6b7280" }}>Loading loss geography data...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ background: "#fff", border: "1px solid #f3f4f6", borderRadius: 16, padding: 20, fontFamily: "system-ui,sans-serif" }}>
        <div style={{ textAlign: "center", padding: "40px 0" }}>
          <p style={{ fontSize: 13, color: "#ef4444" }}>Failed to load loss geography data</p>
          <p style={{ fontSize: 11, color: "#9ca3af", marginTop: 4 }}>{error}</p>
        </div>
      </div>
    );
  }

  if (!rows || rows.length === 0) {
    return (
      <div style={{ background: "#fff", border: "1px solid #f3f4f6", borderRadius: 16, padding: 20, fontFamily: "system-ui,sans-serif" }}>
        <div style={{ textAlign: "center", padding: "40px 0" }}>
          <p style={{ fontSize: 13, color: "#6b7280" }}>No loss geography data available</p>
          <p style={{ fontSize: 11, color: "#9ca3af", marginTop: 4 }}>Check back later</p>
        </div>
      </div>
    );
  }

  const maxVal = Math.max(...rows.map((r) => r[activeType]));
  function bubbleR(val) { return (6 + (val / maxVal) * 22) / transform.scale; }

  function handleWheel(e) {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.85 : 1.18;
    const rect = svgRef.current.getBoundingClientRect();
    const scaleX = W / rect.width;
    const mx = (e.clientX - rect.left) * scaleX;
    const my = (e.clientX - rect.left) * scaleX * (H / W);
    setTransform((t) => {
      const newScale = Math.min(Math.max(t.scale * delta, 1), 12);
      const ratio = newScale / t.scale;
      return { scale: newScale, x: mx - ratio * (mx - t.x), y: my - ratio * (my - t.y) };
    });
  }

  function handleMouseDown(e) {
    setIsDragging(true);
    const rect = svgRef.current.getBoundingClientRect();
    const scaleX = W / rect.width;
    dragStart.current = { x: e.clientX * scaleX - transform.x, y: e.clientY * scaleX - transform.y };
  }

  function handleMouseMove(e) {
    if (!isDragging || !dragStart.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const scaleX = W / rect.width;
    setTransform((t) => ({ ...t, x: e.clientX * scaleX - dragStart.current.x, y: e.clientY * scaleX - dragStart.current.y }));
  }

  function handleMouseUp() { setIsDragging(false); }
  function resetZoom() { setTransform({ x: 0, y: 0, scale: 1 }); }

  const hoveredRow = rows.find((r) => r.region === hovered);

  return (
    <div style={{ background: "#fff", border: "1px solid #f3f4f6", borderRadius: 16, padding: 20, fontFamily: "system-ui,sans-serif", userSelect: "none" }}>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
        <div>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: "#111827", margin: 0 }}>Pregnancy loss — Sub-Saharan Africa</h3>
          <p style={{ fontSize: 11, color: "#9ca3af", margin: "3px 0 0" }}>Scroll to zoom · drag to pan · hover bubbles for detail</p>
        </div>
        <button onClick={resetZoom} style={{ fontSize: 11, padding: "4px 10px", border: "1px solid #e5e7eb", borderRadius: 8, background: "#f9fafb", color: "#6b7280", cursor: "pointer" }}>
          Reset
        </button>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        {Object.entries(TYPE_LABELS).map(([key, label]) => (
          <button key={key} onClick={() => setActiveType(key)} style={{
            fontSize: 11, fontWeight: 500, padding: "5px 14px", borderRadius: 999, border: "none", cursor: "pointer",
            background: activeType === key ? TYPE_COLORS[key] : "#f3f4f6",
            color: activeType === key ? "#fff" : "#6b7280",
          }}>{label}</button>
        ))}
      </div>

      <div style={{ position: "relative", borderRadius: 12, overflow: "hidden", background: "#dbeafe", border: "1px solid #bfdbfe" }}>
        <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`}
          style={{ width: "100%", display: "block", cursor: isDragging ? "grabbing" : "grab" }}
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <g transform={`translate(${transform.x},${transform.y}) scale(${transform.scale})`}>
            {COUNTRIES.map((c) => (
              <polygon key={c.name} points={pts(c.p)}
                fill={c.highlight ? "#dcfce7" : "#f0fdf4"}
                stroke={c.highlight ? "#4ade80" : "#d1fae5"}
                strokeWidth={(c.highlight ? 1.5 : 0.7) / transform.scale}
              />
            ))}
            {rows.map((row) => {
              const x = lngToX(row.lng), y = latToY(row.lat);
              const r = bubbleR(row[activeType]);
              const isHov = hovered === row.region;
              return (
                <g key={row.region} onMouseEnter={() => setHovered(row.region)} onMouseLeave={() => setHovered(null)} style={{ cursor: "pointer" }}>
                  {isHov && <circle cx={x} cy={y} r={r + 5 / transform.scale} fill="none" stroke={TYPE_COLORS[activeType]} strokeWidth={1.5 / transform.scale} opacity={0.5} />}
                  <circle cx={x} cy={y} r={r} fill={TYPE_COLORS[activeType]} opacity={isHov ? 0.92 : 0.7} />
                  <text x={x} y={y + 1} textAnchor="middle" dominantBaseline="middle"
                    fontSize={Math.max(5.5, 8 / transform.scale)} fill="#fff" fontWeight="700" style={{ pointerEvents: "none" }}>
                    {row[activeType]}
                  </text>
                  <text x={x} y={y + r + 9 / transform.scale} textAnchor="middle"
                    fontSize={Math.max(5, 7 / transform.scale)} fill="#1f2937" fontWeight="600" style={{ pointerEvents: "none" }}>
                    {row.region}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>

        <div style={{ position: "absolute", bottom: 8, right: 10, background: "rgba(255,255,255,0.8)", borderRadius: 6, padding: "3px 8px", fontSize: 11, color: "#6b7280" }}>
          {Math.round(transform.scale * 100)}%
        </div>

        {hoveredRow && (
          <div style={{ position: "absolute", top: 10, left: 10, background: "#111827", color: "#fff", borderRadius: 12, padding: "12px 14px", minWidth: 165, pointerEvents: "none" }}>
            <p style={{ fontSize: 13, fontWeight: 700, margin: "0 0 1px" }}>{hoveredRow.region}</p>
            <p style={{ fontSize: 10, color: "#9ca3af", margin: "0 0 10px" }}>{hoveredRow.country || "Cameroon"}</p>
            {Object.entries(TYPE_LABELS).map(([key, label]) => (
              <div key={key} style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "#9ca3af" }}>
                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: TYPE_COLORS[key], display: "inline-block" }} />
                  {label}
                </span>
                <span style={{ fontSize: 12, fontWeight: 700, color: TYPE_COLORS[key] }}>{hoveredRow[key]}</span>
              </div>
            ))}
            <div style={{ borderTop: "1px solid #374151", marginTop: 8, paddingTop: 8, display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: 10, color: "#6b7280" }}>Total</span>
              <span style={{ fontSize: 13, fontWeight: 700 }}>{hoveredRow.miscarriage + hoveredRow.ectopic + hoveredRow.stillbirth}</span>
            </div>
          </div>
        )}
      </div>

      <div style={{ marginTop: 14 }}>
        <p style={{ fontSize: 11, color: "#9ca3af", marginBottom: 8 }}>Ranked by {TYPE_LABELS[activeType].toLowerCase()}</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6 }}>
          {[...rows].sort((a, b) => b[activeType] - a[activeType]).map((row, i) => (
            <div key={row.region} onMouseEnter={() => setHovered(row.region)} onMouseLeave={() => setHovered(null)}
              style={{ padding: "8px 10px", borderRadius: 8, cursor: "pointer", background: hovered === row.region ? "#f0fdf4" : "#f9fafb", border: `1px solid ${hovered === row.region ? "#bbf7d0" : "#f3f4f6"}`, transition: "all 0.15s" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontSize: 11, color: "#374151", fontWeight: 500 }}><span style={{ color: "#9ca3af" }}>#{i + 1} </span>{row.region}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: TYPE_COLORS[activeType] }}>{row[activeType]}</span>
              </div>
              <div style={{ height: 3, borderRadius: 999, background: "#e5e7eb" }}>
                <div style={{ height: "100%", width: `${Math.round((row[activeType] / maxVal) * 100)}%`, background: TYPE_COLORS[activeType], borderRadius: 999 }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}