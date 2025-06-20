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
  tax?: string; // Optional percentage string e.g., "14%" (undefined if no tax)
  service?: number; // Optional fixed number for equal distribution (undefined if no service)
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
        tax: { type: SchemaType.STRING, nullable: true },
        service: {
          type: SchemaType.NUMBER,
          nullable: true,
          description:
            "Service charge as fixed amount for equal distribution among participants.",
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

    const prompt = `Analyze this receipt image and extract the following information:

1. ITEMS: Extract all distinct items with their individual prices and quantities if available.

2. TAX CALCULATION: 
   - Only include tax if it's actually shown on the receipt
   - If tax amount is shown, calculate: (tax_amount / subtotal) × 100 to get percentage
   - Return as percentage string format (e.g., "14%", "15%", "13.5%")
   - If NO tax is shown on receipt, set tax to null (do not default to any value)
   - NEVER return tax as a fixed dollar amount - always as percentage or null

3. SERVICE CHARGE: 
   - Include ANY service-related charges: service fees, delivery fees, tips, etc.
   - Service charges MUST ALWAYS be returned as fixed dollar amounts (numbers)
   - If service shows as percentage on receipt, calculate the actual dollar amount
   - Examples: delivery fee $3.50 → return 3.50, service charge $15.00 → return 15.00
   - If no service charges found, set to null
   - Service will be divided equally among all participants

4. VALIDATION:
   - Ensure the total makes mathematical sense: total ≈ subtotal + tax + service
   - If quantities are not found for items, default to 1
   - Tax: percentage string format or null
   - Service: fixed amount (number) or null

Return the data in the specified JSON format.`;

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

  // Validate optional tax field
  if (data.tax !== undefined && data.tax !== null) {
    if (typeof data.tax === "string") {
      // Check if it's a percentage string like "14%", "15.5%"
      if (!/^\d+(\.\d+)?%$/.test(data.tax)) {
        // If it's a string but not a valid percentage, try to convert to percentage
        const parsedTaxNum = parseFloat(data.tax);
        if (isNaN(parsedTaxNum)) {
          return {
            isValid: false,
            error: `Invalid tax string format: ${data.tax}. Expected percentage string (e.g., '14%').`,
          };
        }
        data.tax = `${parsedTaxNum}%`; // Convert to percentage string
      }
      // If it IS a valid percentage string (e.g. "14%"), keep as string.
    } else if (typeof data.tax === "number") {
      // Convert number to percentage string (assume it's already a percentage value)
      data.tax = `${data.tax}%`;
    } else {
      return {
        isValid: false,
        error: `Tax must be a percentage string: ${data.tax}`,
      };
    }
  } else if (data.tax === null) {
    // Keep null as a valid state
  }

  // Validate optional service field - always convert to number
  if (data.service !== undefined && data.service !== null) {
    if (typeof data.service === "string") {
      // Try to parse as number (removing any % symbols if present)
      const parsedServiceNum = parseFloat(data.service.replace("%", ""));
      if (isNaN(parsedServiceNum)) {
        return {
          isValid: false,
          error: `Invalid service string: ${data.service}. Expected number.`,
        };
      }
      data.service = parsedServiceNum; // Convert to number
    } else if (typeof data.service !== "number" || isNaN(data.service)) {
      return {
        isValid: false,
        error: `Service must be a number: ${data.service}`,
      };
    }
  } else if (data.service === null) {
    // Keep null as a valid state
  }

  return { isValid: true };
}

function getMockData(): ParsedReceiptData {
  const items = [
    { itemName: "Burger", itemPrice: 10.99, quantity: 1 },
    { itemName: "Fries", itemPrice: 3.5, quantity: 2 },
    { itemName: "Soda", itemPrice: 2.5, quantity: 1 },
    { itemName: "Salad", itemPrice: 8.75, quantity: 1 },
    { itemName: "Coffee", itemPrice: 3.25, quantity: 2 },
  ];

  // Calculate subtotal
  const subtotal = items.reduce(
    (acc, item) => acc + item.itemPrice * item.quantity,
    0
  );

  // No tax in mock data (only if actually found on receipt)
  const tax = undefined;
  const taxAmount = 0;

  // Example delivery fee as service charge
  const service = 3.5; // Delivery fee

  return {
    items,
    total: subtotal + taxAmount + service,
    tax,
    service,
  };
}
