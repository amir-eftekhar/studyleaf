const fs = require('fs');
const path = require('path');

// Source path in node_modules
const workerPath = path.resolve(__dirname, '../node_modules/pdfjs-dist/build/pdf.worker.min.js');

// Destination path in public directory
const destPath = path.resolve(__dirname, '../public/pdf.worker.min.js');

// Create public directory if it doesn't exist
const publicDir = path.dirname(destPath);
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Copy the worker file
fs.copyFileSync(workerPath, destPath);
console.log('PDF.js worker file copied to public directory');
