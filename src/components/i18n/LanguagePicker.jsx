import React, { useState } from "react";
import { Check, ChevronsUpDown, Languages } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { findLocale } from "@/lib/translationLocales";

/**
 * Searchable language chooser. A plain dropdown is unusable once every DeepL
 * language is offered, so options are filtered as the visitor types — matching
 * the language's own name, its English name, or its code.
 */
export default function LanguagePicker({
  locales,
  value,
  onChange,
  ariaLabel = "Choose language",
  className = "",
  showIcon = false,
  align = "end",
}) {
  const [open, setOpen] = useState(false);
  const selected = findLocale(value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={ariaLabel}
          className={cn(
            "flex items-center gap-1.5 rounded-md text-left text-xs font-sans text-muted-foreground transition-colors hover:text-foreground",
            className
          )}
        >
          {showIcon && <Languages className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />}
          <span className="truncate">{selected ? selected.native : value}</span>
          <ChevronsUpDown className="h-3 w-3 flex-shrink-0 opacity-50" aria-hidden="true" />
        </button>
      </PopoverTrigger>
      <PopoverContent align={align} className="w-72 p-0">
        <Command>
          <CommandInput placeholder="Search languages…" />
          <CommandList className="max-h-72">
            <CommandEmpty>No language found.</CommandEmpty>
            <CommandGroup>
              {locales.map((option) => (
                <CommandItem
                  key={option.code}
                  value={`${option.native} ${option.label} ${option.code}`}
                  onSelect={() => {
                    onChange(option.code);
                    setOpen(false);
                  }}
                  className="flex items-center justify-between gap-3"
                >
                  <span className="flex min-w-0 items-baseline gap-2">
                    <span className="truncate text-sm">{option.native}</span>
                    {option.native !== option.label && (
                      <span className="truncate text-xs text-muted-foreground">{option.label}</span>
                    )}
                  </span>
                  <Check
                    className={cn(
                      "h-3.5 w-3.5 flex-shrink-0",
                      option.code === value ? "opacity-100" : "opacity-0"
                    )}
                    aria-hidden="true"
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}