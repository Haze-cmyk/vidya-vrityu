import stringSimilarity from 'string-similarity';

/**
 * Clean and normalize a human name string for reliable fuzzy comparison
 * @param {string} name
 * @returns {string}
 */
export function normalizeName(name) {
  if (!name || typeof name !== 'string') return '';
  return name
    .toLowerCase()
    .replace(/\b(shri|smt|mr|mrs|ms|dr|kumar|kumari)\b\.?/gi, '')
    .replace(/[^a-z0-9\s]/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Sort words in a name alphabetically (e.g. "thakur jayesh" -> "jayesh thakur")
 * @param {string} normalizedName
 * @returns {string}
 */
export function sortNameTokens(normalizedName) {
  return normalizedName
    .split(' ')
    .filter(Boolean)
    .sort()
    .join(' ');
}

/**
 * Compare two names using Sørensen-Dice coefficient and token sorting
 * @param {string} nameA - First name (e.g. provided at signup)
 * @param {string} nameB - Second name (e.g. extracted from OCR)
 * @returns {{ similarityScore: number, isMatch: boolean, confidence: number, rationale: string }}
 */
export function compareNamesFuzzy(nameA, nameB) {
  const normA = normalizeName(nameA);
  const normB = normalizeName(nameB);

  if (!normA || !normB) {
    return {
      similarityScore: 0,
      isMatch: false,
      confidence: 0,
      rationale: 'One or both names were empty or missing'
    };
  }

  // Exact match after normalization
  if (normA === normB) {
    return {
      similarityScore: 100,
      isMatch: true,
      confidence: 100,
      rationale: 'Exact normalized match'
    };
  }

  // Standard Dice coefficient similarity (0 to 1)
  const directSimilarity = stringSimilarity.compareTwoStrings(normA, normB);

  // Token-sorted similarity (handles name reordering like "First Last" vs "Last First")
  const sortedA = sortNameTokens(normA);
  const sortedB = sortNameTokens(normB);
  const sortedSimilarity = stringSimilarity.compareTwoStrings(sortedA, sortedB);

  // Token containment check (e.g., "Jayesh Hareram Thakur" vs "Jayesh Thakur")
  const tokensA = new Set(normA.split(' '));
  const tokensB = new Set(normB.split(' '));
  const intersection = [...tokensA].filter((t) => tokensB.has(t));
  const subsetRatio = intersection.length / Math.min(tokensA.size, tokensB.size);

  // Combine metrics taking the highest signal
  const maxSimilarity = Math.max(
    directSimilarity,
    sortedSimilarity,
    subsetRatio >= 0.8 ? 0.85 : 0
  );

  const similarityScore = Math.min(100, Math.max(0, Math.round(maxSimilarity * 100)));
  const isMatch = similarityScore >= 75;

  let rationale = 'Fuzzy match verified';
  if (similarityScore >= 90) rationale = 'Very high confidence match';
  else if (similarityScore >= 75) rationale = 'High confidence match (minor spelling/order variation)';
  else if (similarityScore >= 50) rationale = 'Partial name match - manual officer review suggested';
  else rationale = 'Significant name mismatch detected';

  return {
    similarityScore,
    isMatch,
    confidence: similarityScore,
    rationale
  };
}
