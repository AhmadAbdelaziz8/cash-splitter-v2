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

// Receives a number, returns a string formatted to N decimal places
function formatAmount(amount) {
  if (typeof amount !== "number" || isNaN(amount)) {
    console.warn("formatAmount received invalid amount:", amount);
    return (0).toFixed(CONFIG.PRECISION); // Default to 0.00 if invalid
  }
  return amount.toFixed(CONFIG.PRECISION);
}

// item: { name: string, price: number }
function createReceiptTile(item, index) {
  const tile = document.createElement("div");
  tile.className = "receipt-container";
  tile.dataset.index = index; // Add index to tile for easier checkbox targeting

  const checkboxContainer = document.createElement("div");
  checkboxContainer.className = "receipt-checkbox";
  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.id = `item-${index}`;
  checkbox.dataset.price = item.price;
  checkbox.addEventListener("change", calculateUserTotal);
  // Prevent tile click from also firing if checkbox is directly clicked
  checkbox.addEventListener("click", (event) => {
    event.stopPropagation();
  });
  checkboxContainer.appendChild(checkbox);

  const header = document.createElement("div");
  header.className = "receipt-header";
  header.textContent = item.name;

  const priceDisplay = document.createElement("div");
  priceDisplay.className = "receipt-price";
  priceDisplay.textContent = formatAmount(item.price);

  const peopleContainer = document.createElement("div");
  peopleContainer.className = "receipt-people";

  const minusBtn = document.createElement("button");
  minusBtn.type = "button";
  minusBtn.className = "people-btn minus-btn";
  minusBtn.textContent = "-";
  minusBtn.dataset.index = index;
  minusBtn.addEventListener("click", (event) => {
    event.stopPropagation(); // Prevent tile click
    let currentCount = parseInt(
      document.getElementById(`people-count-${index}`).textContent || "1"
    );
    if (currentCount > CONFIG.MIN_PEOPLE_COUNT) {
      currentCount--;
      document.getElementById(`people-count-${index}`).textContent =
        currentCount.toString();
      calculateUserTotal();
    }
  });

  const peopleCountDisplay = document.createElement("span");
  peopleCountDisplay.className = "people-count-display";
  peopleCountDisplay.id = `people-count-${index}`;
  peopleCountDisplay.textContent = CONFIG.DEFAULT_PEOPLE_COUNT.toString();

  const plusBtn = document.createElement("button");
  plusBtn.type = "button";
  plusBtn.className = "people-btn plus-btn";
  plusBtn.textContent = "+";
  plusBtn.dataset.index = index;
  plusBtn.addEventListener("click", (event) => {
    event.stopPropagation(); // Prevent tile click
    let currentCount = parseInt(
      document.getElementById(`people-count-${index}`).textContent || "1"
    );
    currentCount++;
    document.getElementById(`people-count-${index}`).textContent =
      currentCount.toString();
    calculateUserTotal();
  });

  peopleContainer.appendChild(minusBtn);
  peopleContainer.appendChild(peopleCountDisplay);
  peopleContainer.appendChild(plusBtn);

  const userShareDisplay = document.createElement("div");
  userShareDisplay.className = "receipt-user-share";
  userShareDisplay.id = `share-${index}`;
  userShareDisplay.textContent = "0.00";

  tile.appendChild(checkboxContainer);
  tile.appendChild(header);
  tile.appendChild(priceDisplay);
  tile.appendChild(peopleContainer);
  tile.appendChild(userShareDisplay);

  // Make the whole tile clickable to toggle the checkbox
  tile.addEventListener("click", function () {
    // 'this' refers to the tile element
    const chk = this.querySelector('.receipt-checkbox input[type="checkbox"]');
    if (chk) {
      chk.checked = !chk.checked;
      // Manually trigger the change event for the checkbox if other listeners depend on it,
      // or directly call calculateUserTotal.
      // For simplicity and since our main listener is already on 'change', let's directly call calculateUserTotal.
      calculateUserTotal();
    }
  });

  return tile;
}

function displayReceiptItems(items) {
  const sectionTitle = document.querySelector(".receipt-section h2");
  if (!sectionTitle) {
    console.error("Receipt section title not found. Cannot display items.");
    return;
  }

  let container = document.getElementById("receipt-items-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "receipt-items-container";
    container.className = "receipt-items-container";
    sectionTitle.insertAdjacentElement("afterend", container);
  } else {
    container.innerHTML = ""; // Clear existing items
  }

  if (!items || items.length === 0) {
    container.innerHTML =
      '<p class="no-items-message">No items to display. Share a receipt from the app!</p>';
    return;
  }

  items.forEach((item, index) => {
    const tile = createReceiptTile(item, index);
    container.appendChild(tile);
  });
}

