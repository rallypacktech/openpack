import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const TOTAL_LIMIT = 50000;

function Line({ label, used, limit, hint }) {
  const pct = limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 0;
  return (
    <div>
      <div className="flex items-baseline justify-between mb-1.5">
        <span className="text-sm font-medium text-foreground">{label}</span>
        <span className="text-sm text-muted-foreground tabular-nums">
          {used.toLocaleString()} / {limit.toLocaleString()} chars
        </span>
      </div>
      <Progress value={pct} className="h-1.5" />
      {hint && <p className="text-xs text-muted-foreground mt-1.5">{hint}</p>}
    </div>
  );
}

/** Monthly DeepL ledger: what page translation has spent and what is held back. */
export default function TranslationBudgetPanel({ usage, monthLabel }) {
  const pageUsed = usage?.page_chars_used || 0;
  const chatUsed = usage?.chat_chars_used || 0;
  const pageLimit = usage?.page_char_limit ?? 30000;
  const chatReserve = usage?.chat_reserve ?? 20000;
  const pageRemaining = Math.max(0, pageLimit - pageUsed);

  return (
    <Card>
      <CardContent className="pt-6 space-y-5">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <div>
            <h2 className="font-serif text-xl font-bold text-foreground">Monthly translation budget</h2>
            <p className="text-xs text-muted-foreground">{monthLabel} · resets on the 1st</p>
          </div>
          <span className="text-sm text-muted-foreground tabular-nums">
            {(pageUsed + chatUsed).toLocaleString()} / {TOTAL_LIMIT.toLocaleString()} chars used this month
          </span>
        </div>

        <Line
          label="Public page translation"
          used={pageUsed}
          limit={pageLimit}
          hint={`${pageRemaining.toLocaleString()} characters left for pages this month.`}
        />
        <Line
          label="Held-back reserve"
          used={chatUsed}
          limit={chatReserve}
          hint={`${Math.max(0, chatReserve - chatUsed).toLocaleString()} characters of reserve left — available to pages or the chatbot.`}
        />
      </CardContent>
    </Card>
  );
}