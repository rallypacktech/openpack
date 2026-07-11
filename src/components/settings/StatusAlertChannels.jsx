import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Mail, Send, MessageCircle, Radio, Check } from "lucide-react";

const CHANNELS = [
  { key: "email", label: "Email", desc: "Send to family members' email addresses", icon: Mail, needsConnection: false, connectText: "Always available" },
  { key: "telegram", label: "Telegram", desc: "Send to linked family members on Telegram", icon: Send, needsConnection: true, connectText: "Connect Telegram below" },
  { key: "discord", label: "Discord", desc: "Post to a Discord family server channel", icon: MessageCircle, needsConnection: true, connectText: "Set up your webhook in the Discord card below" },
  { key: "threads", label: "Threads", desc: "Generate a share link with pre-filled text", icon: Radio, needsConnection: false, connectText: "No connection needed — opens share" },
  { key: "signal", label: "Signal", desc: "Generate a share link with pre-filled text", icon: Radio, needsConnection: false, connectText: "No connection needed — opens share" },
];

export default function StatusAlertChannels({ profile, onSave }) {
  const [selected, setSelected] = useState(profile?.status_alert_channels || ["email"]);

  useEffect(() => {
    setSelected(profile?.status_alert_channels || ["email"]);
  }, [profile]);

  const toggleChannel = (key) => {
    const next = selected.includes(key)
      ? selected.filter(c => c !== key)
      : [...selected, key];
    setSelected(next);
    onSave({ status_alert_channels: next.length > 0 ? next : ["email"] });
  };

  return (
    <Card id="status-alert-channels">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-semibold">Status Alert Channels</CardTitle>
        <p className="text-sm text-muted-foreground">
          Choose how your "I'm Safe" / "Need Help" alerts are sent. Email is always included for family members with email addresses.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          {CHANNELS.map(({ key, label, desc, icon: Icon, needsConnection, connectText }) => {
            const isSelected = selected.includes(key);
            const isConnected = key === "email" || key === "threads" || key === "signal"
              ? true
              : key === "telegram"
                ? !!profile?.telegram_chat_id
                : key === "discord"
                  ? !!profile?.discord_webhook_url
                  : false;

            return (
              <button
                key={key}
                type="button"
                onClick={() => toggleChannel(key)}
                className={`w-full flex items-start gap-3 p-4 rounded-lg border text-left transition-colors ${
                  isSelected ? "border-primary bg-primary/5" : "border-border hover:border-foreground/30"
                }`}
                aria-pressed={isSelected}
              >
                <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${isSelected ? "text-primary" : "text-muted-foreground"}`} aria-hidden="true" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Label className="font-medium cursor-pointer">{label}</Label>
                    {isSelected && <Check className="w-3.5 h-3.5 text-primary" />}
                    {needsConnection && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                        isConnected ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                      }`}>
                        {isConnected ? "Connected" : "Not connected"}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">{desc}</p>
                  {needsConnection && !isConnected && (
                    <p className="text-xs text-amber-600 mt-1">{connectText}</p>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}