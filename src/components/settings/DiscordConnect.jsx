import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MessageCircle, CheckCircle2, Loader2, Unlink } from "lucide-react";
import { toast } from "sonner";

export default function DiscordConnect({ profile, onProfileUpdate }) {
  const [webhookUrl, setWebhookUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const isConnected = !!profile?.discord_webhook_url;

  useEffect(() => {
    setWebhookUrl(profile?.discord_webhook_url || "");
  }, [profile]);

  const handleConnect = async () => {
    const trimmed = webhookUrl.trim();
    if (!trimmed) {
      setError("Please paste your Discord webhook URL");
      return;
    }
    if (!trimmed.startsWith("https://discord.com/api/webhooks/") && !trimmed.startsWith("https://discordapp.com/api/webhooks/")) {
      setError("URL must start with https://discord.com/api/webhooks/");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const updated = await base44.entities.UserProfile.update(profile.id, {
        discord_webhook_url: trimmed,
      });
      if (onProfileUpdate) onProfileUpdate(updated);
      toast.success("Discord connected! Emergency alerts will now post to your channel.");
    } catch (e) {
      setError(e.response?.data?.error || "Failed to connect Discord");
    } finally {
      setSaving(false);
    }
  };

  const handleDisconnect = async () => {
    setSaving(true);
    setError(null);
    try {
      const updated = await base44.entities.UserProfile.update(profile.id, {
        discord_webhook_url: null,
      });
      setWebhookUrl("");
      if (onProfileUpdate) onProfileUpdate(updated);
      toast.success("Discord disconnected.");
    } catch (e) {
      setError("Failed to disconnect");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card id="discord-connect">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-indigo-600" aria-hidden="true" />
          <CardTitle className="text-xl font-semibold">Discord Emergency Alerts</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Connect a Discord channel to receive emergency alerts (evacuations, shelter openings,
          severe weather) using the same message template as email and Telegram. Each alert includes
          the original event timestamp and delivery attempt number so you can judge if information
          may be stale.
        </p>

        {isConnected ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" aria-hidden="true" />
              <span className="text-sm font-medium text-green-900">Discord channel connected</span>
            </div>
            <p className="text-xs text-muted-foreground break-all font-mono">
              {profile?.discord_webhook_url}
            </p>
            <Button variant="outline" onClick={handleDisconnect} disabled={saving} className="text-sm">
              {saving ? "Disconnecting..." : (
                <>
                  <Unlink className="w-3.5 h-3.5 mr-1.5" /> Disconnect
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="discord-webhook" className="text-sm font-medium">Discord Webhook URL</Label>
              <Input
                id="discord-webhook"
                type="url"
                placeholder="https://discord.com/api/webhooks/..."
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                className="bg-white"
              />
            </div>
            <Button onClick={handleConnect} disabled={saving} className="w-full bg-indigo-600 hover:bg-indigo-700">
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden="true" />
                  Connecting...
                </>
              ) : (
                <>
                  <MessageCircle className="w-4 h-4 mr-2" aria-hidden="true" />
                  Connect Discord
                </>
              )}
            </Button>
            <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg space-y-1">
              <p className="font-semibold">How to create a webhook:</p>
              <p>1. In Discord, go to your server → <strong>Server Settings</strong></p>
              <p>2. Click <strong>Integrations</strong> → <strong>Webhooks</strong></p>
              <p>3. Click <strong>New Webhook</strong>, pick a channel, then <strong>Copy Webhook URL</strong></p>
              <p>4. Paste the URL above and tap Connect</p>
            </div>
          </div>
        )}

        {error && <p className="text-sm text-red-600" role="alert">{error}</p>}
      </CardContent>
    </Card>
  );
}