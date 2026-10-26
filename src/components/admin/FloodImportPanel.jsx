import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Database, RefreshCw, Download } from "lucide-react";

// Fetch and import are two separate backend calls: the fetch returns the records
// to review, the import writes them. Nothing is stored until Import is pressed.
const SOURCES = [
  { id: "OPENFEMA", label: "OpenFEMA — flood declarations (US)", needsYear: false },
  { id: "NOAA_STORM_EVENTS", label: "NOAA Storm Events (US)", needsYear: true },
];

const UNAVAILABLE_NOTE =
  "EM-DAT and UNDRR DesInventar have no open API — their records are added as manual entries from a downloaded file.";

export default function FloodImportPanel({ onImported }) {
  const [source, setSource] = useState("OPENFEMA");
  const [year, setYear] = useState(String(new Date().getFullYear() - 1));
  const [busy, setBusy] = useState(null); // "fetch" | "import"
  const [preview, setPreview] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const needsYear = SOURCES.find((s) => s.id === source)?.needsYear;

  const handleFetch = async () => {
    setBusy("fetch");
    setError("");
    setMessage("");
    setPreview(null);
    try {
      const res = await base44.functions.invoke("fetchFloodSourceRecords", {
        source,
        limit: 200,
        ...(needsYear ? { year: parseInt(year, 10) || undefined } : {}),
      });
      const data = res.data || {};
      if (data.unavailable) {
        setError(data.reason || "This source cannot be fetched automatically.");
      } else if (data.error) {
        setError(data.error);
      } else {
        setPreview(data);
        setMessage(`${data.returned || 0} records fetched${data.year ? ` for ${data.year}` : ""}. Review, then import.`);
      }
    } catch (e) {
      setError(e?.response?.data?.error || e.message || "Fetch failed");
    } finally {
      setBusy(null);
    }
  };

  const handleImport = async () => {
    if (!preview?.records?.length) return;
    setBusy("import");
    setError("");
    try {
      const res = await base44.functions.invoke("importFloodRecords", { records: preview.records });
      const data = res.data || {};
      if (data.error) {
        setError(data.error);
        return;
      }
      setMessage(`Imported ${data.created} new records (${data.skipped} duplicates skipped).`);
      setPreview(null);
      onImported?.();
    } catch (e) {
      setError(e?.response?.data?.error || e.message || "Import failed");
    } finally {
      setBusy(null);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Database className="w-4 h-4" /> Import Flood Records
        </CardTitle>
        <p className="text-xs text-gray-500">
          Fetch a public source into review, then import. Records already stored are skipped, so a re-run is safe.
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <Select value={source} onValueChange={(v) => { setSource(v); setPreview(null); setMessage(""); setError(""); }}>
            <SelectTrigger className="w-[280px] h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SOURCES.map((s) => <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>)}
            </SelectContent>
          </Select>

          {needsYear && (
            <Input
              type="number"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              min="2010"
              max={new Date().getFullYear()}
              className="w-[100px] h-8 text-sm"
              aria-label="Storm Events year"
            />
          )}

          <Button size="sm" variant="outline" onClick={handleFetch} disabled={!!busy}>
            {busy === "fetch" ? <><RefreshCw className="w-4 h-4 mr-1 animate-spin" /> Fetching…</> : <>Fetch records</>}
          </Button>

          <Button size="sm" onClick={handleImport} disabled={!!busy || !preview?.records?.length}>
            {busy === "import"
              ? <><RefreshCw className="w-4 h-4 mr-1 animate-spin" /> Importing…</>
              : <><Download className="w-4 h-4 mr-1" /> Import {preview?.records?.length || ""}</>}
          </Button>
        </div>

        {message && <p className="text-xs text-blue-700 bg-blue-50 border border-blue-200 rounded px-3 py-2">{message}</p>}
        {error && <p className="text-xs text-red-700 bg-red-50 border border-red-200 rounded px-3 py-2">{error}</p>}
        {preview?.note && <p className="text-xs text-gray-500">{preview.note}</p>}
        <p className="text-xs text-gray-400">{UNAVAILABLE_NOTE}</p>
      </CardContent>
    </Card>
  );
}