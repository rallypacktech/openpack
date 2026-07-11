import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, XCircle, Clock, Mail, Send } from "lucide-react";
import { getIncidentType, getEventLevel } from "@/lib/alertTemplates";

export default function AlertSubmissionsPanel() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [adminNotes, setAdminNotes] = useState({});
  const [filter, setFilter] = useState("pending_review");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const subs = await base44.asServiceRole.entities.AlertSubmission.list("-created_date", 50);
      setSubmissions(subs);
    } catch (e) {
      console.error("Failed to load submissions:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (submissionId, action) => {
    setActionLoading(submissionId);
    try {
      await base44.functions.invoke("approveAlertSubmission", {
        submission_id: submissionId,
        action,
        admin_notes: adminNotes[submissionId] || "",
      });
      await loadData();
    } catch (e) {
      console.error("Failed to update submission:", e);
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = submissions.filter(s => {
    if (filter === "all") return true;
    if (filter === "pending") return s.status === "pending_review";
    if (filter === "approved") return s.status === "approved";
    if (filter === "sent") return s.status === "sent";
    return true;
  });

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-6 h-6 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Alert Submissions for Review
          </CardTitle>
          <div className="flex gap-1">
            {[
              { id: "pending", label: "Pending" },
              { id: "approved", label: "Approved" },
              { id: "sent", label: "Sent" },
              { id: "all", label: "All" },
            ].map(f => (
              <Button
                key={f.id}
                size="sm"
                variant={filter === f.id ? "default" : "outline"}
                onClick={() => setFilter(f.id)}
              >
                {f.label}
              </Button>
            ))}
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          Review and approve emergency alert submissions from organizations before they can be dispatched.
        </p>
      </CardHeader>
      <CardContent>
        {filtered.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Mail className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No alert submissions {filter === "pending" ? "pending review" : "found"}.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map(s => {
              const it = getIncidentType(s.incident_type);
              const el = getEventLevel(s.event_level);
              return (
                <div key={s.id} className={`border rounded-lg p-4 ${s.status === "pending_review" ? "border-yellow-300 bg-yellow-50/30" : "border-border"}`}>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-lg">{it?.icon}</span>
                        <Badge className={el?.badgeClass}>{el?.label}</Badge>
                        <span className="font-sans font-semibold text-foreground">{s.generated_title}</span>
                        <StatusBadge status={s.status} />
                      </div>
                      <div className="text-xs text-muted-foreground space-y-0.5">
                        <p>Organization: <strong>{s.organization_name}</strong></p>
                        <p>Submitted by: {s.submitted_by_email}</p>
                        {s.target_area && <p>Target area: {s.target_area}</p>}
                        {s.approved_by && <p>Approved by: {s.approved_by}</p>}
                      </div>
                    </div>
                  </div>

                  {/* Message preview */}
                  <div className="bg-white border rounded p-3 mb-3">
                    <p className="text-sm text-foreground whitespace-pre-wrap font-sans leading-relaxed">{s.generated_body}</p>
                  </div>

                  {/* Delivery summary if sent */}
                  {s.delivery_summary && (
                    <div className="bg-green-50 border border-green-200 rounded p-2 mb-3">
                      <p className="text-xs text-green-700">
                        {(() => {
                          try {
                            const d = JSON.parse(s.delivery_summary);
                            return `Delivered: ${d.email_delivered || 0} email · ${d.telegram_delivered || 0} Telegram · ${d.in_app_created || 0} in-app · ${d.failed || 0} failed`;
                          } catch { return s.delivery_summary; }
                        })()}
                      </p>
                    </div>
                  )}

                  {/* Admin notes for pending */}
                  {s.status === "pending_review" && (
                    <div className="space-y-2">
                      <Textarea
                        placeholder="Admin notes (optional)..."
                        value={adminNotes[s.id] || ""}
                        onChange={(e) => setAdminNotes({ ...adminNotes, [s.id]: e.target.value })}
                        rows={2}
                        className="text-sm"
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleAction(s.id, "approve")}
                          disabled={actionLoading === s.id}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          {actionLoading === s.id ? "..." : (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                              Approve
                            </>
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAction(s.id, "reject")}
                          disabled={actionLoading === s.id}
                          className="text-red-600 border-red-300 hover:bg-red-50"
                        >
                          <XCircle className="w-3.5 h-3.5 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Admin notes if already reviewed */}
                  {s.admin_notes && s.status !== "pending_review" && (
                    <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-1">
                      Admin notes: {s.admin_notes}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function StatusBadge({ status }) {
  const map = {
    pending_review: { icon: Clock, label: "Pending", class: "bg-yellow-100 text-yellow-800" },
    approved: { icon: CheckCircle2, label: "Approved", class: "bg-green-100 text-green-800" },
    rejected: { icon: XCircle, label: "Rejected", class: "bg-red-100 text-red-800" },
    sent: { icon: Send, label: "Sent", class: "bg-blue-100 text-blue-800" },
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