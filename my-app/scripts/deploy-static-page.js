const fs = require("fs");
const path = require("path");

// Paths
const staticSrcDir = path.join(__dirname, "..", "static");
const deployDir = path.join(__dirname, "..", "web-build", "static");

// Create deploy directory if it doesn't exist
if (!fs.existsSync(deployDir)) {
  fs.mkdirSync(deployDir, { recursive: true });
}

// Copy static files to deploy directory
console.log("Copying static files to web-build/static...");
fs.readdirSync(staticSrcDir).forEach((file) => {
  const srcFile = path.join(staticSrcDir, file);
  const destFile = path.join(deployDir, file);

  if (fs.lstatSync(srcFile).isFile()) {
    fs.copyFileSync(srcFile, destFile);
    console.log(`Copied ${file} to ${destFile}`);
  }
});

console.log("Static files deployment complete!");
console.log("To host these files:");
console.log(
  "1. Upload the contents of the web-build directory to a static hosting service"
);
console.log(
  "2. Update the shareable link URL in the app to point to your hosted page"
);
