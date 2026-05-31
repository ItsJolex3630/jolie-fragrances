import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';

const remaining = [
  "Lattafa Ansaam Gold",
  "Lattafa Ansaam Silver",
  "Lattafa Shaheen Gold",
  "Lattafa Shaheen Silver",
  "Lattafa Hala",
  "Lattafa Ishq Al Shuyukh Gold",
  "Lattafa Ishq Al Shuyukh Silver",
  "Lattafa Ta'weel",
  "Lattafa Teriaq Intense",
  "Lattafa Musamam White Intense",
  "Lattafa Victoria",
  "Lattafa Art of Universe",
  "Lattafa Vanilla Freak",
  "Lattafa Berry On Top",
  "Lattafa Choco Overdose",
  "Lattafa Mallow Madness",
  "Lattafa Whipped Pleasure",
  "Lattafa The Kingdom Woman",
  "Lattafa The Kingdom Men",
  "Lattafa Layaan",
  "Lattafa Efeef",
  "Lattafa Al Noble Safeer",
  "Lattafa Al Noble Ameer",
  "Lattafa Al Noble Wazeer",
  "Lattafa Her Confession"
];

async function searchWithRetry(zai, name, maxRetries = 3) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const result = await zai.functions.invoke("web_search", {
        query: `${name} Fragrantica notes top heart base`,
        num: 5
      });
      return { name, searchResult: result };
    } catch (e) {
      if (e.message && e.message.includes('429')) {
        const delay = (attempt + 1) * 10000; // 10s, 20s, 30s
        console.log(`  Rate limited, waiting ${delay/1000}s before retry ${attempt+1}...`);
        await new Promise(r => setTimeout(r, delay));
      } else {
        return { name, searchResult: null, error: e.message };
      }
    }
  }
  return { name, searchResult: null, error: 'Max retries exceeded' };
}

async function main() {
  const zai = await ZAI.create();
  const allResults = [];
  
  for (let i = 0; i < remaining.length; i++) {
    const perfume = remaining[i];
    console.log(`[${i+1}/${remaining.length}] Searching: ${perfume}`);
    const result = await searchWithRetry(zai, perfume);
    allResults.push(result);
    
    // Print snippet if found
    if (result.searchResult && Array.isArray(result.searchResult)) {
      const fragResult = result.searchResult.find(r => r.host_name && r.host_name.includes('fragrantica'));
      if (fragResult && fragResult.snippet) {
        console.log(`  ✓ Found: ${fragResult.snippet.substring(0, 150)}`);
      } else if (result.searchResult[0] && result.searchResult[0].snippet) {
        console.log(`  ✓ Found: ${result.searchResult[0].snippet.substring(0, 150)}`);
      } else {
        console.log(`  ? No snippets found`);
      }
    } else {
      console.log(`  ✗ No results`);
    }
    
    // 3 second delay between requests
    await new Promise(r => setTimeout(r, 3000));
  }
  
  fs.writeFileSync('/home/z/my-project/search-results-batch2.json', JSON.stringify(allResults, null, 2));
  console.log(`\nSaved ${allResults.length} results to search-results-batch2.json`);
}

main().catch(console.error);
