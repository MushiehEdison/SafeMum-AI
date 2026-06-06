import { MapContainer, TileLayer, CircleMarker, Tooltip } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const TYPE_COLORS = {
  miscarriage: "#60a5fa",
  ectopic:     "#fb923c",
  stillbirth:  "#f472b6",
};

const TYPE_LABELS = {
  miscarriage: "Miscarriage",
  ectopic:     "Ectopic",
  stillbirth:  "Stillbirth",
};

function getDominant(row) {
  return ["miscarriage", "ectopic", "stillbirth"].reduce((a, b) =>
    row[a] >= row[b] ? a : b
  );
}

export default function LossGeographyMap({ data, loading, error }) {
  const rows = data?.lossGeography || [];

  if (loading) {
    return (
      <div className="bg-white border border-gray-100 rounded-2xl p-5">
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-400" />
          <span className="ml-2 text-sm text-gray-400">Loading map...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white border border-gray-100 rounded-2xl p-5 text-center py-10">
        <p className="text-sm text-red-500">Failed to load geography data</p>
        <p className="text-xs text-gray-400 mt-1">{error}</p>
      </div>
    );
  }

  if (!rows.length) {
    return (
      <div className="bg-white border border-gray-100 rounded-2xl p-5 text-center py-10">
        <p className="text-sm text-gray-500">No geography data yet</p>
        <p className="text-xs text-gray-400 mt-1">Check back once users have registered locations</p>
      </div>
    );
  }

  const maxTotal = Math.max(
    ...rows.map((r) => r.miscarriage + r.ectopic + r.stillbirth)
  );

  const sorted = [...rows].sort(
    (a, b) =>
      b.miscarriage + b.ectopic + b.stillbirth -
      (a.miscarriage + a.ectopic + a.stillbirth)
  );

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 space-y-4">
      {/* Header */}
      <div>
        <h3 className="text-sm font-medium text-gray-900">
          Pregnancy loss by region
        </h3>
        <p className="text-xs text-gray-400 mt-0.5">
          Bubble size = total cases · hover for breakdown · scroll to zoom
        </p>
      </div>

      {/* Map */}
      <div style={{ height: 420, borderRadius: 12, overflow: "hidden", zIndex: 0, position: "relative" }}>
        <MapContainer
          center={[5.5, 11.5]}
          zoom={6}
          style={{ height: "100%", width: "100%" }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {rows.map((row) => {
            const total = row.miscarriage + row.ectopic + row.stillbirth;
            const radius = 12 + (total / maxTotal) * 28;
            const dominant = getDominant(row);
            const isPrimary = total === maxTotal;

            return (
              <CircleMarker
                key={row.region}
                center={[row.lat, row.lng]}
                radius={radius}
                pathOptions={{
                  fillColor:   TYPE_COLORS[dominant],
                  fillOpacity: 0.75,
                  color:       TYPE_COLORS[dominant],
                  weight:      1.5,
                }}
              >
                <Tooltip
                  permanent={isPrimary}
                  direction="top"
                  offset={[0, -radius]}
                  opacity={1}
                >
                  <div style={{ fontFamily: "system-ui, sans-serif", minWidth: 150 }}>
                    <p style={{ fontWeight: 700, fontSize: 13, margin: "0 0 6px", color: "#111827" }}>
                      {row.region}
                    </p>
                    {Object.entries(TYPE_LABELS).map(([key, label]) => (
                      <div
                        key={key}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          gap: 16,
                          fontSize: 11,
                          marginBottom: 3,
                        }}
                      >
                        <span style={{ color: TYPE_COLORS[key] }}>
                          ● {label}
                        </span>
                        <span style={{ fontWeight: 600, color: "#111827" }}>
                          {row[key]}
                        </span>
                      </div>
                    ))}
                    <div
                      style={{
                        borderTop: "1px solid #e5e7eb",
                        marginTop: 6,
                        paddingTop: 6,
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: 12,
                      }}
                    >
                      <span style={{ color: "#6b7280" }}>Total</span>
                      <span style={{ fontWeight: 700, color: "#111827" }}>
                        {total}
                      </span>
                    </div>
                  </div>
                </Tooltip>
              </CircleMarker>
            );
          })}
        </MapContainer>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs text-gray-500">
        {Object.entries(TYPE_LABELS).map(([key, label]) => (
          <span key={key} className="flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-full inline-block"
              style={{ background: TYPE_COLORS[key] }}
            />
            {label}
          </span>
        ))}
        <span className="text-gray-300 ml-auto text-xs hidden sm:block">
          Bubble color = dominant loss type
        </span>
      </div>

      {/* Region cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {sorted.map((row, i) => {
          const total = row.miscarriage + row.ectopic + row.stillbirth;
          const dominant = getDominant(row);
          return (
            <div
              key={row.region}
              className="bg-gray-50 rounded-xl px-3 py-2.5 border border-gray-100"
            >
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-gray-500 font-medium">
                  <span className="text-gray-300 mr-0.5">#{i + 1}</span>
                  {row.region}
                </span>
                <span
                  className="text-xs font-bold"
                  style={{ color: TYPE_COLORS[dominant] }}
                >
                  {total}
                </span>
              </div>
              <div className="flex gap-2 text-xs text-gray-400">
                <span style={{ color: TYPE_COLORS.miscarriage }}>
                  MC {row.miscarriage}
                </span>
                <span style={{ color: TYPE_COLORS.ectopic }}>
                  EC {row.ectopic}
                </span>
                <span style={{ color: TYPE_COLORS.stillbirth }}>
                  SB {row.stillbirth}
                </span>
              </div>
              {/* mini progress bar */}
              <div className="mt-1.5 h-1 rounded-full bg-gray-200 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.round((total / maxTotal) * 100)}%`,
                    background: TYPE_COLORS[dominant],
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