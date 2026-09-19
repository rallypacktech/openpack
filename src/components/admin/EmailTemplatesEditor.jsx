import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Loader2, Save, RefreshCw, Mail } from "lucide-react";
import { VOUCHER_CODE } from "@/lib/fireMarshalVoucher";
import { GENERAL_VOUCHER_CODE } from "@/lib/generalVoucher";

const DEFAULT_TEMPLATES = [
  {
    audience_key: "general",
    label: "Workplace Preparedness",
    subject: "Fire safety compliance & emergency tracking for your business",
    intro: "RallyPack helps businesses stay inspection-ready. Track first aid kits across every floor with automatic expiry alerts, document evacuation plans and assembly points, maintain your floor warden roster, and send emergency notifications to your whole team — all from one dashboard.",
    learn_path: "/BusinessOnboarding",
    voucher_code: GENERAL_VOUCHER_CODE,
  },
  {
    audience_key: "equine",
    label: "Equine Emergency Preparedness",
    subject: "Equine emergency preparedness — a free resource for your clients",
    intro: "RallyPack offers free, species-specific emergency preparedness resources for horse owners — including evacuation planning, trailer logistics, Coggins test tracking, and emergency feed protocols. As an equine business, you can help your clients protect their horses when disasters strike.",
    learn_path: "/equine",
  },
  {
    audience_key: "canine",
    label: "Canine Emergency Preparedness",
    subject: "Canine emergency preparedness — a free resource for your clients",
    intro: "RallyPack offers free, species-specific emergency preparedness resources for dog owners — including transport planning, medical record storage, 72-hour supply kits, and shelter logistics. As a canine-focused business, you can help your clients keep their dogs safe during emergencies.",
    learn_path: "/canine",
  },
  {
    audience_key: "feline",
    label: "Feline Emergency Preparedness",
    subject: "Feline emergency preparedness — a free resource for your clients",
    intro: "RallyPack offers free, species-specific emergency preparedness resources for cat owners — including carrier training, medical records, and shelter logistics. As a feline-focused business, you can help your clients protect their cats during disasters.",
    learn_path: "/feline",
  },
  {
    audience_key: "infant",
    label: "Infant Emergency Preparedness",
    subject: "Infant emergency preparedness — a free resource for your clients",
    intro: "RallyPack offers free emergency preparedness resources for parents of infants — including formula and supply checklists, medical record storage, and evacuation planning. As a business serving families with infants, you can help your clients protect their youngest during emergencies.",
    learn_path: "/infant",
  },
  {
    audience_key: "avian",
    label: "Avian Emergency Preparedness",
    subject: "Avian emergency preparedness — a free resource for your clients",
    intro: "RallyPack offers free, species-specific emergency preparedness resources for bird owners — including respiratory safety, transport containers, and temperature control. As an avian-focused business, you can help your clients protect their birds during disasters.",
    learn_path: "/avian",
  },
  {
    audience_key: "reptile",
    label: "Reptile Emergency Preparedness",
    subject: "Reptile emergency preparedness — a free resource for your clients",
    intro: "RallyPack offers free, species-specific emergency preparedness resources for reptile owners — including temperature control, transport containers, and food supply planning. As a reptile-focused business, you can help your clients protect their reptiles during disasters.",
    learn_path: "/reptile",
  },
  {
    audience_key: "livestock",
    label: "Livestock Emergency Preparedness",
    subject: "Livestock emergency preparedness — a free resource for your clients",
    intro: "RallyPack offers free, species-specific emergency preparedness resources for livestock owners — including evacuation logistics, trailer capacity planning, and destination coordination. As a livestock-focused business, you can help your clients protect their animals during disasters.",
    learn_path: "/livestock",
  },
  {
    audience_key: "wildfire",
    label: "Wildfire Preparedness",
    subject: "Is your community ready for wildfire season? A free resource from RallyPack",
    intro: "RallyPack provides free, real-time wildfire alerts, go-bag checklists, and evacuation planning tools for families in fire-prone areas. Whether you're a business in a high-risk region or serve clients who are, share this resource to help your community prepare before a fire starts.",
    learn_path: "/wildfire",
    voucher_code: VOUCHER_CODE,
  },
  {
    audience_key: "flood",
    label: "Flood Preparedness",
    subject: "Flood season is coming — free preparedness resources for your community",
    intro: "RallyPack provides free flood preparedness guides, emergency supply checklists, and shelter-in-place vs. evacuation guidance for families in flood-prone areas. Help your employees or clients know what to do before floodwaters rise.",
    learn_path: "/flood",
  },
  {
    audience_key: "hurricane",
    label: "Hurricane Preparedness",
    subject: "Hurricane season preparedness — a free resource for your team and community",
    intro: "RallyPack offers free hurricane preparedness resources including evacuation planning, go-bag checklists, and real-time storm alerts. As a business in a coastal or storm-prone area, you can help your employees and clients plan ahead before the season peaks.",
    learn_path: "/hurricane",
  },
  {
    audience_key: "tornado",
    label: "Tornado Preparedness",
    subject: "Tornado season alert — free preparedness resources for your community",
    intro: "RallyPack provides free tornado preparedness guidance including shelter-in-place protocols, family communication plans, and emergency supply checklists. Share this resource with your team or community to help everyone know what to do when a tornado warning sounds.",
    learn_path: "/tornado",
  },
  {
    audience_key: "hoa",
    label: "Homeowner Association (HOA)",
    subject: "A free preparedness resource for your neighborhood — from RallyPack",
    intro: "RallyPack is a free, open-source emergency preparedness platform that helps families build go-bags, evacuation plans, and emergency supply caches — making it a great resource to share with your entire neighborhood. We'd love to encourage you to add our free Readiness Quiz to your next HOA newsletter so every resident can quickly check how prepared they really are.",
    learn_path: "/ReadinessQuiz",
  },
  {
    audience_key: "fire_marshal",
    label: "Fire Safety & Prevention",
    subject: "A free year of RallyPack — and a request for your inspection expertise",
    intro: "We built RallyPack with input from the fire service: a dashboard where a business logs its first aid kits, AED units, batteries, pads, staff CPR/first aid/AED certifications, and fire equipment inspections, and gets reminded before anything expires. The goal is that nothing lapses between inspections.\n\nWe would like your candid feedback on whether this actually helps a building prepare for an inspection. In return, your first year of the Professional plan is free.",
    learn_path: "/BusinessOnboarding",
    voucher_code: VOUCHER_CODE,
  },
  {
    audience_key: "commercial_property",
    label: "Commercial Property Preparedness",
    subject: "Fire safety readiness & emergency tracking for your properties",
    intro: "RallyPack helps commercial landlords and office park managers stay inspection-ready across every building — track first aid kits by floor with automatic expiry alerts, document evacuation plans and assembly points, maintain your floor warden roster, and send emergency notifications to tenants and staff. One dashboard proves every property is compliant.",
    learn_path: "/BusinessOnboarding",
  },
];

