import { GoogleGenerativeAI, Part } from "@google/generative-ai";
import {
  ParseResult,
  ParsedReceiptData,
  ReceiptItem as APIReceiptItem,
} from "@/types";
import { API, MESSAGES } from "@/constants/AppConstants";
import { errorHandler, ErrorType } from "@/utils/errorUtils";

interface ReceiptItem {
  itemName: string;
  itemPrice: number;
}

class ReceiptService {
  private apiKey: string | undefined;
  private genAI: GoogleGenerativeAI | null = null;

  constructor() {
    this.apiKey = process.env.EXPO_PUBLIC_GOOGLE_API_KEY;
    if (this.apiKey) {
      this.genAI = new GoogleGenerativeAI(this.apiKey);
    }
  }

  private getMockData(): ParsedReceiptData {
    return {
      items: [
        {
          id: "1",
          name: "Burger",
          price: 10.99,
          selected: false,
          assignedTo: [],
        },
        { id: "2", name: "Fries", price: 3.5, selected: false, assignedTo: [] },
        { id: "3", name: "Soda", price: 2.5, selected: false, assignedTo: [] },
        {
          id: "4",
          name: "Ice Cream",
          price: 4.99,
          selected: false,
          assignedTo: [],
        },
        {
          id: "5",
          name: "Coffee",
          price: 3.99,
          selected: false,
          assignedTo: [],
        },
      ],
      total: 25.97,
    };
  }

  private validateParsedData(data: any): { isValid: boolean; error?: string } {
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

  private formatToAppFormat(data: {
    items: ReceiptItem[];
    total: number;
  }): ParsedReceiptData {
    return {
      items: data.items.map((item, index) => ({
        id: `${index + 1}`,
        name: item.itemName,
        price: item.itemPrice,
        selected: false,
        assignedTo: [],
      })),
      total: data.total,
    };
  }

  async parseReceiptImage(
    base64Image: string,
    mimeType: string = API.DEFAULT_MIME_TYPE
  ): Promise<ParseResult> {
    if (!this.apiKey || !this.genAI) {
      errorHandler.logError(
        ErrorType.API,
        "API key not configured",
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
      const model = this.genAI.getGenerativeModel({
        model: API.GEMINI_MODEL,
      });

      // Clean base64 data
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

      const prompt = this.buildPrompt();
      const result = await model.generateContent([prompt, imagePart]);
      const response = result.response;
      const text = response.text().trim();

      const parsedData = this.parseAPIResponse(text);
      const validationResult = this.validateParsedData(parsedData);

      if (!validationResult.isValid) {
        throw new Error(`Invalid data structure: ${validationResult.error}`);
      }

      const formattedData = this.formatToAppFormat(parsedData);

      return {
        success: true,
        data: formattedData,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";

      errorHandler.logError(
        ErrorType.API,
        errorMessage,
        error instanceof Error ? error : undefined,
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
    return `Analyze this receipt image and extract all items with their prices.

CRITICAL: Return ONLY a valid JSON object in this EXACT format:
{"items": [{"itemName": "string", "itemPrice": number}], "total": number}

Rules:
- Do not include any text before or after the JSON
- Do not use markdown formatting or code blocks
- Ensure itemPrice and total are numbers, not strings
- If you cannot read the receipt clearly, return empty items array and total: 0

Example output:
{"items": [{"itemName": "Coffee", "itemPrice": 4.50}], "total": 4.50}`;
  }

  private parseAPIResponse(text: string): any {
    try {
      return JSON.parse(text);
    } catch (directParseError) {
      try {
        const codeBlockMatch = text.match(/```(?:json)?\s*(\{.*?\})\s*```/s);
        if (codeBlockMatch) {
          return JSON.parse(codeBlockMatch[1]);
        } else {
          const jsonMatch = text.match(/\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/s);
          if (!jsonMatch) {
            throw new Error("No JSON structure found in response");
          }
          return JSON.parse(jsonMatch[0]);
        }
      } catch (extractionError) {
        const errorMsg =
          extractionError instanceof Error
            ? extractionError.message
            : String(extractionError);
        throw new Error(`Failed to parse JSON from response: ${errorMsg}`);
      }
    }
  }
}

export const receiptService = new ReceiptService();
