import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';

const perfumes = [
  { id: 215, name: "Fakhar Silver", brand: "Lattafa" },
  { id: 216, name: "Veneno Bianco", brand: "Paris Corner" },
  { id: 217, name: "Ana Abiyedh Coral", brand: "Lattafa" },
  { id: 218, name: "Mayar Cherry", brand: "Lattafa" },
  { id: 219, name: "Eclaire", brand: "Lattafa" },
  { id: 220, name: "Tharwah Silver", brand: "Lattafa" },
];

const zai = await ZAI.create();
const results = {};
const delay = ms => new Promise(r => setTimeout(r, ms));

for (const p of perfumes) {
  try {
    const query = `${p.name} ${p.brand} fragrantica`;
    console.error(`Searching: ${query}`);
    const searchResults = await zai.functions.invoke('web_search', {
      query: query,
      num: 5
    });
    
    let fragUrl = null;
    for (const r of searchResults) {
      if (r.url && r.url.includes('fragrantica.com')) {
        fragUrl = r.url;
        break;
      }
    }
    
    if (fragUrl) {
      console.error(`  Found: ${fragUrl}`);
      results[p.id] = { url: fragUrl };
      
      // Read the page immediately
      await delay(2000);
      console.error(`  Reading page...`);
      const pageResult = await zai.functions.invoke('page_reader', {
        url: fragUrl
      });
      
      if (pageResult && pageResult.data) {
        results[p.id].title = pageResult.data.title;
        results[p.id].html = pageResult.data.html;
        console.error(`  Read: ${pageResult.data.title}`);
      }
    } else {
      console.error(`  No Fragrantica URL found`);
      results[p.id] = { url: null };
    }
    
    await delay(3000);
  } catch (err) {
    console.error(`  ERROR: ${err.message}`);
    results[p.id] = { error: err.message };
    await delay(5000);
  }
}

fs.writeFileSync('/tmp/batch1.json', JSON.stringify(results, null, 2));
console.error("Batch 1 done");
console.log("DONE");
