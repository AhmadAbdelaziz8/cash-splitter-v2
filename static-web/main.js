const mockReceiptData = [
  { name: "🍔 Burger", price: 1099, quantity: 1 }, // Store price in cents
  { name: "🍟 Fries", price: 350, quantity: 2 },
  { name: "🥤 Soda", price: 250, quantity: 1 },
  { name: "🍰 Ice Cream", price: 499, quantity: 1 },
];

// Configuration constants
const CONFIG = {
  DEFAULT_PEOPLE_COUNT: 2,
  MIN_PEOPLE_COUNT: 1,
  MAX_PEOPLE_COUNT: 10,
  CURRENCY_PRECISION: 2,
  NOTIFICATION_DURATION: 2000,
  COLORS: {
    SELECTED: "#059669",
    UNSELECTED: "#6b7280",
    BACKGROUND_GRADIENT: "linear-gradient(135deg, #ecfdf5, #d1fae5)",
    BORDER: "#10b981",
    TEXT_DARK: "#065f46",
  },
};

// Utility functions for currency handling
function formatCurrency(cents) {
  return `$${(cents / 100).toFixed(2)}`;
}

function parseCurrency(dollarString) {
  return Math.round(parseFloat(dollarString.replace("$", "")) * 100);
}

function createReceiptTile(item, index) {
  // create the main container of the tile
  const tile = document.createElement("div");
  tile.className = "receipt-container";

  // create checkbox for participation
  const checkboxContainer = document.createElement("div");
  checkboxContainer.className = "receipt-checkbox";
  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.id = `item-${index}`;
  checkbox.addEventListener("change", calculateUserTotal);
  checkboxContainer.appendChild(checkbox);

  // create the header of the tile
  const header = document.createElement("div");
  header.className = "receipt-header";
  header.textContent = item.name;

  // create the price of the tile
  const price = document.createElement("div");
  price.className = "receipt-price";
  price.textContent = formatCurrency(item.total);

  // create people count input
  const peopleContainer = document.createElement("div");
  peopleContainer.className = "receipt-people";
  const peopleInput = document.createElement("input");
  peopleInput.type = "number";
  peopleInput.min = CONFIG.MIN_PEOPLE_COUNT.toString();
  peopleInput.max = CONFIG.MAX_PEOPLE_COUNT.toString();
  peopleInput.value = CONFIG.DEFAULT_PEOPLE_COUNT.toString();
  peopleInput.id = `people-${index}`;
  peopleInput.addEventListener("input", calculateUserTotal);

  const peopleLabel = document.createElement("label");
  peopleLabel.textContent = "people";
  peopleLabel.style.fontSize = "12px";

  peopleContainer.appendChild(peopleInput);
  peopleContainer.appendChild(peopleLabel);

  // create user's share for this item
  const userShare = document.createElement("div");
  userShare.className = "receipt-user-share";
  userShare.id = `share-${index}`;
  userShare.textContent = "$0.00";

  // append the elements to the tile
  tile.appendChild(checkboxContainer);
  tile.appendChild(header);
  tile.appendChild(price);
  tile.appendChild(peopleContainer);
  tile.appendChild(userShare);

  return tile;
}

function displayReceiptItems(items) {
  // Remove existing static tiles
  const existingTiles = document.querySelectorAll(".receipt-container");
  existingTiles.forEach((tile) => tile.remove());

  // Find the title
  const title = document.querySelector("section h2");

  // Create or get the scrollable container
  let container = document.getElementById("receipt-items-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "receipt-items-container";
    container.className = "receipt-items-container";
    title.insertAdjacentElement("afterend", container);
  } else {
    container.innerHTML = ""; // Clear existing items
  }

  // Create and insert each tile into the scrollable container
  items.forEach((item, index) => {
    const tile = createReceiptTile(item, index);
    container.appendChild(tile);
  });
}

function calculateUserTotal() {
  let userTotalCents = 0;

  receiptData.forEach((item, index) => {
    const checkbox = document.getElementById(`item-${index}`);
    const peopleInput = document.getElementById(`people-${index}`);
    const shareElement = document.getElementById(`share-${index}`);

    if (checkbox && peopleInput && shareElement) {
      const peopleCount = parseInt(peopleInput.value) || 1;
      const userShareCents = Math.round(item.total / peopleCount);

      if (checkbox.checked) {
        shareElement.textContent = formatCurrency(userShareCents);
        shareElement.style.color = "#059669";
        shareElement.style.fontWeight = "bold";
        userTotalCents += userShareCents;
      } else {
        shareElement.textContent = "$0.00";
        shareElement.style.color = "#6b7280";
        shareElement.style.fontWeight = "normal";
      }
    }
  });

  updateTotalDisplay(userTotalCents);
}

