import { useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";

// Updates the user's last_active timestamp periodically while they're active in the app.
// This powers the "Online Now" count in the admin system monitor.
// Throttled: only writes if >60s since last write AND user interacted in the last 5 min.
const HEARTBEAT_INTERVAL = 90 * 1000; // check every 90s
const STALE_THRESHOLD = 60 * 1000; // skip write if last write was <60s ago
const IDLE_THRESHOLD = 5 * 60 * 1000; // don't heartbeat if user idle >5 min

export function useActivityHeartbeat() {
  const lastInteractionRef = useRef(Date.now());
  const lastWriteRef = useRef(0);
  const profileIdRef = useRef(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    let mounted = true;

    const onActivity = () => {
      lastInteractionRef.current = Date.now();
    };
    const events = ["mousemove", "keydown", "click", "scroll", "touchstart"];
    events.forEach((e) => window.addEventListener(e, onActivity, { passive: true }));

    const onVisibility = () => {
      if (!document.hidden) {
        lastInteractionRef.current = Date.now();
        heartbeat();
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    const heartbeat = async () => {
      if (!mounted || !profileIdRef.current) return;
      const now = Date.now();
      if (now - lastWriteRef.current < STALE_THRESHOLD) return;
      if (now - lastInteractionRef.current > IDLE_THRESHOLD) return;
      try {
        await base44.entities.UserProfile.update(profileIdRef.current, {
          last_active: new Date().toISOString(),
        });
        lastWriteRef.current = now;
      } catch (e) {
        // Best-effort — don't disrupt the user's session
      }
    };

    (async () => {
      try {
        const user = await base44.auth.me();
        if (!user) return;
        const profiles = await base44.entities.UserProfile.filter({ created_by_id: user.id });
        if (profiles.length > 0 && mounted) {
          profileIdRef.current = profiles[0].id;
          heartbeat();
          intervalRef.current = setInterval(heartbeat, HEARTBEAT_INTERVAL);
        }
      } catch (e) {
        // Not logged in — no heartbeat needed
      }
    })();

    return () => {
      mounted = false;
      events.forEach((e) => window.removeEventListener(e, onActivity));
      document.removeEventListener("visibilitychange", onVisibility);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);
}