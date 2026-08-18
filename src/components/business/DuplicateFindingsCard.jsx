import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Copy, GitMerge, Layers, AlertTriangle } from "lucide-react";

function fmt(n) {
  if (!n && n !== 0) return "0";
  return Math.round(n).toLocaleString();
}

// Read-only summary of the wildfire merge audit. Surfaces how many
// double-counted fires were found and the net hectares corrected — the
// "story" behind honest totals. Restore/admin actions stay in the admin
// MergeAuditPanel; this card never exposes them.
export default function DuplicateFindingsCard({ mergeAudit }) {
  const m = mergeAudit || {
    total_merges: 0,
    double_counted_fires: 0,
    continuing_incident_double_counts: 0,
    net_hectares_corrected: 0,
  };

  if (m.total_merges === 0) {
    return (
      <Card>
        <CardContent className="pt-5">
          <div className="flex items-start gap-3">
            <GitMerge className="w-5 h-5 text-sage shrink-0 mt-0.5" />
            <div>
              <h3 className="font-serif text-base font-bold text-foreground">No double-counted fires detected</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Every tracked wildfire is a distinct incident — the dataset is clean.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <GitMerge className="w-4 h-4" /> Data Integrity — Duplicate Findings
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
          Some wildfires are reported by multiple agencies — for example a NASA FIRMS
          satellite hotspot and a CAL FIRE ground report for the same blaze. RallyPack
          merges these so each fire is counted once, keeping the totals above honest.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Stat icon={GitMerge} label="Merges performed" value={fmt(m.total_merges)} />
          <Stat icon={Copy} label="Double-counted fires removed" value={fmt(m.double_counted_fires)} />
          <Stat icon={AlertTriangle} label="Continuing-incident double-counts" value={fmt(m.continuing_incident_double_counts)} />
          <Stat icon={Layers} label="Net hectares corrected" value={`${fmt(m.net_hectares_corrected)} ha`} />
        </div>
      </CardContent>
    </Card>
  );
}

function Stat({ icon: Icon, label, value }) {
  return (
    <div className="rounded-lg border border-border bg-muted/30 p-3">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
        <Icon className="w-3.5 h-3.5" /> {label}
      </div>
      <div className="text-xl font-bold text-foreground">{value}</div>
    </div>
  );
}