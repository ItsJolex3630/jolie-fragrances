import ZAI from 'z-ai-web-dev-sdk';
const zai = await ZAI.create();
try {
  const result = await zai.functions.invoke('web_search', {
    query: "Fakhar Silver Lattafa fragrantica",
    num: 3
  });
  console.log(JSON.stringify(result.slice(0,2), null, 2));
} catch(err) {
  console.error("FAILED:", err.message);
}
