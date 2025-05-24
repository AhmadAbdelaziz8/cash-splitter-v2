import { GoogleGenerativeAI, Part } from "@google/generative-ai";

// ⚠️ SECURITY WARNING: This API key is exposed client-side!
// 🚨 FOR PRODUCTION: Move this to a secure backend server
// 📚 FOR DEVELOPMENT: This is acceptable for learning/prototyping
const API_KEY = process.env.EXPO_PUBLIC_GOOGLE_API_KEY;

// Type definitions for better type safety
export interface ReceiptItem {
  itemName: string;
  itemPrice: number;
}

export interface ParsedReceiptData {
  items: ReceiptItem[];
  total: number;
}

export interface ParseResult {
  success: boolean;
  data?: ParsedReceiptData;
  error?: string;
}

export async function parseReceiptImage(
  base64Image: string,
  mimeType: string = "image/jpeg"
): Promise<ParseResult> {
  if (!API_KEY) {
    return {
      success: false,
      error: "Google API Key not configured. Please check your .env file.",
      data: getMockData(),
    };
  }

  try {
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash-preview-05-20",
    });

    // Strip data URL prefix if it exists
    let cleanBase64 = base64Image;
    if (base64Image.startsWith("data:")) {
      const base64Index = base64Image.indexOf(",");
      if (base64Index !== -1) {
        cleanBase64 = base64Image.substring(base64Index + 1);
      }
    }

    const imagePart: Part = {
      inlineData: {
        data: cleanBase64,
        mimeType: mimeType,
      },
    };

    const prompt = `Analyze this receipt image and extract all items with their prices.

CRITICAL: Return ONLY a valid JSON object in this EXACT format:
{"items": [{"itemName": "string", "itemPrice": number}], "total": number}

Rules:
- Do not include any text before or after the JSON
- Do not use markdown formatting or code blocks
- Ensure itemPrice and total are numbers, not strings
- If you cannot read the receipt clearly, return empty items array and total: 0

Example output:
{"items": [{"itemName": "Coffee", "itemPrice": 4.50}], "total": 4.50}`;

    const result = await model.generateContent([prompt, imagePart]);
    const response = result.response;
    const text = response.text().trim();

    let parsedData: ParsedReceiptData;

    try {
      parsedData = JSON.parse(text);
    } catch (directParseError) {
      try {
        const codeBlockMatch = text.match(/```(?:json)?\s*(\{.*?\})\s*```/s);
        if (codeBlockMatch) {
          parsedData = JSON.parse(codeBlockMatch[1]);
        } else {
          const jsonMatch = text.match(/\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/s);
          if (!jsonMatch) {
            throw new Error("No JSON structure found in response");
          }
          parsedData = JSON.parse(jsonMatch[0]);
        }
      } catch (extractionError) {
        const errorMsg =
          extractionError instanceof Error
            ? extractionError.message
            : String(extractionError);
        throw new Error(`Failed to parse JSON from response: ${errorMsg}`);
      }
    }

    const validationResult = validateParsedData(parsedData);
    if (!validationResult.isValid) {
      throw new Error(`Invalid data structure: ${validationResult.error}`);
    }

    return {
      success: true,
      data: parsedData,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    return {
      success: false,
      error: errorMessage,
      data: getMockData(),
    };
  }
}

function validateParsedData(data: any): { isValid: boolean; error?: string } {
  if (!data || typeof data !== "object") {
    return { isValid: false, error: "Data is not an object" };
  }

  if (!Array.isArray(data.items)) {
    return { isValid: false, error: "Items is not an array" };
  }

  if (typeof data.total !== "number" && typeof data.total !== "string") {
    return { isValid: false, error: "Total is not a number or string" };
  }

  for (let i = 0; i < data.items.length; i++) {
    const item = data.items[i];
    if (!item.itemName || typeof item.itemName !== "string") {
      return { isValid: false, error: `Item ${i} has invalid itemName` };
    }

    if (typeof item.itemPrice === "string") {
      const parsed = parseFloat(item.itemPrice);
      if (isNaN(parsed)) {
        return {
          isValid: false,
          error: `Item ${i} has invalid itemPrice: ${item.itemPrice}`,
        };
      }
      item.itemPrice = parsed;
    } else if (typeof item.itemPrice !== "number" || isNaN(item.itemPrice)) {
      return {
        isValid: false,
        error: `Item ${i} has invalid itemPrice: ${item.itemPrice}`,
      };
    }
  }

  if (typeof data.total === "string") {
    const parsed = parseFloat(data.total);
    if (isNaN(parsed)) {
      return { isValid: false, error: `Invalid total: ${data.total}` };
    }
    data.total = parsed;
  }

  return { isValid: true };
}

function getMockData(): ParsedReceiptData {
  return {
    items: [
      { itemName: "Burger", itemPrice: 10.99 },
      { itemName: "Fries", itemPrice: 3.5 },
      { itemName: "Soda", itemPrice: 2.5 },
      { itemName: "Ice Cream", itemPrice: 4.99 },
      { itemName: "Coffee", itemPrice: 3.99 },
    ],
    total: 25.97,
  };
}
