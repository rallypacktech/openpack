// Re-export the single-source-of-truth country list from the backend shared module
// so the admin dashboard and the backend functions can never drift apart.
export * from "../../base44/shared/wildfireCountries.ts";