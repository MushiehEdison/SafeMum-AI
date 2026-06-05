import { useInsightsData } from "../../API/useInsightsData";

function barColor(pct) {
  if (pct >= 65) return "bg-red-400";
  if (pct >= 40) return "bg-amber-400";
  return "bg-green-400";
}

function badgeColor(pct) {
  if (pct >= 65) return "text-red-600";
  if (pct >= 40) return "text-amber-600";
  return "text-green-600";
}

export default function CareFacilityGapsMap() {
  const { data, loading, error } = useInsightsData();
  
  const gaps = data?.facilityGaps || [];

  if (loading) {
    return (
      <div className="bg-white border border-gray-100 rounded-2xl p-5">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-400"></div>
          <span className="ml-2 text-sm text-gray-400">Loading facility data...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white border border-gray-100 rounded-2xl p-5">
        <div className="text-center py-6">
          <p className="text-sm text-red-500">Failed to load facility gap data</p>
          <p className="text-xs text-gray-400 mt-1">{error}</p>
        </div>
      </div>
    );
  }

  if (gaps.length === 0) {
    return (
      <div className="bg-white border border-gray-100 rounded-2xl p-5">
        <div className="text-center py-6">
          <p className="text-sm text-gray-500">No facility gap data available</p>
          <p className="text-xs text-gray-400 mt-1">Check back later</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5">
      <div className="mb-4">
        <h3 className="text-sm font-medium text-gray-900">
          Care facility gaps
        </h3>
        <p className="text-xs text-gray-400 mt-0.5">
          % of population with no post-loss facility within 30 km — output for
          ministries &amp; NGOs
        </p>
      </div>

      <div className="space-y-3">
        {gaps.map((row) => (
          <div key={row.region}>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-600">{row.region}</span>
              <span className={`font-medium ${badgeColor(row.pct)}`}>
                {row.pct}%
              </span>
            </div>
            <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
              <div
                className={`h-full rounded-full ${barColor(row.pct)} transition-all duration-500`}
                style={{ width: `${row.pct}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-4 mt-4 text-xs text-gray-400">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-red-400 inline-block" />
          Critical (&gt;65%)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
          Moderate (40–65%)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-green-400 inline-block" />
          Manageable (&lt;40%)
        </span>
      </div>
    </div>
  );
}