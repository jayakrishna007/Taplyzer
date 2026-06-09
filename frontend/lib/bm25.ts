/**
 * lib/bm25.ts
 * Lightweight BM25Okapi implementation — no npm dependency required.
 * Used by the Taplyzer match engine to score keyword relevance between
 * a user's needs/offerings and every candidate business.
 *
 * BM25 parameters (standard research defaults):
 *   k1 = 1.5  — term frequency saturation
 *   b  = 0.75 — document length normalization
 */

const K1 = 1.5;
const B  = 0.75;

// Common English stop-words that add noise to matching
const STOP_WORDS = new Set([
  // ── English function words ────────────────────────────────────────────────
  "a","an","the","and","or","but","in","on","at","to","for","of","with",
  "by","from","as","is","are","was","were","be","been","has","have","had",
  "do","does","did","will","would","could","should","may","might","shall",
  "it","its","this","that","these","those","we","our","you","your","they",
  "their","i","my","me","us","he","she","him","her","not","no","so","if",

  // ── Generic business descriptors ─────────────────────────────────────────
  "company","services","solutions","business","provide","offering","needs",
  "looking","seeking","specializing","expert","professional","team","agency",
  "firm","group","partners","partnership","ventures","enterprise","startup",
  "industry","sector","domain","field","space","market","segment","vertical",

  // ── Business model / go-to-market labels (CROSS-NICHE NOISE) ─────────────
  // These describe HOW a business operates, NOT what it offers.
  // Including them causes a digital marketing agency to match a steel factory
  // just because both selected "B2B" in their profile.
  "b2b","b2c","d2c","dtc","b2g","saas","paas","iaas","ecommerce","ecom",
  "marketplace","platform","subscription","enterprise","smb","sme","msme",
  "wholesale","retail","direct","indirect","omnichannel","multichannel",

  // ── Generic intent / outcome words ──────────────────────────────────────
  "clients","customers","users","buyers","sellers","vendors","suppliers",
  "growth","scale","revenue","profit","deals","sales","leads","pipeline",
  "opportunities","results","outcomes","success","goals","targets","metrics",
  "new","existing","potential","ideal","qualified","premium","high","low",
]);

/**
 * Classic Porter Stemmer algorithm (1980) implemented in pure TypeScript.
 * Reduces an inflected word to its common root/stem form.
 */
