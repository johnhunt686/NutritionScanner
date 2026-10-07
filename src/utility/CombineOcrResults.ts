import type { OCRResult } from 'react-native-nitro-ocr';

const normalizeWord = (word: string): string =>
  word
    .toLowerCase()
    .replace(/^[.,;:()[\]{}]+|[.,;:()[\]{}]+$/g, '');

export const combineOcrResults = (results: OCRResult[]): string => {
  // Get the OCR text from every scan
  const texts = results
    .map((result) => result.text.trim())
    .filter(Boolean);

  if (texts.length === 0) {
    return '';
  }

  // Convert each scan into words
  const sequences = texts.map((text) =>
    text
      .split(/\s+/)
      .map((word) => word.trim())
      .filter(Boolean)
  );

  // Start with the first scan
  let merged = [...sequences[0]];

  // Merge each additional scan
  for (let i = 1; i < sequences.length; i++) {
    const current = sequences[i];

    if (current.length === 0) {
      continue;
    }

    let bestOverlap = 0;

    const maxOverlap = Math.min(merged.length, current.length);

    // Find the largest overlap between the end of the
    // merged text and the beginning of the new scan.
    for (let overlap = 1; overlap <= maxOverlap; overlap++) {
      const mergedEnd = merged.slice(-overlap);
      const currentStart = current.slice(0, overlap);

      const matches = mergedEnd.every(
        (word, index) =>
          normalizeWord(word) === normalizeWord(currentStart[index])
      );

      if (matches) {
        bestOverlap = overlap;
      }
    }

    if (bestOverlap > 0) {
      // Add only the words that aren't part of the overlap.
      merged.push(...current.slice(bestOverlap));
    } else {
      // If there is no overlap, add words that haven't
      // already appeared in the merged result.
      const newWords = current.filter((word) => {
        const normalized = normalizeWord(word);

        return !merged.some(
          (existingWord) =>
            normalizeWord(existingWord) === normalized
        );
      });

      merged.push(...newWords);
    }
  }

  // Turn the merged words back into a single string.
  const combinedText = merged.join(' ');

  // --------------------------------------------------
  // Find "Ingredients"
  // --------------------------------------------------

  const ingredientsMatch = combinedText.match(/\bingredients\b/i);

  if (!ingredientsMatch || ingredientsMatch.index === undefined) {
    return combinedText;
  }

  // Start exactly at "Ingredients"
  const startIndex = ingredientsMatch.index;

  const fromIngredients = combinedText.slice(startIndex);

  // --------------------------------------------------
  // Find the first period after "Ingredients"
  // --------------------------------------------------

  const periodIndex = fromIngredients.indexOf('.');

  if (periodIndex === -1) {
    // No period was detected, so return everything
    // starting at Ingredients.
    return fromIngredients.trim();
  }

  // Include the period itself.
  return fromIngredients.slice(0, periodIndex + 1).trim();
};

