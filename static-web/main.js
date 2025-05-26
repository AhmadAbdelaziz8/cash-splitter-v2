const mockReceiptData = [
  { name: "🍔 Burger", price: 10.99, quantity: 1, total: 10.99 },
  { name: "🍟 Fries", price: 3.5, quantity: 2, total: 7.0 },
  { name: "🥤 Soda", price: 2.5, quantity: 1, total: 2.5 },
  { name: "🍰 Ice Cream", price: 4.99, quantity: 1, total: 4.99 },
];

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
  price.textContent = `$${item.total.toFixed(2)}`;

  // create people count input
  const peopleContainer = document.createElement("div");
  peopleContainer.className = "receipt-people";
  const peopleInput = document.createElement("input");
  peopleInput.type = "number";
  peopleInput.min = "1";
  peopleInput.max = "10";
  peopleInput.value = "2"; // default 2 people
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
  let userTotal = 0;

  mockReceiptData.forEach((item, index) => {
    const checkbox = document.getElementById(`item-${index}`);
    const peopleInput = document.getElementById(`people-${index}`);
    const shareElement = document.getElementById(`share-${index}`);

    if (checkbox && peopleInput && shareElement) {
      const peopleCount = parseInt(peopleInput.value) || 1;
      const userShare = item.total / peopleCount;

      // Update individual share display
      if (checkbox.checked) {
        shareElement.textContent = `$${userShare.toFixed(2)}`;
        shareElement.style.color = "#059669";
        shareElement.style.fontWeight = "bold";
        userTotal += userShare;
      } else {
        shareElement.textContent = "$0.00";
        shareElement.style.color = "#6b7280";
        shareElement.style.fontWeight = "normal";
      }
    }
  });

  // Update total display
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
      $${total.toFixed(2)}
    </div>
    <p style="color: #065f46; margin: 10px 0 0 0; font-size: 14px;">
      Based on items you selected and people sharing
    </p>
  `;
}

/**
 * Add event listeners for quick action buttons
 */
function addQuickActionListeners() {
  // Select All button
  const selectAllBtn = document.getElementById("select-all-btn");
  if (selectAllBtn) {
    selectAllBtn.addEventListener("click", () => {
      mockReceiptData.forEach((_, index) => {
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
      mockReceiptData.forEach((_, index) => {
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

/**
 * Share the result (copy to clipboard or use Web Share API)
 */
async function shareResult() {
  const selectedItems = [];
  let userTotal = 0;

  mockReceiptData.forEach((item, index) => {
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
        `${item.name}: $${item.yourShare.toFixed(2)} (split ${
          item.people
        } ways)`
    )
    .join("\n")}\n\n🧾 My Total: $${userTotal.toFixed(
    2
  )}\n\nSplit with Cash Splitter 📱`;

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

// Initialize everything when page loads
window.addEventListener("DOMContentLoaded", () => {
  displayReceiptItems(mockReceiptData);
  calculateUserTotal(); // Initialize with $0.00
  addQuickActionListeners();
});
