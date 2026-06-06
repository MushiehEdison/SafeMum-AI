import { useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Tooltip } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const TYPE_COLORS = { miscarriage: "#60a5fa", ectopic: "#fb923c", stillbirth: "#f472b6" };
const TYPE_LABELS = { miscarriage: "Miscarriage", ectopic: "Ectopic", stillbirth: "Stillbirth" };
const CAMEROON_CENTER = [5.5, 11.5];
const DEFAULT_ZOOM = 6;

export default function LossGeographyMap({ data, loading, error }) {
  const rows = data?.lossGeography || [];
  const [activeType, setActiveType] = useState("miscarriage");
  const [hovered, setHovered] = useState(null);

  if (loading) {
    return (
      <div className="bg-white border border-gray-100 rounded-2xl p-5 font-['Manrope']">
        <div className="flex items-center justify-center py-10">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-400" />
          <span className="ml-2 text-sm text-gray-500">Loading loss geography data...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white border border-gray-100 rounded-2xl p-5 font-['Manrope']">
        <div className="text-center py-10">
          <p className="text-sm text-red-500">Failed to load loss geography data</p>
          <p className="text-xs text-gray-400 mt-1">{error}</p>
        </div>
      </div>
    );
  }

  if (!rows || rows.length === 0) {
    return (
      <div className="bg-white border border-gray-100 rounded-2xl p-5 font-['Manrope']">
        <div className="text-center py-10">
          <p className="text-sm text-gray-500">No geography data yet</p>
          <p className="text-xs text-gray-400 mt-1">Check back later</p>
        </div>
      </div>
    );
  }

  const totalCases = rows.map((r) => r.miscarriage + r.ectopic + r.stillbirth);
  const maxTotal = Math.max(...totalCases);
  const maxActive = Math.max(...rows.map((r) => r[activeType]));
  const maxRegion = rows.reduce((max, r) => {
    const total = r.miscarriage + r.ectopic + r.stillbirth;
    return total > (max?.total || 0) ? { ...r, total } : max;
  }, null);

  function getDominantType(row) {
    const counts = { miscarriage: row.miscarriage, ectopic: row.ectopic, stillbirth: row.stillbirth };
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
  }

  function getBubbleRadius(total) {
    return 12 + (total / maxTotal) * 28;
  }

  function getBubbleColor(row) {
    return TYPE_COLORS[getDominantType(row)];
  }

  const sortedByActive = [...rows].sort((a, b) => b[activeType] - a[activeType]);
  const hoveredRow = rows.find((r) => r.region === hovered);

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 font-['Manrope']">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">Pregnancy loss — Sub-Saharan Africa</h3>
          <p className="text-[11px] text-gray-400 mt-0.5">Scroll to zoom · hover bubbles for detail</p>
        </div>
      </div>

      {/* Type toggle */}
      <div className="flex gap-2 mb-4">
        {Object.entries(TYPE_LABELS).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setActiveType(key)}
            className="text-[11px] font-medium px-3 py-1.5 rounded-full transition-all"
            style={{
              background: activeType === key ? TYPE_COLORS[key] : "#f3f4f6",
              color: activeType === key ? "#fff" : "#6b7280",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Map */}
      <div style={{ height: 420, borderRadius: 12, overflow: "hidden", border: "1px solid #e5e7eb" }}>
        <MapContainer
          center={CAMEROON_CENTER}
          zoom={DEFAULT_ZOOM}
          style={{ height: "100%", width: "100%" }}
          scrollWheelZoom={true}
          dragging={true}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />

          {rows.map((row) => {
            const total = row.miscarriage + row.ectopic + row.stillbirth;
            const radius = getBubbleRadius(total);
            const color = getBubbleColor(row);
            const isMax = maxRegion && row.region === maxRegion.region;

            return (
              <CircleMarker
                key={row.region}
                center={[row.lat, row.lng]}
                radius={radius}
                pathOptions={{
                  fillColor: color,
                  fillOpacity: 0.75,
                  color: color,
                  weight: 1.5,
                }}
                eventHandlers={{
                  mouseover: () => setHovered(row.region),
                  mouseout: () => setHovered(null),
                }}
              >
                {/* Permanent tooltip for highest region */}
                {isMax && (
                  <Tooltip permanent direction="top" offset={[0, -radius - 8]}>
                    <div style={{ fontSize: 11, fontFamily: "'Manrope', sans-serif" }}>
                      <strong>{row.region}</strong>
                      <br />
                      <span style={{ color: "#6b7280" }}>Total: {total}</span>
                    </div>
                  </Tooltip>
                )}

                {/* Hover tooltip */}
                {hovered === row.region && !isMax && (
                  <Tooltip direction="top" offset={[0, -radius - 8]}>
                    <div style={{ fontSize: 11, fontFamily: "'Manrope', sans-serif", minWidth: 140 }}>
                      <p style={{ fontWeight: 700, margin: "0 0 4px", fontSize: 12 }}>{row.region}</p>
                      {Object.entries(TYPE_LABELS).map(([key, label]) => (
                        <div key={key} style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                          <span style={{ display: "flex", alignItems: "center", gap: 5, color: "#6b7280" }}>
                            <span style={{ width: 7, height: 7, borderRadius: "50%", background: TYPE_COLORS[key], display: "inline-block" }} />
                            {label}
                          </span>
                          <span style={{ fontWeight: 600, color: TYPE_COLORS[key] }}>{row[key]}</span>
                        </div>
                      ))}
                      <div style={{ borderTop: "1px solid #e5e7eb", marginTop: 6, paddingTop: 6, display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: "#9ca3af", fontSize: 10 }}>Total</span>
                        <span style={{ fontWeight: 700, fontSize: 12 }}>{total}</span>
                      </div>
                    </div>
                  </Tooltip>
                )}
              </CircleMarker>
            );
          })}
        </MapContainer>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-4 mb-2">
        {Object.entries(TYPE_LABELS).map(([key, label]) => (
          <div key={key} className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: TYPE_COLORS[key] }} />
            <span className="text-[11px] text-gray-500">{label}</span>
          </div>
        ))}
      </div>

      {/* Region cards */}
      <p className="text-[11px] text-gray-400 mb-3">
        Ranked by {TYPE_LABELS[activeType].toLowerCase()}
      </p>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {sortedByActive.map((row, i) => {
          const dominant = getDominantType(row);
          const total = row.miscarriage + row.ectopic + row.stillbirth;
          const isHov = hovered === row.region;
          return (
            <div
              key={row.region}
              onMouseEnter={() => setHovered(row.region)}
              onMouseLeave={() => setHovered(null)}
              className="p-2.5 rounded-lg cursor-pointer transition-all"
              style={{
                background: isHov ? "#f0fdf4" : "#f9fafb",
                border: `1px solid ${isHov ? "#bbf7d0" : "#f3f4f6"}`,
              }}
            >
              <div className="flex justify-between items-center mb-1">
                <span className="text-[11px] text-gray-700 font-medium">
                  <span className="text-gray-400">#{i + 1} </span>
                  {row.region}
                </span>
                <span className="text-xs font-bold" style={{ color: TYPE_COLORS[dominant] }}>
                  {total}
                </span>
              </div>
              <div className="flex gap-2 text-[10px] text-gray-400">
                <span>MC: {row.miscarriage}</span>
                <span>EC: {row.ectopic}</span>
                <span>SB: {row.stillbirth}</span>
              </div>
              <div className="h-1.5 rounded-full bg-gray-200 mt-1.5 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${Math.round((row[activeType] / maxActive) * 100)}%`,
                    background: TYPE_COLORS[activeType],
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}