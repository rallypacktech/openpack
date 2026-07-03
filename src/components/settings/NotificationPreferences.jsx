import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Bell, Save, Mail } from "lucide-react";

// Alert types with optional radius support
const alertTypes = [
  { key: 'wildfire', label: 'Wildfire Alerts', description: 'Active wildfires within your radius', hasRadius: true, defaultRadius: 80 },
  { key: 'severe_weather', label: 'Severe Weather', description: 'Thunderstorms, high winds, hail', hasRadius: true, defaultRadius: 120 },
  { key: 'hurricane', label: 'Hurricane Warnings', description: 'Tropical storms and hurricanes', hasRadius: true, defaultRadius: 300 },
  { key: 'tornado', label: 'Tornado Warnings', description: 'Tornado watches and warnings', hasRadius: true, defaultRadius: 80 },
  { key: 'flood', label: 'Flood Alerts', description: 'Flash floods and flood warnings', hasRadius: true, defaultRadius: 40 },
  { key: 'temperature_thresholds', label: 'Extreme Temperatures', description: 'Heat waves and cold snaps', hasRadius: false },
  { key: 'precipitation', label: 'Heavy Precipitation', description: 'Significant rain or snow events', hasRadius: false },
  { key: 'earthquake', label: 'Earthquake Alerts', description: 'Seismic activity notifications', hasRadius: true, defaultRadius: 150 },
];

const defaultSettings = {
  wildfire: true,
  wildfire_radius_km: 80,
  severe_weather: true,
  severe_weather_radius_km: 120,
  hurricane: true,
  hurricane_radius_km: 300,
  tornado: true,
  tornado_radius_km: 80,
  flood: true,
  flood_radius_km: 40,
  temperature_thresholds: true,
  precipitation: true,
  earthquake: false,
  earthquake_radius_km: 150,
  alert_frequency: 'immediate'
};

export default function NotificationPreferences({ profile, onSave, hasLargeAnimals = false }) {
  const [settings, setSettings] = useState(defaultSettings);
  const [notificationMethod, setNotificationMethod] = useState("both");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile?.alert_settings) {
      setSettings({ ...defaultSettings, ...profile.alert_settings });
    }
    if (profile?.notification_method) {
      setNotificationMethod(profile.notification_method);
    }
  }, [profile]);

  const handleSave = async () => {
    setSaving(true);
    await onSave({ alert_settings: settings, notification_method: notificationMethod });
    setSaving(false);
  };

  const updateSetting = (key, value) => setSettings(prev => ({ ...prev, [key]: value }));

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-blue-600" />
          <CardTitle>Notification Preferences</CardTitle>
        </div>
        <CardDescription>
          Customize which alerts you receive and the radius for location-based alerts
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">

        {/* Large animal advisory */}
        {hasLargeAnimals && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex gap-3">
            <span className="text-xl">🐴</span>
            <div>
              <p className="text-sm font-semibold text-amber-900">Large Animal Advisory</p>
              <p className="text-sm text-amber-700 mt-0.5">
                You have equine or livestock. FEMA and ASPCA recommend increasing wildfire and smoke alert radii to at least 150 km for large animals — they're more sensitive to smoke and require more lead time to evacuate.
              </p>
              <button
                className="mt-2 text-xs text-amber-800 underline font-medium"
                onClick={() => {
                  setSettings(prev => ({
                    ...prev,
                    wildfire_radius_km: Math.max(prev.wildfire_radius_km || 80, 150),
                    severe_weather_radius_km: Math.max(prev.severe_weather_radius_km || 120, 150)
                  }));
                }}
              >
                Apply recommended large-animal radii →
              </button>
            </div>
          </div>
        )}

        {/* Email Notifications */}
        <div className="pb-4 border-b">
          <Label className="text-base font-semibold mb-3 flex items-center gap-2">
            <Mail className="w-4 h-4 text-blue-600" />
            Email Notifications
          </Label>
          <p className="text-sm text-gray-500 mb-3">In-app notifications are always on. Choose whether to also receive emails.</p>
          <div className="space-y-2">
            {[
              { value: "in_app", label: "In-app only", desc: "Notifications inside RallyPack only" },
              { value: "email", label: "Email only", desc: "Receive alerts by email (no in-app badge)" },
              { value: "both", label: "Both (recommended)", desc: "In-app + email for critical alerts" },
            ].map((opt) => (
              <button
                key={opt.value}
                onClick={() => setNotificationMethod(opt.value)}
                className={`w-full flex items-start gap-3 p-3 rounded-lg border text-left transition-colors ${notificationMethod === opt.value ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"}`}
              >
                <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 mt-0.5 ${notificationMethod === opt.value ? "border-blue-500 bg-blue-500" : "border-gray-300"}`} />
                <div>
                  <p className="font-medium text-sm text-gray-900">{opt.label}</p>
                  <p className="text-xs text-gray-500">{opt.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Alert Frequency */}
        <div className="pb-4 border-b">
          <Label htmlFor="alert-frequency" className="text-base font-semibold mb-3 block">
            Alert Frequency
          </Label>
          <Select
            value={settings.alert_frequency}
            onValueChange={(value) => updateSetting('alert_frequency', value)}
          >
            <SelectTrigger id="alert-frequency">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="immediate">Immediate - Get alerts as they happen</SelectItem>
              <SelectItem value="daily_digest">Daily Digest - One summary per day</SelectItem>
              <SelectItem value="weekly_digest">Weekly Digest - One summary per week</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Alert Types with per-type radius */}
        <div>
          <Label className="text-base font-semibold mb-3 block">Alert Types & Radii</Label>
          <div className="space-y-3">
            {alertTypes.map((alert) => (
              <div key={alert.key} className="p-3 bg-gray-50 rounded-lg space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <Label htmlFor={alert.key} className="font-medium cursor-pointer">
                      {alert.label}
                    </Label>
                    <p className="text-sm text-gray-500 mt-0.5">{alert.description}</p>
                  </div>
                  <Switch
                    id={alert.key}
                    checked={!!settings[alert.key]}
                    onCheckedChange={(checked) => updateSetting(alert.key, checked)}
                  />
                </div>
                {alert.hasRadius && settings[alert.key] && (
                  <div className="flex items-center gap-3 pt-1">
                    <span className="text-xs text-gray-500 w-14">Radius:</span>
                    <Input
                      type="number"
                      min="5"
                      max="800"
                      value={settings[`${alert.key}_radius_km`] ?? alert.defaultRadius}
                      onChange={(e) => updateSetting(`${alert.key}_radius_km`, parseInt(e.target.value))}
                      className="w-20 h-7 text-sm"
                    />
                    <span className="text-xs text-gray-500">km</span>
                    {hasLargeAnimals && (alert.key === 'wildfire' || alert.key === 'severe_weather') && (
                      <span className="text-xs text-amber-600 font-medium">🐴 150+ recommended</span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <Button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-blue-600 hover:bg-blue-700"
        >
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Saving...' : 'Save Notification Preferences'}
        </Button>
      </CardContent>
    </Card>
  );
}