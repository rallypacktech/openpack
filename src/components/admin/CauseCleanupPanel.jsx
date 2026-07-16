import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Sparkles, Save, Search, CheckCircle2, AlertCircle } from "lucide-react";
import { STANDARD_CAUSES, suggestCleanedCause } from "@/lib/causeCleanup";

export default function CauseCleanupPanel() {
  const [causeGroups, setCauseGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [dirty, setDirty] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const incidents = await base44.entities.WildfireIncident.list("-created_date", 500);
      const map = new Map();
      incidents.forEach((i) => {
        const orig = i.cause ? i.cause.trim() : "(none)";
        if (!map.has(orig)) {
          map.set(orig, { count: 0, cleaned: i.cause_cleaned || "" });
        }
        const entry = map.get(orig);
        entry.count++;
        if (i.cause_cleaned) entry.cleaned = i.cause_cleaned;
      });
      const groups = Array.from(map.entries())
        .map(([original, info]) => ({
          original,
          count: info.count,
          cleaned: info.cleaned || "",
          suggested: suggestCleanedCause(original),
        }))
        .sort((a, b) => b.count - a.count);
      setCauseGroups(groups);
    } catch (e) {
      console.error("Failed to load causes:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleAutoSuggest = () => {
    setCauseGroups((groups) => groups.map((g) => ({ ...g, cleaned: g.suggested })));
    setDirty(true);
  };

  const handleChange = (original, value) => {
    setCauseGroups((groups) =>
      groups.map((g) => (g.original === original ? { ...g, cleaned: value } : g))
    );
    setDirty(true);
  };

  const handleSave = async () => {
    setSaving(true);
    setResult(null);
    const cleanedToOriginals = {};
    causeGroups.filter((g) => g.cleaned && g.original !== "(none)").forEach((g) => {
      if (!cleanedToOriginals[g.cleaned]) cleanedToOriginals[g.cleaned] = [];
      cleanedToOriginals[g.cleaned].push(g.original);
    });
    let updated = 0;
    let failed = 0;
    for (const [cleaned, originals] of Object.entries(cleanedToOriginals)) {
      try {
        await base44.entities.WildfireIncident.updateMany(
          { cause: { $in: originals } },
          { $set: { cause_cleaned: cleaned } }
        );
        updated++;
      } catch (e) {
        console.error(`Failed to update cause group:`, e);
        failed++;
      }
    }
    setSaving(false);
    setDirty(false);
    setResult({ updated, failed, total: Object.keys(cleanedToOriginals).length });
    setTimeout(() => loadData(), 500);
  };

  const filtered = search
    ? causeGroups.filter(
        (g) =>
          g.original.toLowerCase().includes(search.toLowerCase()) ||
          g.cleaned.toLowerCase().includes(search.toLowerCase())
      )
    : causeGroups;

  const mapped = causeGroups.filter((g) => g.cleaned).length;
  const cleanedValues = [...new Set(causeGroups.filter((g) => g.cleaned).map((g) => g.cleaned))].sort();

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-5">
          <div className="flex justify-center py-12">
            <div className="w-6 h-6 border-2 border-gray-200 border-t-gray-600 rounded-full animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" /> CausesCleaned — Cause Standardization
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Merge and standardize wildfire incident causes. {causeGroups.length} unique original causes → {cleanedValues.length} cleaned values.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleAutoSuggest}>
              <Sparkles className="w-4 h-4 mr-1" /> Auto-Suggest All
            </Button>
            <Button size="sm" onClick={handleSave} disabled={saving || !dirty}>
              <Save className="w-4 h-4 mr-1" /> {saving ? "Saving..." : "Save All"}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {result && (
          <div className={`rounded-lg p-3 mb-4 text-sm ${result.failed > 0 ? "bg-amber-50 text-amber-800 border border-amber-200" : "bg-green-50 text-green-800 border border-green-200"}`}>
            {result.failed > 0 ? <AlertCircle className="w-4 h-4 inline mr-1" /> : <CheckCircle2 className="w-4 h-4 inline mr-1" />}
            Updated {result.updated} cause groups. {result.failed > 0 && `${result.failed} failed.`}
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-xs text-gray-500">Unique Causes</div>
            <div className="text-xl font-bold text-gray-900">{causeGroups.length}</div>
          </div>
          <div className="bg-blue-50 rounded-lg p-3">
            <div className="text-xs text-blue-600">Mapped</div>
            <div className="text-xl font-bold text-blue-900">{mapped}</div>
          </div>
          <div className="bg-amber-50 rounded-lg p-3">
            <div className="text-xs text-amber-600">Unmapped</div>
            <div className="text-xl font-bold text-amber-900">{causeGroups.length - mapped}</div>
          </div>
          <div className="bg-green-50 rounded-lg p-3">
            <div className="text-xs text-green-600">Cleaned Values</div>
            <div className="text-xl font-bold text-green-900">{cleanedValues.length}</div>
          </div>
        </div>

        {cleanedValues.length > 0 && (
          <div className="mb-4">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Cleaned Values</h4>
            <div className="flex flex-wrap gap-2">
              {cleanedValues.map((v) => {
                const count = causeGroups.filter((g) => g.cleaned === v).reduce((sum, g) => sum + g.count, 0);
                return (
                  <Badge key={v} variant="outline" className="bg-white">
                    {v} ({count})
                  </Badge>
                );
              })}
            </div>
          </div>
        )}

        <div className="relative mb-4">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search causes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="overflow-x-auto max-h-[500px] overflow-y-auto border rounded-lg">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-white border-b z-10">
              <tr className="text-left text-xs text-gray-500">
                <th className="px-3 py-2">Original Cause</th>
                <th className="px-3 py-2 text-right">Count</th>
                <th className="px-3 py-2">CausesCleaned</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((g) => (
                <tr key={g.original} className="border-b hover:bg-gray-50">
                  <td className="px-3 py-2 font-medium text-gray-900">{g.original}</td>
                  <td className="px-3 py-2 text-right text-gray-600">{g.count}</td>
                  <td className="px-3 py-2">
                    <select
                      value={g.cleaned}
                      onChange={(e) => handleChange(g.original, e.target.value)}
                      className="px-2 py-1 border rounded text-sm bg-white w-full"
                    >
                      <option value="">— Unmapped —</option>
                      {STANDARD_CAUSES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}