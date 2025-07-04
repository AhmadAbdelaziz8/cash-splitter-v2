const CONFIG = {
  DEFAULT_PEOPLE_COUNT: 1,
  MIN_PEOPLE_COUNT: 1,
  PRECISION: 2,
  NOTIFICATION_DURATION: 2000,
  COLORS: {
    SELECTED: "#059669",
    UNSELECTED: "#6b7280",
    TEXT_DARK: "#065f46",
  },
};

let receiptData = [];
let receiptTax = null; // Always percentage string like "14%"
let receiptServiceCharge = null; // Always fixed number for equal distribution
let numberOfPeopleForFixedService = CONFIG.DEFAULT_PEOPLE_COUNT;

const peopleInputContainer = document.getElementById("people-input-container");
const numberOfPeopleInput = document.getElementById("number-of-people");
const overallSummaryDiv = document.getElementById("overall-summary");
const userTotalDiv = document.getElementById("user-total");
const receiptItemsContainer = document.getElementById(
  "receipt-items-container"
);

function formatAmount(amount) {
  if (typeof amount !== "number" || isNaN(amount)) {
    return (0).toFixed(CONFIG.PRECISION);
  }
  return amount.toFixed(CONFIG.PRECISION);
}

// Helper function to determine if a number is approximately a percentage of a subtotal
function isApproximatelyPercentage(
  amount,
  subtotal,
  percentage,
  tolerance = 0.01
) {
  if (subtotal === 0) return false;
  const expectedAmount = (subtotal * percentage) / 100;
  const difference = Math.abs(amount - expectedAmount);
  const relativeError = difference / expectedAmount;
  return relativeError <= tolerance;
}

// Helper function to ensure tax is always a percentage string (only if tax exists)
function normalizeTax(taxValue, subtotal) {
  if (taxValue === null || taxValue === undefined) {
    return null; // No tax
  }

  if (typeof taxValue === "string" && taxValue.includes("%")) {
    return taxValue; // Already a percentage
  }

  if (typeof taxValue === "number" && subtotal > 0) {
    // Convert number to percentage by calculating percentage from subtotal
    const percentage = (taxValue / subtotal) * 100;
    return `${percentage.toFixed(1)}%`;
  }

  return null; // No valid tax
}

