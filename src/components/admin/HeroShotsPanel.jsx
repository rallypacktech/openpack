import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { HERO_SHOTS } from "@/lib/heroShots";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, Save, RotateCcw, Image as ImageIcon } from "lucide-react";

export default function HeroShotsPanel() {
  const [overrides, setOverrides] = useState({});
  const [drafts, setDrafts] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null);

  useEffect(() => {
    loadAssets();
  }, []);

  const loadAssets = async () => {
    try {
      const records = await base44.entities.SiteAsset.list();
      const map = {};
      records.forEach((r) => {
        if (!map[r.page_key]) map[r.page_key] = r;
      });
      setOverrides(map);
    } catch (e) {
      console.error("Error loading hero shots:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (pageKey) => {
    const url = (drafts[pageKey] ?? overrides[pageKey]?.image_url ?? "").trim();
    if (!url) return;
    setSaving(pageKey);
    try {
      const existing = overrides[pageKey];
      if (existing) {
        const updated = await base44.entities.SiteAsset.update(existing.id, {
          image_url: url,
        });
        setOverrides((p) => ({ ...p, [pageKey]: updated }));
      } else {
        const entry = HERO_SHOTS.find((h) => h.page_key === pageKey);
        const created = await base44.entities.SiteAsset.create({
          page_key: pageKey,
          image_url: url,
          label: entry?.label || pageKey,
        });
        setOverrides((p) => ({ ...p, [pageKey]: created }));
      }
      setDrafts((p) => {
        const n = { ...p };
        delete n[pageKey];
        return n;
      });
    } catch (e) {
      console.error("Error saving hero shot:", e);
    } finally {
      setSaving(null);
    }
  };

  const handleReset = async (pageKey) => {
    const existing = overrides[pageKey];
    if (!existing) return;
    setSaving(pageKey);
    try {
      await base44.entities.SiteAsset.delete(existing.id);
      setOverrides((p) => {
        const n = { ...p };
        delete n[pageKey];
        return n;
      });
      setDrafts((p) => {
        const n = { ...p };
        delete n[pageKey];
        return n;
      });
    } catch (e) {
      console.error("Error resetting hero shot:", e);
    } finally {
      setSaving(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 text-muted-foreground">
        <Loader2 className="w-5 h-5 mr-2 animate-spin" aria-hidden="true" /> Loading
        hero shots…
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Override the hero background image for the home page and each landing
        page. Reset to restore the default. Changes appear immediately on the
        live pages.
      </p>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {HERO_SHOTS.map((shot) => {
          const override = overrides[shot.page_key];
          const draft = drafts[shot.page_key];
          const currentUrl = override?.image_url || shot.default_url;
          const editing = draft !== undefined;
          const value = editing ? draft : currentUrl;
          return (
            <Card key={shot.page_key}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" aria-hidden="true" /> {shot.label}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="relative h-28 w-full overflow-hidden rounded border bg-muted">
                  <img
                    src={value}
                    alt={shot.label}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      e.target.style.opacity = 0.2;
                    }}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor={`hero-${shot.page_key}`} className="text-xs">
                    Image URL
                  </Label>
                  <Input
                    id={`hero-${shot.page_key}`}
                    value={value}
                    onChange={(e) =>
                      setDrafts((p) => ({ ...p, [shot.page_key]: e.target.value }))
                    }
                    placeholder={shot.default_url}
                    className="text-xs"
                  />
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Button
                    size="sm"
                    disabled={!editing || saving === shot.page_key || !value.trim()}
                    onClick={() => handleSave(shot.page_key)}
                  >
                    {saving === shot.page_key ? (
                      <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                    ) : (
                      <Save className="w-3.5 h-3.5 mr-1.5" />
                    )}
                    Save
                  </Button>
                  {override && (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={saving === shot.page_key}
                      onClick={() => handleReset(shot.page_key)}
                    >
                      <RotateCcw className="w-3.5 h-3.5 mr-1.5" /> Reset to default
                    </Button>
                  )}
                  {override && (
                    <span className="text-xs text-amber-600 font-medium">
                      Custom image set
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}