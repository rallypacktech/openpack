import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Check, X, Save, Loader2 } from "lucide-react";

const STATUS_LABELS = {
  queued: "Not translated",
  draft: "Awaiting review",
  approved: "Approved",
  rejected: "Rejected",
};

/** One string: English source, DeepL draft, and the reviewer's version side by side. */
export default function TranslationRow({ entry, reviewerEmail, onSaved }) {
  const [text, setText] = useState(entry.human_text || entry.machine_text || "");
  const [saving, setSaving] = useState(null);

  const save = async (status) => {
    setSaving(status);
    try {
      const patch = {
        // Keep the machine draft untouched so the two versions stay comparable.
        human_text: text === (entry.machine_text || "") ? "" : text,
        status,
      };
      if (status !== "draft") {
        patch.reviewed_by = reviewerEmail;
        patch.reviewed_at = new Date().toISOString();
      }
      await base44.entities.TranslationEntry.update(entry.id, patch);
      onSaved();
    } finally {
      setSaving(null);
    }
  };

  const busy = saving !== null;
  const edited = text !== (entry.machine_text || "");

  return (
    <div className="border border-border rounded-lg bg-card p-4">
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <Badge variant="secondary" className="text-[10px] uppercase tracking-wider">
          {STATUS_LABELS[entry.status] || entry.status}
        </Badge>
        {entry.page_key && (
          <span className="text-xs text-muted-foreground font-mono">{entry.page_key}</span>
        )}
        {entry.reviewed_by && (
          <span className="text-xs text-muted-foreground">reviewed by {entry.reviewed_by}</span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">English source</p>
          <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">{entry.source_text}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">DeepL draft</p>
          <p className="text-sm text-foreground/60 leading-relaxed whitespace-pre-wrap">
            {entry.machine_text || <span className="italic">Not translated yet</span>}
          </p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">
            Published translation{edited ? " (edited)" : ""}
          </p>
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={4}
            className="text-sm"
            placeholder="Edit the wording, or approve the draft as it stands."
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mt-3">
        <Button size="sm" onClick={() => save("approved")} disabled={busy || !text.trim()}>
          {saving === "approved" ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <Check className="w-3.5 h-3.5 mr-1.5" />}
          Approve &amp; publish
        </Button>
        <Button size="sm" variant="outline" onClick={() => save("draft")} disabled={busy}>
          {saving === "draft" ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <Save className="w-3.5 h-3.5 mr-1.5" />}
          Save draft
        </Button>
        <Button size="sm" variant="ghost" onClick={() => save("rejected")} disabled={busy}>
          <X className="w-3.5 h-3.5 mr-1.5" />
          Reject
        </Button>
      </div>
    </div>
  );
}