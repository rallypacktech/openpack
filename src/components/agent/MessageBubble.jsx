import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import { ChevronRight, Loader2, CheckCircle, XCircle } from "lucide-react";

const STATUS_META = {
  pending: { Icon: Loader2, label: "Queued", spin: true, color: "text-muted-foreground" },
  running: { Icon: Loader2, label: "Running", spin: true, color: "text-muted-foreground" },
  in_progress: { Icon: Loader2, label: "Running", spin: true, color: "text-muted-foreground" },
  completed: { Icon: CheckCircle, label: "Done", color: "text-green-600" },
  success: { Icon: CheckCircle, label: "Done", color: "text-green-600" },
  failed: { Icon: XCircle, label: "Failed", color: "text-red-600" },
  error: { Icon: XCircle, label: "Error", color: "text-red-600" },
};

function formatName(name = "") {
  return name.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function FunctionDisplay({ toolCall }) {
  const [expanded, setExpanded] = useState(false);
  const status = toolCall.status || "pending";
  const meta = STATUS_META[status] || STATUS_META.pending;
  const proj = toolCall.display_projection || {};
  const hideAll = proj.hide_details && proj.details_redacted;
  const isFailed =
    status === "failed" ||
    status === "error" ||
    (typeof toolCall.results === "object" && toolCall.results && toolCall.results.success === false) ||
    (typeof toolCall.results === "string" && /error|failed/i.test(toolCall.results));

  const stateLabel = hideAll
    ? ["failed", "error"].includes(status)
      ? proj.error_label || meta.label
      : ["pending", "running", "in_progress"].includes(status)
      ? proj.active_label || meta.label
      : proj.label || meta.label
    : null;

  let parsedArgs = toolCall.arguments_string;
  try {
    parsedArgs = JSON.parse(toolCall.arguments_string);
  } catch {
    /* keep raw */
  }
  let parsedResults = toolCall.results;
  if (typeof parsedResults === "string") {
    try {
      parsedResults = JSON.parse(parsedResults);
    } catch {
      /* keep raw */
    }
  }

  const Icon = isFailed ? XCircle : meta.Icon;

  return (
    <div className="mt-2 text-xs border border-border rounded bg-muted/40">
      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        className="flex items-center gap-2 w-full px-2.5 py-1.5 text-left hover:bg-muted/60 transition-colors"
      >
        <ChevronRight className={`w-3 h-3 transition-transform ${expanded ? "rotate-90" : ""}`} />
        <Icon className={`w-3.5 h-3.5 ${meta.color} ${meta.spin && !isFailed ? "animate-spin" : ""}`} />
        <span className="font-medium">{proj.label || formatName(toolCall.name)}</span>
        <span className={`ml-auto ${isFailed ? "text-red-600" : meta.color}`}>
          {stateLabel || meta.label}
        </span>
      </button>
      {!hideAll && expanded && (
        <div className="px-2.5 pb-2.5 pt-1 space-y-1.5 border-t border-border">
          {toolCall.arguments_string && (
            <div>
              <p className="font-semibold text-muted-foreground mb-0.5">Parameters</p>
              <pre className="whitespace-pre-wrap break-words bg-background p-1.5 rounded text-xs">
                {typeof parsedArgs === "string" ? parsedArgs : JSON.stringify(parsedArgs, null, 2)}
              </pre>
            </div>
          )}
          {parsedResults !== undefined && parsedResults !== null && (
            <div>
              <p className="font-semibold text-muted-foreground mb-0.5">Result</p>
              <pre className="whitespace-pre-wrap break-words bg-background p-1.5 rounded text-xs">
                {typeof parsedResults === "string" ? parsedResults : JSON.stringify(parsedResults, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function MessageBubble({ message }) {
  const isUser = message.role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] rounded-lg px-3.5 py-2.5 ${
          isUser ? "bg-primary text-primary-foreground" : "bg-card border border-border"
        }`}
      >
        {message.content &&
          (isUser ? (
            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
          ) : (
            <div className="text-sm space-y-2 [&_p]:leading-relaxed [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:list-decimal [&_ol]:pl-4 [&_a]:underline [&_strong]:font-semibold">
              <ReactMarkdown>{message.content}</ReactMarkdown>
            </div>
          ))}
        {message.tool_calls?.map((tc, i) => (
          <FunctionDisplay key={i} toolCall={tc} />
        ))}
      </div>
    </div>
  );
}