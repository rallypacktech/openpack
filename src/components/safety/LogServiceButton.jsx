import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Loader2 } from "lucide-react";
import { nextServiceDates } from "@/lib/safetyIntervals";

// One-tap "I checked / replaced this" — records today as the last check and
// advances the next due date by the record's interval so it never goes stale.
export default function LogServiceButton({ record, onLogged, label = "Log check" }) {
  const [saving, setSaving] = useState(false);

  const handleLog = async () => {
    setSaving(true);
    try {
      await base44.entities.ComplianceRecord.update(record.id, nextServiceDates(record));
      onLogged();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Button
      size="sm"
      variant="outline"
      className="gap-1.5 h-7 text-xs"
      onClick={handleLog}
      disabled={saving}
      title="Marks it checked today and sets the next due date"
    >
      {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
      {label}
    </Button>
  );
}