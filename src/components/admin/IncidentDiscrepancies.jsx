import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GitCompare, RefreshCw, AlertTriangle, MapPin, Clock, Loader2 } from "lucide-react";

export default function IncidentDiscrepancies() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

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

  return (
    <div className="space-y-4">
      {/* Header */}
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
          <AlertTriangle className="w-4 h-4 inline mr-2" />
          {error}
        </div>
      )}

      {result && (
        <>
          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <Card>
              <CardContent className="pt-4 pb-4">
                <div className="text-xs text-gray-500 mb-1">NWS Fire Alerts</div>
                <div className="text-2xl font-bold text-gray-900">{result.summary.nws_fire_alerts}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 pb-4">
                <div className="text-xs text-gray-500 mb-1">DB Incidents (90d)</div>
                <div className="text-2xl font-bold text-gray-900">{result.summary.db_recent_incidents}</div>
              </CardContent>
            </Card>
            <Card className="border-green-200 bg-green-50">
              <CardContent className="pt-4 pb-4">
                <div className="text-xs text-green-600 mb-1">Matched</div>
                <div className="text-2xl font-bold text-green-900">{result.summary.matched}</div>
              </CardContent>
            </Card>
            <Card className="border-amber-200 bg-amber-50">
              <CardContent className="pt-4 pb-4">
                <div className="text-xs text-amber-600 mb-1">NWS Only (no DB record)</div>
                <div className="text-2xl font-bold text-amber-900">{result.summary.nws_only}</div>
              </CardContent>
            </Card>
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="pt-4 pb-4">
                <div className="text-xs text-blue-600 mb-1">DB Only (no NWS alert)</div>
                <div className="text-2xl font-bold text-blue-900">{result.summary.db_only}</div>
              </CardContent>
            </Card>
          </div>

          {/* NWS Only — alerts with no matching DB incident */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                NWS Fire Alerts — No Matching Incident Record
                <Badge variant="outline" className="bg-amber-50 text-amber-700">{result.nws_only.length}</Badge>
              </CardTitle>
              <p className="text-xs text-muted-foreground">These fire-related NWS alerts have no corresponding WildfireIncident in the database within {result.match_radius_km} km. Consider importing them.</p>
            </CardHeader>
            <CardContent>
              {result.nws_only.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">All NWS fire alerts have matching incident records. No discrepancies.</p>
              ) : (
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {result.nws_only.map((alert, i) => (
                    <div key={alert.id || i} className="border rounded-lg p-3 bg-amber-50/50">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm text-gray-900">{alert.headline}</p>
                          <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> {alert.areaDesc}
                          </p>
                          <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                            {alert.sent && (
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" /> {new Date(alert.sent).toLocaleString()}
                              </span>
                            )}
                            <Badge variant="outline" className="text-xs">{alert.severity}</Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* DB Only — incidents with no matching NWS alert */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-blue-600" />
                Database Incidents — No Matching NWS Alert
                <Badge variant="outline" className="bg-blue-50 text-blue-700">{result.db_only.length}</Badge>
              </CardTitle>
              <p className="text-xs text-muted-foreground">Uncontained wildfire incidents in the database with no active NWS alert nearby. May indicate the fire is no longer triggering NWS alerts, or data is stale.</p>
            </CardHeader>
            <CardContent>
              {result.db_only.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">All database incidents have matching NWS alerts. No discrepancies.</p>
              ) : (
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {result.db_only.map((inc) => (
                    <div key={inc.id} className="border rounded-lg p-3 bg-blue-50/50">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm text-gray-900">{inc.incident_name}</p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            <MapPin className="w-3 h-3 inline mr-1" />
                            {inc.admin2_name ? `${inc.admin2_name}, ` : ""}{inc.admin1_name}
                          </p>
                          <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                            <span>Started: {inc.start_date}</span>
                            {inc.acres_burned > 0 && <span>{Math.round(inc.acres_burned).toLocaleString()} acres</span>}
                            <Badge variant="outline" className="text-xs">{inc.severity}</Badge>
                            <Badge variant="outline" className="text-xs">{inc.source}</Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <p className="text-xs text-gray-400 text-center">
            Comparison run at {new Date(result.fetched_at).toLocaleString()} · Match radius: {result.match_radius_km} km
          </p>
        </>
      )}
    </div>
  );
}