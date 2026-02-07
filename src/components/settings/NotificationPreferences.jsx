import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Bell, Save } from "lucide-react";

export default function NotificationPreferences({ profile, onSave }) {
  const [settings, setSettings] = useState({
    wildfire: true,
    wildfire_radius_miles: 50,
    severe_weather: true,
    temperature_thresholds: true,
    precipitation: true,
    hurricane: true,
    tornado: true,
    flood: true,
    earthquake: false,
    alert_frequency: 'immediate'
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile?.alert_settings) {
      setSettings({ ...settings, ...profile.alert_settings });
    }
  }, [profile]);

  const handleSave = async () => {
    setSaving(true);
    await onSave({ alert_settings: settings });
    setSaving(false);
  };

  const alertTypes = [
    { key: 'wildfire', label: 'Wildfire Alerts', description: 'Active wildfires within your radius' },
    { key: 'severe_weather', label: 'Severe Weather', description: 'Thunderstorms, high winds, hail' },
    { key: 'hurricane', label: 'Hurricane Warnings', description: 'Tropical storms and hurricanes' },
    { key: 'tornado', label: 'Tornado Warnings', description: 'Tornado watches and warnings' },
    { key: 'flood', label: 'Flood Alerts', description: 'Flash floods and flood warnings' },
    { key: 'temperature_thresholds', label: 'Extreme Temperatures', description: 'Heat waves and cold snaps' },
    { key: 'precipitation', label: 'Heavy Precipitation', description: 'Significant rain or snow events' },
    { key: 'earthquake', label: 'Earthquake Alerts', description: 'Seismic activity notifications' }
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-blue-600" />
          <CardTitle>Notification Preferences</CardTitle>
        </div>
        <CardDescription>
          Customize which alerts you receive and how often
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Alert Frequency */}
        <div className="pb-4 border-b">
          <Label htmlFor="alert-frequency" className="text-base font-semibold mb-3 block">
            Alert Frequency
          </Label>
          <Select 
            value={settings.alert_frequency} 
            onValueChange={(value) => setSettings({ ...settings, alert_frequency: value })}
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

        {/* Wildfire Radius */}
        {settings.wildfire && (
          <div className="pb-4 border-b">
            <Label htmlFor="wildfire-radius" className="text-base font-semibold mb-2 block">
              Wildfire Alert Radius
            </Label>
            <div className="flex items-center gap-3">
              <Input
                id="wildfire-radius"
                type="number"
                min="10"
                max="200"
                value={settings.wildfire_radius_miles}
                onChange={(e) => setSettings({ ...settings, wildfire_radius_miles: parseInt(e.target.value) })}
                className="w-24"
              />
              <span className="text-sm text-gray-600">miles from your location</span>
            </div>
          </div>
        )}

        {/* Alert Types */}
        <div>
          <Label className="text-base font-semibold mb-3 block">Alert Types</Label>
          <div className="space-y-4">
            {alertTypes.map((alert) => (
              <div key={alert.key} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <Label htmlFor={alert.key} className="font-medium cursor-pointer">
                    {alert.label}
                  </Label>
                  <p className="text-sm text-gray-500 mt-0.5">{alert.description}</p>
                </div>
                <Switch
                  id={alert.key}
                  checked={settings[alert.key]}
                  onCheckedChange={(checked) => setSettings({ ...settings, [alert.key]: checked })}
                />
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