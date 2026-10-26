import { base44 } from "@/api/base44Client";

// Every dashboard widget used to ask the API who is signed in, and for that
// user's profile, all over again: four copies of the same two requests in a
// single page load, repeated on every navigation. That burst is what trips the
// app's rate limit.
//
// The helpers below collapse the duplicates. The signed-in user is cached for
// the session (logging in and out are full page loads, so it can never go
// stale in a running tab), and profile lookups share one in-flight request
// instead of racing each other.

const USER_TTL_MS = 5 * 60 * 1000;
const ANON_TTL_MS = 30 * 1000;

let cachedUser = null;
let cachedUntil = 0;
let userInFlight = null;

// The signed-in user, or a thrown error for an anonymous visitor — same
// contract as base44.auth.me(), just answered from the cache when it can be.
export async function getCurrentUser() {
  if (Date.now() < cachedUntil) return cachedUser;
  if (!userInFlight) {
    userInFlight = base44.auth
      .me()
      .then((user) => {
        cachedUser = user;
        cachedUntil = Date.now() + USER_TTL_MS;
        return user;
      })
      .catch((error) => {
        // Remember the anonymous answer briefly so public pages don't re-ask
        // on every widget that mounts.
        cachedUser = null;
        cachedUntil = Date.now() + ANON_TTL_MS;
        throw error;
      })
      .finally(() => {
        userInFlight = null;
      });
  }
  return userInFlight;
}

let profileInFlight = null;
let cachedProfile = null;
let profileCacheUntil = 0;

// The profile is read by the header, the beacon, the heartbeat and the page
// itself within the same second of every navigation — four reads of one record.
// It is therefore reused for a moment: long enough that one page load shares a
// single read, short enough that an edit is never masked. Writers call
// invalidateMyProfile() so a save shows up immediately.
const PROFILE_TTL_MS = 5000;

export function invalidateMyProfile() {
  cachedProfile = null;
  profileCacheUntil = 0;
}

// The signed-in user's profile record, or null if they don't have one yet.
export async function getMyProfile() {
  if (profileCacheUntil > Date.now()) return cachedProfile;
  if (!profileInFlight) {
    profileInFlight = (async () => {
      const user = await getCurrentUser();
      if (!user?.email) return null;
      const profiles = await base44.entities.UserProfile.filter({
        created_by: user.email,
      });
      const profile = profiles[0] || null;
      // A missing record is never cached: the dashboard bootstraps one, and the
      // next check has to see it instead of a remembered "no profile".
      if (profile) {
        cachedProfile = profile;
        profileCacheUntil = Date.now() + PROFILE_TTL_MS;
      }
      return profile;
    })().finally(() => {
      profileInFlight = null;
    });
  }
  return profileInFlight;
}