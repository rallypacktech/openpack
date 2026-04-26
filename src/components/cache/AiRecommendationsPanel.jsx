import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, ExternalLink, ChevronDown, ChevronUp, Loader2, AlertTriangle, User, Heart } from "lucide-react";

const PRIORITY_COLORS = {
  critical: "bg-red-100 text-red-800 border-red-200",
  important: "bg-amber-100 text-amber-800 border-amber-200",
  "nice-to-have": "bg-blue-100 text-blue-800 border-blue-200",
};

const CATEGORY_ICONS = {
  medical: "🏥", water: "💧", food: "🥫", tools: "🔧",
  clothing: "👕", documents: "📄", communication: "📻", hygiene: "🧼", other: "📦",
};

export default function AiRecommendationsPanel({ cacheId, mode = "cache", onAddItem }) {
  const [recs, setRecs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [expanded, setExpanded] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const resp = await base44.functions.invoke("getAiCacheRecommendations", { cacheId, mode });
      setRecs(resp.data.recommendations || []);
      setLoaded(true);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (!loaded) {
    return (
      <div className="border border-dashed border-primary/30 rounded bg-primary/5 p-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Sparkles className="w-5 h-5 text-primary flex-shrink-0" />
          <div>
            <p className="font-sans font-semibold text-foreground text-sm">AI-Powered Gap Analysis</p>
            <p className="text-xs text-muted-foreground font-sans">
              Personalized for your household, pets, medical needs & region
            </p>
          </div>
        </div>
        <Button
          size="sm"
          onClick={load}
          disabled={loading}
          className="bg-primary text-primary-foreground font-sans text-xs shrink-0"
        >
          {loading ? (
            <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Analyzing…</>
          ) : (
            <><Sparkles className="w-3.5 h-3.5 mr-1.5" /> Analyze Gaps</>
          )}
        </Button>
      </div>
    );
  }

  return (
    <div className="border border-primary/20 rounded overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-5 py-3 bg-primary/5 hover:bg-primary/10 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="font-sans font-semibold text-foreground text-sm">
            AI Recommendations ({recs.length})
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => { e.stopPropagation(); load(); }}
            className="text-xs text-muted-foreground h-6 px-2"
          >
            Refresh
          </Button>
          {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
        </div>
      </button>

      {expanded && (
        <div className="p-4 space-y-3">
          {recs.length === 0 ? (
            <p className="text-sm text-muted-foreground font-sans text-center py-4">
              ✅ Great! No critical gaps detected for your household.
            </p>
          ) : (
            recs.map((rec, i) => (
              <div key={i} className={`border rounded p-4 ${PRIORITY_COLORS[rec.priority] || "bg-gray-50 border-gray-200"}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-sm font-sans">{CATEGORY_ICONS[rec.category] || "📦"}</span>
                      <span className="font-sans font-semibold text-sm text-foreground">{rec.item_name}</span>
                      {rec.quantity > 1 && (
                        <span className="text-xs text-muted-foreground">×{rec.quantity}</span>
                      )}
                      <Badge className={`text-[10px] py-0 h-4 border ${PRIORITY_COLORS[rec.priority]}`}>
                        {rec.priority}
                      </Badge>
                    </div>
                    {rec.for_whom && rec.for_whom !== "all" && (
                      <p className="text-xs font-sans text-muted-foreground flex items-center gap-1 mb-1">
                        {rec.for_whom.toLowerCase().includes("pet") || rec.for_whom.toLowerCase().includes("dog") || rec.for_whom.toLowerCase().includes("cat")
                          ? <Heart className="w-3 h-3" />
                          : <User className="w-3 h-3" />}
                        For: {rec.for_whom}
                      </p>
                    )}
                    <p className="text-xs font-sans leading-relaxed">{rec.why}</p>
                  </div>
                  <div className="flex flex-col gap-1.5 shrink-0">
                    {onAddItem && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs h-7 px-2 border-current"
                        onClick={() => onAddItem(rec)}
                      >
                        + Add
                      </Button>
                    )}
                    {rec.affiliate_search && (
                      <a
                        href={`https://www.amazon.com/s?k=${encodeURIComponent(rec.affiliate_search)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-sans text-primary hover:underline"
                      >
                        Shop <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}