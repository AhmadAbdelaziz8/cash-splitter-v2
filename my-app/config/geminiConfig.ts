import { GoogleGenerativeAI, Part, SchemaType } from "@google/generative-ai";
const API_KEY = process.env.EXPO_PUBLIC_GOOGLE_API_KEY;

export interface ReceiptItem {
  itemName: string;
  itemPrice: number;
  quantity: number;
}

export interface ParsedReceiptData {
  items: ReceiptItem[];
  total: number;
  tax?: number;
  service?: number;
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
      model: "gemini-2.0-flash",
    });

    const receiptSchema: any = {
      type: SchemaType.OBJECT,
      properties: {
        items: {
          type: SchemaType.ARRAY,
          items: {
            type: SchemaType.OBJECT,
            properties: {
              itemName: { type: SchemaType.STRING },
              itemPrice: { type: SchemaType.NUMBER },
              quantity: { type: SchemaType.NUMBER, nullable: true },
            },
            required: ["itemName", "itemPrice"],
          },
        },
        total: { type: SchemaType.NUMBER },
        tax: { type: SchemaType.NUMBER, nullable: true }, // Make tax optional
        service: { type: SchemaType.NUMBER, nullable: true }, // Make service optional
      },
      required: ["items", "total"], // Items and total are likely always required
    };

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

    const prompt = `Analyze this receipt image. Extract all distinct items with their individual prices and quantities if available.
Also, identify any overall tax and service charge amounts.
If quantity for an item is not found, it can be omitted or set to null (it will default to 1).
If tax or service charges are not found, they can be omitted or set to null.`;

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }, imagePart] }],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: receiptSchema,
      },
    });
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

    // Validate and default quantity for each item
    if (item.quantity === undefined || item.quantity === null) {
      item.quantity = 1;
    } else if (typeof item.quantity === "string") {
      const parsedQuantity = parseFloat(item.quantity);
      if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
        item.quantity = 1; // Default to 1 if parsing fails or quantity is invalid
      } else {
        item.quantity = parsedQuantity;
      }
    } else if (
      typeof item.quantity !== "number" ||
      isNaN(item.quantity) ||
      item.quantity <= 0
    ) {
      item.quantity = 1; // Default to 1 if not a valid number
    }
  }

  if (typeof data.total === "string") {
    const parsed = parseFloat(data.total);
    if (isNaN(parsed)) {
      return { isValid: false, error: `Invalid total: ${data.total}` };
    }
    data.total = parsed;
  }

  // Validate optional tax field
  if (data.tax !== undefined && data.tax !== null) {
    if (typeof data.tax === "string") {
      const parsed = parseFloat(data.tax);
      if (isNaN(parsed)) {
        return { isValid: false, error: `Invalid tax value: ${data.tax}` };
      }
      data.tax = parsed;
    } else if (typeof data.tax !== "number" || isNaN(data.tax)) {
      return { isValid: false, error: `Tax is not a number: ${data.tax}` };
    }
  } else if (data.tax === null) {
    delete data.tax; // Remove null tax, treat as not present
  }

  // Validate optional service field
  if (data.service !== undefined && data.service !== null) {
    if (typeof data.service === "string") {
      const parsed = parseFloat(data.service);
      if (isNaN(parsed)) {
        return {
          isValid: false,
          error: `Invalid service value: ${data.service}`,
        };
      }
      data.service = parsed;
    } else if (typeof data.service !== "number" || isNaN(data.service)) {
      return {
        isValid: false,
        error: `Service is not a number: ${data.service}`,
      };
    }
  } else if (data.service === null) {
    delete data.service; // Remove null service, treat as not present
  }

  return { isValid: true };
}

function getMockData(): ParsedReceiptData {
  return {
    items: [
      { itemName: "Burger", itemPrice: 10.99, quantity: 1 },
      { itemName: "Fries", itemPrice: 3.5, quantity: 2 },
      { itemName: "Soda", itemPrice: 2.5, quantity: 1 },
      { itemName: "Ice Cream", itemPrice: 4.99, quantity: 1 },
      { itemName: "Coffee", itemPrice: 3.99, quantity: 1 },
    ],
    total: 25.97,
    tax: 3.64,
    service: 2.6,
  };
}
