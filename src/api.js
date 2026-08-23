import { Platform } from "react-native";

// Change this to your live tunnel URL. Works with any Dropicgram backend.
export const API_BASE = "https://dose-introduces-hughes-workflow.trycloudflare.com";

let token = null;
export function setToken(t) {
  token = t;
}
export function getToken() {
  return token;
}

export function wsUrl() {
  const host = API_BASE.replace(/^https?:\/\//, "");
  return `wss://${host}/ws?token=${encodeURIComponent(token || "")}`;
}

export async function api(path, opts = {}) {
  const headers = { "Content-Type": "application/json", ...(opts.headers || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}${path}`, { ...opts, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const e = new Error(data.error || "Something went wrong");
    e.status = res.status;
    e.body = data;
    throw e;
  }
  return data;
}

export async function upload(path, formData) {
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}${path}`, { method: "POST", body: formData, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const e = new Error(data.error || "Upload failed");
    e.status = res.status;
    e.body = data;
    throw e;
  }
  return data;
}

export function assetUrl(p) {
  if (!p) return null;
  if (p.startsWith("http")) return p;
  return `${API_BASE}${p}`;
}

export function timeAgo(ts) {
  const d = new Date(ts.replace(" ", "T") + "Z");
  const sec = Math.floor((Date.now() - d.getTime()) / 1000);
  if (sec < 60) return "now";
  if (sec < 3600) return `${Math.floor(sec / 60)}m`;
  if (sec < 86400) return `${Math.floor(sec / 3600)}h`;
  if (sec < 604800) return `${Math.floor(sec / 86400)}d`;
  return d.toLocaleDateString();
}
