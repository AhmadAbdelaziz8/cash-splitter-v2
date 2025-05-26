import { ReceiptItem } from "@/contexts/ReceiptContext";
import { WEB_SHARING, MESSAGES } from "@/constants/AppConstants";
import { errorHandler, ErrorType } from "@/utils/errorUtils";

export interface WebUrlData {
  items: Array<{
    name: string;
    price: number;
    quantity: number;
  }>;
}

export interface WebUrlResult {
  success: boolean;
  url?: string;
  fallbackMessage?: string;
  error?: string;
}

class WebSharingService {
  /**
   * Generate a web URL with receipt items for the static page
   */
  generateWebUrl(items: ReceiptItem[]): WebUrlResult {
    try {
      const webData: WebUrlData = {
        items: items.map((item) => ({
          name: item.name,
          price: item.price,
          quantity: 1,
        })),
      };

      const jsonString = JSON.stringify(webData.items);
      const encodedData = encodeURIComponent(jsonString);
      const url = `${WEB_SHARING.BASE_URL}?items=${encodedData}`;

      if (url.length > WEB_SHARING.MAX_URL_LENGTH) {
        return {
          success: false,
          error: "URL too long",
          fallbackMessage: this.generateFallbackMessage(items),
        };
      }

      return { success: true, url };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        fallbackMessage: this.generateFallbackMessage(items),
      };
    }
  }

  /**
   * Generate a shareable URL for a specific person's split
   */
  generatePersonalizedUrl(
    items: ReceiptItem[],
    personName: string,
    selectedItems: string[]
  ): WebUrlResult {
    const personItems = items.filter((item) => selectedItems.includes(item.id));
    const result = this.generateWebUrl(personItems);

    if (result.success && result.url) {
      const separator = result.url.includes("?") ? "&" : "?";
      return {
        success: true,
        url: `${result.url}${separator}person=${encodeURIComponent(
          personName
        )}`,
      };
    }

    return result;
  }

  /**
   * Generate fallback text message when URL generation fails
   */
  private generateFallbackMessage(items: ReceiptItem[]): string {
    const total = items.reduce((sum, item) => sum + item.price, 0);
    let message = "💰 Cash Splitter Receipt\n\nItems:\n";
    items.forEach((item) => {
      message += `• ${item.name}: $${item.price.toFixed(2)}\n`;
    });
    message += `\nTotal: $${total.toFixed(
      2
    )}\nSplit this bill using Cash Splitter! 📱`;
    return message;
  }
}

export const webSharingService = new WebSharingService();
