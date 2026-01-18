import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const websiteDir = path.join(__dirname, '..', 'website');

// SVG content for favicon (simpler version that sharp can handle)
const faviconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect width="32" height="32" rx="6" fill="#0C0C0E"/>
  <text x="4" y="22" font-family="monospace" font-size="14" font-weight="bold" fill="#FF5722">&gt;_</text>
</svg>`;

const iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="96" fill="#0C0C0E"/>
  <text x="70" y="345" font-family="monospace" font-size="224" font-weight="bold" fill="#FF5722">&gt;_</text>
</svg>`;

async function generateIcons() {
  console.log('Generating icons...\n');

  try {
    // Generate favicon.ico (32x32 PNG, then we'll note it needs to be .ico)
    console.log('Creating favicon (32x32)...');
    await sharp(Buffer.from(faviconSvg))
      .resize(32, 32)
      .png()
      .toFile(path.join(websiteDir, 'favicon-32.png'));
    console.log('✓ favicon-32.png created');

    // Generate favicon-16.png
    console.log('Creating favicon (16x16)...');
    await sharp(Buffer.from(faviconSvg))
      .resize(16, 16)
      .png()
      .toFile(path.join(websiteDir, 'favicon-16.png'));
    console.log('✓ favicon-16.png created');

    // Generate apple-touch-icon (180x180)
    console.log('Creating apple-touch-icon (180x180)...');
    await sharp(Buffer.from(iconSvg))
      .resize(180, 180)
      .png()
      .toFile(path.join(websiteDir, 'apple-touch-icon.png'));
    console.log('✓ apple-touch-icon.png created');

    // Generate icon-192.png
    console.log('Creating icon-192 (192x192)...');
    await sharp(Buffer.from(iconSvg))
      .resize(192, 192)
      .png()
      .toFile(path.join(websiteDir, 'icon-192.png'));
    console.log('✓ icon-192.png created');

    // Generate icon-512.png
    console.log('Creating icon-512 (512x512)...');
    await sharp(Buffer.from(iconSvg))
      .resize(512, 512)
      .png()
      .toFile(path.join(websiteDir, 'icon-512.png'));
    console.log('✓ icon-512.png created');

    console.log('\n✅ All PNG icons generated successfully!');
    console.log('\nNow generating favicon.ico...');

    // Generate ICO file (multi-size)
    await generateIco();

  } catch (error) {
    console.error('Error generating icons:', error);
    process.exit(1);
  }
}

async function generateIco() {
  // ICO file format header
  const sizes = [16, 32];
  const images = [];

  for (const size of sizes) {
    const pngPath = path.join(websiteDir, `favicon-${size}.png`);
    const pngBuffer = fs.readFileSync(pngPath);
    images.push({ size, buffer: pngBuffer });
  }

  // ICO file structure
  const iconDir = Buffer.alloc(6 + images.length * 16);
  
  // ICONDIR header
  iconDir.writeUInt16LE(0, 0);      // Reserved
  iconDir.writeUInt16LE(1, 2);      // Type: 1 for ICO
  iconDir.writeUInt16LE(images.length, 4); // Number of images

  let dataOffset = 6 + images.length * 16;
  const imageBuffers = [];

  images.forEach((img, index) => {
    const offset = 6 + index * 16;
    
    // ICONDIRENTRY
    iconDir.writeUInt8(img.size === 256 ? 0 : img.size, offset);     // Width
    iconDir.writeUInt8(img.size === 256 ? 0 : img.size, offset + 1); // Height
    iconDir.writeUInt8(0, offset + 2);                                // Color palette
    iconDir.writeUInt8(0, offset + 3);                                // Reserved
    iconDir.writeUInt16LE(1, offset + 4);                             // Color planes
    iconDir.writeUInt16LE(32, offset + 6);                            // Bits per pixel
    iconDir.writeUInt32LE(img.buffer.length, offset + 8);            // Size of image data
    iconDir.writeUInt32LE(dataOffset, offset + 12);                  // Offset to image data

    dataOffset += img.buffer.length;
    imageBuffers.push(img.buffer);
  });

  const icoBuffer = Buffer.concat([iconDir, ...imageBuffers]);
  fs.writeFileSync(path.join(websiteDir, 'favicon.ico'), icoBuffer);
  
  console.log('✓ favicon.ico created');

  // Clean up temporary files
  fs.unlinkSync(path.join(websiteDir, 'favicon-16.png'));
  fs.unlinkSync(path.join(websiteDir, 'favicon-32.png'));
  console.log('✓ Cleaned up temporary files');

  console.log('\n🎉 All icons generated successfully!');
  console.log('\nGenerated files:');
  console.log('  - favicon.ico (16x16, 32x32)');
  console.log('  - apple-touch-icon.png (180x180)');
  console.log('  - icon-192.png (192x192)');
  console.log('  - icon-512.png (512x512)');
}

generateIcons();
