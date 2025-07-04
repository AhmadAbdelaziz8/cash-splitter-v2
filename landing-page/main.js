// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();

    document.querySelector(this.getAttribute("href")).scrollIntoView({
      behavior: "smooth",
    });
  });
});

// Scroll animations
const animatedElements = document.querySelectorAll(".animate-on-scroll");

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.1,
  }
);

animatedElements.forEach((element) => {
  observer.observe(element);
});

// Download button tracking
const downloadButton = document.getElementById("download-button");

if (downloadButton) {
  downloadButton.addEventListener("click", () => {
    console.log(
      "Download button clicked! Sending event to Google Analytics..."
    );

    // Send an event to Google Analytics
    if (typeof gtag === "function") {
      gtag("event", "download_click", {
        event_category: "Landing Page Actions",
        event_label: "Hero Download Button",
      });
    }
  });
}