function createReceiptTile(item, index) {
  const tile = document.createElement("div");
  tile.className = "receipt-container";
  tile.dataset.index = index;
  tile.dataset.itemId = item.id;

  const checkboxContainer = document.createElement("div");
  checkboxContainer.className = "receipt-checkbox";
  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.id = `item-${index}`;
  checkbox.dataset.unitPrice = item.price;
  checkbox.dataset.quantity = item.quantity;
  checkbox.addEventListener("change", calculateUserTotal);
  checkbox.addEventListener("click", (event) => event.stopPropagation());
  checkboxContainer.appendChild(checkbox);

  const header = document.createElement("div");
  header.className = "receipt-header";
  header.textContent = `${item.name} (Qty: ${item.quantity})`;

  const priceDisplay = document.createElement("div");
  priceDisplay.className = "receipt-price";
  priceDisplay.textContent = formatAmount(item.price * item.quantity);

  const peopleContainer = document.createElement("div");
  peopleContainer.className = "receipt-people";

  const minusBtn = document.createElement("button");
  minusBtn.type = "button";
  minusBtn.className = "people-btn minus-btn";
  minusBtn.textContent = "-";
  minusBtn.dataset.index = index;
  minusBtn.addEventListener("click", (event) => {
    event.stopPropagation();
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
    event.stopPropagation();
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

  tile.addEventListener("click", function () {
    const chk = this.querySelector('.receipt-checkbox input[type="checkbox"]');
    if (chk) {
      chk.checked = !chk.checked;
      calculateUserTotal();
    }
  });

  return tile;
}

function displayReceiptItems(items) {
  if (!receiptItemsContainer) {
    return;
  }
  receiptItemsContainer.innerHTML = "";

  if (!items || items.length === 0) {
    receiptItemsContainer.innerHTML =
      '<p class="no-items-message">No items to display. Share a receipt from the app!</p>';
    return;
  }

  items.forEach((item, index) => {
    const tile = createReceiptTile(item, index);
    receiptItemsContainer.appendChild(tile);
  });
}

function calculateUserTotal() {
  let currentUserSubtotal = 0;
  let currentUserTotalTax = 0;
  let currentUserTotalFixedServicePortion = 0;

  receiptData.forEach((itemData, index) => {
    const checkbox = document.getElementById(`item-${index}`);
    const peopleCountForItemDisplay = document.getElementById(
      `people-count-${index}`
    );
    const shareElement = document.getElementById(`share-${index}`);

    if (checkbox && peopleCountForItemDisplay && shareElement) {
      const unitPrice = parseFloat(checkbox.dataset.unitPrice);
      const quantity = parseInt(checkbox.dataset.quantity, 10);
      const itemTotalPrice = unitPrice * quantity;

      if (isNaN(unitPrice) || isNaN(quantity)) {
        shareElement.textContent = "Error";
        return;
      }

      const peopleSharingThisItem =
        parseInt(peopleCountForItemDisplay.textContent || "1") || 1;
      const pricePerSharerForItem = itemTotalPrice / peopleSharingThisItem;

      let itemTax = 0;

      // Calculate tax - always percentage applied to this person's items
      if (
        receiptTax !== null &&
        typeof receiptTax === "string" &&
        receiptTax.includes("%")
      ) {
        const taxPercentage = parseFloat(receiptTax) / 100;
        if (!isNaN(taxPercentage)) {
          itemTax = pricePerSharerForItem * taxPercentage;
        }
      }

      const userShareForItemDisplay = pricePerSharerForItem + itemTax;

      if (checkbox.checked) {
        shareElement.textContent = formatAmount(userShareForItemDisplay);
        shareElement.style.color = CONFIG.COLORS.SELECTED;
        shareElement.style.fontWeight = "bold";

        currentUserSubtotal += pricePerSharerForItem;
        currentUserTotalTax += itemTax;
      } else {
        shareElement.textContent = formatAmount(0);
        shareElement.style.color = CONFIG.COLORS.UNSELECTED;
        shareElement.style.fontWeight = "normal";
      }
    }
  });

  // Service charge is always fixed amount divided equally
  if (
    receiptServiceCharge &&
    typeof receiptServiceCharge === "number" &&
    numberOfPeopleForFixedService > 0 &&
    currentUserSubtotal > 0
  ) {
    currentUserTotalFixedServicePortion =
      receiptServiceCharge / numberOfPeopleForFixedService;
  }

  const finalUserTotal =
    currentUserSubtotal +
    currentUserTotalTax +
    currentUserTotalFixedServicePortion;

  updateTotalDisplay(
    finalUserTotal,
    currentUserSubtotal,
    currentUserTotalTax,
    currentUserTotalFixedServicePortion
  );
}

function updateTotalDisplay(total, subtotal, tax, fixedServicePortion) {
  if (userTotalDiv) {
    let breakdownHtml = `<p class="summary-item">Subtotal: <span class="amount">${formatAmount(
      subtotal
    )}</span></p>`;
    if (tax > 0) {
      breakdownHtml += `<p class="summary-item">Tax: <span class="amount">${formatAmount(
        tax
      )}</span></p>`;
    }
    if (fixedServicePortion > 0) {
      breakdownHtml += `<p class="summary-item">Service (Fixed Portion): <span class="amount">${formatAmount(
        fixedServicePortion
      )}</span></p>`;
    }

    userTotalDiv.innerHTML = `
      <h3 class="summary-title">💰 Your Share</h3>
      <div class="summary-total">${formatAmount(total)}</div>

    `;
  }
}

function updateOverallSummary() {
  if (!overallSummaryDiv) {
    return;
  }

  const overallSubtotal = receiptData.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );
  let overallTaxAmount = 0;
  let overallServiceAmount = 0;
  let serviceDisplayText = "Service:";
  let taxDisplayText = "Tax:";

  // Calculate tax amount - always percentage
  if (
    receiptTax !== null &&
    typeof receiptTax === "string" &&
    receiptTax.includes("%")
  ) {
    const taxPercentage = parseFloat(receiptTax) / 100;
    if (!isNaN(taxPercentage)) {
      overallTaxAmount = overallSubtotal * taxPercentage;
      taxDisplayText = `Tax (${receiptTax}):`;
    }
  }

  // Calculate service amount - always fixed amount
  if (receiptServiceCharge && typeof receiptServiceCharge === "number") {
    overallServiceAmount = receiptServiceCharge;
    serviceDisplayText = `Service (Fixed Amount):`;
  }

  const overallGrandTotal =
    overallSubtotal + overallTaxAmount + overallServiceAmount;

  overallSummaryDiv.innerHTML = `
    <h3 class="summary-title">🧾 Full Receipt Summary</h3>
    <div class="summary-item-container">
        <p class="summary-item">Items Subtotal: <span class="amount">${formatAmount(
          overallSubtotal
        )}</span></p>
        <p class="summary-item">${taxDisplayText} <span class="amount">${formatAmount(
    overallTaxAmount
  )}</span></p>
        <p class="summary-item">${serviceDisplayText} <span class="amount">${formatAmount(
    overallServiceAmount
  )}</span></p>
        <hr class="summary-divider">
        <p class="summary-item total-grand">Grand Total: <span class="amount total-grand">${formatAmount(
          overallGrandTotal
        )}</span></p>
    </div>
  `;
}

function parseURLParameters() {
  let itemsFromUrl = [];
  let taxFromUrl = null;
  let serviceFromUrl = null;

  const hash = window.location.hash;
  if (hash && hash.startsWith("#data=")) {
    const encodedData = hash.substring(6);
    try {
      const decodedData = decodeURIComponent(encodedData);
      const parsedDataObject = JSON.parse(decodedData);

      if (parsedDataObject && typeof parsedDataObject === "object") {
        if (Array.isArray(parsedDataObject.items)) {
          itemsFromUrl = parsedDataObject.items.map((item) => ({
            name: item.name || "Unnamed Item",
            price: parseFloat(item.price) || 0,
            quantity: parseInt(item.quantity, 10) || 1,
            id: item.id || `item-${Math.random().toString(36).substr(2, 9)}`,
          }));
        }
        if (parsedDataObject.tax !== undefined) {
          taxFromUrl = parsedDataObject.tax;
        }
        if (parsedDataObject.service !== undefined) {
          serviceFromUrl = parsedDataObject.service;
        }
      }
    } catch (error) {
      console.error("Error parsing data from URL hash:", error);
    }
  }

  if (itemsFromUrl.length === 0) {
    const params = new URLSearchParams(window.location.search);
    const itemsParam = params.get("items");
    const taxParam = params.get("tax");
    const serviceParam = params.get("service");

    if (itemsParam) {
      try {
        const parsedItemsQuery = JSON.parse(decodeURIComponent(itemsParam));
        if (Array.isArray(parsedItemsQuery)) {
          itemsFromUrl = parsedItemsQuery.map((item) => ({
            name: item.name || "Unnamed Item",
            price: parseFloat(item.price) || 0,
            quantity: parseInt(item.quantity, 10) || 1,
            id: item.id || `item-${Math.random().toString(36).substr(2, 9)}`,
          }));
        }
      } catch (error) {
        console.error("Error parsing items from URL query parameters:", error);
      }
    }
    if (taxFromUrl === null && taxParam !== null) {
      if (taxParam.includes("%")) {
        taxFromUrl = taxParam; // Keep as percentage string
      } else {
        const numericTax = parseFloat(taxParam);
        if (!isNaN(numericTax)) {
          taxFromUrl = numericTax;
        } else {
          taxFromUrl = null;
        }
      }
    }
    if (serviceFromUrl === null && serviceParam !== null) {
      const fixedServiceQuery = parseFloat(serviceParam);
      if (serviceParam.includes("%")) {
        serviceFromUrl = serviceParam;
      } else if (!isNaN(fixedServiceQuery)) {
        serviceFromUrl = fixedServiceQuery;
      } else {
        serviceFromUrl = null;
      }
    }
  }

  receiptData = itemsFromUrl;

  const currentOverallSubtotal = receiptData.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  // Handle tax - normalize to percentage when appropriate
  // Handle tax - only if actually found (no defaults)
  if (taxFromUrl !== null) {
    if (typeof taxFromUrl === "string" && taxFromUrl.includes("%")) {
      // Tax is already a percentage string like "14%"
      receiptTax = taxFromUrl;
    } else if (!isNaN(parseFloat(taxFromUrl))) {
      // Tax is a numeric value - convert to percentage based on subtotal
      const numericTax = parseFloat(taxFromUrl);
      receiptTax = normalizeTax(numericTax, currentOverallSubtotal);
    } else {
      receiptTax = null;
    }
  } else {
    // No tax provided - don't default to anything
    receiptTax = null;
  }

  // Handle service - always treat as fixed amount (convert percentage to dollar amount if needed)
  if (serviceFromUrl !== null) {
    let fixedService;
    if (typeof serviceFromUrl === "string" && serviceFromUrl.includes("%")) {
      // Convert percentage to fixed amount based on subtotal
      const percentage = parseFloat(serviceFromUrl.replace("%", "")) / 100;
      if (!isNaN(percentage)) {
        fixedService = currentOverallSubtotal * percentage;
      } else {
        fixedService = 0;
      }
    } else {
      fixedService = parseFloat(serviceFromUrl.toString());
    }

    if (!isNaN(fixedService) && fixedService >= 0) {
      receiptServiceCharge = fixedService;
      if (peopleInputContainer && fixedService > 0)
        peopleInputContainer.style.display = "block";
      else if (peopleInputContainer)
        peopleInputContainer.style.display = "none";
    } else {
      receiptServiceCharge = null;
      if (peopleInputContainer) peopleInputContainer.style.display = "none";
    }
  } else {
    receiptServiceCharge = null;
    if (peopleInputContainer) peopleInputContainer.style.display = "none";
  }

  displayReceiptItems(receiptData);
  calculateUserTotal();
  updateOverallSummary();
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
  }
}

function showNotification(message) {
  const notification = document.createElement("div");
  notification.className = "notification show";
  notification.textContent = message;
  document.body.appendChild(notification);
  setTimeout(() => {
    notification.classList.remove("show");
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  }, CONFIG.NOTIFICATION_DURATION);
}

document.addEventListener("DOMContentLoaded", () => {
  parseURLParameters();
  addQuickActionListeners();
  if (numberOfPeopleInput) {
    numberOfPeopleInput.addEventListener("input", () => {
      const count = parseInt(numberOfPeopleInput.value, 10);
      if (!isNaN(count) && count >= CONFIG.MIN_PEOPLE_COUNT) {
        numberOfPeopleForFixedService = count;
        calculateUserTotal();
        updateOverallSummary();
      } else if (numberOfPeopleInput.value === "") {
        numberOfPeopleForFixedService = CONFIG.MIN_PEOPLE_COUNT;
        calculateUserTotal();
        updateOverallSummary();
      }
    });
  }
});
