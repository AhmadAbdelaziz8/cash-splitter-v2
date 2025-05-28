
const CONFIG = {
  DEFAULT_PEOPLE_COUNT: 1,
  MIN_PEOPLE_COUNT: 1,

  PRECISION: 2, // For decimal places only
  NOTIFICATION_DURATION: 2000,
  COLORS: {
    SELECTED: "#059669",
    UNSELECTED: "#6b7280",
    BACKGROUND_GRADIENT: "linear-gradient(135deg, #ecfdf5, #d1fae5)",
    BORDER: "#10b981",
    TEXT_DARK: "#065f46",
  },
};

function formatAmount(amount) {
  return amount.toFixed(CONFIG.PRECISION);
}

function createReceiptTile(item, index) {
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

  // create the price of the tile - NO currency symbol
  const price = document.createElement("div");
  price.className = "receipt-price";
  price.textContent = formatAmount(item.total);

  // create people count input
  const peopleContainer = document.createElement("div");
  peopleContainer.className = "receipt-people";
  const peopleInput = document.createElement("input");
  peopleInput.type = "number";
  peopleInput.min = CONFIG.MIN_PEOPLE_COUNT.toString();
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
  userShare.textContent = "0.00";

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
  let userTotal = 0;

  receiptData.forEach((item, index) => {
    const checkbox = document.getElementById(`item-${index}`);
    const peopleInput = document.getElementById(`people-${index}`);
    const shareElement = document.getElementById(`share-${index}`);

    if (checkbox && peopleInput && shareElement) {
      const peopleCount = parseInt(peopleInput.value) || 1;
      const userShare = item.total / peopleCount;

      if (checkbox.checked) {
        shareElement.textContent = formatAmount(userShare);
        shareElement.style.color = CONFIG.COLORS.SELECTED;
        shareElement.style.fontWeight = "bold";
        userTotal += userShare;
      } else {
        shareElement.textContent = "0.00";
        shareElement.style.color = CONFIG.COLORS.UNSELECTED;
        shareElement.style.fontWeight = "normal";
      }
    }
  });

  updateTotalDisplay(userTotal);
}

function updateTotalDisplay(total) {
  let totalDiv = document.getElementById("user-total");
  if (!totalDiv) {
    totalDiv = document.createElement("div");
    totalDiv.id = "user-total";
    totalDiv.style.cssText = `
      margin-top: 20px; 
      padding: 20px; 
      background: ${CONFIG.COLORS.BACKGROUND_GRADIENT}; 
      border-radius: 12px; 
      text-align: center;
      border-left: 5px solid ${CONFIG.COLORS.BORDER};
    `;
    document.querySelector(".calculate-button").style.display = "none";
    document.querySelector("section").appendChild(totalDiv);
  }

  totalDiv.innerHTML = `
    <h3 style="color: ${
      CONFIG.COLORS.TEXT_DARK
    }; margin: 0 0 10px 0;">💰 Your Total</h3>
    <div style="font-size: 28px; font-weight: bold; color: ${
      CONFIG.COLORS.SELECTED
    };">
      ${formatAmount(total)}
    </div>
    <p style="color: ${
      CONFIG.COLORS.TEXT_DARK
    }; margin: 10px 0 0 0; font-size: 14px;">
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

  // Format sharing text without currency symbols
  const shareText = `💰 My Bill Split Results\n\n${selectedItems
    .map(
      (item) =>
        `${item.name}: ${formatAmount(item.yourShare)} (split ${
          item.people
        } ways)`
    )
    .join("\n")}\n\n🧾 My Total: ${formatAmount(
    userTotal
  )}\n\nSplit with Cash Splitter 📱`;

  try {
    if (navigator.share) {
      await navigator.share({
        title: "My Bill Split Results",
        text: shareText,
        url: window.location.href,
      });
    } else {
      await navigator.clipboard.writeText(shareText);
      showNotification("💾 Results copied to clipboard!");
    }
  } catch (error) {
    console.error("Error sharing:", error);
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

// Helper function to normalize data - keep prices exactly as they are
function normalizeReceiptItem(item) {
  return {
    name: item.name,
    price: item.price, // Keep exactly as provided - no conversion!
    quantity: item.quantity || 1,
    get total() {
      return this.price * this.quantity;
    },
  };
}

// URL parsing - keep prices exactly as they come
function parseURLParameters() {
  const urlParams = new URLSearchParams(window.location.search);
  const itemsParam = urlParams.get("items");

  if (itemsParam) {
    try {
      const parsedItems = JSON.parse(decodeURIComponent(itemsParam));

      // Keep prices exactly as they come from URL - NO CONVERSION
      return parsedItems.map((item) => ({
        name: item.name,
        price: item.price, // 230 stays 230, not 2.30
        quantity: item.quantity || 1,
        get total() {
          return this.price * this.quantity;
        },
      }));
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
