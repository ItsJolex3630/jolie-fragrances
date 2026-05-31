import ZAI from 'z-ai-web-dev-sdk';

const perfumes = [
  { id: 215, name: "Fakhar Silver", brand: "Lattafa" },
  { id: 216, name: "Veneno Bianco", brand: "Paris Corner" },
  { id: 217, name: "Ana Abiyedh Coral", brand: "Lattafa" },
  { id: 218, name: "Mayar Cherry", brand: "Lattafa" },
  { id: 219, name: "Eclaire", brand: "Lattafa" },
  { id: 220, name: "Tharwah Silver", brand: "Lattafa" },
  { id: 221, name: "Shaghaf Oud Azraq", brand: "Swiss Arabian" },
  { id: 222, name: "Casablanca", brand: "Lattafa" },
  { id: 223, name: "Tiramisu Caramel", brand: "Lattafa" },
  { id: 224, name: "Caramel Cascade", brand: "Lattafa" },
  { id: 225, name: "Glacier Pour Homme", brand: "Maison Alhambra" },
  { id: 226, name: "Khair Fusion", brand: "Lattafa" },
  { id: 227, name: "Khair Confection", brand: "Lattafa" },
  { id: 228, name: "Yara Candy", brand: "Lattafa" },
  { id: 230, name: "Yara Elixir", brand: "Lattafa" },
  { id: 231, name: "Bade'e Al Oud Sublime", brand: "Lattafa" },
  { id: 232, name: "Indomitable", brand: "Paris Corner" },
  { id: 233, name: "Marshmallow Blush", brand: "Lattafa" },
  { id: 234, name: "Khair", brand: "Lattafa" },
  { id: 235, name: "Khair Felicity", brand: "Lattafa" },
  { id: 236, name: "December", brand: "Paris Corner" },
  { id: 237, name: "Emir Memories of Summer", brand: "Paris Corner" },
  { id: 238, name: "Taskeen", brand: "Lattafa" },
  { id: 239, name: "Taskeen Marina", brand: "Lattafa" },
  { id: 240, name: "Lactea Divina", brand: "Lattafa" },
  { id: 241, name: "Fayora", brand: "Lattafa" },
  { id: 242, name: "Mango Punch", brand: "Lattafa" },
  { id: 243, name: "Juice Melange", brand: "Lattafa" },
  { id: 244, name: "Pear Potion", brand: "Lattafa" },
  { id: 245, name: "Qissa Pink", brand: "Paris Corner" },
  { id: 246, name: "Qissa Delicius", brand: "Paris Corner" },
  { id: 247, name: "Qissa Blue", brand: "Paris Corner" },
];

const zai = await ZAI.create();
const results = {};
const delay = ms => new Promise(r => setTimeout(r, ms));

// Step 1: Search for each perfume and find Fragrantica URLs
for (const p of perfumes) {
  try {
    const query = `${p.name} ${p.brand} site:fragrantica.com`;
    console.error(`Searching: ${query}`);
    const searchResults = await zai.functions.invoke('web_search', {
      query: query,
      num: 5
    });
    
    // Find fragrantica URL
    let fragUrl = null;
    for (const r of searchResults) {
      if (r.url && r.url.includes('fragrantica.com')) {
        fragUrl = r.url;
        break;
      }
    }
    
    if (!fragUrl && searchResults.length > 0) {
      // Try without site: filter
      const searchResults2 = await zai.functions.invoke('web_search', {
        query: `${p.name} ${p.brand} fragrantica`,
        num: 5
      });
      for (const r of searchResults2) {
        if (r.url && r.url.includes('fragrantica.com')) {
          fragUrl = r.url;
          break;
        }
      }
    }
    
    if (fragUrl) {
      console.error(`  Found: ${fragUrl}`);
      results[p.id] = { url: fragUrl };
    } else {
      console.error(`  No Fragrantica URL found`);
      results[p.id] = { url: null };
    }
    
    await delay(2500);
  } catch (err) {
    console.error(`  ERROR: ${err.message}`);
    results[p.id] = { error: err.message };
    await delay(5000);
  }
}

// Save URLs for later use
const fs = await import('fs');
fs.writeFileSync('/tmp/fragrantica_urls.json', JSON.stringify(results, null, 2));
console.error("URL search complete. URLs saved.");

// Step 2: Read each Fragrantica page
for (const p of perfumes) {
  const info = results[p.id];
  if (!info || !info.url || info.error) {
    console.error(`Skipping ${p.id} - no URL`);
    continue;
  }
  
  try {
    console.error(`Reading page: ${p.id} - ${info.url}`);
    const pageResult = await zai.functions.invoke('page_reader', {
      url: info.url
    });
    
    if (pageResult && pageResult.data) {
      info.html = pageResult.data.html;
      info.title = pageResult.data.title;
      console.error(`  Read ${info.title} (${pageResult.data.html?.length || 0} chars)`);
    } else {
      console.error(`  No data returned`);
    }
    
    await delay(2500);
  } catch (err) {
    console.error(`  ERROR reading page: ${err.message}`);
    info.readError = err.message;
    await delay(5000);
  }
}

// Save full results
fs.writeFileSync('/tmp/fragrantica_full.json', JSON.stringify(results, null, 2));
console.error("Full data saved.");
console.log("DONE");
