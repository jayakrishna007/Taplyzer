/**
 * Interactive Stemmer Test Tool
 * Run: node scripts/test-stemmer.js
 * Or:  node scripts/test-stemmer.js "running played businesses"
 */
const readline = require('readline');

// ── Business Noise & Stop Words (identical to lib/bm25.ts) ───────────────────
const STOP_WORDS = new Set([
  "a","an","the","and","or","but","in","on","at","to","for","of","with",
  "by","from","as","is","are","was","were","be","been","has","have","had",
  "do","does","did","will","would","could","should","may","might","shall",
  "it","its","this","that","these","those","we","our","you","your","they",
  "their","i","my","me","us","he","she","him","her","not","no","so","if",
  "company","services","solutions","business","provide","offering","needs",
  "looking","seeking","specializing","expert","professional","team","agency",
  "firm","group","partners","partnership","ventures","enterprise","startup",
  "industry","sector","domain","field","space","market","segment","vertical",
  "b2b","b2c","d2c","dtc","b2g","saas","paas","iaas","ecommerce","ecom",
  "marketplace","platform","subscription","enterprise","smb","sme","msme",
  "wholesale","retail","direct","indirect","omnichannel","multichannel",
  "clients","customers","users","buyers","sellers","vendors","suppliers",
  "growth","scale","revenue","profit","deals","sales","leads","pipeline",
  "opportunities","results","outcomes","success","goals","targets","metrics",
  "new","existing","potential","ideal","qualified","premium","high","low",
]);

function stem(w) {
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
      if (/^([^aeiou][^aeiouy]*)?[aeiouy][aeiou]*[^aeiou][^aeiouy]*/.test(stemVal)) {
        w = w.substring(0, w.length - 1);
      }
    }
  } else if (re2.test(w)) {
    let fp = re2.exec(w);
    if (fp) {
      let stemVal = fp[1];
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

  const step2list = {
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
    " Morel": "more",
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

  const step3list = {
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
      if (/^([^aeiou][^aeiouy]*)?[aeiouy][aeiou]*[^aeiou][^aeiouy]*[aeiouy][aeiou]*[^aeiou][^aeiouy]*/.test(stemVal)) {
        w = stemVal;
      }
    }
  } else if (re2.test(w)) {
    let fp = re2.exec(w);
    if (fp) {
      let stemVal = fp[1] + fp[2];
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
      let m1 = /^([^aeiou][^aeiouy]*)?[aeiouy][aeiou]*[^aeiou][^aeiouy]*[aeiouy][aeiou]*[^aeiou][^aeiouy]*/.test(stemVal);
      let mEq1 = /^([^aeiou][^aeiouy]*)?[aeiouy][aeiou]*[^aeiou][^aeiouy]*(([aeiouy][aeiou]*)?)$/.test(stemVal);
      let cvc = /^[^aeiou][^aeiouy]*[aeiouy][^aeiouwxy]$/.test(stemVal);
      if (m1 || (mEq1 && !cvc)) {
        w = stemVal;
      }
    }
  }

  // Step 5b
  re = /ll$/;
  if (re.test(w) && /^([^aeiou][^aeiouy]*)?[aeiouy][aeiou]*[^aeiou][^aeiouy]*[aeiouy][aeiou]*[^aeiou][^aeiouy]*/.test(w)) {
    w = w.substring(0, w.length - 1);
  }

  if (firstch === "y") {
    w = "y" + w.substring(1);
  }

  return w;
}

function processPhrase(phrase) {
  console.log('\n' + '─'.repeat(50));
  console.log(`📝 Original Input:  "${phrase}"`);

  const rawWords = phrase.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(Boolean);
  console.log(`🔍 Raw Words:       [ ${rawWords.join(', ')} ]`);

  const deNoised = rawWords.filter(w => w.length > 2 && !STOP_WORDS.has(w));
  console.log(`🚫 De-noised:       [ ${deNoised.join(', ')} ] (Removed stop-words/business noise)`);

  const stemmed = deNoised.map(w => stem(w));
  console.log(`🎯 Stemmed Roots:   [ ${stemmed.join(', ')} ]`);
  console.log('─'.repeat(50) + '\n');
}

// ── Main Execution Flow ──────────────────────────────────────────────────────
const args = process.argv.slice(2);
if (args.length > 0) {
  // Command line arguments passed — execute immediately
  processPhrase(args.join(' '));
  process.exit(0);
} else {
  // Start interactive CLI
  console.log('🚀 Porter Stemmer Interactive Test Tool');
  console.log('========================================');
  console.log('Type any phrase or sentence below to see tokenisation and stemming in action.');
  console.log('Type "exit" or press Ctrl+C to quit.\n');

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const promptUser = () => {
    rl.question('Phrase > ', (input) => {
      if (input.trim().toLowerCase() === 'exit') {
        rl.close();
        process.exit(0);
      }
      processPhrase(input);
      promptUser();
    });
  };

  promptUser();
}
