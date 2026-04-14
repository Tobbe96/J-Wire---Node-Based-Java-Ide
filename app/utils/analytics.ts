'use client';

/**
 * Lightweight anonymous analytics — stores usage counts in localStorage.
 * No external services, no PII, no network requests.
 *
 * Usage:
 *   analytics.track('compile');
 *   analytics.track('template_loaded', { template: 'hello-world' });
 *   analytics.getSummary();
 */

const STORAGE_KEY = 'devflow_analytics';

interface AnalyticsData {
  events: Record<string, number>;
  firstSeen: string;
  lastSeen: string;
  sessions: number;
}

function loadData(): AnalyticsData {
  if (typeof window === 'undefined') {
    return { events: {}, firstSeen: '', lastSeen: '', sessions: 0 };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // Corrupted data — start fresh
  }
  return {
    events: {},
    firstSeen: new Date().toISOString(),
    lastSeen: new Date().toISOString(),
    sessions: 0,
  };
}

function saveData(data: AnalyticsData) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Storage full or unavailable — silently ignore
  }
}

/** Track an event by name. Increments a counter. */
function track(event: string) {
  const data = loadData();
  data.events[event] = (data.events[event] ?? 0) + 1;
  data.lastSeen = new Date().toISOString();
  saveData(data);
}

/** Record a new session (call once on app load). */
function recordSession() {
  const data = loadData();
  data.sessions += 1;
  data.lastSeen = new Date().toISOString();
  saveData(data);
}

/** Get a summary of all tracked data. */
function getSummary(): AnalyticsData {
  return loadData();
}

/** Clear all analytics data. */
function clear() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}

export const analytics = { track, recordSession, getSummary, clear };
