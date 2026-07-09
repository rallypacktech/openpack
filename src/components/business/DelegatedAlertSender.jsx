import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Send, AlertTriangle, CheckCircle2 } from "lucide-react";

export default function DelegatedAlertSender() {
  const [delegation, setDelegation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [eventType, setEventType] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    loadDelegation();
  }, []);

  const loadDelegation = async () => {
    try {
      const delegations = await base44.entities.AlertDelegation.filter({});
      if (delegations.length > 0) {
        setDelegation(delegations[0]);
      }
    } catch (e) {
      console.error("Failed to load delegation:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!message.trim()) return;
    setSending(true);
    setResult(null);
    try {
      const res = await base44.functions.invoke("sendDelegatedTelegramAlert", {
        message: message.trim(),
        event_type: eventType.trim() || undefined
      });
      setResult(res.data || res);
    } catch (e) {
      setResult({ error: e.message || "Failed to send alert" });
    } finally {
      setSending(false);
    }
  };

  if (loading) return null;
  if (!delegation) return null;

  return (
    <Card className="border-amber-200 bg-amber-50/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <AlertTriangle className="w-5 h-5 text-amber-600" />
          Emergency Alert Sender — {delegation.organization_name}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          You are authorized to send emergency alerts to all members of your organization via Telegram.
          Use responsibly — every message is logged with your identity.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="event-type">Alert Type (optional)</Label>
          <Input
            id="event-type"
            placeholder="e.g. Shelter Open, Evacuation Notice"
            value={eventType}
            onChange={(e) => setEventType(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="alert-message">Message</Label>
          <Textarea
            id="alert-message"
            placeholder="Enter your emergency alert message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
          />
        </div>
        {result && (
          <div className={`rounded-lg p-3 text-sm ${result.error ? "bg-red-50 text-red-800" : "bg-green-50 text-green-800"}`}>
            {result.error ? (
              <p>Error: {result.error}</p>
            ) : (
              <div className="space-y-1">
                <p className="font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Alert dispatched to {result.organization}
                </p>
                <p>Delivered: {result.delivered} · Not connected: {result.no_telegram} · Failed: {result.failed}</p>
              </div>
            )}
          </div>
        )}
        <Button
          onClick={handleSend}
          disabled={!message.trim() || sending}
          className="w-full"
        >
          {sending ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
              Sending...
            </>
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" />
              Send Alert to All Members
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}