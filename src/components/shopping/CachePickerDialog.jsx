import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MapPin, Package } from "lucide-react";
import { addProductToCache } from "@/lib/cacheItems";

const CACHE_TYPE_LABELS = {
  go_bag: "Go Bag",
  automobile: "Automobile",
  barn: "Barn / Livestock",
  general: "General",
};

export default function CachePickerDialog({
  open,
  onOpenChange,
  rec,
  title = "Add to a cache",
  subtitle,
  onAdded,
  onSkip,
}) {
  const [caches, setCaches] = useState([]);
  const [selected, setSelected] = useState("");
  const [expiration, setExpiration] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setSelected("");
    setExpiration("");
    setLoading(true);
    (async () => {
      try {
        // RLS returns only caches this user owns, which is exactly the set they
        // may file an item into.
        setCaches(await base44.entities.EmergencyCache.list());
      } catch (e) {
        console.error("Error loading caches:", e);
        setCaches([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [open]);

  const handleConfirm = async () => {
    if (!selected || !rec) return;
    setSaving(true);
    try {
      await addProductToCache({
        rec,
        cacheId: selected,
        expirationDate: expiration,
      });
      onAdded?.();
      onOpenChange(false);
    } catch (e) {
      console.error("Error adding to cache:", e);
      alert("Could not add this item to the cache. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        {rec && (
          <p className="text-sm text-muted-foreground font-sans">
            <span className="font-semibold text-foreground">
              {rec.item_name}
            </span>
            {subtitle && (
              <>
                <br />
                {subtitle}
              </>
            )}
          </p>
        )}

        {loading ? (
          <div className="py-8 flex justify-center">
            <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        ) : caches.length === 0 ? (
          <div className="py-4">
            <p className="text-sm text-muted-foreground font-sans mb-3">
              You don't have any caches yet. Create one first, then come back and
              add this item to it.
            </p>
            <Button asChild variant="outline" className="w-full">
              <a href="/Resources?tab=supplies">Go to My Supplies</a>
            </Button>
          </div>
        ) : (
          <>
            <div className="space-y-2 mt-2">
              {caches.map((cache) => (
                <button
                  key={cache.id}
                  type="button"
                  onClick={() => setSelected(cache.id)}
                  className={`w-full text-left border rounded-lg p-3 transition-colors ${
                    selected === cache.id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium text-foreground text-sm">
                      {cache.name}
                    </span>
                    <span className="text-xs text-muted-foreground ml-auto">
                      {CACHE_TYPE_LABELS[cache.cache_type] || "General"}
                    </span>
                  </div>
                  {cache.location && (
                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                      <MapPin className="w-3 h-3" />
                      {cache.location}
                    </div>
                  )}
                </button>
              ))}
            </div>

            <div className="mt-4">
              <Label className="text-xs text-muted-foreground">
                Expiration date (optional)
              </Label>
              <Input
                type="date"
                value={expiration}
                onChange={(e) => setExpiration(e.target.value)}
                className="mt-1"
              />
            </div>

            <div className="flex gap-2 mt-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  onSkip?.();
                  onOpenChange(false);
                }}
              >
                Skip
              </Button>
              <Button
                className="flex-1 bg-primary hover:bg-primary/90"
                disabled={!selected || saving}
                onClick={handleConfirm}
              >
                {saving ? "Adding..." : "Add to cache"}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}