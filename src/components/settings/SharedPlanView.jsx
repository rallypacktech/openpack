import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MapPin, Package, Users } from "lucide-react";

// A read-only look at a plan someone has shared. Nothing here is editable and
// nothing is copied into the viewer's own account — the owner keeps control.

export default function SharedPlanView({ open, onClose, plan, loading, error }) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {plan ? `${plan.owner_name}'s plan` : "Shared plan"}
          </DialogTitle>
        </DialogHeader>

        {loading && (
          <div className="flex justify-center py-8">
            <div className="w-5 h-5 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin" role="status" aria-label="Loading plan" />
          </div>
        )}

        {!loading && error && (
          <p className="text-sm font-sans text-destructive py-4">{error}</p>
        )}

        {!loading && !error && plan && (
          <div className="space-y-5 text-sm font-sans">
            {plan.location && (
              <p className="text-muted-foreground">Based in {plan.location}</p>
            )}

            <section>
              <h3 className="flex items-center gap-2 font-semibold text-foreground mb-2">
                <MapPin className="w-4 h-4 text-primary" aria-hidden="true" /> Meeting spots
              </h3>
              {plan.meet_spots.length === 0 ? (
                <p className="text-muted-foreground">None recorded yet.</p>
              ) : (
                <ul className="space-y-2">
                  {plan.meet_spots.map((s, i) => (
                    <li key={i} className="border border-border rounded-md px-3 py-2">
                      <p className="font-medium text-foreground">
                        {s.is_primary ? "Primary — " : ""}{s.name}
                      </p>
                      {s.address && <p className="text-muted-foreground">{s.address}</p>}
                      {s.description && <p className="text-muted-foreground">{s.description}</p>}
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section>
              <h3 className="flex items-center gap-2 font-semibold text-foreground mb-2">
                <Package className="w-4 h-4 text-primary" aria-hidden="true" /> Emergency caches
              </h3>
              {plan.caches.length === 0 ? (
                <p className="text-muted-foreground">None recorded yet.</p>
              ) : (
                <ul className="space-y-2">
                  {plan.caches.map((c, i) => (
                    <li key={i} className="border border-border rounded-md px-3 py-2">
                      <p className="font-medium text-foreground">{c.name}</p>
                      <p className="text-muted-foreground">
                        {c.location} · {String(c.cache_type).replace(/_/g, " ")}
                      </p>
                      {c.items.length > 0 && (
                        <p className="text-muted-foreground mt-1">
                          {c.items.map((it) => it.name).filter(Boolean).join(", ")}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section>
              <h3 className="flex items-center gap-2 font-semibold text-foreground mb-2">
                <Users className="w-4 h-4 text-primary" aria-hidden="true" /> Household
              </h3>
              {plan.household.length === 0 ? (
                <p className="text-muted-foreground">None recorded yet.</p>
              ) : (
                <ul className="space-y-1">
                  {plan.household.map((m, i) => (
                    <li key={i} className="text-foreground">
                      {m.name} <span className="text-muted-foreground capitalize">({m.relationship})</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <p className="text-xs text-muted-foreground border-t border-border pt-3">
              Read-only. The plan belongs to {plan.owner_name} and stays in their account.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}