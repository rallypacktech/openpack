import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertTriangle, MapPin, Clock, Users } from "lucide-react";
import { toast } from "sonner";

/**
 * SafetyBeacon — minimal one-tap "I'm Safe" / "At Rally Point" widget.
 * No SMS, no free-form text. Just status + optional rally point selection.
 * Unique: ties status directly to your pre-defined MeetSpots so family
 * sees exactly where you plan to rally, not just "safe".
 */
export default function SafetyBeacon() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [meetSpots, setMeetSpots] = useState([]);
  const [familyStatuses, setFamilyStatuses] = useState([]);
  const [selectedRallySpot, setSelectedRallySpot] = useState(null);
  const [posting, setPosting] = useState(false);
  const [showRallyPicker, setShowRallyPicker] = useState(false);

  useEffect(() => {
    load();
    // Subscribe to real-time profile updates
    const unsub = base44.entities.UserProfile.subscribe((event) => {
      if (event.type === "update") load();
    });
    return unsub;
  }, []);

  const load = async () => {
    try {
      const u = await base44.auth.me();
      setUser(u);
      const [profiles, spots] = await Promise.all([
        base44.entities.UserProfile.filter({ created_by: u.email }),
        base44.entities.MeetSpot.list(),
      ]);
      setProfile(profiles[0] || null);
      setMeetSpots(spots);

      // Load family statuses
      const resp = await base44.functions.invoke("getFamilyStatuses", {});
      setFamilyStatuses(resp.data.statuses || []);
    } catch (e) {
      console.error(e);
    }
  };

  const postStatus = async (status, rallySpotId = null) => {
    setPosting(true);
    try {
      const spot = rallySpotId ? meetSpots.find((s) => s.id === rallySpotId) : null;
      const profileData = {
        current_status: status,
        status_updated_at: new Date().toISOString(),
      };

      if (profile) {
        await base44.entities.UserProfile.update(profile.id, profileData);
      } else {
        await base44.entities.UserProfile.create(profileData);
      }

      // Send a family message with status + rally spot
      const spotMsg = spot ? ` — rallying at ${spot.name}` : "";
      await base44.entities.FamilyMessage.create({
        sender_id: user.id,
        receiver_id: "family",
        content: status === "safe"
          ? `✅ I'm safe${spotMsg}`
          : `🆘 I need assistance${spotMsg}`,
        message_type: status === "safe" ? "status_safe" : "status_needs_assistance",
      });

      toast.success(status === "safe" ? "Status posted: Safe" : "Status posted: Needs Assistance");
      setShowRallyPicker(false);
      setSelectedRallySpot(null);
      load();
    } catch (e) {
      toast.error("Failed to post status");
    } finally {
      setPosting(false);
    }
  };

  const myStatus = profile?.current_status;
  const myStatusAge = profile?.status_updated_at
    ? Math.round((Date.now() - new Date(profile.status_updated_at)) / 60000)
    : null;

  return (
    <Card className="border-2 border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-sans font-semibold">
          <CheckCircle className="w-4 h-4 text-primary" />
          Safety Beacon
        </CardTitle>
        <p className="text-xs text-muted-foreground font-sans">
          One tap to broadcast your status to family — no phone signal required
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* My current status */}
        {myStatus && myStatus !== "unknown" && (
          <div className={`flex items-center gap-2 px-3 py-2 rounded text-xs font-sans ${
            myStatus === "safe" ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"
          }`}>
            {myStatus === "safe"
              ? <CheckCircle className="w-3.5 h-3.5 text-green-600 flex-shrink-0" />
              : <AlertTriangle className="w-3.5 h-3.5 text-red-600 flex-shrink-0" />}
            <span className={myStatus === "safe" ? "text-green-800" : "text-red-800"}>
              Your status: <strong>{myStatus === "safe" ? "Safe" : "Needs Assistance"}</strong>
              {myStatusAge !== null && ` · ${myStatusAge < 1 ? "just now" : `${myStatusAge}m ago`}`}
            </span>
          </div>
        )}

        {/* Action buttons */}
        {!showRallyPicker ? (
          <div className="grid grid-cols-2 gap-2">
            <Button
              size="sm"
              className="bg-green-600 hover:bg-green-700 text-white font-sans text-xs h-10"
              onClick={() => setShowRallyPicker("safe")}
              disabled={posting}
            >
              <CheckCircle className="w-3.5 h-3.5 mr-1" />
              I'm Safe
            </Button>
            <Button
              size="sm"
              variant="destructive"
              className="font-sans text-xs h-10"
              onClick={() => postStatus("needs_assistance")}
              disabled={posting}
            >
              <AlertTriangle className="w-3.5 h-3.5 mr-1" />
              Need Help
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-xs font-sans font-semibold text-muted-foreground uppercase tracking-widest">
              Rally Point (optional)
            </p>
            {meetSpots.length > 0 ? (
              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                {meetSpots.map((spot) => (
                  <button
                    key={spot.id}
                    onClick={() => setSelectedRallySpot(spot.id === selectedRallySpot ? null : spot.id)}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded border text-left text-xs font-sans transition-colors ${
                      selectedRallySpot === spot.id
                        ? "border-primary bg-primary/5 text-foreground"
                        : "border-border hover:border-primary/50 text-muted-foreground"
                    }`}
                  >
                    <MapPin className="w-3 h-3 flex-shrink-0" />
                    <span>{spot.name}</span>
                    {spot.is_primary && (
                      <Badge className="ml-auto text-[10px] py-0 h-4 bg-primary/10 text-primary">Primary</Badge>
                    )}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground italic font-sans">No rally points set yet</p>
            )}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <Button
                size="sm"
                className="bg-green-600 hover:bg-green-700 text-white font-sans text-xs"
                onClick={() => postStatus("safe", selectedRallySpot)}
                disabled={posting}
              >
                {posting ? "Posting..." : "Post Safe"}
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="font-sans text-xs"
                onClick={() => { setShowRallyPicker(false); setSelectedRallySpot(null); }}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Family statuses */}
        {familyStatuses.length > 0 && (
          <div className="border-t border-border pt-3">
            <p className="text-xs font-sans font-semibold text-muted-foreground uppercase tracking-widest mb-2 flex items-center gap-1">
              <Users className="w-3 h-3" /> Family
            </p>
            <div className="space-y-1.5">
              {familyStatuses.slice(0, 4).map((s, i) => (
                <div key={i} className="flex items-center justify-between text-xs font-sans">
                  <span className="text-foreground font-medium">{s.name}</span>
                  <div className="flex items-center gap-1.5">
                    {s.status === "safe" ? (
                      <CheckCircle className="w-3 h-3 text-green-600" />
                    ) : s.status === "needs_assistance" ? (
                      <AlertTriangle className="w-3 h-3 text-red-600" />
                    ) : (
                      <span className="w-3 h-3 rounded-full bg-gray-300 inline-block" />
                    )}
                    <span className={
                      s.status === "safe" ? "text-green-700" :
                      s.status === "needs_assistance" ? "text-red-700" :
                      "text-muted-foreground"
                    }>
                      {s.status === "safe" ? "Safe" : s.status === "needs_assistance" ? "Needs help" : "Unknown"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}