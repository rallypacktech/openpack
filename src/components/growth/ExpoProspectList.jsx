import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Pencil } from "lucide-react";

const STATUSES = ["identified", "contacted", "in_conversation", "partnered", "declined"];

export default function ExpoProspectList({ prospects, onStatus, onDelete, onEdit }) {
  if (prospects.length === 0) {
    return (
      <p className="text-sm text-muted-foreground font-sans border border-dashed border-border rounded-lg p-6 text-center">
        No prospects recorded yet. Add one from the list above, or add a contact manually.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {prospects.map((p) => (
        <div key={p.id} className="flex flex-wrap items-center gap-3 border border-border rounded-lg bg-card px-4 py-3">
          <div className="flex-1 min-w-[160px]">
            <p className="font-sans font-semibold text-sm text-foreground">{p.organization_name}</p>
            <p className="text-xs text-muted-foreground font-sans">
              {p.contact_name || "No contact yet"}{p.contact_role ? ` · ${p.contact_role}` : ""}
            </p>
          </div>
          <Badge variant="outline" className="text-[10px]">{(p.partnership_fit || "other").replace(/_/g, " ")}</Badge>
          <Select value={p.status || "identified"} onValueChange={(v) => onStatus(p.id, v)}>
            <SelectTrigger className="w-[150px] h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              {STATUSES.map((s) => (
                <SelectItem key={s} value={s}>{s.replace(/_/g, " ")}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button size="icon" variant="ghost" onClick={() => onEdit(p)} aria-label={`Edit ${p.organization_name}`}>
            <Pencil className="w-3.5 h-3.5" aria-hidden="true" />
          </Button>
          <Button size="icon" variant="ghost" onClick={() => onDelete(p.id)} aria-label={`Delete ${p.organization_name}`}>
            <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
          </Button>
        </div>
      ))}
    </div>
  );
}