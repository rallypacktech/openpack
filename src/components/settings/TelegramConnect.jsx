import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, CheckCircle2, Loader2, ExternalLink, Smartphone, Copy, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";

export default function TelegramConnect({ profile, onProfileUpdate }) {
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [connectInfo, setConnectInfo] = useState(null);
  const [showManual, setShowManual] = useState(false);

  const isConnected = !!profile?.telegram_chat_id;

  const handleConnect = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await base44.functions.invoke('getTelegramConnectLink', {});
      if (res.data?.connect_url) {
        setConnectInfo({
          webUrl: res.data.connect_url,
          botUsername: res.data.bot_username,
          token: res.data.connect_url.split('start=')[1] || '',
        });
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
      const profiles = await base44.entities.UserProfile.filter({ created_by: userData.email });
      if (profiles.length > 0 && onProfileUpdate) {
        onProfileUpdate(profiles[0]);
        if (profiles[0].telegram_chat_id) {
          setConnectInfo(null);
          toast.success("Telegram connected successfully!");
        } else {
          setError("No Telegram connection detected yet. Make sure you sent the message in Telegram, then try again. If you're using a VPN, try disabling it — VPNs can block the connection.");
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
      setConnectInfo(null);
    } catch (e) {
      setError('Failed to disconnect');
    } finally {
      setLoading(false);
    }
  };

  const copyToken = () => {
    if (connectInfo?.token) {
      navigator.clipboard.writeText(`/start ${connectInfo.token}`);
      toast.success("Copied! Paste it into your Telegram chat with the bot.");
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
        ) : connectInfo ? (
          <div className="space-y-3">
            <div className="p-3 bg-blue-50 rounded-lg space-y-1">
              <p className="text-sm font-medium text-blue-900">Step 1: Open Telegram</p>
              <p className="text-xs text-blue-700">Tap a button below to open Telegram with a pre-filled message, then press send.</p>
            </div>

            {/* t.me link — works via Universal Links on iOS (opens installed app + sends /start automatically) and web on desktop */}
            <a
              href={connectInfo.webUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full bg-primary hover:bg-primary/90 text-white font-sans font-medium text-sm py-2.5 rounded-lg transition-colors"
            >
              <Smartphone className="w-4 h-4" aria-hidden="true" />
              Open Telegram
            </a>

            <div className="p-3 bg-muted/50 rounded-lg space-y-2">
              <p className="text-xs font-sans font-semibold text-muted-foreground uppercase tracking-widest">Step 2: Confirm</p>
              <p className="text-xs text-muted-foreground">After sending the message in Telegram, come back and tap below.</p>
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

            {/* Manual fallback for privacy browsers that block both links */}
            <button
              onClick={() => setShowManual(!showManual)}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              {showManual ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              Links not working? Manual setup
            </button>
            {showManual && (
              <div className="p-3 bg-amber-50 rounded-lg space-y-2 text-xs text-amber-900">
                <p className="font-medium">Manual setup (for DuckDuckGo / privacy browsers):</p>
                <p>1. Open Telegram and search for <strong>@{connectInfo.botUsername}</strong></p>
                <p>2. Tap Start, then send this exact message:</p>
                <div className="flex items-center gap-2">
                  <Input
                    readOnly
                    value={`/start ${connectInfo.token}`}
                    className="bg-white text-xs font-mono"
                  />
                  <Button size="sm" variant="outline" onClick={copyToken} className="flex-shrink-0">
                    <Copy className="w-3 h-3 mr-1" /> Copy
                  </Button>
                </div>
                <p>3. Come back and tap "Check connection" above.</p>
              </div>
            )}
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
          </div>
        )}

        {error && (
          <p className="text-sm text-red-600" role="alert">{error}</p>
        )}

        <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg space-y-1">
          <p><strong>Free & best-effort:</strong> Telegram alerts depend on your internet connection.
          During tower outages, messages may be delayed — that's why each alert carries its original
          timestamp. Always verify critical status in the RallyPack app.</p>
          <p><strong>VPN users:</strong> If the connection doesn't go through, try disabling your VPN
          and tapping "Check connection" again — VPNs can block Telegram's webhook delivery.</p>
        </div>
      </CardContent>
    </Card>
  );
}