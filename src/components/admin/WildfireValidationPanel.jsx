import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw, ClipboardList, Copy, Check, AlertTriangle } from "lucide-react";

// Admin-only, read-only data-validation report. Flags suspected issues with
// IDs so the admin can act via existing merge/edit tools. NEVER writes.
export default function WildfireValidationPanel() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await base44.functions.invoke("validateWildfireData", {});
      setData(res.data);
    } catch (e) {
      setError(e.response?.data?.error || e.message || "Failed to run validation");
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => { load(); }, []);

  const copyIds = async (key, ids) => {
    try {
      await navigator.clipboard.writeText((ids || []).join(", "));
      setCopied(key);
      setTimeout(() => setCopied(null), 1500);
    } catch (e) {}
  };

  if (loading && !data) {
    return (
      <Card>
        <CardContent className="pt-5 flex items-center justify-center py-16">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          <span className="ml-2 text-sm text-muted-foreground">Scanning full dataset…</span>
        </CardContent>
      </Card>
    );
  }
  if (error) {
    return (
      <Card>
        <CardContent className="pt-5">
          <p className="text-sm text-red-600 mb-3">{error}</p>
          <Button size="sm" variant="outline" onClick={load}><RefreshCw className="w-4 h-4 mr-1" /> Retry</Button>
        </CardContent>
      </Card>
    );
  }

  const s = data.summary;
  const sm = data.smoulder_candidates || [];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ClipboardList className="w-5 h-5 text-crimson" />
          <h2 className="text-lg font-serif font-bold text-foreground">Wildfire data validation</h2>
          <span className="text-xs text-muted-foreground">Read-only · {s.total_active.toLocaleString()} active records</span>
        </div>
        <Button size="sm" variant="outline" onClick={load} disabled={loading}>
          {loading ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-1" />} Re-run
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat label="Smoulder double-counts" value={s.smoulder_candidates} tone="warn" ids={sm.map((m) => m.later_id)} copyKey="smoulder" copied={copied} onCopy={copyIds} />
        <Stat label="Hectares unit-swap suspects" value={s.hectares_unit_swap_suspects} tone="warn" ids={data.hectares_unit_swap_suspects} copyKey="unitswap" copied={copied} onCopy={copyIds} />
        <Stat label="Hectares > 1M suspects" value={s.hectares_huge_suspects} ids={data.hectares_huge_suspects} copyKey="huge" copied={copied} onCopy={copyIds} />
        <Stat label="Pre-2016 strays" value={s.pre_2016} ids={(data.pre_2016 || []).map((r) => r.id)} copyKey="pre2016" copied={copied} onCopy={copyIds} />
        <Stat label="Missing geo" value={s.missing_geo} ids={data.missing_geo} copyKey="geo" copied={copied} onCopy={copyIds} />
        <Stat label="Missing hectares" value={s.missing_hectares} ids={data.missing_hectares} copyKey="ha" copied={copied} onCopy={copyIds} />
        <Stat label="Missing containment" value={s.missing_containment} ids={data.missing_containment} copyKey="cont" copied={copied} onCopy={copyIds} />
        <Stat label="Cause buckets" value={s.cause_buckets} />
      </div>

      {/* Smoulder candidates detail */}
      {sm.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base">Suspected smoulder double-counts (top 50)</CardTitle></CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="pb-2 pr-3">Incident</th>
                    <th className="pb-2 pr-3">Country</th>
                    <th className="pb-2 pr-3 text-right">Gap (days)</th>
                    <th className="pb-2 pr-3">Earlier ID</th>
                    <th className="pb-2">Later ID</th>
                  </tr>
                </thead>
                <tbody>
                  {sm.slice(0, 50).map((m, i) => (
                    <tr key={i} className="border-b">
                      <td className="py-2 pr-3 font-medium">{m.name}</td>
                      <td className="py-2 pr-3 text-muted-foreground">{m.country_code || "—"}</td>
                      <td className="py-2 pr-3 text-right">{m.gap_days}</td>
                      <td className="py-2 pr-3 text-muted-foreground font-mono">{m.earlier_id}</td>
                      <td className="py-2 text-muted-foreground font-mono">{m.later_id}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cause fragmentation */}
      <Card>
        <CardHeader><CardTitle className="text-base">Cause label fragmentation</CardTitle></CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground mb-3">Raw cause labels grouped by canonical bucket — variants within a bucket should be canonicalized via the existing cause-cleanup tools.</p>
          <div className="space-y-3">
            {(data.cause_variants || []).map((b) => (
              <div key={b.canonical}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-sans font-semibold text-sm text-foreground">{b.canonical}</span>
                  <span className="text-xs text-muted-foreground">{b.total} records · {b.variants.length} variants</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {b.variants.map((v, i) => (
                    <span key={i} className="px-2 py-0.5 rounded text-xs bg-secondary border border-border text-muted-foreground">
                      {v.label || "(empty)"} · {v.count}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Stat({ label, value, tone, ids, copyKey, copied, onCopy }) {
  const canCopy = ids && ids.length > 0;
  return (
    <Card className={tone === "warn" && value > 0 ? "border-amber-300" : ""}>
      <CardContent className="pt-4">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            {tone === "warn" && value > 0 && <AlertTriangle className="w-3 h-3 text-amber-500" />}
            {label}
          </span>
          {canCopy && (
            <button onClick={() => onCopy(copyKey, ids)} className="text-muted-foreground hover:text-foreground" title="Copy IDs">
              {copied === copyKey ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>
        <div className={`text-2xl font-serif font-bold mt-1 ${value > 0 && tone === "warn" ? "text-amber-700" : "text-foreground"}`}>
          {value?.toLocaleString() || 0}
        </div>
      </CardContent>
    </Card>
  );
}