function calculateUserTotal() {
  let userTotal = 0;

  // receiptData should be an array of { name: string, price: number }
  receiptData.forEach((item, index) => {
    const checkbox = document.getElementById(`item-${index}`);
    const peopleCountDisplay = document.getElementById(`people-count-${index}`);
    const shareElement = document.getElementById(`share-${index}`);

    if (checkbox && peopleCountDisplay && shareElement) {
      // item.price is the full price of this single item
      const itemFullPrice = parseFloat(checkbox.dataset.price); // Get price from dataset
      if (isNaN(itemFullPrice)) {
        console.warn(
          `Item ${index} has invalid price: ${checkbox.dataset.price}`
        );
        shareElement.textContent = "Error";
        return; // Skip this item if price is invalid
      }

      // Get peopleCount from the span's textContent
      const peopleCount = parseInt(peopleCountDisplay.textContent || "1") || 1;
      const userShareForItem = itemFullPrice / peopleCount;

      if (checkbox.checked) {
        shareElement.textContent = formatAmount(userShareForItem);
        shareElement.style.color = CONFIG.COLORS.SELECTED;
        shareElement.style.fontWeight = "bold";
        userTotal += userShareForItem;
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
  const totalDiv = document.getElementById("user-total");
  if (totalDiv) {
    totalDiv.innerHTML = `
      <h3 style="color: ${
        CONFIG.COLORS.TEXT_DARK
      }; margin: 0 0 10px 0; text-align: center;">💰 Your Total</h3>
      <div style="font-size: 28px; font-weight: bold; color: ${
        CONFIG.COLORS.SELECTED
      }; text-align: center;">
        ${formatAmount(total)}
      </div>
      <p style="color: ${
        CONFIG.COLORS.TEXT_DARK
      }; margin: 10px 0 0 0; font-size: 14px; text-align: center;">
        Select items and adjust sharers.
      </p>
    `;
  } else {
    console.error("Element with ID 'user-total' not found!"); // Changed from warn to error
  }
}

function addQuickActionListeners() {
  const selectAllBtn = document.getElementById("select-all-btn");
  if (selectAllBtn) {
    selectAllBtn.addEventListener("click", () => {
      const allItemCheckboxes = document.querySelectorAll(
        '.receipt-checkbox input[type="checkbox"]'
      );
      allItemCheckboxes.forEach((checkbox) => (checkbox.checked = true));
      calculateUserTotal();
    });
  } else {
    console.warn("Element with ID 'select-all-btn' not found!");
  }

  const clearAllBtn = document.getElementById("clear-all-btn");
  if (clearAllBtn) {
    clearAllBtn.addEventListener("click", () => {
      const allItemCheckboxes = document.querySelectorAll(
        '.receipt-checkbox input[type="checkbox"]'
      );
      allItemCheckboxes.forEach((checkbox) => (checkbox.checked = false));
      calculateUserTotal();
    });
  } else {
    console.warn("Element with ID 'clear-all-btn' not found!");
  }
  // Removed shareBtn listener
}

// Removed shareResult function

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
    animation: fadeInOut ${CONFIG.NOTIFICATION_DURATION / 1000}s ease-in-out;
  `;
  notification.textContent = message;

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
    if (notification.parentNode === document.body) {
      document.body.removeChild(notification);
    }
    if (style.parentNode === document.head) {
      document.head.removeChild(style);
    }
  }, CONFIG.NOTIFICATION_DURATION);
}

// Removed normalizeReceiptItem function as data comes pre-structured.

// URL parsing from hash
function parseURLParameters() {
  // Example: #data=[{"name":"Burger","price":10.99},{"name":"Fries","price":3.5}]
  const hash = window.location.hash;
  if (hash && hash.startsWith("#data=")) {
    const encodedData = hash.substring(6); // Remove #data=
    try {
      const decodedData = decodeURIComponent(encodedData);
      const parsedItems = JSON.parse(decodedData);
      // Ensure items have name and price, price is a number
      return parsedItems
        .map((item) => ({
          name: String(item.name || "Unnamed Item"),
          price: parseFloat(item.price || 0),
        }))
        .filter((item) => !isNaN(item.price)); // Filter out items where price became NaN
    } catch (error) {
      console.error("Error parsing URL items from hash:", error);
      showNotification("Error: Could not load items from link.");
      return []; // Return empty array on error
    }
  }
  return []; // Return empty array if no valid data hash
}

let receiptData = [];

window.addEventListener("DOMContentLoaded", () => {
  receiptData = parseURLParameters();
  displayReceiptItems(receiptData);
  calculateUserTotal();
  addQuickActionListeners();
});
