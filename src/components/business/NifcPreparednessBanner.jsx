import React from "react";
import { Flame, RefreshCw, AlertTriangle } from "lucide-react";
import { NIFC_OUTLOOK_META, getActiveFireRegions } from "@/lib/nifcOutlook";

const STALE_MS = 24 * 60 * 60 * 1000;

// Freshness-aware NIFC preparedness banner. The forecast meta (preparedness
// level, active regions, period) is seasonal and sourced from NIFC; the
// burned-acreage / wildfire counts are data-driven from tracked incidents, and
// the "data as of" line + stale badge reflect the last NIFC sync — never
// presenting old numbers as current.
export default function NifcPreparednessBanner({ nifc, usSeason, onRefresh, refreshing }) {
  const now = new Date();
  const month = now.getMonth() + 1;
  const activeRegions = getActiveFireRegions(month);
  const lastAt = nifc?.last_imported_at ? new Date(nifc.last_imported_at) : null;
  const stale = !lastAt || now - lastAt > STALE_MS;
  const outlookStale = NIFC_OUTLOOK_META.nextIssuance && new Date(NIFC_OUTLOOK_META.nextIssuance) < now;

  const asOfLabel = lastAt
    ? `Data as of ${lastAt.toLocaleString()}`
    : "No NIFC sync yet — showing tracked incident totals";

  return (
    <div
      className={`flex items-start gap-3 rounded-lg border px-4 py-3 ${
        stale ? "border-amber-300 bg-amber-50" : "border-orange-300 bg-orange-50"
      }`}
    >
      <Flame className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
      <div className="text-sm flex-1 min-w-0">
        <p className="font-semibold text-orange-900">
          National Preparedness Level {NIFC_OUTLOOK_META.preparednessLevel}/{NIFC_OUTLOOK_META.preparednessLevelMax} — {activeRegions.length} above-normal fire potential region(s) active this month
        </p>
        <p className="text-xs text-orange-700 mt-0.5">
          {usSeason
            ? `${usSeason.acres.toLocaleString()} acres · ${usSeason.incidents.toLocaleString()} wildfires tracked in ${usSeason.year}`
            : "—"}{" "}
          · {asOfLabel}
          {stale && (
            <span className="ml-1 inline-flex items-center gap-1 text-amber-700 font-medium">
              <AlertTriangle className="w-3 h-3" />
              {!lastAt ? "Awaiting first sync" : "Stale — refresh"}
            </span>
          )}
        </p>
        <p className="text-[11px] text-orange-600/70 mt-0.5">
          Source: {NIFC_OUTLOOK_META.source}
          {outlookStale ? " · outlook pending update" : ""}
        </p>
      </div>
      <button
        onClick={onRefresh}
        disabled={refreshing}
        className="shrink-0 inline-flex items-center gap-1 text-xs font-medium text-orange-800 hover:text-orange-900 disabled:opacity-50"
        title="Refresh NIFC data"
      >
        <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
        {refreshing ? "Syncing…" : "Refresh"}
      </button>
    </div>
  );
}