import ZAI from 'z-ai-web-dev-sdk';

const perfumes = [
  // FRENCH AVENUE
  { name: "Liquid Brun", brand: "French Avenue", id: 76, current: ["Dulce", "Amaderado"] },
  { name: "Aether", brand: "French Avenue", id: 77, current: ["Cítrico", "Amaderado"] },
  { name: "Luscious", brand: "French Avenue", id: 78, current: ["Dulce", "Floral"] },
  { name: "Intense Addiction", brand: "French Avenue", id: 79, current: ["Dulce", "Ámbar"] },
  { name: "Obsidian", brand: "French Avenue", id: 80, current: ["Amaderado", "Ahumado"] },
  { name: "Vulcan Feu", brand: "French Avenue", id: 81, current: ["Especiado", "Ámbar"] },
  // AFNAN
  { name: "Supremacy Not Only Intense", brand: "Afnan", id: 82, current: ["Cítrico", "Amaderado"] },
  { name: "Supremacy Silver", brand: "Afnan", id: 83, current: ["Cítrico", "Amaderado"] },
  { name: "Supremacy Incense", brand: "Afnan", id: 84, current: ["Ahumado", "Amaderado"] },
  { name: "Supremacy In Heaven", brand: "Afnan", id: 85, current: ["Cítrico", "Frutal"] },
  { name: "9PM Rebel", brand: "Afnan", id: 86, current: ["Dulce", "Frutal"] },
  { name: "9PM Pour Femme", brand: "Afnan", id: 87, current: ["Dulce", "Floral"] },
  { name: "9PM", brand: "Afnan", id: 137, current: ["Dulce", "Amaderado"] },
  { name: "9PM Nite Out", brand: "Afnan", id: 138, current: ["Dulce", "Especiado"] },
  { name: "9PM Elixir", brand: "Afnan", id: 139, current: ["Dulce", "Ámbar"] },
  { name: "9AM Dive", brand: "Afnan", id: 140, current: ["Cítrico", "Acuático"] },
  { name: "Turathi Electric", brand: "Afnan", id: 152, current: ["Frutal", "Ámbar"] },
  { name: "Turathi Blue", brand: "Afnan", id: 153, current: ["Amaderado", "Ámbar"] },
  // RAVE
  { name: "Rave Now", brand: "Rave", id: 88, current: ["Cítrico", "Amaderado"] },
  { name: "Rave Now Women", brand: "Rave", id: 89, current: ["Floral", "Dulce"] },
  { name: "Rave Rage", brand: "Rave", id: 90, current: ["Dulce", "Amaderado"] },
];

async function searchWithRetry(zai, query, maxRetries = 5) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const results = await zai.functions.invoke('web_search', {
        query: query,
        num: 5
      });
      return results;
    } catch (error) {
      if (error.message && error.message.includes('429')) {
        const waitTime = Math.min(5000 * Math.pow(2, attempt - 1), 120000);
        console.log(`  Rate limited, waiting ${waitTime/1000}s (attempt ${attempt}/${maxRetries})...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      } else {
        throw error;
      }
    }
  }
  throw new Error(`Max retries exceeded for query: ${query}`);
}

async function main() {
  const zai = await ZAI.create();
  const results = [];

  for (const perfume of perfumes) {
    console.log(`\nSearching: ${perfume.brand} ${perfume.name}...`);
    try {
      const query = `Fragrantica ${perfume.name} ${perfume.brand} perfume notes`;
      const searchResults = await searchWithRetry(zai, query);
      
      // Get the Fragrantica URL
      const fragranticaResult = searchResults.find(r => 
        r.url && r.url.includes('fragrantica.com')
      );
      
      if (fragranticaResult) {
        console.log(`  Found: ${fragranticaResult.name}`);
        console.log(`  URL: ${fragranticaResult.url}`);
        console.log(`  Snippet: ${fragranticaResult.snippet}`);
        results.push({
          ...perfume,
          fragranticaUrl: fragranticaResult.url,
          fragranticaTitle: fragranticaResult.name,
          fragranticaSnippet: fragranticaResult.snippet,
        });
      } else {
        console.log(`  No Fragrantica result found`);
        console.log(`  Top result: ${searchResults[0]?.name} - ${searchResults[0]?.snippet}`);
        results.push({
          ...perfume,
          fragranticaUrl: null,
          fragranticaTitle: searchResults[0]?.name,
          fragranticaSnippet: searchResults[0]?.snippet,
        });
      }
      
      // Wait between requests to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 3000));
    } catch (error) {
      console.log(`  Error: ${error.message}`);
      results.push({ ...perfume, error: error.message });
    }
  }

  // Save results
  const fs = await import('fs');
  fs.writeFileSync('perfume_search_results.json', JSON.stringify(results, null, 2));
  console.log('\n\nResults saved to perfume_search_results.json');
  
  // Print summary
  console.log('\n=== SUMMARY ===');
  for (const r of results) {
    console.log(`[${r.id}] ${r.brand} - ${r.name}`);
    if (r.fragranticaSnippet) {
      console.log(`  Snippet: ${r.fragranticaSnippet.substring(0, 200)}`);
    }
  }
}

main().catch(console.error);