export function stem(w: string): string {
  if (w.length < 3) return w;

  let firstch = w.charAt(0);
  if (firstch === "y") {
    w = "Y" + w.substring(1);
  }

  // Step 1a
  let re = /^(.+?)(ss|i)es$/;
  let re2 = /^(.+?)([^s])s$/;
  if (re.test(w)) {
    w = w.replace(re, "$1$2");
  } else if (re2.test(w)) {
    w = w.replace(re2, "$1$2");
  }

  // Step 1b
  re = /^(.+?)eed$/;
  re2 = /^(.+?)(ed|ing)$/;
  if (re.test(w)) {
    let fp = re.exec(w);
    if (fp) {
      let stemVal = fp[1];
      // [C]VC... is m > 0
      if (/^([^aeiou][^aeiouy]*)?[aeiouy][aeiou]*[^aeiou][^aeiouy]*/.test(stemVal)) {
        w = w.substring(0, w.length - 1);
      }
    }
  } else if (re2.test(w)) {
    let fp = re2.exec(w);
    if (fp) {
      let stemVal = fp[1];
      // vowel in stem
      if (/^([^aeiou][^aeiouy]*)?[aeiouy]/.test(stemVal)) {
        w = stemVal;
        if (/(at|bl|iz)$/.test(w)) {
          w = w + "e";
        } else if (/([^aeiouylsz])\1$/.test(w)) {
          w = w.substring(0, w.length - 1);
        } else if (/^[^aeiou][^aeiouy]*[aeiouy][^aeiouwxy]$/.test(w)) {
          w = w + "e";
        }
      }
    }
  }

  // Step 1c
  re = /^(.+?)y$/;
  if (re.test(w)) {
    let fp = re.exec(w);
    if (fp) {
      let stemVal = fp[1];
      if (/^([^aeiou][^aeiouy]*)?[aeiouy]/.test(stemVal)) {
        w = stemVal + "i";
      }
    }
  }

  const step2list: Record<string, string> = {
    "ational": "ate",
    "tional": "tion",
    "enci": "ence",
    "anci": "ance",
    "izer": "ize",
    "bli": "ble",
    "alli": "al",
    "entli": "ent",
    "eli": "e",
    "ousli": "ous",
    "organization": "organize",
    "ization": "ize",
    "ation": "ate",
    "ator": "ate",
    "alism": "al",
    "iveness": "ive",
    "fulness": "ful",
    "ousness": "ous",
    "aliti": "al",
    "iviti": "ive",
    "biliti": "ble",
    "logi": "log"
  };

  const step3list: Record<string, string> = {
    "icate": "ic",
    "ative": "",
    "alize": "al",
    "iciti": "ic",
    "ical": "ic",
    "ful": "",
    "ness": ""
  };

  // Step 2
  re = /^(.+?)(ational|tional|enci|anci|izer|bli|alli|entli|eli|ousli|ization|ation|ator|alism|iveness|fulness|ousness|aliti|iviti|biliti|logi)$/;
  if (re.test(w)) {
    let fp = re.exec(w);
    if (fp) {
      let stemVal = fp[1];
      let suffix = fp[2];
      // m > 0
      if (/^([^aeiou][^aeiouy]*)?[aeiouy][aeiou]*[^aeiou][^aeiouy]*/.test(stemVal)) {
        w = stemVal + step2list[suffix];
      }
    }
  }

  // Step 3
  re = /^(.+?)(icate|ative|alize|iciti|ical|ful|ness)$/;
  if (re.test(w)) {
    let fp = re.exec(w);
    if (fp) {
      let stemVal = fp[1];
      let suffix = fp[2];
      // m > 0
      if (/^([^aeiou][^aeiouy]*)?[aeiouy][aeiou]*[^aeiou][^aeiouy]*/.test(stemVal)) {
        w = stemVal + step3list[suffix];
      }
    }
  }

  // Step 4
  re = /^(.+?)(al|ance|ence|er|ic|able|ible|ant|ement|ment|ent|ou|ism|ate|iti|ous|ive|ize)$/;
  re2 = /^(.+?)(s|t)(ion)$/;
  if (re.test(w)) {
    let fp = re.exec(w);
    if (fp) {
      let stemVal = fp[1];
      // m > 1
      if (/^([^aeiou][^aeiouy]*)?[aeiouy][aeiou]*[^aeiou][^aeiouy]*[aeiouy][aeiou]*[^aeiou][^aeiouy]*/.test(stemVal)) {
        w = stemVal;
      }
    }
  } else if (re2.test(w)) {
    let fp = re2.exec(w);
    if (fp) {
      let stemVal = fp[1] + fp[2];
      // m > 1
      if (/^([^aeiou][^aeiouy]*)?[aeiouy][aeiou]*[^aeiou][^aeiouy]*[aeiouy][aeiou]*[^aeiou][^aeiouy]*/.test(stemVal)) {
        w = stemVal;
      }
    }
  }

  // Step 5a
  re = /^(.+?)e$/;
  if (re.test(w)) {
    let fp = re.exec(w);
    if (fp) {
      let stemVal = fp[1];
      // m > 1
      let m1 = /^([^aeiou][^aeiouy]*)?[aeiouy][aeiou]*[^aeiou][^aeiouy]*[aeiouy][aeiou]*[^aeiou][^aeiouy]*/.test(stemVal);
      // m == 1
      let mEq1 = /^([^aeiou][^aeiouy]*)?[aeiouy][aeiou]*[^aeiou][^aeiouy]*(([aeiouy][aeiou]*)?)$/.test(stemVal);
      let cvc = /^[^aeiou][^aeiouy]*[aeiouy][^aeiouwxy]$/.test(stemVal);
      if (m1 || (mEq1 && !cvc)) {
        w = stemVal;
      }
    }
  }

  // Step 5b
  re = /ll$/;
  // m > 1
  if (re.test(w) && /^([^aeiou][^aeiouy]*)?[aeiouy][aeiou]*[^aeiou][^aeiouy]*[aeiouy][aeiou]*[^aeiou][^aeiouy]*/.test(w)) {
    w = w.substring(0, w.length - 1);
  }

  if (firstch === "y") {
    w = "y" + w.substring(1);
  }

  return w;
}

