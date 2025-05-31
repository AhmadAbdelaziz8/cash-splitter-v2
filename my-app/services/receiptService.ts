import { GoogleGenerativeAI, Part, SchemaType } from "@google/generative-ai";
// Import types from geminiConfig.ts
import {
  ParseResult,
  ParsedReceiptData, // This is Gemini's ParsedReceiptData with strict ReceiptItem
  ReceiptItem, // This is Gemini's ReceiptItem with quantity: number
} from "@/config/geminiConfig";
import { API, MESSAGES } from "@/constants/AppConstants";
import { errorHandler, ErrorType } from "@/utils/errorUtils";

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
  tax?: number;
  service?: number | string; // Service can be number or string from LLM
}

class ReceiptService {
  private apiKey: string | undefined;
  private genAI: GoogleGenerativeAI | null = null;
  private receiptSchema: any;

  constructor() {
    this.apiKey = process.env.EXPO_PUBLIC_GOOGLE_API_KEY;
    if (this.apiKey) {
      this.genAI = new GoogleGenerativeAI(this.apiKey);
    }
    // Schema now expects quantity to be potentially null from LLM, validation will fix it.
    // Service can be number or string.
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
        service: {
          // Corrected: Specify a single primary type. Validation will handle parsing.
          // The prompt guides the LLM to send numbers for fixed amounts and strings for percentages.
          // String is a safe bet for schema as numbers can be represented as strings.
          type: SchemaType.STRING,
          nullable: true,
          description:
            "Service charge. Can be fixed (number) or percentage (string, e.g., '10%'). LLM should return numbers as numbers and percentages as strings (e.g. \"10%\").",
        },
      },
      required: ["items", "total"],
    };
  }

  // getMockData should return data conforming to config/geminiConfig.ts:ParsedReceiptData
  private getMockData(): ParsedReceiptData {
    return {
      items: [
        { itemName: "Burger", itemPrice: 10.99, quantity: 1 },
        { itemName: "Fries", itemPrice: 3.5, quantity: 2 },
        { itemName: "Soda", itemPrice: 2.5, quantity: 1 },
      ],
      total: 19.49,
      tax: 1.95,
      service: 1.0, // Example: fixed service
      // service: "10%", // Example: percentage service
    };
  }

  // Validates the raw data from LLM and transforms it to ParsedReceiptData
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

    let tax = rawData.tax;
    if (tax !== undefined && tax !== null) {
      if (typeof tax === "string") {
        const parsed = parseFloat(tax);
        if (isNaN(parsed)) {
          return { isValid: false, error: `Invalid tax value: ${tax}` };
        }
        tax = parsed;
      } else if (typeof tax !== "number" || isNaN(tax)) {
        return { isValid: false, error: `Tax is not a number: ${tax}` };
      }
    } else if (tax === null) {
      tax = undefined;
    }

    let service = rawData.service;
    if (service !== undefined && service !== null) {
      if (typeof service === "string") {
        if (!/^\d+(\.\d+)?%$/.test(service)) {
          // If not a percentage string
          const parsedServiceNum = parseFloat(service); // Try to parse as number
          if (isNaN(parsedServiceNum)) {
            return {
              isValid: false,
              error: `Invalid service string: ${service}. Expected number or 'X%'.`,
            };
          }
          service = parsedServiceNum; // Convert to number if it was a numeric string
        }
        // If it is a valid percentage string (e.g., "10%"), it remains a string.
      } else if (typeof service !== "number" || isNaN(service)) {
        return {
          isValid: false,
          error: `Service is not a valid number or percentage string: ${service}`,
        };
      }
    } else if (service === null) {
      service = undefined;
    }

    const finalValidatedData: ParsedReceiptData = {
      items: validatedItems,
      total: rawData.total,
      tax: tax, // tax can be number or undefined
      service: service, // service can be number, string, or undefined
    };

    return { isValid: true, validatedData: finalValidatedData };
  }

  async parseReceiptImage(
    base64Image: string,
    mimeType: string = API.DEFAULT_MIME_TYPE
  ): Promise<ParseResult> {
    // Return type is now ParseResult from geminiConfig
    console.trace("parseReceiptImage called in ReceiptService");

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
        data: this.getMockData(), // Ensure mock data also conforms
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
      const parsedJson = this.parseAPIResponse(text); // This is 'any'

      const validationResult = this.validateParsedData(parsedJson); // Returns { validatedData?: ParsedReceiptData }

      if (!validationResult.isValid || !validationResult.validatedData) {
        throw new Error(
          validationResult.error || "Invalid data structure after validation"
        );
      }
      // validationResult.validatedData is now ParsedReceiptData from geminiConfig
      return { success: true, data: validationResult.validatedData };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown processing error";
      // Check if error is an instance of Error before passing to errorHandler
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
        data: this.getMockData(),
      };
    }
  }

  private buildPrompt(): string {
    return `Analyze this receipt image.
Extract all distinct items with their individual prices and quantities if available.
Identify any overall tax amount.
Identify any service charge. If the service charge is a percentage, return it as a string (e.g., "10%", "12.5%"). If it's a fixed amount, return it as a number.
If quantity for an item is not found, it can be omitted or set to null (it will default to 1).
If tax or service charges are not found, they can be omitted or set to null.`;
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
