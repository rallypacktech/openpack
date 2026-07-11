import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "../../utils";
import { base44 } from "@/api/base44Client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Package, Plus, MapPin, Loader2, Check } from "lucide-react";
import { toast } from "sonner";

export default function AddToCacheDialog({ recommendation, caches }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [addingId, setAddingId] = useState(null);
  const [addedId, setAddedId] = useState(null);

  const handleAddToCache = async (cache) => {
    setAddingId(cache.id);
    try {
      await base44.entities.CacheItem.create({
        cache_id: cache.id,
        item_name: recommendation.item_name,
        quantity: recommendation.quantity || 1,
        category: recommendation.category || "other",
        notes: recommendation.description || "",
      });
      setAddedId(cache.id);
      toast.success(`Added "${recommendation.item_name}" to ${cache.name}`);
      setTimeout(() => {
        setOpen(false);
        setAddedId(null);
      }, 1200);
    } catch (e) {
      toast.error("Failed to add item to cache");
    } finally {
      setAddingId(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setAddedId(null); }}>
      <DialogTrigger asChild>
        <Button size="sm" className="mt-2 bg-foreground hover:bg-foreground/90">
          <Package className="w-3 h-3 mr-1" />
          Add to Cache
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add to Cache</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          Add <strong className="text-foreground">{recommendation.item_name}</strong> to one of your caches.
        </p>
        {caches && caches.length > 0 ? (
          <div className="space-y-2 max-h-72 overflow-y-auto">
            {caches.map((cache) => (
              <button
                key={cache.id}
                onClick={() => handleAddToCache(cache)}
                disabled={addingId === cache.id || !!addedId}
                className="w-full flex items-center gap-3 p-3 rounded-lg border text-left hover:border-foreground/40 transition-colors disabled:opacity-60"
              >
                <div className="p-2 rounded-lg bg-secondary">
                  {addedId === cache.id ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : addingId === cache.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-gray-900">{cache.name}</p>
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <MapPin className="w-3 h-3" />
                    <span>{cache.location}</span>
                    {cache._shared && <span className="text-blue-600">· Pack member</span>}
                  </div>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <Package className="w-10 h-10 mx-auto mb-2 text-gray-300" />
            <p className="text-sm text-gray-500 mb-3">You don't have any caches yet.</p>
            <Button onClick={() => navigate(createPageUrl("Resources"))} className="bg-foreground text-background hover:bg-foreground/90">
              <Plus className="w-4 h-4 mr-1.5" />
              Start a Cache
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}