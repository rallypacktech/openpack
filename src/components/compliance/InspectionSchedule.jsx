import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarClock } from "lucide-react";

// What gets inspected, and how often, for the selected country.
export default function InspectionSchedule({ region }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <CalendarClock className="w-4 h-4 text-primary" aria-hidden="true" />
          Inspection Schedule
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-muted-foreground font-sans mb-3">
          Inspection cadence for {region.label}. Confirm exact intervals with{" "}
          {region.authority.charAt(0).toLowerCase() + region.authority.slice(1)}.
        </p>
        <div className="divide-y divide-border">
          {region.inspections.map((row) => (
            <div key={row.item} className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4 py-2.5">
              <span className="text-sm font-sans font-medium text-foreground sm:w-1/2">{row.item}</span>
              <span className="text-sm font-sans text-muted-foreground sm:w-1/2">{row.cadence}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}