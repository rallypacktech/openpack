import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { FOOTER_ROUTES } from "@/lib/footerRoutes";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle2, HelpCircle, Loader2, SearchCheck, XCircle } from "lucide-react";

const VERDICTS = {
  PASS: { label: "Indexed", className: "text-emerald-700", Icon: CheckCircle2 },
  PARTIAL: { label: "Partial", className: "text-amber-700", Icon: AlertTriangle },
  FAIL: { label: "Not indexed", className: "text-red-700", Icon: XCircle },
  NEUTRAL: { label: "Unknown", className: "text-muted-foreground", Icon: HelpCircle },
};

function VerdictBadge({ verdict, error }) {
  if (error) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-amber-700">
        <AlertTriangle className="w-3.5 h-3.5" />
        Unavailable
      </span>
    );
  }
  const v = VERDICTS[verdict] || VERDICTS.NEUTRAL;
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${v.className}`}>
      <v.Icon className="w-3.5 h-3.5" />
      {v.label}
    </span>
  );
}

const formatDate = (value) =>
  value ? new Date(value).toLocaleDateString(undefined, { dateStyle: "medium" }) : "—";

export default function FooterIndexPanel({ siteUrl }) {
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  const run = async () => {
    setRunning(true);
    setError(null);
    setResults(null);
    try {
      const res = await base44.functions.invoke("inspectFooterPages", {
        site_url: siteUrl,
        paths: FOOTER_ROUTES.map((r) => r.path),
      });
      if (res.data?.error) throw new Error(res.data.error);
      setResults(res.data?.results || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setRunning(false);
    }
  };

  const indexed = results?.filter((r) => r.verdict === "PASS").length ?? 0;

  return (
    <Card>
      <CardContent className="pt-6 space-y-4">
        <div className="flex items-start gap-3">
          <SearchCheck className="w-4 h-4 mt-0.5 flex-shrink-0 text-muted-foreground" />
          <div className="flex-1">
            <h2 className="font-serif text-lg font-bold text-foreground">Footer page indexing</h2>
            <p className="text-xs text-muted-foreground mt-1">
              Asks Google what it currently thinks of all {FOOTER_ROUTES.length} footer pages —
              whether each one is indexed, and the coverage state behind that verdict.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button onClick={run} disabled={running}>
            {running ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <SearchCheck className="w-4 h-4 mr-2" />
            )}
            {running ? "Checking…" : "Check indexing"}
          </Button>
          {running && (
            <span className="text-xs text-muted-foreground">
              Asking Google about {FOOTER_ROUTES.length} pages — this takes a moment.
            </span>
          )}
        </div>

        {error && (
          <div className="flex items-start gap-3 rounded-md border border-amber-300 bg-amber-50 p-4">
            <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0 text-amber-600" />
            <p className="text-xs text-amber-900">{error}</p>
          </div>
        )}

        {results && (
          <>
            <p className="text-sm text-muted-foreground">
              {indexed} of {results.length} pages indexed.
            </p>
            <div className="overflow-x-auto -mx-2 px-2">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-muted-foreground border-b border-border">
                    <th className="text-left font-medium py-2 pr-3">Page</th>
                    <th className="text-left font-medium py-2 px-2">Status</th>
                    <th className="text-left font-medium py-2 px-2">Coverage</th>
                    <th className="text-right font-medium py-2 pl-2">Last crawl</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((r) => (
                    <tr key={r.path} className="border-b border-border/60 last:border-0">
                      <td className="py-2 pr-3 text-foreground whitespace-nowrap">{r.path}</td>
                      <td className="py-2 px-2">
                        <VerdictBadge verdict={r.verdict} error={r.error} />
                      </td>
                      <td
                        className="py-2 px-2 text-muted-foreground text-xs"
                        title={r.error || r.coverage_state || undefined}
                      >
                        {r.error || r.coverage_state || "—"}
                      </td>
                      <td className="py-2 pl-2 text-right text-xs text-muted-foreground whitespace-nowrap">
                        {formatDate(r.last_crawl_time)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}