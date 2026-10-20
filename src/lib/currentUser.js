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

// The signed-in user's profile record, or null if they don't have one yet.
// Deliberately not cached: the profile is edited all over the app, so every
// call gets a fresh answer. Only simultaneous callers share one request.
export async function getMyProfile() {
  if (!profileInFlight) {
    profileInFlight = (async () => {
      const user = await getCurrentUser();
      if (!user?.email) return null;
      const profiles = await base44.entities.UserProfile.filter({
        created_by: user.email,
      });
      return profiles[0] || null;
    })().finally(() => {
      profileInFlight = null;
    });
  }
  return profileInFlight;
}