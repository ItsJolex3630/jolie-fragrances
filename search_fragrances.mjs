import ZAI from 'z-ai-web-dev-sdk';

const perfumes = [
  "Al Haramain Amber Oud Gold Edition fragrance notes",
  "Al Haramain Amber Oud Carbon Edition fragrance notes",
  "Al Haramain Amber Oud White Edition fragrance notes",
  "Al Haramain Amber Oud Aqua Dubai fragrance notes",
  "Maison Alhambra Baroque Rouge 540 fragrance notes",
  "Maison Alhambra Cassius fragrance notes",
  "Maison Alhambra The Tux fragrance notes",
  "Maison Alhambra Glacier Le Noir fragrance notes",
  "Maison Alhambra Celeste fragrance notes",
  "Maison Alhambra Tobacco Touch fragrance notes",
  "Dumont Nitro Pour Homme fragrance notes",
  "Dumont Nitro Blue fragrance notes",
  "Dumont Nitro Red fragrance notes",
  "Dumont Nitro White fragrance notes",
  "Dumont Nitro Platinum fragrance notes"
];

async function searchOne(zai, query, index) {
  try {
    const results = await zai.functions.invoke('web_search', {
      query: query,
      num: 5
    });
    console.log(`\n=== RESULT ${index + 1}: ${query} ===`);
    for (const r of results.slice(0, 3)) {
      console.log(`URL: ${r.url}`);
      console.log(`Title: ${r.name}`);
      console.log(`Snippet: ${r.snippet}`);
      console.log('---');
    }
    return results;
  } catch (e) {
    console.error(`Error for "${query}": ${e.message}`);
    return null;
  }
}

async function main() {
  const zai = await ZAI.create();
  
  for (let i = 0; i < perfumes.length; i++) {
    await searchOne(zai, perfumes[i], i);
    // Wait 10 seconds between requests to avoid rate limiting
    if (i < perfumes.length - 1) {
      console.log(`Waiting 10 seconds...`);
      await new Promise(r => setTimeout(r, 10000));
    }
  }
}

main().catch(e => console.error('Fatal:', e.message));
