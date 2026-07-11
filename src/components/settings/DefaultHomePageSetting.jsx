import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { LayoutDashboard, WifiOff, Package } from "lucide-react";

const OPTIONS = [
  { value: "dashboard", label: "Dashboard", desc: "Command center with weather, alerts, and quick actions", icon: LayoutDashboard },
  { value: "offline", label: "Offline Mode", desc: "Downloaded resources and offline map for emergencies", icon: WifiOff },
  { value: "resources", label: "Resources", desc: "Caches, meet spots, and first aid supplies", icon: Package },
];

export default function DefaultHomePageSetting({ profile, onSave }) {
  const [selected, setSelected] = useState(profile?.default_home_page || "dashboard");

  useEffect(() => {
    setSelected(profile?.default_home_page || "dashboard");
  }, [profile?.default_home_page]);

  const handleSelect = (value) => {
    setSelected(value);
    onSave({ default_home_page: value });
  };

  return (
    <Card id="default-home-page">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-semibold">Default Home Page</CardTitle>
        <p className="text-sm text-muted-foreground">Choose where you land after logging in. New users always start on the Dashboard first.</p>
      </CardHeader>
      <CardContent className="space-y-3">
        {OPTIONS.map(({ value, label, desc, icon: Icon }) => {
          const isActive = selected === value;
          return (
            <button
              key={value}
              type="button"
              onClick={() => handleSelect(value)}
              className={`w-full flex items-start gap-3 p-4 rounded-lg border text-left transition-colors ${
                isActive ? "border-primary bg-primary/5" : "border-border hover:border-foreground/30"
              }`}
              aria-pressed={isActive}
            >
              <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${isActive ? "text-primary" : "text-muted-foreground"}`} aria-hidden="true" />
              <div>
                <Label className="font-medium cursor-pointer">{label}{isActive && " ✓"}</Label>
                <p className="text-sm text-muted-foreground mt-0.5">{desc}</p>
              </div>
            </button>
          );
        })}
      </CardContent>
    </Card>
  );
}