import ZAI from 'z-ai-web-dev-sdk';

const zai = await ZAI.create();
const result = await zai.functions.invoke('web_search', {
  query: "Fakhar Silver Lattafa fragrantica",
  num: 3
});
console.log(JSON.stringify(result, null, 2));
