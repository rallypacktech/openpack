import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Sparkles, MapPin, Loader2, PawPrint } from "lucide-react";

const DIRECTION_COLORS = {
  North: "border-blue-200 bg-blue-50",
  South: "border-green-200 bg-green-50",
  East: "border-amber-200 bg-amber-50",
  West: "border-purple-200 bg-purple-50",
};

export default function AiMeetSpotSuggestions({ missingDirections, onAddSpot }) {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const resp = await base44.functions.invoke("getAiMeetSpotSuggestions", {});
      setSuggestions(resp.data.suggestions || []);
      setLoaded(true);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (missingDirections.length === 0) return null;

  if (!loaded) {
    return (
      <div className="border border-dashed border-primary/30 rounded bg-primary/5 p-5 flex items-center justify-between gap-4 mt-4">
        <div className="flex items-center gap-3">
          <Sparkles className="w-5 h-5 text-primary flex-shrink-0" />
          <div>
            <p className="font-sans font-semibold text-foreground text-sm">AI Meet Spot Suggestions</p>
            <p className="text-xs text-muted-foreground font-sans">
              Missing {missingDirections.join(", ")} coverage — get AI-powered local suggestions
            </p>
          </div>
        </div>
        <Button
          size="sm"
          onClick={load}
          disabled={loading}
          className="bg-primary text-primary-foreground font-sans text-xs shrink-0"
        >
          {loading
            ? <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Searching…</>
            : <><Sparkles className="w-3.5 h-3.5 mr-1.5" /> Get Suggestions</>}
        </Button>
      </div>
    );
  }

  if (suggestions.length === 0) return null;

  return (
    <div className="mt-4 space-y-3">
      <div className="flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-primary" />
        <h3 className="font-sans font-semibold text-foreground text-sm">
          AI-Suggested Meet Spots for Missing Directions
        </h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {suggestions.map((s, i) => (
          <div key={i} className={`border rounded p-4 ${DIRECTION_COLORS[s.direction] || "bg-gray-50 border-gray-200"}`}>
            <div className="flex items-center gap-2 mb-1.5">
              <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-xs font-sans font-semibold uppercase tracking-widest text-muted-foreground">
                {s.direction}
              </span>
              {s.pet_friendly && (
                <span className="flex items-center gap-0.5 text-[10px] text-green-700 bg-green-100 px-1.5 py-0.5 rounded-full ml-auto">
                  <PawPrint className="w-2.5 h-2.5" /> Pet OK
                </span>
              )}
            </div>
            <p className="font-sans font-semibold text-sm text-foreground mb-1">{s.place_type}</p>
            <p className="text-xs text-muted-foreground font-sans mb-2">{s.why}</p>
            {s.search_tip && (
              <p className="text-xs text-primary font-sans italic mb-2">💡 {s.search_tip}</p>
            )}
            {onAddSpot && (
              <Button
                size="sm"
                variant="outline"
                className="text-xs h-7 px-2 w-full"
                onClick={() => onAddSpot({ name: s.place_type, description: s.why, direction_hint: s.direction })}
              >
                + Add as Meet Spot
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}