import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { History, RotateCcw, Loader2, AlertTriangle, Flame, TrendingUp, Calendar, Users } from "lucide-react";

function fmtNum(n) {
  if (n == null) return "—";
  return new Intl.NumberFormat("en-US").format(Math.round(n));
}
function fmtDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}
function fmtDateTime(d) {
  if (!d) return "—";
  const dt = new Date(d);
  if (isNaN(dt)) return "—";
  return dt.toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

export default function MergeAuditPanel() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [restoring, setRestoring] = useState(null);
  const [auditRunning, setAuditRunning] = useState(false);
  const [audit, setAudit] = useState(null);
  const [auditError, setAuditError] = useState(null);

  const loadLogs = useCallback(async () => {
    setLoading(true);
    try {
      const data = await base44.entities.WildfireMergeLog.list("-merged_at", 100);
      setLogs(data);
    } catch (e) {
      console.error("Error loading merge logs:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadLogs(); }, [loadLogs]);

  const handleRestore = async (logId, incidentId) => {
    setRestoring(`${logId}:${incidentId}`);
    try {
      await base44.functions.invoke("restoreMergedIncident", { log_id: logId, incident_id: incidentId });
      await loadLogs();
    } catch (e) {
      window.alert(e.response?.data?.error || e.message || "Failed to restore");
    } finally {
      setRestoring(null);
    }
  };

  const runAudit = async () => {
    setAuditRunning(true);
    setAuditError(null);
    setAudit(null);
    try {
      const res = await base44.functions.invoke("backfillMergeAudit", {});
      setAudit(res.data);
    } catch (e) {
      setAuditError(e.response?.data?.error || e.message || "Audit failed");
    } finally {
      setAuditRunning(false);
    }
  };

  const totalMerged = logs.length;
  const continuingCount = logs.filter((l) => (l.hectares_delta && l.hectares_delta > 0) || (l.containment_date_diff_days && l.containment_date_diff_days > 0)).length;
  const totalHectaresDelta = logs.reduce((s, l) => s + (l.hectares_delta || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <History className="w-5 h-5 text-indigo-600" /> Merge Audit & Double-Count Report
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Every merged duplicate is now soft-deleted and logged with containment, hectares, and responding-org deltas. Restore a record if a merge was wrong.
          </p>
        </div>
        <Button variant="outline" onClick={loadLogs} disabled={loading}>
          {loading ? <><Loader2 className="w-4 h-4 mr-1 animate-spin" /> Loading…</> : <><History className="w-4 h-4 mr-1" /> Refresh Logs</>}
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Card><CardContent className="pt-4 pb-4">
          <div className="text-xs text-gray-500 mb-1 flex items-center gap-1"><History className="w-3 h-3" /> Merged Groups (all)</div>
          <div className="text-2xl font-bold text-gray-900">{totalMerged}</div>
          <p className="text-[11px] text-gray-400 mt-0.5">Each = one double-counted fire</p>
        </CardContent></Card>
        <Card className="border-amber-200 bg-amber-50"><CardContent className="pt-4 pb-4">
          <div className="text-xs text-amber-600 mb-1 flex items-center gap-1"><TrendingUp className="w-3 h-3" /> Continuing-Incident Merges</div>
          <div className="text-2xl font-bold text-amber-900">{continuingCount}</div>
          <p className="text-[11px] text-amber-500 mt-0.5">Hectares grew or containment moved later</p>
        </CardContent></Card>
        <Card className="border-blue-200 bg-blue-50"><CardContent className="pt-4 pb-4">
          <div className="text-xs text-blue-600 mb-1 flex items-center gap-1"><Flame className="w-3 h-3" /> Net Hectares Corrected</div>
          <div className="text-2xl font-bold text-blue-900">{fmtNum(totalHectaresDelta)}</div>
          <p className="text-[11px] text-blue-400 mt-0.5">Sum of hectares_delta across merges</p>
        </CardContent></Card>
      </div>

      {/* Historical backfill audit */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" /> Historical Backfill Audit (last 10 days of imports)
          </CardTitle>
          <p className="text-xs text-gray-500">
            Estimates double-counted fires still present in countries imported in the last 10 days — pairs that look like the same fire re-reported as it grew (hectares or containment differ). Previously hard-deleted merges can't be recovered from the DB; this finds what's still there to merge now.
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button onClick={runAudit} disabled={auditRunning}>
            {auditRunning ? <><Loader2 className="w-4 h-4 mr-1 animate-spin" /> Auditing…</> : <><AlertTriangle className="w-4 h-4 mr-1" /> Run Backfill Audit</>}
          </Button>
          {auditError && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800"><AlertTriangle className="w-4 h-4 inline mr-2" />{auditError}</div>}
          {audit && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Card className="border-amber-200 bg-amber-50"><CardContent className="pt-4 pb-4">
                  <div className="text-xs text-amber-600 mb-1">Countries Audited</div>
                  <div className="text-2xl font-bold text-amber-900">{audit.audited_countries}</div>
                </CardContent></Card>
                <Card className="border-red-200 bg-red-50"><CardContent className="pt-4 pb-4">
                  <div className="text-xs text-red-600 mb-1">Estimated Double-Counted Fires</div>
                  <div className="text-2xl font-bold text-red-900">{audit.total_double_counted}</div>
                </CardContent></Card>
              </div>
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {audit.per_country.filter((c) => c.double_counted > 0).length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">No continuing-incident double-counts found in recent imports.</p>
                ) : audit.per_country.filter((c) => c.double_counted > 0).map((c) => (
                  <div key={c.country_code} className="border rounded-lg p-3 bg-amber-50/40">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-sm text-gray-900">{c.country_name} <span className="text-gray-400 font-normal">({c.country_code})</span></p>
                      <Badge className="bg-amber-100 text-amber-800">{c.double_counted} pairs</Badge>
                    </div>
                    <div className="mt-2 space-y-1.5">
                      {c.pairs.slice(0, 12).map((p, i) => (
                        <div key={i} className="text-xs border rounded p-2 bg-white">
                          <div className="flex items-start gap-2">
                            <span className="text-gray-400 mt-0.5">#{i + 1}</span>
                            <div className="flex-1 grid grid-cols-2 gap-2">
                              <div>
                                <p className="font-medium text-gray-800">{p.a.name}</p>
                                <p className="text-gray-500">{fmtDate(p.a.start)} · {fmtNum(p.a.hectares)} ha · cont. {fmtDate(p.a.containment)} · {p.a.source || "—"}</p>
                              </div>
                              <div>
                                <p className="font-medium text-gray-800">{p.b.name}</p>
                                <p className="text-gray-500">{fmtDate(p.b.start)} · {fmtNum(p.b.hectares)} ha · cont. {fmtDate(p.b.containment)} · {p.b.source || "—"}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                      {c.pairs.length > 12 && <p className="text-[11px] text-gray-400">+ {c.pairs.length - 12} more…</p>}
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-gray-400">{audit.note}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Merge log entries */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <History className="w-4 h-4 text-indigo-600" /> Merge Log
            <Badge variant="outline">{logs.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>
          ) : logs.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">No merges logged yet. Merges from the Discrepancies tab will appear here with full deltas.</p>
          ) : (
            <div className="space-y-3">
              {logs.map((log) => {
                const isOpen = expanded === log.id;
                const deletedIds = log.deleted_incident_ids || [];
                const deletedSnaps = log.deleted_snapshots || [];
                const restoredIds = new Set(log.restored_incident_ids || []);
                return (
                  <div key={log.id} className="border rounded-lg p-3">
                    <button className="w-full text-left" onClick={() => setExpanded(isOpen ? null : log.id)}>
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-sm text-gray-900">{log.kept_snapshot?.incident_name || "—"}</span>
                          <Badge variant="outline" className="text-xs">{deletedIds.length} merged</Badge>
                          {log.hectares_delta > 0 && <Badge className="bg-amber-100 text-amber-800 text-xs">+{fmtNum(log.hectares_delta)} ha</Badge>}
                          {log.containment_date_diff_days != null && log.containment_date_diff_days > 0 && <Badge className="bg-blue-100 text-blue-800 text-xs">containment +{log.containment_date_diff_days}d</Badge>}
                          {(log.responding_orgs_added?.length || 0) > 0 && <Badge className="bg-green-100 text-green-800 text-xs">+{log.responding_orgs_added.length} orgs</Badge>}
                          {restoredIds.size > 0 && <Badge className="bg-gray-100 text-gray-600 text-xs">{restoredIds.size} restored</Badge>}
                        </div>
                        <span className="text-xs text-gray-400">{fmtDateTime(log.merged_at)} · {log.merged_by}</span>
                      </div>
                    </button>
                    {isOpen && (
                      <div className="mt-3 space-y-3 border-t pt-3">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                          <div><span className="text-gray-500">Reason:</span> <span className="font-medium text-gray-800">{log.merge_reason || "—"}</span></div>
                          <div><span className="text-gray-500">Containment Δ:</span> <span className="font-medium text-gray-800">{log.containment_date_diff_days != null ? `${log.containment_date_diff_days}d` : "—"}</span></div>
                          <div><span className="text-gray-500">End Δ:</span> <span className="font-medium text-gray-800">{log.end_date_diff_days != null ? `${log.end_date_diff_days}d` : "—"}</span></div>
                          <div><span className="text-gray-500">Hectares Δ:</span> <span className="font-medium text-gray-800">{fmtNum(log.hectares_delta)}</span></div>
                        </div>
                        {(log.responding_orgs_added?.length > 0 || log.responding_orgs_removed?.length > 0) && (
                          <div className="text-xs flex flex-wrap gap-3">
                            {log.responding_orgs_added?.length > 0 && <span className="text-green-700">Added: {log.responding_orgs_added.join(", ")}</span>}
                            {log.responding_orgs_removed?.length > 0 && <span className="text-red-700">Removed: {log.responding_orgs_removed.join(", ")}</span>}
                          </div>
                        )}
                        <div className="space-y-2">
                          <p className="text-xs font-medium text-gray-500 flex items-center gap-1"><Users className="w-3 h-3" /> Soft-deleted records (click to restore):</p>
                          {deletedIds.map((id, i) => {
                            const snap = deletedSnaps[i] || {};
                            const restored = restoredIds.has(id);
                            return (
                              <div key={id} className={`flex items-center justify-between gap-2 border rounded p-2 text-xs ${restored ? "bg-green-50 border-green-200" : "bg-white"}`}>
                                <div className="min-w-0">
                                  <p className="font-medium text-gray-800 truncate">{snap.incident_name || id}</p>
                                  <p className="text-gray-500">{fmtDate(snap.start_date)} · {fmtNum(snap.hectares_burned)} ha · cont. {fmtDate(snap.containment_date)} · {snap.source || "—"}</p>
                                </div>
                                {restored ? (
                                  <Badge className="bg-green-100 text-green-800">Restored</Badge>
                                ) : (
                                  <Button size="sm" variant="outline" onClick={() => handleRestore(log.id, id)} disabled={restoring === `${log.id}:${id}`}>
                                    {restoring === `${log.id}:${id}` ? <><Loader2 className="w-3 h-3 mr-1 animate-spin" />…</> : <><RotateCcw className="w-3 h-3 mr-1" /> Restore</>}
                                  </Button>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}