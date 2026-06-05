import { useInsightsData } from "../../API/useInsightsData";

export default function EmotionalRecoveryChart({ data, loading, error }) {

  const bars = data?.emotionalHealth?.regionalData || [];
  const recovery = data?.emotionalHealth?.recoveryTrajectory || [];

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="bg-white border border-gray-100 rounded-2xl p-5">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-400"></div>
            <span className="ml-2 text-sm text-gray-400">Loading emotional health data...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="bg-white border border-gray-100 rounded-2xl p-5">
          <div className="text-center py-6">
            <p className="text-sm text-red-500">Failed to load emotional health data</p>
            <p className="text-xs text-gray-400 mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (bars.length === 0 && recovery.length === 0) {
    return (
      <div className="space-y-4">
        <div className="bg-white border border-gray-100 rounded-2xl p-5">
          <div className="text-center py-6">
            <p className="text-sm text-gray-500">No emotional health data available</p>
            <p className="text-xs text-gray-400 mt-1">Check back later</p>
          </div>
        </div>
      </div>
    );
  }

  const maxScore = recovery.length > 0 
    ? Math.max(...recovery.map((r) => r.score)) 
    : 100;

  return (
    <div className="space-y-4">
      {/* Regional depression + trauma */}
      {bars.length > 0 && (
        <div className="bg-white border border-gray-100 rounded-2xl p-5">
          <div className="mb-4">
            <h3 className="text-sm font-medium text-gray-900">Depression &amp; trauma by region</h3>
            <p className="text-xs text-gray-400 mt-0.5">% of SafeRecovery users above high-risk threshold</p>
          </div>
          <div className="flex gap-4 mb-4 text-xs text-gray-500">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-pink-400 inline-block" />
              Depression risk
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-violet-400 inline-block" />
              Trauma indicators
            </span>
          </div>
          <div className="space-y-4">
            {bars.map((row) => (
              <div key={row.region}>
                <p className="text-xs text-gray-500 mb-1.5">{row.region}</p>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-16 text-right text-xs text-gray-400">{row.depression}%</span>
                    <div className="flex-1 h-4 bg-gray-50 rounded overflow-hidden">
                      <div 
                        className="h-full bg-pink-400 rounded transition-all duration-500" 
                        style={{ width: `${row.depression}%` }} 
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-16 text-right text-xs text-gray-400">{row.trauma}%</span>
                    <div className="flex-1 h-4 bg-gray-50 rounded overflow-hidden">
                      <div 
                        className="h-full bg-violet-400 rounded transition-all duration-500" 
                        style={{ width: `${row.trauma}%` }} 
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recovery trajectory */}
      {recovery.length > 0 && (
        <div className="bg-white border border-gray-100 rounded-2xl p-5">
          <div className="mb-4">
            <h3 className="text-sm font-medium text-gray-900">Average recovery score — 12 weeks</h3>
            <p className="text-xs text-gray-400 mt-0.5">Composite score from SafeRecovery check-ins (0–100, higher = better)</p>
          </div>
          <div className="flex items-end gap-1.5 h-32">
            {recovery.map((r) => (
              <div key={r.week} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full bg-gray-100 rounded-t overflow-hidden" style={{ height: 96 }}>
                  <div
                    className="w-full bg-violet-500 rounded-t transition-all duration-500"
                    style={{ height: `${(r.score / maxScore) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-gray-400" style={{ fontSize: 9 }}>{r.week}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}