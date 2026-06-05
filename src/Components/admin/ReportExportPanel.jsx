import { useState } from "react";

export default function ReportExportPanel() {
  const [period, setPeriod] = useState("monthly");
  const [region, setRegion] = useState("all");
  const [format, setFormat] = useState("pdf");
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState(null);

  // Static prebuilt reports (no API call needed)
  const prebuiltReports = [
    { id: "q1-2026", name: "Quarterly summary Q1 2026", meta: "All regions · Mar 2026", url: "/reports/q1-2026.pdf" },
    { id: "annual-2025", name: "Annual report 2025", meta: "Full year · 42 pages", url: "/reports/annual-2025.pdf" },
    { id: "gap-analysis", name: "Service gap analysis", meta: "Ministry briefing", url: "/reports/gap-analysis.pdf" },
  ];

  async function handleGenerate() {
    setGenerating(true);
    setGenerated(false);
    setDownloadUrl(null);

    try {
      const response = await fetch("/api/admin/reports/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ period, region, format }),
      });

      if (!response.ok) throw new Error("Failed to generate report");

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
      setGenerated(true);
    } catch (err) {
      console.error("Report generation failed:", err);
    } finally {
      setGenerating(false);
    }
  }

  function handleDownload() {
    if (downloadUrl) {
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = `report_${period}_${region}_${Date.now()}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(downloadUrl);
      setGenerated(false);
      setDownloadUrl(null);
    }
  }

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5">
      <div className="mb-4">
        <h3 className="text-sm font-medium text-gray-900">Report export</h3>
        <p className="text-xs text-gray-400 mt-0.5">
          Download pre-built or generate custom reports
        </p>
      </div>

      {/* Pre-built reports */}
      {prebuiltReports.length > 0 && (
        <div className="space-y-2 mb-5">
          {prebuiltReports.map((r) => (
            <div
              key={r.id}
              className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3"
            >
              <div>
                <p className="text-sm font-medium text-gray-800">{r.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">{r.meta}</p>
              </div>
              <a
                href={r.url}
                download
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 border border-gray-200 rounded-lg text-gray-500 hover:bg-white transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3" />
                </svg>
                Download
              </a>
            </div>
          ))}
        </div>
      )}

      {/* Custom report generator */}
      <div className="border-t border-gray-100 pt-4">
        <p className="text-xs text-gray-400 mb-3">Generate custom report</p>
        <div className="grid grid-cols-3 gap-2 mb-3">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="text-xs border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-700 focus:outline-none focus:border-gray-400"
          >
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
            <option value="annual">Annual</option>
          </select>
          <select
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            className="text-xs border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-700 focus:outline-none focus:border-gray-400"
          >
            <option value="all">All regions</option>
            <option value="littoral">Littoral</option>
            <option value="far-north">Far North</option>
            <option value="north">North</option>
            <option value="centre">Centre</option>
            <option value="adamawa">Adamawa</option>
            <option value="south">South</option>
            <option value="east">East</option>
            <option value="west">West</option>
            <option value="north-west">North West</option>
            <option value="south-west">South West</option>
          </select>
          <select
            value={format}
            onChange={(e) => setFormat(e.target.value)}
            className="text-xs border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-700 focus:outline-none focus:border-gray-400"
          >
            <option value="pdf">PDF</option>
            <option value="csv">CSV</option>
            <option value="xlsx">XLSX</option>
          </select>
        </div>
        <button
          onClick={generated ? handleDownload : handleGenerate}
          disabled={generating}
          className="w-full text-xs py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors font-medium"
        >
          {generating
            ? "Generating report..."
            : generated
            ? "✓ Download report"
            : "Generate report"}
        </button>
      </div>
    </div>
  );
}