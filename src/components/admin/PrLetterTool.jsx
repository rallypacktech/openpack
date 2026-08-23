import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Send, Download, Sparkles, Mail } from "lucide-react";

// PR letter generator: drafts a tailored letter from the public report
// aggregate via InvokeLLM, then lets the admin edit, print, or email it.
// `report` is optional — if omitted, the tool fetches it itself (Admin Monitor use).
export default function PrLetterTool({ report: reportProp }) {
  const [report, setReport] = useState(reportProp || null);
  const [recipientType, setRecipientType] = useState("press");
  const [recipientName, setRecipientName] = useState("");
  const [focusCountry, setFocusCountry] = useState("");
  const [draft, setDraft] = useState("");
  const [subject, setSubject] = useState("RallyPack 10-Year Wildfire Trend Report — Prevention Briefing");
  const [generating, setGenerating] = useState(false);
  const [sending, setSending] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState("");
  const [status, setStatus] = useState(null);

  useEffect(() => {
    if (!reportProp) {
      (async () => {
        try {
          const res = await base44.functions.invoke("getPublicWildfireReport", {});
          setReport(res.data);
        } catch (e) {}
      })();
    }
  }, [reportProp]);

  const statsBlock = () => {
    if (!report) return "Report data unavailable.";
    const t = report.totals;
    const topCount = (report.top_countries_by_count || []).slice(0, 3).map((c) => `${c.name} (${c.count})`).join(", ");
    const topHa = (report.top_countries_by_hectares || []).slice(0, 3).map((c) => `${c.name} (${Math.round(c.hectares).toLocaleString()} ha)`).join(", ");
    const hp = report.holiday_proximity || {};
    return [
      `Total recorded wildfires (10 yr): ${t.total_incidents.toLocaleString()}`,
      `Hectares burned across recorded incidents: ${t.total_hectares.toLocaleString()}`,
      `Countries affected: ${t.countries_affected}`,
      `Structures destroyed: ${(t.total_structures || 0).toLocaleString()} · Fatalities: ${(t.total_fatalities || 0).toLocaleString()}`,
      `Top by count: ${topCount}`,
      `Top by hectares: ${topHa}`,
      `Fires within 24h of a firework holiday: ${hp.within_24h || 0} (${(hp.pct_24h || 0).toFixed(1)}% of fires in firework-holiday countries)`,
      `Spikes: 2017–2018 and 2024–2025 (2024 coincides with the 2023–2024 El Niño).`,
    ].join("\n");
  };

  const generate = async () => {
    setGenerating(true);
    setStatus(null);
    try {
      const prompt = `You are drafting a public-relations letter from RallyPack, a nonprofit disaster-preparedness platform, to ${recipientType === "press" ? "a journalist or newsroom" : "a municipal government official"}${recipientName ? ` (${recipientName})` : ""}${focusCountry ? `, focused on ${focusCountry}` : ""}.

Use ONLY these verified figures from RallyPack's 10-year wildfire trend report (do not invent numbers):
${statsBlock()}

Methodology note to include: causes are canonicalized; fires that smoulder and re-ignite may be counted separately, which can inflate counts; no records were modified; hectares are burned area across recorded incidents, not a global total.

Write a concise, professional letter (350–500 words) that:
1. Opens with the trend story and the 2017–2018 / 2024–2025 spikes.
2. Highlights the firework-holiday correlation and the dominance of human-caused fires.
3. Frames these as preventable and proposes 3–4 concrete prevention actions (public fireworks restrictions, debris-burning bans during high-risk weather, community alert signup at rallypack.org, brush-clearance programs).
4. Closes with an offer of the full dataset and a spokesperson contact (beta@rallypack.tech).
Return only the letter body text, no subject line.`;
      const res = await base44.integrations.Core.InvokeLLM({ prompt });
      setDraft(res.data || res);
      setStatus({ ok: true, msg: "Draft generated — review and edit below." });
    } catch (e) {
      setStatus({ ok: false, msg: e.response?.data?.error || e.message || "Generation failed" });
    } finally {
      setGenerating(false);
    }
  };

  const printLetter = () => {
    const win = window.open("", "_blank");
    win.document.write(`<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>PR Letter — RallyPack</title>
    <style>body{font-family:Georgia,serif;max-width:720px;margin:36px auto;padding:0 24px;color:#111;line-height:1.6}h1{font-size:18px}.meta{font-size:12px;color:#666;margin-bottom:20px;font-family:sans-serif}.logo{font-weight:bold;font-size:18px;margin-bottom:4px}@media print{.noprint{display:none}}</style></head>
    <body><div class="logo">RallyPack</div><p class="noprint">File → Print → Save as PDF</p>
    <h1>${subject}</h1><div class="meta">${recipientType === "press" ? "To: Press" : "To: Municipal official"}${recipientName ? " — " + recipientName : ""}</div>
    <pre style="white-space:pre-wrap;font-family:Georgia,serif;font-size:14px">${(draft || "").replace(/</g, "&lt;")}</pre>
    </body></html>`);
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 400);
  };

  const sendEmail = async () => {
    if (!recipientEmail) { setStatus({ ok: false, msg: "Enter a recipient email." }); return; }
    setSending(true);
    setStatus(null);
    try {
      await base44.integrations.Core.SendEmail({ to: recipientEmail, subject, body: draft });
      setStatus({ ok: true, msg: `Email sent to ${recipientEmail}.` });
    } catch (e) {
      setStatus({ ok: false, msg: e.response?.data?.error || e.message || "Email failed — try downloading instead." });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <Label className="text-xs">Recipient type</Label>
          <Select value={recipientType} onValueChange={setRecipientType}>
            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="press">Press / journalist</SelectItem>
              <SelectItem value="municipality">Municipality / official</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs">Recipient name / org</Label>
          <Input className="mt-1" value={recipientName} onChange={(e) => setRecipientName(e.target.value)} placeholder="e.g. City of Austin / The Globe" />
        </div>
        <div>
          <Label className="text-xs">Focus country (optional)</Label>
          <Input className="mt-1" value={focusCountry} onChange={(e) => setFocusCountry(e.target.value)} placeholder="e.g. United States" />
        </div>
      </div>

      <Button onClick={generate} disabled={generating || !report}>
        {generating ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Sparkles className="w-4 h-4 mr-1" />}
        Generate draft from report
      </Button>

      {status && (
        <p className={`text-xs ${status.ok ? "text-green-600" : "text-red-600"}`}>{status.msg}</p>
      )}

      {draft && (
        <Card>
          <CardContent className="pt-4 space-y-3">
            <div>
              <Label className="text-xs">Subject</Label>
              <Input className="mt-1" value={subject} onChange={(e) => setSubject(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs">Letter body (editable)</Label>
              <Textarea className="mt-1 min-h-[280px] font-sans text-sm" value={draft} onChange={(e) => setDraft(e.target.value)} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Recipient email (to send)</Label>
                <Input className="mt-1" type="email" value={recipientEmail} onChange={(e) => setRecipientEmail(e.target.value)} placeholder="press@example.com" />
              </div>
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              <Button variant="outline" size="sm" onClick={printLetter}><Download className="w-4 h-4 mr-1" /> Print / Save as PDF</Button>
              <Button size="sm" onClick={sendEmail} disabled={sending}>
                {sending ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Send className="w-4 h-4 mr-1" />} Send via email
              </Button>
            </div>
            <p className="text-[11px] text-muted-foreground flex items-center gap-1"><Mail className="w-3 h-3" /> Email delivery to non-RallyPack addresses requires a connected domain and may be subject to screening.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}