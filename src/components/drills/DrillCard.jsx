import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, MapPin, Clock, ExternalLink, Flag, Edit, Trash2, Building2 } from "lucide-react";
import DrillFlagDialog from "@/components/drills/DrillFlagDialog";
import { drillTypeLabel, DRILL_STATUS_LABELS } from "@/lib/drillTypes";

const STATUS_STYLES = {
  scheduled: "bg-green-50 text-green-700 border-green-200",
  completed: "bg-muted text-muted-foreground border-border",
  cancelled: "bg-red-50 text-red-700 border-red-200",
};

export default function DrillCard({ drill, user, onRequireSignIn, onEdit, onChanged }) {
  const [showFlag, setShowFlag] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const isOwner = !!user && drill.created_by_id === user.id;
  const dateLabel = drill.date
    ? new Date(`${drill.date}T00:00:00`).toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "Date to be confirmed";

  const place = [drill.venue, drill.city, drill.admin1_name, drill.country_code]
    .filter(Boolean)
    .join(" · ");

  const handleDelete = async () => {
    setDeleting(true);
    await base44.entities.CommunityDrill.delete(drill.id);
    setDeleting(false);
    onChanged();
  };

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3 flex-wrap mb-2">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className="text-xs">{drillTypeLabel(drill.drill_type)}</Badge>
            <Badge variant="outline" className={`text-xs ${STATUS_STYLES[drill.status] || ""}`}>
              {DRILL_STATUS_LABELS[drill.status] || "Scheduled"}
            </Badge>
            {drill.open_to_public === false && (
              <Badge variant="outline" className="text-xs">Members only</Badge>
            )}
          </div>
          {isOwner && (
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onEdit(drill)} aria-label="Edit this listing">
                <Edit className="w-3.5 h-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-destructive hover:text-destructive"
                onClick={handleDelete}
                disabled={deleting}
                aria-label="Delete this listing"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          )}
        </div>

        <h3 className="font-serif text-lg font-semibold text-foreground leading-snug">{drill.title}</h3>
        <p className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
          <Building2 className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          {drill.organization_name}
        </p>

        <div className="flex flex-wrap gap-x-5 gap-y-1.5 mt-3 text-sm text-foreground/80">
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            {dateLabel}
          </span>
          {(drill.start_time || drill.end_time) && (
            <span className="inline-flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              {[drill.start_time, drill.end_time].filter(Boolean).join(" – ")}
            </span>
          )}
          {place && (
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              {place}
            </span>
          )}
        </div>

        {drill.description && (
          <p className="text-sm text-muted-foreground mt-3 leading-relaxed">{drill.description}</p>
        )}

        <div className="flex items-center gap-3 mt-4 flex-wrap">
          {drill.registration_url && (
            <a
              href={drill.registration_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
            >
              Register or learn more <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
            </a>
          )}
          {drill.contact_email && (
            <a href={`mailto:${drill.contact_email}`} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              {drill.contact_email}
            </a>
          )}
          <button
            type="button"
            onClick={() => setShowFlag(true)}
            className="ml-auto inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-destructive transition-colors"
          >
            <Flag className="w-3.5 h-3.5" aria-hidden="true" /> Flag an issue
          </button>
        </div>

        <DrillFlagDialog
          open={showFlag}
          onOpenChange={setShowFlag}
          drill={drill}
          user={user}
          onRequireSignIn={onRequireSignIn}
        />
      </CardContent>
    </Card>
  );
}