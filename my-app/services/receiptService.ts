import { GoogleGenerativeAI, Part, SchemaType } from "@google/generative-ai";
// Import types from geminiConfig.ts
import {
  ParseResult,
  ParsedReceiptData, // This is Gemini's ParsedReceiptData with strict ReceiptItem
  ReceiptItem, // This is Gemini's ReceiptItem with quantity: number
} from "@/config/geminiConfig";
import { API, MESSAGES } from "@/constants/AppConstants";
import { errorHandler, ErrorType } from "@/utils/errorUtils";
import { getApiKey } from "@/services/apiKeyService"; // Add import for user's API key

// LLMReceiptItem can be kept if the initial parsing step from LLM is slightly different
// before validation, but validateParsedData should output items conforming to ReceiptItem.
interface LLMReceiptItemForParsing {
  itemName: string;
  itemPrice: number;
  quantity?: number; // LLM might omit it or send null
}

interface ParsedDataFromLLMForValidation {
  items: LLMReceiptItemForParsing[];
  total: number;
  tax?: string; // Always percentage string
  service?: number; // Always fixed number
}

class ReceiptService {
  private genAI: GoogleGenerativeAI | null = null;
  private receiptSchema: any;

  constructor() {
    this.receiptSchema = {
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
  }

  private getMockData(): ParsedReceiptData {
    const items = [
      { itemName: "Burger", itemPrice: 10.99, quantity: 1 },
      { itemName: "Fries", itemPrice: 3.5, quantity: 2 },
      { itemName: "Soda", itemPrice: 2.5, quantity: 1 },
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

  private validateParsedData(data: any): {
    isValid: boolean;
    error?: string;
    validatedData?: ParsedReceiptData; // Output type is now the strict ParsedReceiptData
  } {
    if (!data || typeof data !== "object") {
      return { isValid: false, error: "Data is not an object" };
    }

    const rawData = data as ParsedDataFromLLMForValidation; // Cast the input for easier access

    if (!Array.isArray(rawData.items)) {
      return { isValid: false, error: "Items is not an array" };
    }
    if (typeof rawData.total !== "number") {
      if (typeof rawData.total === "string") {
        const parsedTotal = parseFloat(rawData.total);
        if (isNaN(parsedTotal)) {
          return { isValid: false, error: "Total is not a valid number" };
        }
        rawData.total = parsedTotal;
      } else {
        return { isValid: false, error: "Total is not a number" };
      }
    }

    const validatedItems: ReceiptItem[] = []; // Items will conform to strict ReceiptItem
    for (let i = 0; i < rawData.items.length; i++) {
      const item = rawData.items[i];
      if (!item.itemName || typeof item.itemName !== "string") {
        return { isValid: false, error: `Item ${i} has invalid itemName` };
      }

      let price = item.itemPrice;
      if (typeof price === "string") {
        const parsed = parseFloat(price);
        if (isNaN(parsed)) {
          return {
            isValid: false,
            error: `Item ${i} has invalid itemPrice: ${price}`,
          };
        }
        price = parsed;
      } else if (typeof price !== "number" || isNaN(price)) {
        return {
          isValid: false,
          error: `Item ${i} has invalid itemPrice: ${price}`,
        };
      }

      let quantity = 1; // Default quantity
      if (item.quantity !== undefined && item.quantity !== null) {
        if (typeof item.quantity === "string") {
          const parsedQuantity = parseFloat(item.quantity);
          if (!isNaN(parsedQuantity) && parsedQuantity > 0) {
            quantity = parsedQuantity;
          }
        } else if (
          typeof item.quantity === "number" &&
          !isNaN(item.quantity) &&
          item.quantity > 0
        ) {
          quantity = item.quantity;
        }
      }
      validatedItems.push({
        itemName: item.itemName,
        itemPrice: price,
        quantity: quantity,
      });
    }

    // Validate optional tax field
    let tax = rawData.tax;
    if (tax !== undefined && tax !== null) {
      if (typeof tax === "string") {
        // Check if it's a percentage string like "14%", "15.5%"
        if (!/^\d+(\.\d+)?%$/.test(tax)) {
          // If it's a string but not a valid percentage, try to parse as number
          const parsedTaxNum = parseFloat(tax);
          if (isNaN(parsedTaxNum)) {
            return {
              isValid: false,
              error: `Invalid tax string format: ${tax}. Expected number or percentage string (e.g., '14%').`,
            };
          }
          tax = parsedTaxNum.toString(); // Convert to string if it was a numeric string
        }
        // If it IS a valid percentage string (e.g. "14%"), keep as string.
      } else if (typeof tax !== "string") {
        return {
          isValid: false,
          error: `Tax is not a valid string: ${tax}`,
        };
      }
    } else if (tax === null) {
      tax = undefined;
    }

    let service = rawData.service;
    if (service !== undefined && service !== null) {
      if (typeof service !== "number") {
        return {
          isValid: false,
          error: `Service is not a valid number: ${service}`,
        };
      }
    } else if (service === null) {
      service = undefined;
    }

    const finalValidatedData: ParsedReceiptData = {
      items: validatedItems,
      total: rawData.total,
      tax: tax, // tax can be string or undefined
      service: service, // service can be number or undefined
    };

    return { isValid: true, validatedData: finalValidatedData };
  }

  async parseReceiptImage(
    base64Image: string,
    mimeType: string = API.DEFAULT_MIME_TYPE
  ): Promise<ParseResult> {
    const apiKey = await getApiKey();

    if (!apiKey) {
      errorHandler.logError(
        ErrorType.API,
        MESSAGES.NO_API_KEY,
        undefined,
        "ReceiptService.parseReceiptImage"
      );
      return {
        success: false,
        error:
          "Google API Key not found. Please set your API key in the app settings.",
        data: null as any, // No mock data when API key is missing
      };
    }

    this.genAI = new GoogleGenerativeAI(apiKey);

    try {
      const model = this.genAI.getGenerativeModel({ model: API.GEMINI_MODEL });
      let cleanBase64 = base64Image;
      if (base64Image.startsWith("data:")) {
        const base64Index = base64Image.indexOf(",");
        if (base64Index !== -1) {
          cleanBase64 = base64Image.substring(base64Index + 1);
        }
      }

      const imagePart: Part = {
        inlineData: { data: cleanBase64, mimeType: mimeType },
      };
      const prompt = this.buildPrompt();

      const result = await model.generateContent({
        contents: [{ role: "user", parts: [imagePart, { text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: this.receiptSchema,
        },
      });

      const response = result.response;
      const text = response.text().trim();
      const parsedJson = this.parseAPIResponse(text);

      const validationResult = this.validateParsedData(parsedJson);

      if (!validationResult.isValid || !validationResult.validatedData) {
        throw new Error(
          validationResult.error || "Invalid data structure after validation"
        );
      }
      return { success: true, data: validationResult.validatedData };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown processing error";
      const errorInstance = error instanceof Error ? error : undefined;
      errorHandler.logError(
        ErrorType.API,
        errorMessage,
        errorInstance,
        "ReceiptService.parseReceiptImage"
      );
      return {
        success: false,
        error: errorMessage,
        data: this.getMockData(), // Keep mock data for other errors, but not for missing API key
      };
    }
  }

  private buildPrompt(): string {
    return `Analyze this receipt image and extract the following information:

1. ITEMS: Extract all distinct items with their individual prices and quantities if available.

2. TAX CALCULATION: 
   - Only include tax if it's actually shown on the receipt
   - If tax amount is shown, calculate: (tax_amount / subtotal) × 100 to get percentage
   - Return as percentage string format (e.g., "14%", "15%", "13.5%")
   - If NO tax is shown on receipt, set tax to null (do not default to any value)
   - NEVER return tax as a fixed dollar amount - always as percentage or null

3. SERVICE CHARGE: 
   - Include ANY service-related charges: service fees, delivery fees, tips, gratuity, etc.
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
  }

  private parseAPIResponse(text: string): any {
    // This can remain 'any' as validation handles structure
    try {
      return JSON.parse(text);
    } catch (directParseError) {
      try {
        const codeBlockMatch = text.match(/```(?:json)?\s*(\{.*?\})\s*```/s);
        if (codeBlockMatch) return JSON.parse(codeBlockMatch[1]);
        const jsonMatch = text.match(/\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/s);
        if (!jsonMatch) throw new Error("No JSON structure found in response");
        return JSON.parse(jsonMatch[0]);
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
  }
}

export const receiptService = new ReceiptService();
