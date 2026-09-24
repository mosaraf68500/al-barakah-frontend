import { Product } from '@/types';

/**
 * Stop words that do not provide strong relevance signal
 */
const STOP_WORDS = new Set([
  'and', 'or', 'the', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 
  'a', 'an', 'is', 'all', 'premium', 'pure', 'natural', 'best', 'organic'
]);

/**
 * Extract meaningful clean alphanumeric words from text
 */
function extractWords(text: string): string[] {
  if (!text) return [];
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length >= 2 && !STOP_WORDS.has(w));
}

/**
 * Extract dosage, potency or size numbers (e.g., '5', '10', '20', '500', '650')
 */
function extractDosageOrSize(text: string): string[] {
  if (!text) return [];
  const matches = text.match(/\b\d+(\.\d+)?(mg|ml|gm|g|kg|l|s|pcs)?\b/gi);
  if (!matches) return [];
  return matches.map((m) => m.toLowerCase().replace(/[^0-9]/g, '')).filter(Boolean);
}

/**
 * Calculate longest common prefix length between two strings
 */
function commonPrefixLength(a: string, b: string): number {
  let len = 0;
  const minLen = Math.min(a.length, b.length);
  while (len < minLen && a[len] === b[len]) {
    len++;
  }
  return len;
}

/**
 * Calculate similarity between two words using bigram overlap + prefix matching
 */
function wordSimilarity(w1: string, w2: string): number {
  if (w1 === w2) return 1.0;
  if (w1.length < 3 || w2.length < 3) return 0;

  // Prefix match (e.g. "cilmedip" vs "cildip" both start with "cil")
  const prefixLen = commonPrefixLength(w1, w2);
  let prefixScore = 0;
  if (prefixLen >= 3) {
    prefixScore = (prefixLen / Math.max(w1.length, w2.length)) * 0.7;
  }

  // Suffix match (e.g. "cilmedip" and "cildip" both end with "dip")
  let suffixLen = 0;
  const minL = Math.min(w1.length, w2.length);
  while (suffixLen < minL && w1[w1.length - 1 - suffixLen] === w2[w2.length - 1 - suffixLen]) {
    suffixLen++;
  }
  let suffixScore = 0;
  if (suffixLen >= 3) {
    suffixScore = (suffixLen / Math.max(w1.length, w2.length)) * 0.5;
  }

  // Bigram similarity
  const getBigrams = (str: string) => {
    const s = new Set<string>();
    for (let i = 0; i < str.length - 1; i++) {
      s.add(str.substring(i, i + 2));
    }
    return s;
  };

  const bg1 = getBigrams(w1);
  const bg2 = getBigrams(w2);
  let intersection = 0;
  bg1.forEach((b) => {
    if (bg2.has(b)) intersection++;
  });
  const bigramScore = (2 * intersection) / (bg1.size + bg2.size || 1);

  return Math.max(bigramScore, prefixScore + suffixScore);
}

/**
 * Calculate a comprehensive relevance score between target product and a candidate product
 */
export function calculateRelevanceScore(target: Product, candidate: Product): number {
  if (target.id === candidate.id) return -1; // Ignore self

  let score = 0;

  const targetWords = extractWords(target.name);
  const candidateWords = extractWords(candidate.name);

  const targetDosages = extractDosageOrSize(target.name);
  const candidateDosages = extractDosageOrSize(candidate.name);

  // 1. Exact Word Overlap (+30 points per common word)
  for (const tw of targetWords) {
    for (const cw of candidateWords) {
      if (tw === cw) {
        score += 35;
      } else {
        const sim = wordSimilarity(tw, cw);
        if (sim >= 0.55) {
          score += Math.round(sim * 30);
        }
      }
    }
  }

  // 2. Dosage / Potency Match (e.g. '5' in Cilmedip 5 and '5' in Cildip 5)
  for (const td of targetDosages) {
    if (candidateDosages.includes(td)) {
      score += 25;
    }
  }

  // 3. Subcategory Match (+30 points)
  if (
    target.subcategory && 
    candidate.subcategory && 
    target.subcategory.trim().toLowerCase() === candidate.subcategory.trim().toLowerCase()
  ) {
    score += 30;
  }

  // 4. Category Match (+15 points)
  if (
    target.category && 
    candidate.category && 
    target.category.trim().toLowerCase() === candidate.category.trim().toLowerCase()
  ) {
    score += 15;
  } else {
    // Penalize products from different categories
    score -= 30;
  }

  // 5. Tags Overlap (+15 points per matched tag)
  const targetTags = (target.tags || []).map((t) => t.toLowerCase().trim());
  const candidateTags = (candidate.tags || []).map((t) => t.toLowerCase().trim());
  for (const tt of targetTags) {
    if (candidateTags.includes(tt)) {
      score += 15;
    }
  }

  // 6. Price Proximity (bonus up to +5 if within 50% price range)
  if (target.price > 0 && candidate.price > 0) {
    const ratio = Math.min(target.price, candidate.price) / Math.max(target.price, candidate.price);
    score += Math.round(ratio * 5);
  }

  // 7. Rating & Review Boost (tie-breaker +1 to +5)
  if (candidate.rating) {
    score += Math.round(candidate.rating);
  }

  return score;
}

/**
 * Get prioritized related products based on smart relevance scoring
 */
export function getSmartRelatedProducts(
  targetProduct: Product, 
  allProducts: Product[], 
  limit: number = 4
): Product[] {
  if (!targetProduct || !allProducts || allProducts.length === 0) return [];

  // Score all candidate products
  const scored = allProducts
    .filter((p) => p.id !== targetProduct.id)
    .map((candidate) => ({
      product: candidate,
      score: calculateRelevanceScore(targetProduct, candidate),
    }))
    .sort((a, b) => b.score - a.score);

  // Return the top relevant products
  return scored.slice(0, limit).map((s) => s.product);
}