function updateTotalDisplay(totalCents) {
  let totalDiv = document.getElementById("user-total");
  if (!totalDiv) {
    totalDiv = document.createElement("div");
    totalDiv.id = "user-total";
    totalDiv.style.cssText = `
      margin-top: 20px; 
      padding: 20px; 
      background: linear-gradient(135deg, #ecfdf5, #d1fae5); 
      border-radius: 12px; 
      text-align: center;
      border-left: 5px solid #10b981;
    `;
    document.querySelector(".calculate-button").style.display = "none"; // Hide the old button
    document.querySelector("section").appendChild(totalDiv);
  }

  totalDiv.innerHTML = `
    <h3 style="color: #065f46; margin: 0 0 10px 0;">💰 Your Total</h3>
    <div style="font-size: 28px; font-weight: bold; color: #059669;">
      ${formatCurrency(totalCents)}
    </div>
    <p style="color: #065f46; margin: 10px 0 0 0; font-size: 14px;">
      Based on items you selected and people sharing
    </p>
  `;
}

function addQuickActionListeners() {
  // Select All button
  const selectAllBtn = document.getElementById("select-all-btn");
  if (selectAllBtn) {
    selectAllBtn.addEventListener("click", () => {
      receiptData.forEach((_, index) => {
        const checkbox = document.getElementById(`item-${index}`);
        if (checkbox) {
          checkbox.checked = true;
        }
      });
      calculateUserTotal();
    });
  }

  // Clear All button
  const clearAllBtn = document.getElementById("clear-all-btn");
  if (clearAllBtn) {
    clearAllBtn.addEventListener("click", () => {
      receiptData.forEach((_, index) => {
        const checkbox = document.getElementById(`item-${index}`);
        if (checkbox) {
          checkbox.checked = false;
        }
      });
      calculateUserTotal();
    });
  }

  // Share Result button
  const shareBtn = document.getElementById("share-btn");
  if (shareBtn) {
    shareBtn.addEventListener("click", shareResult);
  }
}

async function shareResult() {
  const selectedItems = [];
  let userTotal = 0;

  receiptData.forEach((item, index) => {
    const checkbox = document.getElementById(`item-${index}`);
    const peopleInput = document.getElementById(`people-${index}`);

    if (checkbox && checkbox.checked && peopleInput) {
      const peopleCount = parseInt(peopleInput.value) || 1;
      const userShare = item.total / peopleCount;
      userTotal += userShare;

      selectedItems.push({
        name: item.name,
        total: item.total,
        people: peopleCount,
        yourShare: userShare,
      });
    }
  });

  const shareText = `💰 My Bill Split Results\n\n${selectedItems
    .map(
      (item) =>
        `${item.name}: $${item.yourShare / 100} (split ${item.people} ways)`
    )
    .join("\n")}\n\n🧾 My Total: $${
    userTotal / 100
  }\n\nSplit with Cash Splitter 📱`;

  try {
    // Try Web Share API first (mobile)
    if (navigator.share) {
      await navigator.share({
        title: "My Bill Split Results",
        text: shareText,
        url: window.location.href,
      });
    } else {
      // Fallback to clipboard
      await navigator.clipboard.writeText(shareText);
      showNotification("💾 Results copied to clipboard!");
    }
  } catch (error) {
    console.error("Error sharing:", error);
    // Final fallback - show the text in a prompt
    prompt("Copy this text to share your results:", shareText);
  }
}

/**
 * Show a temporary notification
 */
function showNotification(message) {
  const notification = document.createElement("div");
  notification.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: #10b981;
    color: white;
    padding: 16px 24px;
    border-radius: 8px;
    font-weight: 600;
    z-index: 2000;
    box-shadow: 0 4px 20px rgba(0,0,0,0.15);
    animation: fadeInOut 2s ease-in-out;
  `;
  notification.textContent = message;

  // Add CSS animation
  const style = document.createElement("style");
  style.textContent = `
    @keyframes fadeInOut {
      0%, 100% { opacity: 0; transform: translate(-50%, -50%) scale(0.9); }
      20%, 80% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
    }
  `;
  document.head.appendChild(style);

  document.body.appendChild(notification);

  setTimeout(() => {
    document.body.removeChild(notification);
    document.head.removeChild(style);
  }, 2000);
}

// Helper function to normalize data
function normalizeReceiptItem(item) {
  return {
    name: item.name,
    price: item.price, // Always in cents
    quantity: item.quantity || 1,
    get total() {
      return this.price * this.quantity; // Calculate total dynamically
    },
  };
}

function parseURLParameters() {
  const urlParams = new URLSearchParams(window.location.search);
  const itemsParam = urlParams.get("items");

  if (itemsParam) {
    try {
      const parsedItems = JSON.parse(decodeURIComponent(itemsParam));
      return parsedItems.map(normalizeReceiptItem);
    } catch (error) {
      console.error("Error parsing URL items:", error);
      return null;
    }
  }
  return null;
}

// Update the global data variable
let receiptData = mockReceiptData; // Default fallback

// Initialize everything when page loads
window.addEventListener("DOMContentLoaded", () => {
  // Parse URL parameters and use them if available
  const urlData = parseURLParameters();
  if (urlData && urlData.length > 0) {
    receiptData = urlData;
  }

  displayReceiptItems(receiptData);
  calculateUserTotal();
  addQuickActionListeners();
});
