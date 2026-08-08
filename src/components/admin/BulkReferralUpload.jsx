import React, { useState, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Upload, Loader2, CheckCircle, AlertTriangle } from "lucide-react";

export default function BulkReferralUpload({ onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const fileRef = useRef();

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoading(true);
    setResult(null);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      const extracted = await base44.integrations.Core.ExtractDataFromUploadedFile({
        file_url,
        json_schema: {
          type: "object",
          properties: {
            rows: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  referee_email: { type: "string" },
                  referee_name: { type: "string" },
                  organization_name: { type: "string" },
                  referrer_name: { type: "string" },
                  referrer_email: { type: "string" },
                  audience_type: { type: "string" },
                  message: { type: "string" }
                },
                required: ["referee_email"]
              }
            }
          }
        }
      });
      if (extracted.status !== "success") throw new Error(extracted.details || "Extraction failed");
      const rows = extracted.output?.rows || (Array.isArray(extracted.output) ? extracted.output : []);
      let created = 0, failed = 0;
      for (const row of rows) {
        if (!row.referee_email) { failed++; continue; }
        try {
          await base44.entities.BusinessReferral.create({
            referee_email: row.referee_email,
            referee_name: row.referee_name || "",
            organization_name: row.organization_name || "",
            referrer_name: row.referrer_name || "",
            referrer_email: row.referrer_email || "",
            audience_type: row.audience_type || "general",
            message: row.message || "",
            status: "pending",
          });
          created++;
        } catch { failed++; }
      }
      setResult({ created, failed, total: rows.length });
      if (created > 0) onSuccess?.();
    } catch (err) {
      setResult({ error: err.message || "Upload failed" });
    } finally {
      setLoading(false);
      e.target.value = "";
    }
  };

  return (
    <div className="space-y-2">
      <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={handleFile} />
      <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()} disabled={loading}>
        {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
        {loading ? "Uploading…" : "Bulk Upload Spreadsheet"}
      </Button>
      <p className="text-xs text-muted-foreground">CSV/Excel with columns: referee_email, referee_name, organization_name, referrer_name, referrer_email, audience_type, message</p>
      {result && !result.error && (
        <div className="flex items-center gap-2 text-sm">
          <CheckCircle className="w-4 h-4 text-green-600" />
          <span>Added {result.created} referrals{result.failed > 0 ? `, ${result.failed} skipped` : ""}.</span>
        </div>
      )}
      {result?.error && (
        <div className="flex items-center gap-2 text-sm text-destructive">
          <AlertTriangle className="w-4 h-4" />
          <span>{result.error}</span>
        </div>
      )}
    </div>
  );
}