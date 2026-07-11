import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Send, AlertTriangle, CheckCircle2, Clock, XCircle, Mail } from "lucide-react";
import {
  INCIDENT_TYPES, EVENT_LEVELS, getAvailableIncidentTypes,
  generateAlertMessage, getIncidentType, getEventLevel,
} from "@/lib/alertTemplates";

export default function AlertSubmissionForm() {
  const [delegation, setDelegation] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [dispatching, setDispatching] = useState(null);
  const [result, setResult] = useState(null);

  const [incidentType, setIncidentType] = useState("");
  const [eventLevel, setEventLevel] = useState("warning");
  const [targetArea, setTargetArea] = useState("");
  const [instructions, setInstructions] = useState("");
  const [customMessage, setCustomMessage] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const me = await base44.auth.me();
      const delegations = await base44.entities.AlertDelegation.filter({});
      if (delegations.length > 0) {
        setDelegation(delegations[0]);
        const available = getAvailableIncidentTypes(delegations[0]);
        if (available.length > 0) setIncidentType(available[0]);
      }
      const subs = await base44.entities.AlertSubmission.list("-created_date", 20);
      setSubmissions(subs);
    } catch (e) {
      console.error("Failed to load data:", e);
    } finally {
      setLoading(false);
    }
  };

  const availableTypes = delegation ? getAvailableIncidentTypes(delegation) : [];
  const availableTypeObjects = availableTypes
    .map(id => INCIDENT_TYPES.find(t => t.id === id))
    .filter(Boolean);

  // Generate live preview
  const preview = incidentType
    ? generateAlertMessage(incidentType, eventLevel, {
        area: targetArea || "[your area]",
        org_name: delegation?.organization_name || "",
        instructions,
        custom_message: customMessage,
      })
    : null;

  const handleSubmit = async () => {
    if (!incidentType || !preview) return;
    if (incidentType === "custom" && !customMessage.trim()) return;
    setSubmitting(true);
    setResult(null);
    try {
      const res = await base44.functions.invoke("submitAlertForReview", {
        incident_type: incidentType,
        event_level: eventLevel,
        target_area: targetArea.trim(),
        instructions: instructions.trim(),
        custom_message: customMessage.trim(),
        generated_title: preview.title,
        generated_body: preview.body,
      });
      setResult(res.data || res);
      // Reset form
      setTargetArea("");
      setInstructions("");
      setCustomMessage("");
      await loadData();
    } catch (e) {
      setResult({ error: e.message || "Failed to submit alert" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDispatch = async (submissionId) => {
    setDispatching(submissionId);
    try {
      const res = await base44.functions.invoke("sendApprovedAlert", { submission_id: submissionId });
      setResult(res.data || res);
      await loadData();
    } catch (e) {
      setResult({ error: e.message || "Failed to dispatch alert" });
    } finally {
      setDispatching(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-6 h-6 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin" />
      </div>
    );
  }

  if (!delegation) {
    return (
      <Card className="border-amber-200 bg-amber-50/50">
        <CardContent className="pt-6 text-center">
          <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-3" />
          <p className="font-semibold text-foreground mb-1">No Alert Authorization</p>
          <p className="text-sm text-muted-foreground">
            Your organization is not authorized to send emergency alerts. An admin must grant alert delegation access first.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Submission Form */}
      <Card className="border-amber-200 bg-amber-50/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            Submit Emergency Alert — {delegation.organization_name}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Select the incident type and severity level. Your alert will be reviewed by an admin before it can be dispatched.
            {delegation.is_contracted && (
              <Badge variant="outline" className="ml-2 bg-blue-50 text-blue-700 border-blue-300">
                Contracted: {delegation.contracted_type || "Verified"}
              </Badge>
            )}
            {delegation.provides_shelters && !delegation.is_contracted && (
              <Badge variant="outline" className="ml-2 bg-green-50 text-green-700 border-green-300">
                Shelter Provider
              </Badge>
            )}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Incident Type */}
          <div className="space-y-2">
            <Label>Incident Type</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {availableTypeObjects.map(t => (
                <button
                  key={t.id}
                  onClick={() => setIncidentType(t.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded border text-sm transition-colors ${
                    incidentType === t.id
                      ? "border-primary bg-primary/5 text-foreground font-medium"
                      : "border-border bg-background text-muted-foreground hover:border-primary/30"
                  }`}
                >
                  <span className="text-lg">{t.icon}</span>
                  <span className="text-left">{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Event Level */}
          <div className="space-y-2">
            <Label>Severity Level</Label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {EVENT_LEVELS.map(l => (
                <button
                  key={l.id}
                  onClick={() => setEventLevel(l.id)}
                  className={`px-3 py-2 rounded border text-sm text-center transition-colors ${
                    eventLevel === l.id
                      ? `${l.badgeClass} border-current font-medium`
                      : "border-border bg-background text-muted-foreground hover:border-primary/30"
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">{getEventLevel(eventLevel)?.description}</p>
          </div>

          {/* Target Area */}
          <div className="space-y-2">
            <Label htmlFor="target-area">Target Area</Label>
            <Input
              id="target-area"
              placeholder="e.g. Williamson County, TX"
              value={targetArea}
              onChange={(e) => setTargetArea(e.target.value)}
            />
          </div>

          {/* Custom Message (only for custom type) */}
          {incidentType === "custom" && (
            <div className="space-y-2">
              <Label htmlFor="custom-message">Custom Message</Label>
              <Textarea
                id="custom-message"
                placeholder="Enter your custom alert message..."
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                rows={4}
              />
            </div>
          )}

          {/* Instructions (not for custom type) */}
          {incidentType !== "custom" && (
            <div className="space-y-2">
              <Label htmlFor="instructions">Additional Instructions (optional)</Label>
              <Textarea
                id="instructions"
                placeholder="e.g. Proceed to the main shelter at the fairgrounds..."
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                rows={2}
              />
            </div>
          )}

          {/* Live Preview */}
          {preview && (
            <div className="border rounded-lg p-4 bg-white">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Message Preview (sent to both email &amp; Telegram)</p>
              <div className="flex items-center gap-2 mb-2">
                <Badge className={getEventLevel(eventLevel)?.badgeClass}>
                  {getEventLevel(eventLevel)?.label}
                </Badge>
                <span className="font-sans font-bold text-foreground text-sm">{preview.title}</span>
              </div>
              <p className="text-sm text-foreground whitespace-pre-wrap font-sans leading-relaxed">{preview.body}</p>
              {(eventLevel === "critical" || incidentType === "custom") && (
                <p className="text-xs text-amber-700 mt-3 bg-amber-50 border border-amber-200 rounded px-2 py-1">
                  ⚠️ Critical and custom alerts are sent to BOTH email and Telegram regardless of recipient settings.
                </p>
              )}
            </div>
          )}

          {result && (
            <div className={`rounded-lg p-3 text-sm ${result.error ? "bg-red-50 text-red-800" : "bg-green-50 text-green-800"}`}>
              {result.error ? (
                <p>Error: {result.error}</p>
              ) : (
                <p className="flex items-center gap-2 font-medium">
                  <CheckCircle2 className="w-4 h-4" />
                  {result.message || "Alert submitted successfully."}
                </p>
              )}
            </div>
          )}

          <Button
            onClick={handleSubmit}
            disabled={!incidentType || !preview || submitting || (incidentType === "custom" && !customMessage.trim())}
            className="w-full"
          >
            {submitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                Submitting for Review...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Submit Alert for Admin Review
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Submission History */}
      {submissions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Your Alert Submissions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {submissions.map(s => {
              const it = getIncidentType(s.incident_type);
              const el = getEventLevel(s.event_level);
              return (
                <div key={s.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-lg">{it?.icon}</span>
                      <Badge className={el?.badgeClass}>{el?.label}</Badge>
                      <span className="font-sans font-semibold text-foreground text-sm">{s.generated_title}</span>
                    </div>
                    <StatusBadge status={s.status} />
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{s.generated_body}</p>
                  {s.target_area && (
                    <p className="text-xs text-muted-foreground">Area: {s.target_area}</p>
                  )}
                  {s.admin_notes && (
                    <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-1 mt-2">
                      Admin: {s.admin_notes}
                    </p>
                  )}
                  {s.delivery_summary && (
                    <p className="text-xs text-green-700 mt-2">
                      {(() => {
                        try {
                          const d = JSON.parse(s.delivery_summary);
                          return `Sent: ${d.email_delivered || 0} email · ${d.telegram_delivered || 0} Telegram · ${d.in_app_created || 0} in-app`;
                        } catch { return s.delivery_summary; }
                      })()}
                    </p>
                  )}
                  {s.status === "approved" && !s.sent_at && (
                    <Button
                      size="sm"
                      onClick={() => handleDispatch(s.id)}
                      disabled={dispatching === s.id}
                      className="mt-2 w-full"
                    >
                      {dispatching === s.id ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                          Dispatching...
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5 mr-2" />
                          Dispatch Approved Alert
                        </>
                      )}
                    </Button>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    pending_review: { icon: Clock, label: "Pending Review", class: "bg-yellow-100 text-yellow-800" },
    approved: { icon: CheckCircle2, label: "Approved", class: "bg-green-100 text-green-800" },
    rejected: { icon: XCircle, label: "Rejected", class: "bg-red-100 text-red-800" },
    sent: { icon: CheckCircle2, label: "Sent", class: "bg-blue-100 text-blue-800" },
  };
  const m = map[status] || map.pending_review;
  const Icon = m.icon;
  return (
    <Badge className={m.class}>
      <Icon className="w-3 h-3 mr-1" />
      {m.label}
    </Badge>
  );
}