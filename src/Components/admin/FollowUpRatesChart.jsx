import { useInsightsData } from "../../API/useInsightsData";

export default function FollowUpRatesChart({ data, loading, error }) {
  // REMOVE these duplicate lines
  // const donutData = data?.followUpSplit || [];
  // const trend = data?.followUpTrend || [];
  
  // USE the correct data paths
  const donutData = data?.followUp?.attendanceSplit || [];
  const trend = data?.followUp?.monthlyTrend || [];

  const hasDonutData = donutData.length > 0;
  const hasTrendData = trend.length > 0;

  // Build donut with colors
  const donut = donutData.map((d, i) => ({
    ...d,
    color: d.name === "Returned" ? "bg-green-400" : "bg-red-400"
  }));

  const returned = donut.find((d) => d.name === "Returned")?.value ?? 0;
  const circumference = 2 * Math.PI * 40;
  const dashOffset = circumference - (returned / 100) * circumference;
  
  const maxRate = trend.length > 0 ? Math.max(...trend.map((t) => t.rate)) : 100;

  if (loading) {
    return (
      <div className="bg-white border border-gray-100 rounded-2xl p-5">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-400"></div>
          <span className="ml-2 text-sm text-gray-400">Loading follow-up data...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white border border-gray-100 rounded-2xl p-5">
        <div className="text-center py-6">
          <p className="text-sm text-red-500">Failed to load follow-up data</p>
          <p className="text-xs text-gray-400 mt-1">{error}</p>
        </div>
      </div>
    );
  }

  if (!hasDonutData && !hasTrendData) {
    return (
      <div className="bg-white border border-gray-100 rounded-2xl p-5">
        <div className="text-center py-6">
          <p className="text-sm text-gray-500">No follow-up data available</p>
          <p className="text-xs text-gray-400 mt-1">Check back later</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5">
      <div className="mb-4">
        <h3 className="text-sm font-medium text-gray-900">Follow-up rates</h3>
        <p className="text-xs text-gray-400 mt-0.5">Return attendance vs dropout after discharge</p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Ring - only show if donut data exists */}
        {hasDonutData && (
          <div>
            <p className="text-xs text-gray-400 mb-3">Attendance split</p>
            <div className="flex items-center gap-4">
              <div className="relative w-24 h-24 flex-shrink-0">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#fee2e2" strokeWidth="12" />
                  <circle
                    cx="50" cy="50" r="40" fill="none"
                    stroke="#4ade80" strokeWidth="12"
                    strokeDasharray={circumference}
                    strokeDashoffset={dashOffset}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-medium text-gray-900">{returned}%</span>
                </div>
              </div>
              <div className="space-y-2">
                {donut.map((d) => (
                  <div key={d.name} className="flex items-center gap-2 text-xs text-gray-500">
                    <span className={`w-2.5 h-2.5 rounded-sm inline-block ${d.color}`} />
                    {d.name} {d.value}%
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Trend bars - only show if trend data exists */}
        {hasTrendData && (
          <div>
            <p className="text-xs text-gray-400 mb-3">6-month trend</p>
            <div className="flex items-end gap-2 h-24">
              {trend.map((t) => (
                <div key={t.month} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-xs text-gray-400">{t.rate}%</span>
                  <div className="w-full bg-gray-100 rounded-t overflow-hidden" style={{ height: 60 }}>
                    <div
                      className="w-full bg-green-400 rounded-t transition-all duration-500"
                      style={{ height: `${(t.rate / maxRate) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-400">{t.month}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}