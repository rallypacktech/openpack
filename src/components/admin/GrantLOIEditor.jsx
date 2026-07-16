import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from "@/components/ui/dialog";
import { GRANT_CATEGORY_LABELS, LOI_STAGES } from "@/lib/grantLibrary";
import { Save, X, FileText, ExternalLink } from "lucide-react";

const SECTIONS = [
  { key: "need", label: "Statement of Need", placeholder: "Describe the problem this grant addresses..." },
  { key: "approach", label: "Project Approach", placeholder: "How RallyPack addresses this need..." },
  { key: "impact", label: "Expected Impact", placeholder: "Measurable outcomes and target population..." },
  { key: "budget_summary", label: "Budget Summary", placeholder: "High-level budget allocation..." },
  { key: "org_capacity", label: "Organizational Capacity", placeholder: "RallyPack's relevant experience and infrastructure..." }
];

export default function GrantLOIEditor({ loi, open, onClose, onSave }) {
  const [form, setForm] = useState(null);

  useEffect(() => {
    if (loi) {
      setForm({
        ...loi,
        loi_sections: loi.loi_sections || { need: "", approach: "", impact: "", budget_summary: "", org_capacity: "" }
      });
    }
  }, [loi]);

  if (!form) return null;

  const updateSection = (key, value) => {
    setForm({ ...form, loi_sections: { ...form.loi_sections, [key]: value } });
  };

  const handleSave = () => {
    // Compose a combined markdown draft from sections
    const draft = SECTIONS.map(s => `## ${s.label}\n\n${form.loi_sections[s.key] || "_Not yet completed._"}`).join("\n\n");
    onSave({ ...form, loi_draft: draft });
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <FileText className="w-5 h-5 text-primary" />
            Draft LOI — {form.grant_name}
          </DialogTitle>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-muted-foreground">{form.funder_name}</span>
            <span className="px-2 py-0.5 rounded bg-secondary text-foreground">
              {GRANT_CATEGORY_LABELS[form.grant_category] || form.grant_category}
            </span>
            {form.grant_url && (
              <a href={form.grant_url} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-primary hover:underline">
                Grant page <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Stage</Label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full mt-1 border rounded px-2 py-1.5 text-sm bg-background"
              >
                {LOI_STAGES.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
              </select>
            </div>
            <div>
              <Label className="text-xs">Amount Requested ($)</Label>
              <Input
                type="number"
                value={form.amount_requested || ""}
                onChange={(e) => setForm({ ...form, amount_requested: Number(e.target.value) || 0 })}
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs">Deadline</Label>
              <Input
                type="date"
                value={form.deadline || ""}
                onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs">Assigned To</Label>
              <Input
                type="email"
                value={form.assigned_to || ""}
                onChange={(e) => setForm({ ...form, assigned_to: e.target.value })}
                placeholder="admin@rallypack.org"
                className="mt-1"
              />
            </div>
          </div>

          <div className="border-t pt-4">
            <p className="text-sm font-semibold text-foreground mb-3">LOI Sections</p>
            <div className="space-y-4">
              {SECTIONS.map(section => (
                <div key={section.key}>
                  <Label className="text-xs font-semibold">{section.label}</Label>
                  <Textarea
                    value={form.loi_sections[section.key] || ""}
                    onChange={(e) => updateSection(section.key, e.target.value)}
                    placeholder={section.placeholder}
                    className="mt-1 min-h-[80px] text-sm"
                  />
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-xs">Internal Review Notes</Label>
            <Textarea
              value={form.review_notes || ""}
              onChange={(e) => setForm({ ...form, review_notes: e.target.value })}
              placeholder="Reviewer feedback, gaps to address, next steps..."
              className="mt-1 min-h-[60px] text-sm"
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} size="sm">
            <X className="w-4 h-4 mr-1" /> Cancel
          </Button>
          <Button onClick={handleSave} size="sm">
            <Save className="w-4 h-4 mr-1" /> Save Draft
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}