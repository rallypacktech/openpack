import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import ComplianceRegionSelector from "@/components/compliance/ComplianceRegionSelector";
import InspectionSchedule from "@/components/compliance/InspectionSchedule";
import RegulatoryRequirements from "@/components/compliance/RegulatoryRequirements";
import ComplianceChecklist from "@/components/compliance/ComplianceChecklist";
import { getComplianceRegion } from "@/lib/complianceFrameworks";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Building2, ShieldCheck } from "lucide-react";

export default function GlobalCompliance() {
  const [regionCode, setRegionCode] = useState("US");
  const region = getComplianceRegion(regionCode);

  useEffect(() => {
    document.title = "Global Compliance Portal | RallyPack";
  }, []);

  return (
    <div className="min-h-screen bg-cream font-sans">
      {/* Header */}
      <section className="border-b border-border bg-card">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <p className="text-[10px] uppercase tracking-[0.3em] text-primary font-semibold mb-4">
            Business &amp; Organizations
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4 leading-tight">
            Global Compliance Portal
          </h1>
          <p className="text-base text-muted-foreground max-w-2xl leading-relaxed">
            Fire codes, safety inspections and regulatory requirements change at every border. Pick
            the country your organization operates in and work from the framework that actually
            applies to you — covering Canada, Australia, Ireland, the United Kingdom and the United
            States.
          </p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-6">
        <ComplianceRegionSelector value={regionCode} onChange={setRegionCode} />

        {/* Region summary */}
        <Card>
          <CardContent className="p-5">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center shrink-0">
                <Building2 className="w-4 h-4 text-primary" aria-hidden="true" />
              </div>
              <div>
                <h2 className="font-sans font-semibold text-foreground text-sm mb-1">
                  {region.label} — regulating authority
                </h2>
                <p className="text-sm text-muted-foreground mb-2">{region.authority}</p>
                <p className="text-xs text-muted-foreground flex items-start gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 shrink-0 mt-0.5" aria-hidden="true" />
                  <span>Inspected against {region.framework}.</span>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Schedule + requirements */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InspectionSchedule region={region} />
          <RegulatoryRequirements region={region} />
        </div>

        {/* Interactive checklist */}
        <ComplianceChecklist region={region} />

        <p className="text-xs text-muted-foreground">
          This portal is general guidance for planning and self-inspection. Always confirm current
          requirements with your local authority having jurisdiction — nothing here replaces a
          formal inspection or professional advice.
        </p>

        {/* CTA */}
        <Card className="bg-card">
          <CardContent className="p-6 sm:p-8">
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-foreground mb-2">
              Track it, don't just read it
            </h2>
            <p className="text-sm text-muted-foreground max-w-xl mb-5 leading-relaxed">
              RallyPack business accounts log every kit, certification and piece of safety equipment
              against its expiry date — so an inspection never catches you out.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                to="/BusinessOnboarding"
                className="inline-flex items-center justify-center gap-2 bg-foreground text-background font-semibold text-xs px-6 py-3 rounded hover:bg-foreground/90 transition-colors tracking-widest uppercase"
              >
                Set up a business account
                <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </Link>
              <Link
                to="/BusinessDashboard"
                className="inline-flex items-center justify-center gap-2 border border-border text-foreground font-semibold text-xs px-6 py-3 rounded hover:bg-secondary/50 transition-colors tracking-widest uppercase"
              >
                Go to your dashboard
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}