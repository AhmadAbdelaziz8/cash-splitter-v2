import { GoogleGenerativeAI, Part, SchemaType } from "@google/generative-ai";
import { getApiKey } from "@/services/apiKeyService";

export interface ReceiptItem {
  itemName: string;
  itemPrice: number;
  quantity: number;
}

export interface ParsedReceiptData {
  items: ReceiptItem[];
  total: number;
  tax?: number;
  service?: number | string; // Can be a fixed number or a percentage string e.g., "10%"
}

// Enhanced error types for better user experience
export enum ReceiptParsingError {
  NO_ITEMS_FOUND = "NO_ITEMS_FOUND",
  UNREADABLE_IMAGE = "UNREADABLE_IMAGE",
  INVALID_RECEIPT = "INVALID_RECEIPT",
  API_ERROR = "API_ERROR",
  NETWORK_ERROR = "NETWORK_ERROR",
  VALIDATION_ERROR = "VALIDATION_ERROR",
}

export interface ParseResult {
  success: boolean;
  data?: ParsedReceiptData;
  error?: string;
  errorType?: ReceiptParsingError;
}

export async function parseReceiptImage(
  base64Image: string,
  mimeType: string = "image/jpeg"
): Promise<ParseResult> {
  // Get API key from storage instead of environment variable
  const API_KEY = await getApiKey();

  if (!API_KEY) {
    return {
      success: false,
      error:
        "Google API Key not found. Please set your API key in the app settings.",
      data: getMockData(), // Provide mock data for development without API key
    };
  }

  try {
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash", // Consider using the latest available model version
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
        tax: { type: SchemaType.NUMBER, nullable: true },
        service: {
          type: [SchemaType.NUMBER, SchemaType.STRING], // Accept both number and string
          nullable: true,
          description:
            "Service charge. Can be a fixed amount (number) or a percentage (string, e.g., '10%').",
        },
      },
      required: ["items", "total"],
    };

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

    const prompt = `Analyze this receipt image.
Extract all distinct items with their individual prices and quantities if available.
Identify any overall tax amount.
Identify any service charge. If the service charge is a percentage, return it as a string (e.g., "10%", "12.5%"). If it's a fixed amount, return it as a number.
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
        throw new Error(
          `Failed to parse JSON from response: ${errorMsg}. Original text: ${text}`
        );
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
    // Only log in development
    if (__DEV__) {
      console.error("Error in parseReceiptImage:", error);
    }
    return {
      success: false,
      error: errorMessage,
      data: getMockData(), // Fallback to mock data on error during development
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
    // Allow string for total initially if LLM sends it
    return { isValid: false, error: "Total is not a number or string" };
  }
  if (typeof data.total === "string") {
    // Convert total to number if it's a string
    const parsedTotal = parseFloat(data.total);
    if (isNaN(parsedTotal)) {
      return { isValid: false, error: `Invalid total: ${data.total}` };
    }
    data.total = parsedTotal;
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
    if (item.quantity === undefined || item.quantity === null) {
      item.quantity = 1;
    } else if (typeof item.quantity === "string") {
      const parsedQuantity = parseFloat(item.quantity);
      if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
        item.quantity = 1;
      } else {
        item.quantity = parsedQuantity;
      }
    } else if (
      typeof item.quantity !== "number" ||
      isNaN(item.quantity) ||
      item.quantity <= 0
    ) {
      item.quantity = 1;
    }
  }

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
    // delete data.tax; // Keep null as a valid state, or handle as 0 in context
  }

  // Validate optional service field
  if (data.service !== undefined && data.service !== null) {
    if (typeof data.service === "string") {
      // Check if it's a percentage string like "10%", "12.5%"
      if (!/^\d+(\.\d+)?%$/.test(data.service)) {
        // If it's a string but not a valid percentage, try to parse as number.
        // This handles cases where LLM might send "15.00" as string for a fixed amount.
        const parsedServiceNum = parseFloat(data.service);
        if (isNaN(parsedServiceNum)) {
          return {
            isValid: false,
            error: `Invalid service string format: ${data.service}. Expected number or percentage string (e.g., '10%').`,
          };
        }
        data.service = parsedServiceNum; // Convert to number if it was a numeric string
      }
      // If it IS a valid percentage string (e.g. "10%"), keep as string.
    } else if (typeof data.service !== "number" || isNaN(data.service)) {
      return {
        isValid: false,
        error: `Service is not a valid number or percentage string: ${data.service}`,
      };
    }
  } else if (data.service === null) {
    // delete data.service; // Keep null as a valid state, or handle as 0/not present in context
  }

  return { isValid: true };
}

function getMockData(): ParsedReceiptData {
  // Updated mock data to reflect possible service charge types
  const serviceType = Math.random();
  let mockService: number | string | undefined;
  if (serviceType < 0.4) {
    mockService = 15.0; // Fixed amount
  } else if (serviceType < 0.8) {
    mockService = "12.5%"; // Percentage
  } else {
    mockService = undefined; // No service charge
  }

  return {
    items: [
      { itemName: "Burger", itemPrice: 10.99, quantity: 1 },
      { itemName: "Fries", itemPrice: 3.5, quantity: 2 },
      { itemName: "Soda", itemPrice: 2.5, quantity: 1 },
      { itemName: "Salad", itemPrice: 8.75, quantity: 1 },
      { itemName: "Coffee", itemPrice: 3.25, quantity: 2 },
    ],
    total: 40.0, // Example total, should be calculated based on items, tax, service in real use
    tax: 3.64,
    service: mockService,
  };
}
