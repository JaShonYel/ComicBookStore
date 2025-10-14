import DOMPurify from "dompurify";
import { JSDOM } from "jsdom";

// Node.js: create a DOM window for DOMPurify
const window = new JSDOM("").window;
const purify = DOMPurify(window as any);

export type SanitizeOptions = {
  maxLength: number;
  blacklist: string[];
  redactWith: string;
  allowedChars: string;
};


export function collapseWhitespace(input: string): string {
  return input.replace(/\s+/g, " ").replace(/\s?\n\s?/g, "\n").trim();
}

export function truncate(input: string, maxLength = 1000): string {
  if (!maxLength || input.length <= maxLength) return input;
  return input.slice(0, maxLength - 1).trimEnd() + "…";
}

// Whitelist-based character filtering
export function whitelistText(input: string, allowedChars = "A-Za-zÀ-ž\\s,!.?-"): string {
  if (!input) return "";
  const re = new RegExp(`[^${allowedChars}]`, "g");
  return input.replace(re, "");
}

// Redact blacklisted words
export function redactBlacklist(input: string, blacklist: string[], redactWith = "[redacted]"): string {
  if (!blacklist || blacklist.length === 0) return input;
  let out = input;
  for (const word of blacklist) {
    if (!word) continue;
    const safe = word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const re = new RegExp(`\\b${safe}\\b`, "gi");
    out = out.replace(re, redactWith);
  }
  return out;
}

// Remove artifact groups such as 'PGS.CARDSTOCK' or joined tokens like 'COVERRated T .'
export function removeArtifactGroups(input: string): string {
  if (!input) return input;
  let s = input;
  s = s.replace(/\b[A-Z]{2,}(?:\.[A-Z]{2,})+\b/g, " ");
  s = s.replace(/\b[A-Z][A-Za-z]*Rated\s*[A-Z]?\s*\.?/g, " ");
  s = s.replace(/\b[A-Z]\s*\./g, " ");
  return s;
}

// Preserve line breaks from <br> and <p> before sanitization
function preserveLineBreaks(input: string): string {
  return input
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<p[^>]*>/gi, "");
}

// Full description sanitizer
export function sanitizeDescription(raw?: string | null, opts: SanitizeOptions = {
  maxLength: 0,
  blacklist: [],
  redactWith: "",
  allowedChars: ""
}): string {
  if (!raw) return "";
  const {
    maxLength = 2000,
    blacklist = [],
    redactWith = "[redacted]",
    allowedChars = "A-Za-zÀ-ž\\s,!.?-",
  } = opts;

  let s = String(raw);
  s = preserveLineBreaks(s);
  s = purify.sanitize(s, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
  s = removeArtifactGroups(s);
  s = collapseWhitespace(s);
  if (blacklist.length) s = redactBlacklist(s, blacklist, redactWith);
  s = s.replace(/>{2,}/g, "");
  s = s.replace(/<{2,}/g, "");
  s = s.replace(/(^|\s)>+\s?/g, " ");
  s = s.replace(/\s?<+($|\s)/g, " ");
  s = collapseWhitespace(s);
  s = whitelistText(s, allowedChars);
  s = collapseWhitespace(s);
  s = truncate(s, maxLength);

  return s;
}

export default sanitizeDescription;
