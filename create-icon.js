const fs = require('fs');
const path = require('path');
const { createCanvas } = require('canvas');

// Create assets directory if it doesn't exist
const assetsDir = path.join(__dirname, 'assets');
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

// Create template icon for macOS (transparent background with black content)
function createTemplateIcon() {
  const size = 22; // Menu bar icon size (standard for macOS)
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  
  // Clear canvas
  ctx.clearRect(0, 0, size, size);
  
  // Draw a flame icon (template mode - black only)
  ctx.fillStyle = '#000000';
  
  // Draw flame shape
  ctx.beginPath();
  // Base of flame
  ctx.moveTo(7, size - 5);
  // Left side
  ctx.quadraticCurveTo(5, size - 9, 8, size - 12);
  ctx.quadraticCurveTo(4, size - 15, 7, size - 17);
  // Top of flame
  ctx.quadraticCurveTo(10, size - 22, 14, size - 15);
  // Right side
  ctx.quadraticCurveTo(18, size - 10, 14, size - 6);
  ctx.quadraticCurveTo(17, size - 12, 13, size - 14);
  // Bottom right
  ctx.quadraticCurveTo(11, size - 11, 13, size - 7);
  ctx.quadraticCurveTo(12, size - 5, 7, size - 5);
  ctx.fill();
  
  // Save the template icon
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(path.join(assetsDir, 'icon-template.png'), buffer);
  console.log('Template icon created at: ' + path.join(assetsDir, 'icon-template.png'));
}

// Create standard icon (white flame on dark background)
function createStandardIcon() {
  const size = 22; // Icon size
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  
  // Dark background
  ctx.fillStyle = '#222222';
  ctx.beginPath();
  ctx.arc(size/2, size/2, size/2 - 1, 0, Math.PI * 2);
  ctx.fill();
  
  // Draw a flame icon (white)
  ctx.fillStyle = '#FF5722'; // Orange flame color
  
  // Draw flame shape
  ctx.beginPath();
  // Base of flame
  ctx.moveTo(7, size - 5);
  // Left side
  ctx.quadraticCurveTo(5, size - 9, 8, size - 12);
  ctx.quadraticCurveTo(4, size - 15, 7, size - 17);
  // Top of flame
  ctx.quadraticCurveTo(10, size - 22, 14, size - 15);
  // Right side
  ctx.quadraticCurveTo(18, size - 10, 14, size - 6);
  ctx.quadraticCurveTo(17, size - 12, 13, size - 14);
  // Bottom right
  ctx.quadraticCurveTo(11, size - 11, 13, size - 7);
  ctx.quadraticCurveTo(12, size - 5, 7, size - 5);
  ctx.fill();
  
  // Save the standard icon
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(path.join(assetsDir, 'icon-standard.png'), buffer);
  console.log('Standard icon created at: ' + path.join(assetsDir, 'icon-standard.png'));
}

// Create app icon (larger size for dock and application icon)
function createAppIcon() {
  const size = 512; // App icon size
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  
  // Background - dark with gradient
  const gradient = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2);
  gradient.addColorStop(0, '#333333');
  gradient.addColorStop(1, '#111111');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  
  // Draw a flame icon
  ctx.fillStyle = '#FF5722'; // Orange flame color
  
  // Calculate flame shape for larger size
  const scale = size / 22;
  
  // Draw flame shape (scaled up)
  ctx.beginPath();
  // Base of flame
  ctx.moveTo(7 * scale, size - 5 * scale);
  // Left side
  ctx.quadraticCurveTo(5 * scale, size - 9 * scale, 8 * scale, size - 12 * scale);
  ctx.quadraticCurveTo(4 * scale, size - 15 * scale, 7 * scale, size - 17 * scale);
  // Top of flame
  ctx.quadraticCurveTo(10 * scale, size - 22 * scale, 14 * scale, size - 15 * scale);
  // Right side
  ctx.quadraticCurveTo(18 * scale, size - 10 * scale, 14 * scale, size - 6 * scale);
  ctx.quadraticCurveTo(17 * scale, size - 12 * scale, 13 * scale, size - 14 * scale);
  // Bottom right
  ctx.quadraticCurveTo(11 * scale, size - 11 * scale, 13 * scale, size - 7 * scale);
  ctx.quadraticCurveTo(12 * scale, size - 5 * scale, 7 * scale, size - 5 * scale);
  ctx.fill();
  
  // Add light glow effect
  ctx.shadowColor = '#FF7043';
  ctx.shadowBlur = 30;
  ctx.fill();
  
  // Save the app icon
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(path.join(assetsDir, 'icon.png'), buffer);
  console.log('App icon created at: ' + path.join(assetsDir, 'icon.png'));
  
  // Also create icns file for macOS (requires additional package)
  console.log('Note: For a proper macOS .icns file, you may need to use a conversion tool or service');
}

// Run the icon creation
createTemplateIcon();
createStandardIcon();
createAppIcon();

console.log('All icons created successfully!');
