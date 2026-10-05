import React from "react";
import { Clock, Activity } from "lucide-react";

function isSameDay(value) {
  if (!value) return false;
  const d = new Date(value);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

function AlertRow({ incident, typeConfig, severityBadge, highlighted }) {
  const cfg = typeConfig[incident.type] || typeConfig.other;
  const Icon = cfg.icon;
  const sameDay = isSameDay(incident.sent || incident.effective);

  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-lg border bg-white transition-shadow ${
        highlighted ? "border-gray-300 shadow-sm" : "border-gray-200"
      }`}
    >
      <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ background: cfg.bgColor }}>
        <Icon className="w-4 h-4" style={{ color: cfg.color }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="font-semibold text-gray-900 text-sm">{incident.title}</p>
          <span className={`text-xs px-2 py-0.5 rounded border font-medium ${severityBadge[incident.severity] || severityBadge.watch}`}>
            {incident.severity?.toUpperCase()}
          </span>
          {!incident.isExpired && (
            <span className="text-xs px-2 py-0.5 rounded border font-medium bg-green-100 text-green-800 border-green-300">
              ACTIVE
            </span>
          )}
          {sameDay && (
            <span className="text-xs px-2 py-0.5 rounded border font-medium bg-blue-100 text-blue-800 border-blue-300">
              TODAY
            </span>
          )}
          {incident.isExpired && (
            <span className="text-xs px-2 py-0.5 rounded border font-medium bg-gray-100 text-gray-500 border-gray-300">
              EXPIRED
            </span>
          )}
          {incident.agency && <span className="text-xs text-gray-400 font-mono">{incident.agency}</span>}
        </div>
        <p className="text-xs text-gray-500 mt-0.5">{incident.state}</p>
        <div className="flex items-center gap-3 mt-1 flex-wrap">
          {incident.sent && (
            <p className="text-xs text-gray-400 flex items-center gap-1">
              <Clock className="w-3 h-3" aria-hidden="true" />
              Issued {new Date(incident.sent).toLocaleString()}
            </p>
          )}
          {incident.expires && (
            <p className={`text-xs flex items-center gap-1 ${incident.isExpired ? "text-red-600 font-medium" : "text-gray-400"}`}>
              <Clock className="w-3 h-3" aria-hidden="true" />
              {incident.isExpired ? "Expired" : "Expires"} {new Date(incident.expires).toLocaleString()}
            </p>
          )}
        </div>
        {incident.description && (
          <p className="text-xs text-gray-600 mt-1 leading-relaxed line-clamp-2">{incident.description}</p>
        )}
      </div>
    </div>
  );
}

export default function AlertLog({ incidents = [], typeConfig, severityBadge }) {
  const activeOrToday = [];
  const earlier = [];

  for (const incident of incidents) {
    if (!incident.isExpired || isSameDay(incident.sent || incident.effective)) {
      activeOrToday.push(incident);
    } else {
      earlier.push(incident);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-widest flex items-center gap-2">
          <Activity className="w-4 h-4 text-green-600" aria-hidden="true" />
          Alert Log
        </h3>
        <p className="text-xs text-gray-400">
          {incidents.length} alert{incidents.length !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Active &amp; Same-Day ({activeOrToday.length})
        </p>
        {activeOrToday.length === 0 ? (
          <p className="text-xs text-gray-400 italic py-2">No active or same-day alerts right now.</p>
        ) : (
          activeOrToday.map((incident) => (
            <AlertRow
              key={incident.id}
              incident={incident}
              typeConfig={typeConfig}
              severityBadge={severityBadge}
              highlighted
            />
          ))
        )}
      </div>

      {earlier.length > 0 && (
        <div className="space-y-2 pt-3 border-t border-gray-200">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Earlier ({earlier.length})</p>
          {earlier.map((incident) => (
            <AlertRow
              key={incident.id}
              incident={incident}
              typeConfig={typeConfig}
              severityBadge={severityBadge}
            />
          ))}
        </div>
      )}
    </div>
  );
}