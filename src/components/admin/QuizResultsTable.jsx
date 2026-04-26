import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ClipboardList, TrendingUp, Users, Map } from "lucide-react";
import { format } from "date-fns";

const SCORE_LEVEL_COLORS = {
  "Not Ready": "bg-red-100 text-red-800",
  "Gaps That Put You at Risk": "bg-amber-100 text-amber-800",
  "A Solid Foundation": "bg-blue-100 text-blue-800",
};

const REGION_LABELS = {
  coastal: "Coastal / Hurricane",
  wildfire: "Wildfire",
  tornado: "Tornado / Severe Storm",
  earthquake: "Earthquake",
  flood: "Flood Plain",
  general: "Mixed / Not Sure",
};

const ANSWER_LABELS = {
  yes: "Yes",
  no: "No",
  vague: "Vague",
  good: "Well Stocked",
  partial: "Partial",
  none: "Minimal/None",
  in_my_head: "In My Head",
  prepared: "Prepared",
  unprepared: "Unprepared",
  na: "N/A",
  multiple: "Multiple Times",
  once: "Once",
  at_risk: "At Risk",
  low_risk: "Low Risk",
  unsure: "Unsure",
};

export default function QuizResultsTable() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortField, setSortField] = useState("created_date");
  const [sortDir, setSortDir] = useState("desc");

  useEffect(() => {
    loadResults();
  }, []);

  const loadResults = async () => {
    try {
      const data = await base44.asServiceRole.entities.QuizResult.list("-created_date", 500);
      setResults(data);
    } catch (e) {
      console.error("Error loading quiz results:", e);
    } finally {
      setLoading(false);
    }
  };

  // Aggregate stats
  const avgScore = results.length
    ? Math.round(results.reduce((sum, r) => sum + (r.score || 0), 0) / results.length)
    : 0;

  const regionCounts = results.reduce((acc, r) => {
    const key = r.region || "unknown";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const topRegion = Object.entries(regionCounts).sort((a, b) => b[1] - a[1])[0];

  const levelCounts = results.reduce((acc, r) => {
    if (r.score_level) acc[r.score_level] = (acc[r.score_level] || 0) + 1;
    return acc;
  }, {});

  const registeredCount = results.filter(r => r.is_registered_user).length;

  const sorted = [...results].sort((a, b) => {
    let av = a[sortField], bv = b[sortField];
    if (typeof av === "string") av = av.toLowerCase();
    if (typeof bv === "string") bv = bv.toLowerCase();
    if (av < bv) return sortDir === "asc" ? -1 : 1;
    if (av > bv) return sortDir === "asc" ? 1 : -1;
    return 0;
  });

  const handleSort = (field) => {
    if (sortField === field) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortDir("desc"); }
  };

  const SortIcon = ({ field }) => (
    <span className="ml-1 text-gray-400">
      {sortField === field ? (sortDir === "asc" ? "↑" : "↓") : "↕"}
    </span>
  );

  if (loading) return <div className="text-center py-8 text-gray-400">Loading quiz results...</div>;

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-2 mb-1">
              <ClipboardList className="w-4 h-4 text-primary" />
              <span className="text-xs text-muted-foreground font-sans uppercase tracking-widest">Total Quizzes</span>
            </div>
            <div className="text-3xl font-serif font-bold text-foreground">{results.length}</div>
            <p className="text-xs text-muted-foreground mt-1">{registeredCount} registered users</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-primary" />
              <span className="text-xs text-muted-foreground font-sans uppercase tracking-widest">Avg Score</span>
            </div>
            <div className="text-3xl font-serif font-bold text-foreground">{avgScore}%</div>
            <p className="text-xs text-muted-foreground mt-1">Public readiness pulse</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-2 mb-1">
              <Map className="w-4 h-4 text-primary" />
              <span className="text-xs text-muted-foreground font-sans uppercase tracking-widest">Top Region</span>
            </div>
            <div className="text-xl font-serif font-bold text-foreground">
              {topRegion ? REGION_LABELS[topRegion[0]] || topRegion[0] : "—"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">{topRegion ? `${topRegion[1]} responses` : ""}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-4 h-4 text-primary" />
              <span className="text-xs text-muted-foreground font-sans uppercase tracking-widest">Not Ready</span>
            </div>
            <div className="text-3xl font-serif font-bold text-red-600">
              {levelCounts["Not Ready"] || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {results.length ? Math.round(((levelCounts["Not Ready"] || 0) / results.length) * 100) : 0}% of respondents
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Level Breakdown */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-sans font-semibold text-muted-foreground uppercase tracking-widest">Readiness Level Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3 flex-wrap">
            {Object.entries(SCORE_LEVEL_COLORS).map(([level, cls]) => (
              <div key={level} className={`px-3 py-1.5 rounded text-xs font-semibold font-sans ${cls}`}>
                {level}: {levelCounts[level] || 0}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-serif">All Quiz Submissions</CardTitle>
          <p className="text-xs text-muted-foreground font-sans">{results.length} total responses</p>
        </CardHeader>
        <CardContent className="p-0">
          {results.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground font-sans text-sm">
              No quiz results yet. Share the quiz link to start collecting data.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs font-sans">
                <thead>
                  <tr className="border-b border-border bg-secondary/50 text-left">
                    {[
                      ["created_date", "Date"],
                      ["score", "Score"],
                      ["score_level", "Level"],
                      ["region", "Region"],
                      ["supplies", "Supplies"],
                      ["meeting_spot", "Meet Spot"],
                      ["plan_documented", "Plan"],
                      ["insurance", "Insurance"],
                      ["is_registered_user", "Registered"],
                    ].map(([field, label]) => (
                      <th
                        key={field}
                        className="px-4 py-3 font-semibold text-muted-foreground cursor-pointer hover:text-foreground select-none whitespace-nowrap"
                        onClick={() => handleSort(field)}
                      >
                        {label}<SortIcon field={field} />
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((r, i) => (
                    <tr key={r.id} className={`border-b border-border hover:bg-secondary/30 transition-colors ${i % 2 === 0 ? "" : "bg-secondary/10"}`}>
                      <td className="px-4 py-2.5 text-muted-foreground whitespace-nowrap">
                        {r.created_date ? format(new Date(r.created_date), "MMM d, yyyy") : "—"}
                      </td>
                      <td className="px-4 py-2.5 font-semibold text-foreground">{r.score ?? "—"}%</td>
                      <td className="px-4 py-2.5">
                        {r.score_level ? (
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${SCORE_LEVEL_COLORS[r.score_level] || "bg-gray-100 text-gray-700"}`}>
                            {r.score_level}
                          </span>
                        ) : "—"}
                      </td>
                      <td className="px-4 py-2.5 text-muted-foreground whitespace-nowrap">
                        {REGION_LABELS[r.region] || r.region || "—"}
                      </td>
                      <td className="px-4 py-2.5">
                        <span className={`px-2 py-0.5 rounded text-xs ${
                          r.supplies === "good" ? "bg-green-100 text-green-800" :
                          r.supplies === "partial" ? "bg-amber-100 text-amber-800" :
                          r.supplies === "none" ? "bg-red-100 text-red-800" : "bg-gray-100 text-gray-600"
                        }`}>
                          {ANSWER_LABELS[r.supplies] || r.supplies || "—"}
                        </span>
                      </td>
                      <td className="px-4 py-2.5">
                        <span className={`px-2 py-0.5 rounded text-xs ${
                          r.meeting_spot === "yes" ? "bg-green-100 text-green-800" :
                          r.meeting_spot === "vague" ? "bg-amber-100 text-amber-800" :
                          "bg-red-100 text-red-800"
                        }`}>
                          {ANSWER_LABELS[r.meeting_spot] || r.meeting_spot || "—"}
                        </span>
                      </td>
                      <td className="px-4 py-2.5">
                        <span className={`px-2 py-0.5 rounded text-xs ${
                          r.plan_documented === "yes" ? "bg-green-100 text-green-800" :
                          r.plan_documented === "in_my_head" ? "bg-amber-100 text-amber-800" :
                          "bg-red-100 text-red-800"
                        }`}>
                          {ANSWER_LABELS[r.plan_documented] || r.plan_documented || "—"}
                        </span>
                      </td>
                      <td className="px-4 py-2.5">
                        <span className={`px-2 py-0.5 rounded text-xs ${
                          r.insurance === "yes" ? "bg-green-100 text-green-800" :
                          r.insurance === "unsure" ? "bg-amber-100 text-amber-800" :
                          "bg-red-100 text-red-800"
                        }`}>
                          {ANSWER_LABELS[r.insurance] || r.insurance || "—"}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        {r.is_registered_user ? (
                          <span className="text-green-600 font-semibold">✓</span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}