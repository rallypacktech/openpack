import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Send, CheckCircle2, Loader2, ExternalLink } from "lucide-react";

export default function TelegramConnect({ profile, onProfileUpdate }) {
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const isConnected = !!profile?.telegram_chat_id;

  const handleConnect = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await base44.functions.invoke('getTelegramConnectLink', {});
      if (res.data?.connect_url) {
        window.location.href = res.data.connect_url;
      } else if (res.data?.error) {
        setError(res.data.error);
      }
    } catch (e) {
      setError(e.response?.data?.error || 'Failed to generate connect link');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    setError(null);
    try {
      const userData = await base44.auth.me();
      const profiles = await base44.entities.UserProfile.filter({ created_by_id: userData.id });
      if (profiles.length > 0 && onProfileUpdate) {
        onProfileUpdate(profiles[0]);
        if (!profiles[0].telegram_chat_id) {
          setError("No Telegram connection detected yet. Make sure you sent the message in Telegram, then try again.");
        }
      } else {
        setError("Couldn't find your profile. Try disconnecting and reconnecting.");
      }
    } catch (e) {
      setError('Failed to refresh connection status');
    } finally {
      setRefreshing(false);
    }
  };

  const handleDisconnect = async () => {
    if (!profile) return;
    setLoading(true);
    setError(null);
    try {
      await base44.entities.UserProfile.update(profile.id, {
        telegram_chat_id: null,
        telegram_username: null,
        telegram_connect_token: null
      });
      if (onProfileUpdate) {
        onProfileUpdate({
          ...profile,
          telegram_chat_id: null,
          telegram_username: null,
          telegram_connect_token: null
        });
      }
    } catch (e) {
      setError('Failed to disconnect');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <Send className="w-5 h-5 text-crimson" aria-hidden="true" />
          <CardTitle className="text-xl font-semibold">Telegram Emergency Alerts</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Get free, best-effort alerts via Telegram when an evacuation is ordered or a shelter
          opens near you. Each alert includes the original timestamp and delivery attempt number
          so you can tell if information may be stale.
        </p>

        {isConnected ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" aria-hidden="true" />
              <span className="text-sm font-medium text-green-900">
                Connected{profile?.telegram_username ? ` as @${profile.telegram_username}` : ''}
              </span>
            </div>
            <Button variant="outline" onClick={handleDisconnect} disabled={loading} className="text-sm">
              {loading ? 'Disconnecting...' : 'Disconnect'}
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <Button onClick={handleConnect} disabled={loading} className="w-full bg-primary hover:bg-primary/90">
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden="true" />
                  Generating link...
                </>
              ) : (
                <>
                  <ExternalLink className="w-4 h-4 mr-2" aria-hidden="true" />
                  Connect Telegram
                </>
              )}
            </Button>
            <p className="text-xs text-muted-foreground">
              Opens Telegram with a pre-filled message. Send it to link your account, then come
              back and tap below.
            </p>
            <Button variant="outline" onClick={handleRefresh} disabled={refreshing} className="w-full text-sm">
              {refreshing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden="true" />
                  Checking...
                </>
              ) : (
                "I've sent the message — check connection"
              )}
            </Button>
          </div>
        )}

        {error && (
          <p className="text-sm text-red-600" role="alert">{error}</p>
        )}

        <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">
          <strong>Free & best-effort:</strong> Telegram alerts depend on your internet connection.
          During tower outages, messages may be delayed — that's why each alert carries its original
          timestamp. Always verify critical status in the RallyPack app.
        </div>
      </CardContent>
    </Card>
  );
}