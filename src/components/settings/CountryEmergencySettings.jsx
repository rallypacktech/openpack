import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Phone, Plus, X, Crown, Building2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Emergency numbers by country code
export const COUNTRY_EMERGENCY_DATA = {
  US: { name: "United States", police: "911", fire: "911", ambulance: "911", combined: "911" },
  CA: { name: "Canada", police: "911", fire: "911", ambulance: "911", combined: "911" },
  GB: { name: "United Kingdom", police: "999", fire: "999", ambulance: "999", combined: "999" },
  AU: { name: "Australia", police: "000", fire: "000", ambulance: "000", combined: "000" },
  NZ: { name: "New Zealand", police: "111", fire: "111", ambulance: "111", combined: "111" },
  DE: { name: "Germany", police: "110", fire: "112", ambulance: "112", combined: "110/112" },
  FR: { name: "France", police: "17", fire: "18", ambulance: "15", combined: "15/17/18" },
  ES: { name: "Spain", police: "091", fire: "080", ambulance: "061", combined: "112" },
  IT: { name: "Italy", police: "113", fire: "115", ambulance: "118", combined: "112" },
  MX: { name: "Mexico", police: "911", fire: "911", ambulance: "911", combined: "911" },
  BR: { name: "Brazil", police: "190", fire: "193", ambulance: "192", combined: "190/192/193" },
  JP: { name: "Japan", police: "110", fire: "119", ambulance: "119", combined: "110/119" },
  CN: { name: "China", police: "110", fire: "119", ambulance: "120", combined: "110/119/120" },
  IN: { name: "India", police: "100", fire: "101", ambulance: "102", combined: "112" },
  ZA: { name: "South Africa", police: "10111", fire: "10177", ambulance: "10177", combined: "112" },
  NG: { name: "Nigeria", police: "199", fire: "199", ambulance: "199", combined: "199" },
  EU: { name: "European Union (generic)", police: "112", fire: "112", ambulance: "112", combined: "112" },
};

export default function CountryEmergencySettings({ profile, onSave, isPaidAccount }) {
  const maxCountries = isPaidAccount ? 3 : 1;
  const selectedCountries = profile?.emergency_countries || [];
  const [adding, setAdding] = useState(false);
  const [selectedCode, setSelectedCode] = useState("");

  const availableCodes = Object.keys(COUNTRY_EMERGENCY_DATA).filter(
    (code) => !selectedCountries.includes(code)
  );

  const handleAdd = async () => {
    if (!selectedCode) return;
    const updated = [...selectedCountries, selectedCode];
    await onSave({ emergency_countries: updated });
    setSelectedCode("");
    setAdding(false);
  };

  const handleRemove = async (code) => {
    const updated = selectedCountries.filter((c) => c !== code);
    await onSave({ emergency_countries: updated });
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-xl font-semibold">
          <Phone className="w-5 h-5 text-primary" aria-hidden="true" />
          Emergency Country Preferences
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Select countries you operate in to see localized emergency numbers. If none are selected, 
          generic guidance ("contact local emergency services") will be shown.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Tier info */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-secondary/40 rounded px-3 py-2">
          {isPaidAccount ? (
            <>
              <Crown className="w-3.5 h-3.5 text-gold" aria-hidden="true" />
              Paid plan: up to 3 countries
            </>
          ) : (
            <>
              <span>Free plan: 1 country. Upgrade for up to 3.</span>
            </>
          )}
        </div>

        {/* Selected countries */}
        {selectedCountries.length === 0 && (
          <p className="text-sm text-muted-foreground italic">No countries selected — showing global guidance.</p>
        )}
        <div className="space-y-2">
          {selectedCountries.map((code) => {
            const data = COUNTRY_EMERGENCY_DATA[code];
            if (!data) return null;
            return (
              <div key={code} className="flex items-center justify-between p-3 border border-border rounded-lg bg-card">
                <div>
                  <span className="font-medium text-sm">{data.name}</span>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Emergency: <strong>{data.combined}</strong>
                    {data.police !== data.combined && ` · Police: ${data.police}`}
                    {data.ambulance !== data.combined && ` · Ambulance: ${data.ambulance}`}
                    {data.fire !== data.combined && ` · Fire: ${data.fire}`}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-destructive"
                  onClick={() => handleRemove(code)}
                  aria-label={`Remove ${data.name}`}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            );
          })}
        </div>

        {/* Add country */}
        {selectedCountries.length < maxCountries && (
          <>
            {adding ? (
              <div className="flex gap-2">
                <Select value={selectedCode} onValueChange={setSelectedCode}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select a country…" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableCodes.map((code) => (
                      <SelectItem key={code} value={code}>
                        {COUNTRY_EMERGENCY_DATA[code].name} — {COUNTRY_EMERGENCY_DATA[code].combined}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={handleAdd} disabled={!selectedCode} size="sm">Add</Button>
                <Button variant="ghost" size="sm" onClick={() => { setAdding(false); setSelectedCode(""); }}>Cancel</Button>
              </div>
            ) : (
              <Button variant="outline" size="sm" onClick={() => setAdding(true)} className="gap-2">
                <Plus className="w-4 h-4" />
                Add Country
              </Button>
            )}
          </>
        )}

        {selectedCountries.length >= maxCountries && !isPaidAccount && (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">
              Upgrade to a paid plan to add up to 3 countries.
            </p>
            <Link to="/BusinessDashboard">
              <Button variant="outline" size="sm" className="gap-2 w-full">
                <Building2 className="w-4 h-4" />
                View Business Plans
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}