import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Circle, Printer } from "lucide-react";

// Interactive on-site checklist for the selected country. Ticks are kept in
// memory only — printing produces a clean sheet for a walkthrough.
function printChecklist(region, checked) {
  const itemsHtml = region.checklist
    .map(
      (item, i) =>
        `<li><span class="box">${checked[i] ? "&#9745;" : "&#9744;"}</span>${item}</li>`,
    )
    .join("");
  const win = window.open("", "_blank");
  win.document.write(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${region.label} — Fire &amp; Life Safety Checklist</title>
  <style>
    body { font-family: Georgia, serif; max-width: 720px; margin: 40px auto; padding: 0 24px; color: #111; }
    h1 { font-size: 24px; margin-bottom: 4px; }
    .meta { font-size: 13px; color: #555; margin-bottom: 24px; font-family: sans-serif; }
    ul { list-style: none; padding: 0; margin: 0; }
    li { font-size: 15px; line-height: 1.6; margin-bottom: 10px; padding-left: 26px; text-indent: -26px; }
    .box { font-size: 17px; margin-right: 8px; }
    .logo { font-family: Georgia, serif; font-size: 18px; font-weight: bold; margin-bottom: 4px; }
    .print-note { font-size: 12px; color: #888; font-family: sans-serif; margin-bottom: 24px; }
    .footer { margin-top: 40px; font-size: 12px; color: #888; border-top: 1px solid #ddd; padding-top: 12px; font-family: sans-serif; }
    @media print { .print-note { display: none; } }
  </style>
</head>
<body>
  <div class="logo">RallyPack</div>
  <p class="print-note">To save as PDF: File &rarr; Print &rarr; Save as PDF</p>
  <h1>Fire &amp; Life Safety Checklist — ${region.label}</h1>
  <div class="meta">Inspected against ${region.framework}. Enforced by ${region.authority}.</div>
  <ul>${itemsHtml}</ul>
  <div class="footer">General guidance only — always confirm current requirements with your local authority having jurisdiction.</div>
</body>
</html>`);
  win.document.close();
  win.focus();
  setTimeout(() => win.print(), 400);
}

export default function ComplianceChecklist({ region }) {
  const [checked, setChecked] = useState({});

  // Switching country clears the ticks so one country's progress never carries
  // over to another.
  useEffect(() => {
    setChecked({});
  }, [region.code]);

  const toggle = (i) =>
    setChecked((prev) => ({ ...prev, [i]: !prev[i] }));

  const doneCount = Object.values(checked).filter(Boolean).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center justify-between gap-2">
          <span>On-Site Compliance Checklist</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => printChecklist(region, checked)}
            className="gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" aria-hidden="true" /> Print
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-muted-foreground font-sans mb-3">
          {doneCount}/{region.checklist.length} complete. Walk the site and tick each item.
        </p>
        <ul className="space-y-1">
          {region.checklist.map((item, i) => (
            <li key={item}>
              <button
                onClick={() => toggle(i)}
                aria-pressed={!!checked[i]}
                className="w-full flex items-start gap-2 text-left py-1.5 px-2 -mx-2 rounded hover:bg-secondary/40 transition-colors"
              >
                {checked[i] ? (
                  <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 shrink-0" aria-hidden="true" />
                ) : (
                  <Circle className="w-4 h-4 text-muted-foreground/40 mt-0.5 shrink-0" aria-hidden="true" />
                )}
                <span className={`text-sm font-sans ${checked[i] ? "text-muted-foreground line-through" : "text-foreground"}`}>
                  {item}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}