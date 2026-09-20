import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Scale } from "lucide-react";

// The standing obligations a business carries under the selected country's
// fire code and workplace safety law.
export default function RegulatoryRequirements({ region }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Scale className="w-4 h-4 text-primary" aria-hidden="true" />
          Regulatory Requirements
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-muted-foreground font-sans mb-3">{region.framework}.</p>
        <ul className="space-y-2">
          {region.requirements.map((req) => (
            <li key={req} className="flex items-start gap-2 text-sm font-sans text-muted-foreground">
              <span className="text-primary shrink-0 mt-0.5" aria-hidden="true">§</span>
              <span>{req}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}