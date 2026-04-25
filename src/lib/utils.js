import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
} 


export const isIframe = window.self !== window.top;

// Safari Private Browsing throws SecurityError on sessionStorage/localStorage access
export function safeSessionGet(key) {
  try { return sessionStorage.getItem(key); } catch { return null; }
}

export function safeSessionSet(key, value) {
  try { sessionStorage.setItem(key, value); } catch { /* ignore */ }
}