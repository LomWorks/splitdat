/**
 * Lightweight client-side execution log.
 *
 * Records key application events (tab creation, claims, settlement, guest
 * joins) with timestamps and payload context, entirely in memory + a mirror
 * in sessionStorage so a log survives a page reload during a demo. No
 * network calls, no external service.
 *
 * Usage:
 *   import { logEvent, getExecutionLog, exportExecutionLog } from "./lib/executionLog.js";
 *   logEvent("tab.create", { tabId, hostName, itemCount: items.length });
 *   ...
 *   exportExecutionLog(); // triggers a JSON file download
 */

const STORAGE_KEY = "splitdat-execution-log";
const MAX_ENTRIES = 500;

function readLog() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeLog(entries) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // sessionStorage full or unavailable — log still works in-memory for this session
  }
}

let memoryLog = readLog();

export function logEvent(type, context = {}) {
  const entry = {
    type,
    timestamp: new Date().toISOString(),
    context,
  };

  memoryLog.push(entry);
  if (memoryLog.length > MAX_ENTRIES) {
    memoryLog = memoryLog.slice(-MAX_ENTRIES);
  }

  writeLog(memoryLog);

  if (import.meta.env?.DEV) {
    console.debug(`[execution-log] ${type}`, context);
  }
}

export function getExecutionLog() {
  return [...memoryLog];
}

export function clearExecutionLog() {
  memoryLog = [];
  writeLog(memoryLog);
}

export function exportExecutionLog(filename = "splitdat-execution-log.json") {
  const blob = new Blob([JSON.stringify(memoryLog, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}