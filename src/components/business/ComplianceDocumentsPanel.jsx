import React, { useRef, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Paperclip, Upload, Eye, Trash2, Loader2, FileText } from "lucide-react";
import ExpiryStatusBadge from "@/components/business/ExpiryStatusBadge";
import { sortByExpiry, formatExpiryDate } from "@/lib/expiryStatus";

// One document per tracked item — the certificate, service report or inspection
// record an inspector or insurer asks for. Files are stored privately and opened
// through a short-lived signed link.
export default function ComplianceDocumentsPanel({ records, onChanged }) {
  const [busyId, setBusyId] = useState(null);
  const [targetId, setTargetId] = useState(null);
  const [error, setError] = useState("");
  const inputRef = useRef(null);

  const pickFile = (recordId) => {
    setError("");
    setTargetId(recordId);
    inputRef.current?.click();
  };

  const handleFile = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !targetId) return;
    const recordId = targetId;
    setTargetId(null);
    setBusyId(recordId);
    setError("");
    try {
      const { file_uri } = await base44.integrations.Core.UploadPrivateFile({ file });
      await base44.entities.ComplianceRecord.update(recordId, {
        document_uri: file_uri,
        document_name: file.name,
        document_uploaded_at: new Date().toISOString(),
      });
      onChanged();
    } catch (e) {
      setError(e?.message || "That file could not be uploaded. Please try again.");
    } finally {
      setBusyId(null);
    }
  };

  const view = async (record) => {
    setBusyId(record.id);
    setError("");
    try {
      const { signed_url } = await base44.integrations.Core.CreateFileSignedUrl({
        file_uri: record.document_uri,
        expires_in: 300,
      });
      window.open(signed_url, "_blank", "noopener");
    } catch (e) {
      setError(e?.message || "That document could not be opened.");
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (record) => {
    setBusyId(record.id);
    setError("");
    try {
      await base44.entities.ComplianceRecord.update(record.id, { document_uri: "", document_name: "" });
      onChanged();
    } finally {
      setBusyId(null);
    }
  };

  const sorted = sortByExpiry(records);

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-semibold text-foreground text-sm">Compliance documents</h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          Keep the certificate, service report or inspection record for each item on file, so
          an inspection never turns into a hunt for paperwork.
        </p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.png,.jpg,.jpeg,.webp,.doc,.docx,.xls,.xlsx"
        onChange={handleFile}
        className="hidden"
        aria-hidden="true"
        tabIndex={-1}
      />

      {error && (
        <p className="text-sm text-destructive" role="alert">{error}</p>
      )}

      {sorted.length === 0 ? (
        <Card className="text-center py-10">
          <CardContent>
            <Paperclip className="w-7 h-7 text-muted-foreground mx-auto mb-2" aria-hidden="true" />
            <p className="text-sm text-muted-foreground">
              Nothing to attach a document to yet. Add an inspection or certification on the
              Inspection status tab first.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {sorted.map((record) => (
            <Card key={record.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-foreground">{record.title}</span>
                      <Badge variant="outline" className="text-xs">
                        {record.record_type === "staff_certification" ? "Certification" : "Inspection"}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {record.record_type === "staff_certification"
                        ? record.holder_name || "Unassigned"
                        : record.location || "No location set"}
                    </p>
                    <div className="mt-1.5">
                      {record.document_uri ? (
                        <span className="inline-flex items-center gap-1.5 text-xs text-foreground/80">
                          <FileText className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                          {record.document_name || "Document"}
                          {record.document_uploaded_at && (
                            <span className="text-muted-foreground">
                              · added {formatExpiryDate(record.document_uploaded_at)}
                            </span>
                          )}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">No document on file</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <ExpiryStatusBadge expiration_date={record.expiration_date} />
                    {record.document_uri ? (
                      <>
                        <Button variant="outline" size="sm" className="gap-1.5" onClick={() => view(record)} disabled={busyId === record.id}>
                          {busyId === record.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Eye className="w-3.5 h-3.5" />}
                          View
                        </Button>
                        <Button variant="ghost" size="sm" className="gap-1.5" onClick={() => pickFile(record.id)} disabled={busyId === record.id}>
                          <Upload className="w-3.5 h-3.5" /> Replace
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive hover:text-destructive"
                          onClick={() => remove(record)}
                          disabled={busyId === record.id}
                          aria-label={`Remove the document for ${record.title}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </>
                    ) : (
                      <Button variant="outline" size="sm" className="gap-1.5" onClick={() => pickFile(record.id)} disabled={busyId === record.id}>
                        {busyId === record.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                        Upload
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}