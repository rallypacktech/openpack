import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Check, ExternalLink } from "lucide-react";
import { FIT_GROUPS, EXPO_CONTACTS } from "@/lib/expoContacts";

export default function ExpoContactGroups({ prospects, onAdd }) {
  const isAdded = (c) =>
    prospects.some(
      (p) => p.organization_name === c.org && (p.contact_name || "") === (c.contact || "")
    );

  return (
    <div className="space-y-4">
      {FIT_GROUPS.map((group) => {
        const contacts = EXPO_CONTACTS.filter((c) => c.fit === group.id);
        if (contacts.length === 0) return null;
        return (
          <div key={group.id} className="border border-border rounded-lg bg-card overflow-hidden">
            <div className="px-4 sm:px-5 py-3 bg-secondary/50 border-b border-border">
              <p className="font-sans font-semibold text-sm text-foreground">{group.label}</p>
              <p className="text-xs text-muted-foreground font-sans">{group.need}</p>
            </div>
            <div className="divide-y divide-border">
              {contacts.map((c) => (
                <div key={c.org + (c.contact || "")} className="flex flex-wrap items-start gap-3 px-4 sm:px-5 py-3">
                  <div className="flex-1 min-w-[200px]">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-sans font-semibold text-sm text-foreground">{c.org}</span>
                      {c.contact && (
                        <span className="text-xs text-muted-foreground font-sans">
                          {c.contact}{c.role ? ` · ${c.role}` : ""}
                        </span>
                      )}
                      {c.booth && <Badge variant="outline" className="text-[10px]">Booth {c.booth}</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground font-sans mt-1">{c.goal}</p>
                    {c.url && (
                      <a
                        href={c.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-primary mt-1 hover:underline"
                      >
                        {c.source} <ExternalLink className="w-3 h-3" aria-hidden="true" />
                      </a>
                    )}
                  </div>
                  {isAdded(c) ? (
                    <Badge className="bg-green-100 text-green-800 shrink-0 gap-1">
                      <Check className="w-3 h-3" aria-hidden="true" /> Added
                    </Badge>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      className="shrink-0 gap-1"
                      onClick={() =>
                        onAdd({
                          organization_name: c.org,
                          contact_name: c.contact || "",
                          contact_role: c.role || "",
                          partnership_fit: c.fit,
                          conversation_goal: c.goal,
                          rallypack_need: group.need,
                          source: c.source,
                        })
                      }
                    >
                      <Plus className="w-3.5 h-3.5" aria-hidden="true" /> Add
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}