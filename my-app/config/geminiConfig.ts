import { GoogleGenAI, Type } from "@google/genai";

const API_KEY = process.env.GOOGLE_API_KEY;
const ai = new GoogleGenAI({ apiKey: API_KEY });

async function main() {
  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents:
      "List a few popular cookie recipes, and include the amounts of ingredients.",
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            itemName: {
              type: Type.STRING,
            },
            itemPrice: {
              type: Type.NUMBER,
            },
          },
        },
      },
    },
  });

  console.log(response.text);
}

main();
