import ZAI from 'z-ai-web-dev-sdk';

const perfumes = [
  "Lattafa Eclaire",
  "Lattafa Mayar Natural Intense",
  "Lattafa Fakhar Black",
  "Lattafa Fakhar Rose",
  "Lattafa Qaed Al Fursan",
  "Lattafa Qaed Al Fursan Untamed",
  "Lattafa Qaed Al Fursan Unlimited",
  "Lattafa Hayati Florence",
  "Lattafa Hayati Gold Elixir",
  "Lattafa Hayaati",
  "Lattafa Hayaati Al Maleky",
  "Lattafa Vintage Radio",
  "Lattafa Emeer",
  "Lattafa Nebras Elixir",
  "Lattafa Asad Elixir",
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

async function searchPerfume(zai, name) {
  try {
    const result = await zai.functions.invoke("web_search", {
      query: `${name} Fragrantica notes top heart base`,
      num: 5
    });
    return { name, searchResult: result };
  } catch (e) {
    return { name, searchResult: null, error: e.message };
  }
}

async function readPage(zai, url) {
  try {
    const result = await zai.functions.invoke("web_reader", { url });
    return result;
  } catch (e) {
    return null;
  }
}

// Process in batches of 5 to avoid rate limiting
async function processBatch(zai, batch) {
  const results = [];
  for (const perfume of batch) {
    console.log(`Searching: ${perfume}`);
    const result = await searchPerfume(zai, perfume);
    results.push(result);
    // Small delay between requests
    await new Promise(r => setTimeout(r, 500));
  }
  return results;
}

async function main() {
  const zai = await ZAI.create();
  const allResults = [];
  
  // Process in batches of 5
  for (let i = 0; i < perfumes.length; i += 5) {
    const batch = perfumes.slice(i, i + 5);
    console.log(`\n=== Batch ${Math.floor(i/5) + 1}/${Math.ceil(perfumes.length/5)} ===`);
    const batchResults = await processBatch(zai, batch);
    allResults.push(...batchResults);
  }
  
  // Save raw search results
  const fs = await import('fs');
  fs.writeFileSync('/home/z/my-project/search-results.json', JSON.stringify(allResults, null, 2));
  console.log(`\nSaved ${allResults.length} search results to search-results.json`);
  
  // Now try to read Fragrantica pages for the top results
  const fragranticaUrls = [];
  for (const result of allResults) {
    if (result.searchResult && result.searchResult.results) {
      for (const r of result.searchResult.results) {
        if (r.url && r.url.includes('fragrantica.com')) {
          fragranticaUrls.push({ name: result.name, url: r.url });
          break;
        }
      }
    }
  }
  
  console.log(`\nFound ${fragranticaUrls.length} Fragrantica URLs to read`);
  fs.writeFileSync('/home/z/my-project/fragrantica-urls.json', JSON.stringify(fragranticaUrls, null, 2));
  
  // Read Fragrantica pages in batches
  const pageContents = [];
  for (let i = 0; i < fragranticaUrls.length; i += 3) {
    const batch = fragranticaUrls.slice(i, i + 3);
    console.log(`\nReading Fragrantica pages batch ${Math.floor(i/3) + 1}...`);
    for (const item of batch) {
      console.log(`  Reading: ${item.name} - ${item.url}`);
      const content = await readPage(zai, item.url);
      pageContents.push({ name: item.name, url: item.url, content });
      await new Promise(r => setTimeout(r, 1000));
    }
  }
  
  fs.writeFileSync('/home/z/my-project/fragrantica-pages.json', JSON.stringify(pageContents, null, 2));
  console.log(`\nSaved ${pageContents.length} page contents to fragrantica-pages.json`);
}

main().catch(console.error);
