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
      const { file_url } = await base44.integrations.Core.UploadPublicFile({ file });
      const res = await base44.functions.invoke("importReferralSpreadsheet", { file_url });
      if (res.data?.error) throw new Error(res.data.error);
      const { created, failed, total } = res.data || {};
      setResult({ created, failed, total });
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