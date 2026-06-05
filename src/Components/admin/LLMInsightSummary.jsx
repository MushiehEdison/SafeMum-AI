import { useInsightsData } from "../../API/useInsightsData";

export default function LLMInsightSummary({ data, loading, error, refetch }) {
  const insights = data?.insights || [];  // Note: using 'insights' not 'llmInsights'

  if (loading) {
    return (
      <div className="bg-white border border-gray-100 rounded-2xl p-5">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-400"></div>
          <span className="ml-2 text-sm text-gray-400">Generating insights...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white border border-gray-100 rounded-2xl p-5">
        <div className="text-center py-6">
          <p className="text-sm text-red-500">Failed to load insights</p>
          <p className="text-xs text-gray-400 mt-1">{error}</p>
          <button
            onClick={() => refetch?.()}
            className="mt-3 text-xs text-gray-500 underline hover:text-gray-700"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (insights.length === 0) {
    return (
      <div className="bg-white border border-gray-100 rounded-2xl p-5">
        <div className="text-center py-6">
          <p className="text-sm text-gray-500">No insights available at this time</p>
          <p className="text-xs text-gray-400 mt-1">Check back later</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5">
      <div className="mb-4 flex justify-between items-center">
        <div>
          <h3 className="text-sm font-medium text-gray-900">AI insight summary</h3>
          <p className="text-xs text-gray-400 mt-0.5">
            LLM-generated briefing from platform data
          </p>
        </div>
        <button
          onClick={() => refetch?.()}
          className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
        >
          Refresh
        </button>
      </div>

      <div className="space-y-4">
        {insights.map((item) => (
          <div key={item.id} className="border-l-3 border-l-blue-400 pl-3">
            <p className="text-xs font-medium text-gray-700">{item.title}</p>
            <p className="text-sm text-gray-600 mt-1 leading-relaxed">
              {item.content}
            </p>
            {item.confidence && (
              <p className="text-xs text-gray-400 mt-2">
                Confidence: {item.confidence}%
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}