export default function EmailTemplatesEditor() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState(null);

  const loadTemplates = useCallback(async () => {
    try {
      const data = await base44.entities.EmailTemplate.list();
      const byKey = {};
      data.forEach((t) => { byKey[t.audience_key] = t; });

      const merged = DEFAULT_TEMPLATES.map((def) => {
        const existing = byKey[def.audience_key];
        if (existing) {
          return {
            ...def,
            id: existing.id,
            label: existing.label || def.label,
            subject: existing.subject || def.subject,
            intro: existing.intro || def.intro,
            learn_path: existing.learn_path || def.learn_path,
            voucher_code: existing.voucher_code || def.voucher_code || "",
          };
        }
        return { ...def };
      });

      setTemplates(merged);
    } catch (error) {
      console.error("Error loading templates:", error);
      setTemplates(DEFAULT_TEMPLATES.map((t) => ({ ...t })));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

  const handleChange = (audienceKey, field, value) => {
    setTemplates((prev) =>
      prev.map((t) =>
        t.audience_key === audienceKey ? { ...t, [field]: value } : t
      )
    );
  };

  const handleSave = async (template) => {
    setSavingKey(template.audience_key);
    try {
      const payload = {
        audience_key: template.audience_key,
        label: template.label,
        subject: template.subject,
        intro: template.intro,
        learn_path: template.learn_path,
        voucher_code: template.voucher_code || "",
      };
      if (template.id) {
        await base44.entities.EmailTemplate.update(template.id, payload);
      } else {
        const created = await base44.entities.EmailTemplate.create(payload);
        setTemplates((prev) =>
          prev.map((t) =>
            t.audience_key === template.audience_key
              ? { ...t, id: created.id }
              : t
          )
        );
      }
    } catch (error) {
      console.error("Error saving template:", error);
      window.alert("Failed to save: " + (error.message || "Unknown error"));
    } finally {
      setSavingKey(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Mail className="w-5 h-5" /> Email Templates
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Edit the subject, intro, and landing page for each audience type. Changes apply to all future referral emails.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={loadTemplates}>
          <RefreshCw className="w-4 h-4 mr-2" /> Refresh
        </Button>
      </div>

      {templates.map((tpl) => (
        <Card key={tpl.audience_key}>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <CardTitle className="text-base">{tpl.label}</CardTitle>
              <Badge variant="outline" className="text-xs">
                {tpl.audience_key}
              </Badge>
              {tpl.id && (
                <Badge variant="secondary" className="text-xs bg-green-50 text-green-700">
                  Saved
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label className="text-xs">Subject Line</Label>
              <Input
                value={tpl.subject}
                onChange={(e) => handleChange(tpl.audience_key, "subject", e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs">Intro Paragraph</Label>
              <Textarea
                value={tpl.intro}
                onChange={(e) => handleChange(tpl.audience_key, "intro", e.target.value)}
                rows={3}
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs">Learn More Button Path</Label>
              <Input
                value={tpl.learn_path}
                onChange={(e) => handleChange(tpl.audience_key, "learn_path", e.target.value)}
                className="mt-1"
                placeholder="/BusinessOnboarding"
              />
            </div>
            <div>
              <Label className="text-xs">Voucher Promo Code (optional)</Label>
              <Input
                value={tpl.voucher_code || ""}
                onChange={(e) => handleChange(tpl.audience_key, "voucher_code", e.target.value)}
                className="mt-1"
                placeholder="Leave empty for no voucher"
              />
            </div>
            <div className="flex justify-end">
              <Button
                size="sm"
                onClick={() => handleSave(tpl)}
                disabled={savingKey === tpl.audience_key}
              >
                {savingKey === tpl.audience_key ? (
                  <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                ) : (
                  <Save className="w-3.5 h-3.5 mr-1.5" />
                )}
                Save
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}