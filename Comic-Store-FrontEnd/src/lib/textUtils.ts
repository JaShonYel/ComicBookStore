// Small text sanitization helpers used by pages to safely display descriptions
export type SanitizeOptions = {
  maxLength?: number; // truncate to this many chars (after cleanup)
  blacklist?: string[]; // words to redact
  redactWith?: string; // replacement string for blacklisted words
};

// Decode a few common HTML entities (named and numeric). Keep this small and local
export function decodeHtmlEntities(input: string): string {
  if (!input) return input;
  let s = input;
  // named entities we care about
  const named: { [k: string]: string } = {
    '&lt;': '<',
    '&gt;': '>',
    '&amp;': '&',
    '&quot;': '"',
    '&#x27;': "'",
    '&#39;': "'",
  };
  s = s.replace(/&[a-zA-Z#0-9]+;/g, (m) => named[m] ?? m);
  // numeric decimal
  s = s.replace(/&#(\d+);/g, (_m, code) => String.fromCharCode(Number(code)));
  // numeric hex
  s = s.replace(/&#x([0-9a-fA-F]+);/g, (_m, hex) => String.fromCharCode(parseInt(hex, 16)));
  return s;
}

export function stripHtmlTags(input: string): string {
  if (!input) return "";
  // Convert common <br> variants to newlines first
  let s = input.replace(/<br\s*\/?/gi, "\n");
  // Remove any remaining tags
  s = s.replace(/<[^>]*>/g, "");
  return s;
}

export function collapseWhitespace(input: string): string {
  return input.replace(/\s+/g, " ").replace(/\s?\n\s?/g, "\n").trim();
}

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

export function truncate(input: string, maxLength = 1000): string {
  if (!maxLength || input.length <= maxLength) return input;
  return input.slice(0, maxLength - 1).trimEnd() + "…";
}

// Remove artifact groups such as 'PGS.CARDSTOCK' or joined tokens like 'COVERRated T .'
export function removeArtifactGroups(input: string): string {
  if (!input) return input;
  let s = input;
  // Remove dot-joined uppercase tokens (e.g., PGS.CARDSTOCK or PGS.COVER.STOCK)
  s = s.replace(/\b[A-Z]{2,}(?:\.[A-Z]{2,})+\b/g, " ");
  // Remove patterns where words like COVERRated are glued and followed by single-letter grade and a dot (e.g., COVERRated T .)
  s = s.replace(/\b[A-Z][A-Za-z]*Rated\s*[A-Z]?\s*\.?/g, " ");
  // Common leftover sequences like 'T .' or 'A .' at line ends
  s = s.replace(/\b[A-Z]\s*\./g, " ");
  return s;
}

export function sanitizeDescription(raw?: string | null, opts: SanitizeOptions = {}): string {
  if (!raw) return "";
  const { maxLength = 2000, blacklist = [], redactWith = "[redacted]" } = opts;
  let s = String(raw);
  // Decode HTML entities first so things like &gt; become '>' which we then clean up
  s = decodeHtmlEntities(s);
  s = stripHtmlTags(s);
  // Remove artifact groups like "PGS.CARDSTOCK" and glued tokens like "COVERRated T ."
  s = removeArtifactGroups(s);
  s = collapseWhitespace(s);
  if (blacklist && blacklist.length) s = redactBlacklist(s, blacklist, redactWith);
  // Remove stray angle-bracket characters left from poor markup (e.g. stray '>')
  // Remove sequences of multiple angle-brackets, and any isolated brackets adjacent to whitespace or line boundaries.
  s = s.replace(/>{2,}/g, "");
  s = s.replace(/<{2,}/g, "");
  s = s.replace(/(^|\s)>+\s?/g, " ");
  s = s.replace(/\s?<+($|\s)/g, " ");
  s = collapseWhitespace(s);
  // Keep only letters (Unicode), spaces/newlines and the punctuation: , ! . - ?
  // This removes digits, other punctuation, and symbols per request.
  // Prefer to allow most Latin letters (basic + common diacritics) using a broad range
  // Keep spaces/newlines and characters: , ! . - ?
  s = s.replace(/[^A-Za-zÀ-ž\s,!.?-]/g, "");

  s = collapseWhitespace(s);
  s = truncate(s, maxLength);
  return s;
}

export default sanitizeDescription;
