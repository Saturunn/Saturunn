// scripts/update-quote.js
// Node 18+ (fetch available)
const fs = require('fs');
const path = require('path');

const README_PATH = path.join(process.cwd(), 'README.md');
const QUOTE_START = '<!-- QUOTE_START -->';
const QUOTE_END = '<!-- QUOTE_END -->';
const API_URL = 'https://api.quotable.io/random';

async function fetchQuote() {
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error(`Failed to fetch quote: ${res.status}`);
  const data = await res.json();
  return {
    content: data.content || 'Stay curious.',
    author: data.author || 'Unknown'
  };
}

function replaceBetween(original, startMarker, endMarker, replacement) {
  const startIdx = original.indexOf(startMarker);
  const endIdx = original.indexOf(endMarker);
  if (startIdx === -1 || endIdx === -1 || endIdx < startIdx) {
    throw new Error('Markers not found in README.md');
  }
  const before = original.slice(0, startIdx + startMarker.length);
  const after = original.slice(endIdx);
  return before + '\n' + replacement + '\n' + after;
}

(async () => {
  try {
    const quote = await fetchQuote();
    const block = `> “${quote.content}”\n> — \`${quote.author}\``;

    const readme = fs.readFileSync(README_PATH, 'utf8');
    const newReadme = replaceBetween(readme, QUOTE_START, QUOTE_END, block);

    if (newReadme !== readme) {
      fs.writeFileSync(README_PATH, newReadme, 'utf8');
      console.log('README.md updated with new quote.');
    } else {
      console.log('No change in README.md (quote is same).');
    }
  } catch (err) {
    console.error('Error updating quote:', err);
    process.exit(1);
  }
})();
