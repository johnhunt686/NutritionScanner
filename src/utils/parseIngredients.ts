export type Ingredient = { name: string; parent?: string };

const OPEN = new Set(['(', '[']);
const CLOSE = new Set([')', ']']);

// Trailing words that OCR'd lists share across a group:
// "corn, canola, and sunflower oil" -> corn oil, canola oil, sunflower oil
const SHARED_SUFFIXES = new Set([
  'oil',
  'oils',
  'flour',
  'starch',
  'extract',
  'syrup',
  'sugar',
  'powder',
  'protein',
  'fiber',
  'juice',
  'concentrate',
  'salt',
  'butter',
  'gum',
  'paste',
]);

/** Split on commas outside brackets; treats "and/or" as a separator. */
const splitTopLevel = (text: string): string[] => {
  const normalized = text.replace(/\s*\band\s*\/\s*or\b\s*/gi, ', ');
  const parts: string[] = [];
  let depth = 0;
  let current = '';

  for (const ch of normalized) {
    if (OPEN.has(ch)) depth += 1;
    else if (CLOSE.has(ch)) depth = Math.max(0, depth - 1);

    if (ch === ',' && depth === 0) {
      parts.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  parts.push(current);

  return parts
    .map((p) =>
      p
        .replace(/^\s*(and|or)\s+/i, '')
        .replace(/\s+/g, ' ')
        .trim(),
    )
    .filter(Boolean);
};

const hasBracket = (s: string) => /[()[\]]/.test(s);

/** Spread a shared trailing word ("oil") across the group. */
/** Spread a shared trailing word ("oil") across the group. */
const applySharedSuffix = (children: string[], head: string): string[] => {
  if (children.length === 0) return children;

  const last = children[children.length - 1];
  const lastWords = last.split(' ');
  const suffix = lastWords[lastWords.length - 1].toLowerCase(); // for comparison
  const suffixUpper = suffix.toUpperCase(); // what gets appended

  // "corn, canola, soybean, sunflower oil" -> "corn OIL", "canola OIL", ...
  if (children.length > 1 && lastWords.length > 1 && SHARED_SUFFIXES.has(suffix)) {
    return children.map((child, i) => {
      const words = child.split(' ');
      const skip =
        i === children.length - 1 ||
        hasBracket(child) ||
        words.length > 2 ||
        words[words.length - 1].toLowerCase() === suffix;
      return skip ? child : `${child} ${suffixUpper}`;
    });
  }

  // "Vegetable oil (soybean, canola)" -> "soybean OIL", "canola OIL"
  const headLast = head.split(' ').pop()?.toLowerCase();
  if (
    (headLast === 'oil' || headLast === 'oils') &&
    children.every((c) => !c.includes(' ') && !hasBracket(c))
  ) {
    return children.map((c) => `${c} ${headLast.toUpperCase()}`);
  }

  return children;
};

const expand = (item: string, parent?: string): Ingredient[] => {
  const open = item.search(/[([]/);
  if (open === -1) return [{ name: item, parent }];

  // Find the matching close bracket (may be missing if OCR dropped it)
  let depth = 0;
  let close = -1;
  for (let i = open; i < item.length; i += 1) {
    if (OPEN.has(item[i])) depth += 1;
    else if (CLOSE.has(item[i])) {
      depth -= 1;
      if (depth === 0) {
        close = i;
        break;
      }
    }
  }

  const head = item.slice(0, open).trim();
  const inside = close === -1 ? item.slice(open + 1) : item.slice(open + 1, close);
  const tail = close === -1 ? '' : item.slice(close + 1).trim();
  const name = [head, tail].filter(Boolean).join(' ');

  const children = applySharedSuffix(splitTopLevel(inside), head);

  const out: Ingredient[] = name ? [{ name, parent }] : [];
  children.forEach((child) => out.push(...expand(child, name || parent)));
  return out;
};

/** "Vegetable oil (corn, canola, and/or sunflower oil), salt" -> flat list */
export const parseIngredients = (list: string): Ingredient[] =>
  splitTopLevel(list).flatMap((item) => expand(item));