/**
 * Tokenise a raw string into lowercase, de-stopworded, stemmed alphanumeric tokens.
 */
export function tokenize(text: string): string[] {
  if (!text) return [];
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 2 && !STOP_WORDS.has(t))
    .map((t) => stem(t));
}

/**
 * Business model noise terms that should NOT influence semantic matching.
 * These describe HOW a company operates (go-to-market model), NOT what it
 * actually offers or needs. Including them causes a digital marketing agency
 * to match a steel factory simply because both selected "B2B".
 */
export const NOISE_TERMS = new Set([
  "b2b","b2c","d2c","dtc","b2g","c2c",
  "saas","paas","iaas","xaas",
  "ecommerce","ecom","marketplace","platform",
  "smb","sme","msme","enterprise","startup","unicorn",
  "wholesale","retail","direct","indirect","omnichannel","multichannel",
  "subscription","freemium","on-demand",
  "clients","customers","users","buyers","sellers","vendors","leads",
  "growth","scale","revenue","profit","sales","pipeline",
  "agency","firm","group","startup","company","solutions","services",
]);

/** Strip business model noise terms from a string before embedding or tokenizing */
export function denoiseText(text: string): string {
  return text
    .split(/[,\s]+/)
    .filter(word => !NOISE_TERMS.has(word.toLowerCase().replace(/[^a-z0-9]/g, "")))
    .join(" ")
    .trim();
}

/**
 * Compute BM25 scores for a single query against a corpus of tokenised docs.
 *
 * @param queryTokens  - Tokens from the search query (user's needs / offerings)
 * @param corpus       - Array of token arrays, one per candidate document
 * @returns            - Score array, same length & order as corpus
 */
export function bm25Score(
  queryTokens: string[],
  corpus: string[][]
): number[] {
  const N = corpus.length;
  if (N === 0 || queryTokens.length === 0) return new Array(N).fill(0);

  // Average document length across corpus
  const avgdl = corpus.reduce((s, doc) => s + doc.length, 0) / N;

  // Precompute IDF for each unique query term
  const idfMap = new Map<string, number>();
  for (const term of queryTokens) {
    if (idfMap.has(term)) continue;
    const df = corpus.filter((doc) => doc.includes(term)).length;
    // Robertson-Sparck Jones IDF with +1 smoothing to avoid negative values
    // We cap N at 100 to avoid extreme IDF values in small collections
    const effectiveN = Math.max(N, 10);
    idfMap.set(term, Math.log((effectiveN - df + 0.5) / (df + 0.5) + 1));
  }

  // Score each document
  return corpus.map((doc) => {
    const dl = doc.length;
    // Build term-frequency map for this document
    const tfMap = new Map<string, number>();
    for (const token of doc) {
      tfMap.set(token, (tfMap.get(token) ?? 0) + 1);
    }

    let score = 0;
    for (const term of queryTokens) {
      const tf  = tfMap.get(term) ?? 0;
      if (tf === 0) continue;
      const idf = idfMap.get(term) ?? 0;
      // BM25Okapi formula
      score += idf * (tf * (K1 + 1)) / (tf + K1 * (1 - B + B * (dl / avgdl)));
    }
    return score;
  });
}

/**
 * Normalise an array of raw BM25 scores into [0, 1].
 * Uses a "Soft Ceiling" approach: 
 * - If max score is high (> 2.0), use min-max scaling.
 * - If max score is low (< 2.0), scale relative to 2.0 (preserving weak match signals).
 */
export function normalizeBM25(scores: number[]): number[] {
  const max = Math.max(...scores);
  if (max === 0) return scores.map(() => 0);
  
  // A "healthy" BM25 score for a good match is typically > 2.0 in small corpora.
  // We use 2.5 as a reference for a "perfect" keyword match.
  const referenceMax = Math.max(max, 2.5);
  
  return scores.map((s) => Math.min(s / referenceMax, 1.0));
}
