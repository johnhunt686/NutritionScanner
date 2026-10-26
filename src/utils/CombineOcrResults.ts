import type { OCRResult } from 'react-native-nitro-ocr';

// Tolerates common OCR slips like "Ingredlents" / "Ingred1ents"
const START_RE = /\bingred[i1l]ents?\b\s*[:\-]?/i;

// Text that signals the ingredient list is over.
// "contains" only counts with a colon, because "contains 2% or less of:"
// is a normal part of ingredient lists.
const STOP_RE =
  /\b(contains\s*:|may contain|allergen|manufactured|distributed|produced (in|by)|packed (in|by)|made (in|by)|product of|nutrition facts|supplement facts|best (by|before)|use by|net (wt|weight)|directions|storage|keep refrigerated|questions\??|comments|call (us|\d)|visit|facility|warning)\b|www\.|©/i;

/** Index of the first period that ends the list (outside parentheses). */
const findSentenceEnd = (text: string): number => {
  let depth = 0;
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    if (ch === '(' || ch === '[') depth += 1;
    else if (ch === ')' || ch === ']') depth = Math.max(0, depth - 1);
    else if (ch === '.' && depth === 0) {
      const next = text.slice(i + 1);
      // End of text, or a new sentence starting with a capital letter
      if (next.trim() === '' || /^\s+[A-Z]/.test(next)) return i;
    }
  }
  return -1;
};

const cleanList = (text: string): string =>
  text
    .replace(/[;:•·]+/g, '')
    .replace(/\.(?!\d)/g, '') // keep decimals like 2.5%
    .replace(/\s+,/g, ',')
    .replace(/\s+/g, ' ')
    .replace(/^[,\s]+|[,\s]+$/g, '')
    .trim();

/** Pull just the ingredient list out of one scan's text, or null. */
const extractIngredients = (raw: string): string | null => {
  const text = raw
    .replace(/-\s*\n\s*/g, '') // rejoin words hyphenated across lines
    .replace(/\s+/g, ' ')
    .trim();

  const start = text.match(START_RE);
  if (!start || start.index === undefined) return null;

  let list = text.slice(start.index + start[0].length);

  const stopIndex = list.search(STOP_RE);
  if (stopIndex !== -1) list = list.slice(0, stopIndex);

  const endIndex = findSentenceEnd(list);
  if (endIndex !== -1) list = list.slice(0, endIndex);

  const cleaned = cleanList(list);
  return cleaned || null;
};

/** Split on commas that aren't inside parentheses. */
const splitItems = (list: string): string[] => {
  const items: string[] = [];
  let depth = 0;
  let current = '';
  for (const ch of list) {
    if (ch === '(' || ch === '[') depth += 1;
    if (ch === ')' || ch === ']') depth = Math.max(0, depth - 1);
    if (ch === ',' && depth === 0) {
      items.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  items.push(current);
  return items.map((item) => item.toLowerCase().replace(/[^a-z0-9]/g, '')).filter(Boolean);
};

const similarity = (a: Set<string>, b: Set<string>): number => {
  let shared = 0;
  a.forEach((item) => {
    if (b.has(item)) shared += 1;
  });
  const union = a.size + b.size - shared;
  return union === 0 ? 0 : shared / union;
};

export const combineOcrResults = (results: OCRResult[]): string => {
  const texts = results.map((r) => r.text?.trim()).filter(Boolean) as string[];
  if (texts.length === 0) return '';

  const candidates = texts.map(extractIngredients).filter((c): c is string => c !== null);

  // No scan found an "Ingredients" header: fall back to the raw text
  if (candidates.length === 0) {
    return texts.reduce((a, b) => (b.length > a.length ? b : a)).replace(/\s+/g, ' ');
  }
  if (candidates.length === 1) return candidates[0];

  // Pick the candidate that agrees most with the other scans.
  // A scan that was cut off or misread scores low and loses.
  const sets = candidates.map((c) => new Set(splitItems(c)));
  let bestIndex = 0;
  let bestScore = -1;

  candidates.forEach((candidate, i) => {
    let score = 0;
    sets.forEach((other, j) => {
      if (i !== j) score += similarity(sets[i], other);
    });
    // Tie-break toward the longer (more complete) list
    const isBetter =
      score > bestScore || (score === bestScore && candidate.length > candidates[bestIndex].length);
    if (isBetter) {
      bestScore = score;
      bestIndex = i;
    }
  });

  return candidates[bestIndex];
};
