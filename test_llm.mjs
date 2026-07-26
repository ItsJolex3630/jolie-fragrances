import ZAI from 'z-ai-web-dev-sdk';
const zai = await ZAI.create();
try {
  const completion = await zai.chat.completions.create({
    messages: [
      { role: 'assistant', content: 'You are a perfume expert.' },
      { role: 'user', content: 'What are the main accords and note pyramid of Fakhar Silver by Lattafa? Include percentages for accords.' }
    ],
    thinking: { type: 'disabled' }
  });
  console.log(completion.choices[0]?.message?.content);
} catch(err) {
  console.error("FAILED:", err.message);
}
