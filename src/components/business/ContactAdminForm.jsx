import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Send, CheckCircle2, Bug, Lightbulb, MessageSquare } from "lucide-react";

const REQUEST_TYPES = [
  { id: "bug_report", label: "Bug Report", icon: Bug },
  { id: "improvement", label: "Improvement Request", icon: Lightbulb },
  { id: "general", label: "General Feedback", icon: MessageSquare },
];

export default function ContactAdminForm({ organizationName }) {
  const [form, setForm] = useState({ subject: "", message: "", request_type: "improvement" });
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.subject.trim() || !form.message.trim()) return;
    setSending(true);
    setResult(null);
    try {
      const res = await base44.functions.invoke("contactAdmin", {
        subject: form.subject,
        message: form.message,
        request_type: form.request_type,
        organization_name: organizationName || "",
      });
      setResult(res.data || res);
      setForm({ subject: "", message: "", request_type: "improvement" });
    } catch (err) {
      setResult({ error: err.message || "Failed to send message" });
    } finally {
      setSending(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Mail className="w-4 h-4" />
          Contact RallyPack Admin
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Send a bug report, improvement request, or feedback directly to the RallyPack team.
        </p>
      </CardHeader>
      <CardContent>
        {result && !result.error ? (
          <div className="text-center py-6">
            <CheckCircle2 className="w-10 h-10 text-green-500 mx-auto mb-3" />
            <p className="font-semibold text-foreground mb-1">Message Sent</p>
            <p className="text-sm text-muted-foreground mb-4">{result.message}</p>
            <Button variant="outline" size="sm" onClick={() => setResult(null)}>
              Send Another
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Request Type</Label>
              <div className="grid grid-cols-3 gap-2">
                {REQUEST_TYPES.map(t => {
                  const Icon = t.icon;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setForm({ ...form, request_type: t.id })}
                      className={`flex flex-col items-center gap-1 px-2 py-3 rounded border text-xs transition-colors ${
                        form.request_type === t.id
                          ? "border-primary bg-primary/5 text-foreground font-medium"
                          : "border-border bg-background text-muted-foreground hover:border-primary/30"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {t.label}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact-subject">Subject</Label>
              <Input
                id="contact-subject"
                required
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                placeholder="Brief description of your request"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact-message">Message</Label>
              <Textarea
                id="contact-message"
                required
                rows={5}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                placeholder="Describe the bug, improvement, or feedback in detail..."
              />
            </div>
            {result?.error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">{result.error}</p>
            )}
            <Button type="submit" disabled={sending || !form.subject.trim() || !form.message.trim()} className="w-full">
              {sending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send to Admin
                </>
              )}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}