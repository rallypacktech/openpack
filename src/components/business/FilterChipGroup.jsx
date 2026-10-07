import React from "react";
import { Label } from "@/components/ui/label";

export default function FilterChipGroup({ label, options, selected, onToggle }) {
  return (
    <div>
      <Label className="text-xs uppercase tracking-widest font-sans font-semibold text-muted-foreground">{label}</Label>
      <div className="flex flex-wrap gap-1.5 mt-2">
        {options.map((option) => {
          const active = selected.includes(option.value);
          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={active}
              onClick={() => onToggle(option.value)}
              className={`text-xs px-2.5 py-1 rounded border font-sans transition-colors ${
                active
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background text-muted-foreground border-border hover:text-foreground hover:border-foreground/40"
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}