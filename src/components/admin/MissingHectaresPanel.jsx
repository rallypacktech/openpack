import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Flame, Search, CheckCircle2, XCircle, Loader2, ExternalLink } from "lucide-react";

export default function MissingHectaresPanel() {
  const [loading, setLoading] = useState(false);
  const [dryRun, setDryRun] = useState(true);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const runBackfill = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await base44.functions.invoke("backfillMissingHectares", {
        dry_run: dryRun,
      });
      setResult(res.data);
    } catch (e) {
      setError(e?.response?.data?.error || e?.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Flame className="w-5 h-5 text-orange-600" aria-hidden="true" />
          Missing Hectare Backfill
        </CardTitle>
        <p className="text-sm text-muted-foreground mt-1">
          Searches AP News, Reuters, and official fire agencies (CAL FIRE, NIFC, EFFIS) for
          burned-area figures on incidents with zero hectares. Each found figure is credited
          to its source in the <code>hectares_source</code> field.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={dryRun}
              onChange={(e) => setDryRun(e.target.checked)}
              className="rounded"
            />
            Dry run (preview only — no records updated)
          </label>
          <Button
            onClick={runBackfill}
            disabled={loading}
            className="flex items-center gap-2"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
            ) : (
              <Search className="w-4 h-4" aria-hidden="true" />
            )}
            {loading ? "Searching..." : dryRun ? "Preview Backfill" : "Run Backfill"}
          </Button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">
            <strong>Error:</strong> {error}
          </div>
        )}

        {result && (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-3">
              <Badge variant="secondary">
                Checked: {result.total_checked}
              </Badge>
              <Badge variant="default" className="bg-green-600">
                Found: {result.found}
              </Badge>
              <Badge variant="outline">
                Not found: {result.not_found_count}
              </Badge>
              {!result.dry_run && (
                <Badge variant="default" className="bg-blue-600">
                  Updated: {result.updated}
                </Badge>
              )}
              {result.dry_run && result.found > 0 && (
                <Badge variant="destructive">
                  Dry run — uncheck to apply
                </Badge>
              )}
            </div>

            {result.found_details && result.found_details.length > 0 && (
              <div className="border border-border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted">
                    <tr>
                      <th className="text-left px-3 py-2 font-semibold">Incident</th>
                      <th className="text-left px-3 py-2 font-semibold">Country</th>
                      <th className="text-right px-3 py-2 font-semibold">Hectares</th>
                      <th className="text-right px-3 py-2 font-semibold">Acres</th>
                      <th className="text-left px-3 py-2 font-semibold">Source</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.found_details.map((r, i) => (
                      <tr key={i} className="border-t border-border">
                        <td className="px-3 py-2">{r.incident_name}</td>
                        <td className="px-3 py-2">{r.country}</td>
                        <td className="px-3 py-2 text-right tabular-nums">
                          {r.hectares.toLocaleString()}
                        </td>
                        <td className="px-3 py-2 text-right tabular-nums text-muted-foreground">
                          {r.acres.toLocaleString()}
                        </td>
                        <td className="px-3 py-2">
                          <a
                            href={r.source_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline flex items-center gap-1"
                          >
                            {r.source}
                            <ExternalLink className="w-3 h-3" aria-hidden="true" />
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {result.not_found_count > 0 && (
              <details className="text-sm">
                <summary className="cursor-pointer text-muted-foreground flex items-center gap-1">
                  <XCircle className="w-4 h-4" aria-hidden="true" />
                  {result.not_found_count} incidents with no published hectare figure
                </summary>
                <div className="mt-2 border border-border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <tbody>
                      {(result.not_found_sample || []).map((r, i) => (
                        <tr key={i} className="border-t border-border">
                          <td className="px-3 py-1.5">{r.incident_name}</td>
                          <td className="px-3 py-1.5 text-muted-foreground">{r.country_code}</td>
                          <td className="px-3 py-1.5 text-muted-foreground">{r.start_date}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </details>
            )}

            {result.total_checked === 0 && (
              <div className="flex items-center gap-2 text-green-600 text-sm">
                <CheckCircle2 className="w-5 h-5" aria-hidden="true" />
                All incidents already have hectare counts — nothing to backfill.
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}