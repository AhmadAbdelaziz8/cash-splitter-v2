import { GoogleGenerativeAI, Part, SchemaType } from "@google/generative-ai";
import {
  ParseResult,
  // Assuming ParsedReceiptData from @/types will be updated or we define it here
} from "@/types";
import { API, MESSAGES } from "@/constants/AppConstants";
import { errorHandler, ErrorType } from "@/utils/errorUtils";

// Define the structure LLM is expected to return, matching GeminiParsedReceiptData
interface LLMReceiptItem {
  itemName: string;
  itemPrice: number;
  quantity?: number; // LLM might omit it
}

export interface ParsedReceiptDataByLLM {
  items: LLMReceiptItem[];
  total: number;
  tax?: number;
  service?: number;
}

class ReceiptService {
  private apiKey: string | undefined;
  private genAI: GoogleGenerativeAI | null = null;
  private receiptSchema: any; // To hold the schema for API calls

  constructor() {
    this.apiKey = process.env.EXPO_PUBLIC_GOOGLE_API_KEY;
    if (this.apiKey) {
      this.genAI = new GoogleGenerativeAI(this.apiKey);
    }
    // Define the schema directly here, similar to geminiConfig.ts
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
        tax: { type: SchemaType.NUMBER, nullable: true },
        service: { type: SchemaType.NUMBER, nullable: true },
      },
      required: ["items", "total"],
    };
  }

  private getMockData(): ParsedReceiptDataByLLM {
    // Updated return type
    return {
      items: [
        { itemName: "Burger", itemPrice: 10.99, quantity: 1 },
        { itemName: "Fries", itemPrice: 3.5, quantity: 2 },
        { itemName: "Soda", itemPrice: 2.5, quantity: 1 },
      ],
      total: 19.49,
      tax: 1.95,
      service: 1.0,
    };
  }

  // Validates the data structure received from LLM against ParsedReceiptDataByLLM
  private validateParsedData(data: any): {
    isValid: boolean;
    error?: string;
    validatedData?: ParsedReceiptDataByLLM;
  } {
    if (!data || typeof data !== "object") {
      return { isValid: false, error: "Data is not an object" };
    }

    if (!Array.isArray(data.items)) {
      return { isValid: false, error: "Items is not an array" };
    }

    if (typeof data.total !== "number") {
      // Total must be a number
      // Try to parse if string, else invalid
      if (typeof data.total === "string") {
        const parsedTotal = parseFloat(data.total);
        if (isNaN(parsedTotal)) {
          return { isValid: false, error: "Total is not a valid number" };
        }
        data.total = parsedTotal;
      } else {
        return { isValid: false, error: "Total is not a number" };
      }
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
        const parsed = parseFloat(data.tax);
        if (isNaN(parsed)) {
          return { isValid: false, error: `Invalid tax value: ${data.tax}` };
        }
        data.tax = parsed;
      } else if (typeof data.tax !== "number" || isNaN(data.tax)) {
        return { isValid: false, error: `Tax is not a number: ${data.tax}` };
      }
    } else if (data.tax === null) {
      delete data.tax; // Or set to undefined, context handles ?? null
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
      delete data.service; // Or set to undefined
    }

    return { isValid: true, validatedData: data as ParsedReceiptDataByLLM };
  }

  // This function might be redundant if validateParsedData directly returns ParsedReceiptDataByLLM
  // For now, let's assume it just passes through if validation is successful.
  // The context expects ParsedReceiptDataByLLM (aliased as GeminiParsedReceiptData there)
  private formatToAppFormat(
    data: ParsedReceiptDataByLLM
  ): ParsedReceiptDataByLLM {
    // No actual formatting change needed here if validateParsedData ensures the structure
    // The context will handle mapping to its internal ReceiptItem (with id, name, etc.)
    return data;
  }

  async parseReceiptImage(
    base64Image: string,
    mimeType: string = API.DEFAULT_MIME_TYPE
  ): Promise<ParseResult> {
    // ParseResult should expect ParsedReceiptDataByLLM
    if (!this.apiKey || !this.genAI) {
      errorHandler.logError(
        ErrorType.API,
        MESSAGES.NO_API_KEY,
        undefined,
        "ReceiptService.parseReceiptImage"
      );
      return {
        success: false,
        error: MESSAGES.NO_API_KEY,
        data: this.getMockData(),
      };
    }

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
      const prompt = this.buildPrompt(); // Prompt is now simpler

      const result = await model.generateContent({
        contents: [{ role: "user", parts: [imagePart, { text: prompt }] }], // Prompt can be part of contents
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: this.receiptSchema,
        },
      });

      const response = result.response;
      const text = response.text().trim();
      const parsedJson = this.parseAPIResponse(text); // This just parses string to JSON object

      const validationResult = this.validateParsedData(parsedJson);

      if (!validationResult.isValid || !validationResult.validatedData) {
        throw new Error(
          validationResult.error || "Invalid data structure after validation"
        );
      }

      // The data is now validated and matches ParsedReceiptDataByLLM.
      // No need for formatToAppFormat if it doesn't change the structure further.
      // The context's setProcessedReceiptData expects this ParsedReceiptDataByLLM structure.
      return { success: true, data: validationResult.validatedData };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      errorHandler.logError(
        ErrorType.API,
        errorMessage,
        error instanceof Error ? error : undefined,
        "ReceiptService.parseReceiptImage"
      );
      return { success: false, error: errorMessage, data: this.getMockData() };
    }
  }

  // Prompt is simplified as schema handles the structure
  private buildPrompt(): string {
    return `Analyze this receipt image. Extract all distinct items with their individual prices and quantities if available. Also, identify any overall tax and service charge amounts. If quantity for an item is not found, it can be omitted or set to null (it will default to 1). If tax or service charges are not found, they can be omitted or set to null.`;
  }

  private parseAPIResponse(text: string): any {
    // This function remains crucial for handling potential non-JSON text or markdown.
    // However, with schema mode, the response should be clean JSON.
    // Keeping robust parsing for safety.
    try {
      return JSON.parse(text);
    } catch (directParseError) {
      // Attempt to extract from markdown if direct parse fails (less likely in schema mode)
      try {
        const codeBlockMatch = text.match(/```(?:json)?\s*(\{.*?\})\s*```/s);
        if (codeBlockMatch && codeBlockMatch[1]) {
          return JSON.parse(codeBlockMatch[1]);
        }
        // Fallback for text that might just be a JSON object without markdown
        const jsonMatch = text.match(/\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/s);
        if (jsonMatch && jsonMatch[0]) {
          return JSON.parse(jsonMatch[0]);
        }
        throw new Error(
          "No JSON structure found in response, direct or extracted."
        );
      } catch (extractionError) {
        const errorMsg =
          extractionError instanceof Error
            ? extractionError.message
            : String(extractionError);
        errorHandler.logError(
          ErrorType.PARSING,
          `Failed to parse JSON from LLM response: ${errorMsg}`,
          extractionError instanceof Error ? extractionError : undefined,
          "ReceiptService.parseAPIResponse"
        );
        throw new Error(`Failed to parse JSON from response: ${errorMsg}`);
      }
    }
  }
}

export const receiptService = new ReceiptService();
