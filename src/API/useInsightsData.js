import { useState, useEffect, useCallback } from "react";
import API from "./axios";

export function useInsightsData() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await API.get("/api/admin/insights/all");
      const raw = res.data?.data || res.data;

      setData({
        ...raw,

        followUp: {
          attendanceSplit: raw.followUpSplit || [],
          monthlyTrend:    raw.followUpTrend || [],
        },

        emotionalHealth: {
          regionalData:       raw.emotionalByRegion  || [],
          recoveryTrajectory: raw.recoveryTrajectory || [],
        },

        overview:             raw.overview            || {},
        lossGeography:        raw.lossGeography       || [],
        facilityGaps:         raw.facilityGaps        || [],
        flaggedForCounsellor: raw.flaggedForCounsellor ?? 0,
        insights:             raw.insights            || [],
        computedAt:           raw.computedAt          || null,
      });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch insights");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return { data, loading, error, refetch: fetchAll };
}