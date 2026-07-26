import ZAI from 'z-ai-web-dev-sdk';

const zai = await ZAI.create();

// Try reading a known Fragrantica page directly
const url = "https://www.fragrantica.com/perfume/Lattafa/Fakhar-Silver-70554.html";
try {
  const result = await zai.functions.invoke('page_reader', { url });
  if (result && result.data) {
    console.log("Title:", result.data.title);
    console.log("HTML length:", result.data.html?.length);
    // Extract some text
    const text = result.data.html?.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').substring(0, 500);
    console.log("Text preview:", text);
  }
} catch(err) {
  console.error("Page reader failed:", err.message);
}
