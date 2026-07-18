import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GitCompare, RefreshCw, AlertTriangle, MapPin, Clock, Loader2, Copy, Trash2, CheckCircle2 } from "lucide-react";

export default function IncidentDiscrepancies() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  // Duplicate detection state
  const [dupLoading, setDupLoading] = useState(false);
  const [dupResult, setDupResult] = useState(null);
  const [dupError, setDupError] = useState(null);
  const [keepSelections, setKeepSelections] = useState({}); // groupIndex -> incidentId
  const [actionLoading, setActionLoading] = useState({}); // groupIndex -> boolean
  const [actionResults, setActionResults] = useState({}); // groupIndex -> {merged_fields, deleted_count}

  const runComparison = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await base44.functions.invoke("compareIncidentSources", {});
      setResult(res.data);
    } catch (e) {
      setError(e.response?.data?.error || e.message || "Failed to run comparison");
    } finally {
      setLoading(false);
    }
  };

  const findDuplicates = async () => {
    setDupLoading(true);
    setDupError(null);
    setDupResult(null);
    setKeepSelections({});
    setActionResults({});
    try {
      const res = await base44.functions.invoke("findDuplicateIncidents", {});
      setDupResult(res.data);
      // Default: select the first incident in each group as the one to keep
      const defaults = {};
      (res.data.duplicate_groups || []).forEach((group, i) => {
        if (group.incidents.length > 0) {
          // Prefer the one with coordinates and most data
          const best = group.incidents.reduce((best, inc) => {
            const bestScore = (best.latitude ? 1 : 0) + (best.containment_date ? 1 : 0) + (best.acres_burned ? 1 : 0) + (best.responding_organizations?.length > 0 ? 1 : 0);
            const incScore = (inc.latitude ? 1 : 0) + (inc.containment_date ? 1 : 0) + (inc.acres_burned ? 1 : 0) + (inc.responding_organizations?.length > 0 ? 1 : 0);
            return incScore > bestScore ? inc : best;
          });
          defaults[i] = best.id;
        }
      });
      setKeepSelections(defaults);
    } catch (e) {
      setDupError(e.response?.data?.error || e.message || "Failed to find duplicates");
    } finally {
      setDupLoading(false);
    }
  };

  const handleMerge = async (groupIndex) => {
    const group = dupResult.duplicate_groups[groupIndex];
    const keepId = keepSelections[groupIndex];
    if (!keepId) return;
    const deleteIds = group.incidents.filter(inc => inc.id !== keepId).map(inc => inc.id);
    setActionLoading(prev => ({ ...prev, [groupIndex]: true }));
    try {
      const res = await base44.functions.invoke("mergeIncidents", { keep_id: keepId, delete_ids: deleteIds });
      setActionResults(prev => ({ ...prev, [groupIndex]: res.data }));
    } catch (e) {
      setActionResults(prev => ({ ...prev, [groupIndex]: { error: e.response?.data?.error || e.message } }));
    } finally {
      setActionLoading(prev => ({ ...prev, [groupIndex]: false }));
    }
  };

  const handleDeleteOne = async (incidentId, groupIndex) => {
    setActionLoading(prev => ({ ...prev, [`del-${incidentId}`]: true }));
    try {
      await base44.entities.WildfireIncident.delete(incidentId);
      setActionResults(prev => ({ ...prev, [`del-${incidentId}`]: { deleted: true } }));
    } catch (e) {
      setActionResults(prev => ({ ...prev, [`del-${incidentId}`]: { error: e.message } }));
    } finally {
      setActionLoading(prev => ({ ...prev, [`del-${incidentId}`]: false }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Source Comparison Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <GitCompare className="w-5 h-5 text-indigo-600" /> Source Discrepancies
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Compares active NWS fire alerts against WildfireIncident database records (last 90 days) using a 100 km proximity radius.
            </p>
          </div>
          <Button onClick={runComparison} disabled={loading}>
            {loading ? <><Loader2 className="w-4 h-4 mr-1 animate-spin" /> Comparing...</> : <><GitCompare className="w-4 h-4 mr-1" /> Run Comparison</>}
          </Button>
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            <AlertTriangle className="w-4 h-4 inline mr-2" />{error}
          </div>
        )}

        {result && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <Card><CardContent className="pt-4 pb-4"><div className="text-xs text-gray-500 mb-1">NWS Fire Alerts</div><div className="text-2xl font-bold text-gray-900">{result.summary.nws_fire_alerts}</div></CardContent></Card>
              <Card><CardContent className="pt-4 pb-4"><div className="text-xs text-gray-500 mb-1">DB Incidents (90d)</div><div className="text-2xl font-bold text-gray-900">{result.summary.db_recent_incidents}</div></CardContent></Card>
              <Card className="border-green-200 bg-green-50"><CardContent className="pt-4 pb-4"><div className="text-xs text-green-600 mb-1">Matched</div><div className="text-2xl font-bold text-green-900">{result.summary.matched}</div></CardContent></Card>
              <Card className="border-amber-200 bg-amber-50"><CardContent className="pt-4 pb-4"><div className="text-xs text-amber-600 mb-1">NWS Only</div><div className="text-2xl font-bold text-amber-900">{result.summary.nws_only}</div></CardContent></Card>
              <Card className="border-blue-200 bg-blue-50"><CardContent className="pt-4 pb-4"><div className="text-xs text-blue-600 mb-1">DB Only</div><div className="text-2xl font-bold text-blue-900">{result.summary.db_only}</div></CardContent></Card>
            </div>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600" /> NWS Fire Alerts — No Matching Incident Record
                  <Badge variant="outline" className="bg-amber-50 text-amber-700">{result.nws_only.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {result.nws_only.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">All NWS fire alerts have matching incident records.</p>
                ) : (
                  <div className="space-y-2 max-h-[400px] overflow-y-auto">
                    {result.nws_only.map((alert, i) => (
                      <div key={alert.id || i} className="border rounded-lg p-3 bg-amber-50/50">
                        <p className="font-semibold text-sm text-gray-900">{alert.headline}</p>
                        <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1"><MapPin className="w-3 h-3" /> {alert.areaDesc}</p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                          {alert.sent && <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(alert.sent).toLocaleString()}</span>}
                          <Badge variant="outline" className="text-xs">{alert.severity}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-blue-600" /> Database Incidents — No Matching NWS Alert
                  <Badge variant="outline" className="bg-blue-50 text-blue-700">{result.db_only.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {result.db_only.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">All database incidents have matching NWS alerts.</p>
                ) : (
                  <div className="space-y-2 max-h-[400px] overflow-y-auto">
                    {result.db_only.map(inc => (
                      <div key={inc.id} className="border rounded-lg p-3 bg-blue-50/50">
                        <p className="font-semibold text-sm text-gray-900">{inc.incident_name}</p>
                        <p className="text-xs text-gray-500 mt-0.5"><MapPin className="w-3 h-3 inline mr-1" />{inc.admin2_name ? `${inc.admin2_name}, ` : ""}{inc.admin1_name}</p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                          <span>Started: {inc.start_date}</span>
                          {inc.acres_burned > 0 && <span>{Math.round(inc.acres_burned).toLocaleString()} acres</span>}
                          <Badge variant="outline" className="text-xs">{inc.severity}</Badge>
                          <Badge variant="outline" className="text-xs">{inc.source}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <hr className="border-border" />

      {/* Duplicate Detection Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Copy className="w-5 h-5 text-orange-600" /> Duplicate Detection
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Scans all WildfireIncident records for duplicates by normalized name + state, or geographic proximity (within 10 km). Merge duplicates into one record or delete individual entries.
            </p>
          </div>
          <Button variant="outline" onClick={findDuplicates} disabled={dupLoading}>
            {dupLoading ? <><Loader2 className="w-4 h-4 mr-1 animate-spin" /> Scanning...</> : <><Copy className="w-4 h-4 mr-1" /> Find Duplicates</>}
          </Button>
        </div>

        {dupError && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            <AlertTriangle className="w-4 h-4 inline mr-2" />{dupError}
          </div>
        )}

        {dupResult && (
          <>
            <div className="grid grid-cols-3 gap-3">
              <Card><CardContent className="pt-4 pb-4"><div className="text-xs text-gray-500 mb-1">Total Records</div><div className="text-2xl font-bold text-gray-900">{dupResult.total_records}</div></CardContent></Card>
              <Card className="border-orange-200 bg-orange-50"><CardContent className="pt-4 pb-4"><div className="text-xs text-orange-600 mb-1">Duplicate Groups</div><div className="text-2xl font-bold text-orange-900">{dupResult.total_groups}</div></CardContent></Card>
              <Card className="border-red-200 bg-red-50"><CardContent className="pt-4 pb-4"><div className="text-xs text-red-600 mb-1">Duplicates to Remove</div><div className="text-2xl font-bold text-red-900">{dupResult.total_duplicates}</div></CardContent></Card>
            </div>

            {dupResult.duplicate_groups.length === 0 ? (
              <Card><CardContent className="py-8 text-center text-sm text-muted-foreground">No duplicates found. All incident records are unique.</CardContent></Card>
            ) : (
              <div className="space-y-4">
                {dupResult.duplicate_groups.map((group, gi) => {
                  const isDone = actionResults[gi];
                  const isLoading = actionLoading[gi];
                  return (
                    <Card key={gi} className={isDone ? "border-green-300 bg-green-50/50" : ""}>
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <CardTitle className="text-sm flex items-center gap-2">
                            <Copy className="w-4 h-4 text-orange-600" />
                            Group {gi + 1}
                            <Badge variant="outline" className={group.match_type === 'name' ? "bg-blue-50 text-blue-700" : "bg-purple-50 text-purple-700"}>
                              {group.match_type === 'name' ? 'Name match' : 'Geo match (≤10km)'}
                            </Badge>
                            <Badge variant="outline">{group.count} records</Badge>
                          </CardTitle>
                          {!isDone && (
                            <Button size="sm" onClick={() => handleMerge(gi)} disabled={isLoading || !keepSelections[gi]}>
                              {isLoading ? <><Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> Merging...</> : <><Copy className="w-3.5 h-3.5 mr-1" /> Merge & Delete Duplicates</>}
                            </Button>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        {isDone ? (
                          <div className="flex items-center gap-2 text-sm text-green-700">
                            <CheckCircle2 className="w-4 h-4" />
                            {isDone.error ? `Error: ${isDone.error}` : `Merged into "${isDone.kept_name}". Copied fields: ${isDone.merged_fields?.join(", ") || "none"}. Deleted ${isDone.deleted_count} duplicate(s).`}
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {group.incidents.map(inc => (
                              <div key={inc.id} className={`border rounded-lg p-3 ${keepSelections[gi] === inc.id ? "border-green-400 bg-green-50/50" : "bg-white"}`}>
                                <div className="flex items-start gap-3">
                                  <input
                                    type="radio"
                                    name={`group-${gi}`}
                                    checked={keepSelections[gi] === inc.id}
                                    onChange={() => setKeepSelections(prev => ({ ...prev, [gi]: inc.id }))}
                                    className="mt-1"
                                  />
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <p className="font-semibold text-sm text-gray-900">{inc.incident_name}</p>
                                      {keepSelections[gi] === inc.id && <Badge className="bg-green-100 text-green-800 text-xs">KEEP</Badge>}
                                      <Badge variant="outline" className="text-xs">{inc.source}</Badge>
                                      <Badge variant="outline" className="text-xs">{inc.severity}</Badge>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-0.5">
                                      <MapPin className="w-3 h-3 inline mr-1" />
                                      {inc.admin2_name ? `${inc.admin2_name}, ` : ""}{inc.admin1_name}
                                      {inc.latitude && ` · ${inc.latitude.toFixed(2)}, ${inc.longitude.toFixed(2)}`}
                                    </p>
                                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                                      <span>Started: {inc.start_date}</span>
                                      {inc.acres_burned > 0 && <span>{Math.round(inc.acres_burned).toLocaleString()} acres</span>}
                                      {inc.containment_date && <span>Contained: {inc.containment_date}</span>}
                                      {inc.responding_organizations?.length > 0 && <span>Orgs: {inc.responding_organizations.join(", ")}</span>}
                                    </div>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-red-500 hover:text-red-700 hover:bg-red-50"
                                    onClick={() => handleDeleteOne(inc.id, gi)}
                                    disabled={actionLoading[`del-${inc.id}`] || keepSelections[gi] === inc.id}
                                    title={keepSelections[gi] === inc.id ? "Can't delete the record you're keeping" : "Delete this record"}
                                  >
                                    {actionLoading[`del-${inc.id}`] ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                                  </Button>
                                </div>
                                {actionResults[`del-${inc.id}`]?.deleted && (
                                  <p className="text-xs text-green-600 mt-1">Deleted. Refresh duplicates to update.</p>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}