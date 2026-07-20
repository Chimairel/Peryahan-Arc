const fs = require('fs');
const path = require('path');

// Basic 1x1 gold pixel PNG buffer converted for 192x192 placeholder
const createMinimalPng = (width, height) => {
  // Simple PNG header + data
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <rect width="100%" height="100%" fill="#090d16" rx="36"/>
    <circle cx="${width/2}" cy="${height/2}" r="${width*0.35}" fill="#f59e0b"/>
    <text x="${width/2}" y="${height/2 + width*0.12}" font-family="sans-serif" font-size="${width*0.35}" font-weight="bold" fill="#000000" text-anchor="middle">🎟️</text>
  </svg>`;
  return svg;
};

fs.writeFileSync(path.join(__dirname, '../public/icon.svg'), createMinimalPng(512, 512));
console.log('Icon SVG created successfully');
