import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Loader2, Save, RefreshCw, Mail } from "lucide-react";

const DEFAULT_TEMPLATES = [
  {
    audience_key: "general",
    label: "Workplace Preparedness",
    subject: "Fire marshal compliance & emergency tracking for your business",
    intro: "RallyPack helps businesses stay inspection-ready. Track first aid kits across every floor with automatic expiry alerts, document evacuation plans and assembly points, maintain your floor warden roster, and send emergency notifications to your whole team — all from one dashboard.",
    learn_path: "/BusinessOnboarding",
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