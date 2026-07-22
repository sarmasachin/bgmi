import fs from "fs";
import path from "path";
import sharp from "sharp";

const root = path.resolve(import.meta.dirname, "..");
const srcIcon = path.join(root, "app", "icon.png");
const sourceBackup = path.join(root, "scripts", "icon-square-source.png");

async function circularPng(input, output, size) {
  const resized = await sharp(input)
    .resize(size, size, { fit: "cover" })
    .ensureAlpha()
    .png()
    .toBuffer();

  const mask = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">` +
      `<circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="white"/>` +
      `</svg>`,
  );
  const maskBuf = await sharp(mask).png().toBuffer();

  await sharp(resized)
    .composite([{ input: maskBuf, blend: "dest-in" }])
    .png()
    .toFile(output);
}

/** Minimal ICO with one PNG image (Vista+ / modern browsers). */
function pngToIco(pngBuffer) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2); // ICO
  header.writeUInt16LE(1, 4); // 1 image

  const entry = Buffer.alloc(16);
  entry.writeUInt8(0, 0); // width (0 = 256 or from PNG)
  entry.writeUInt8(0, 1); // height
  entry.writeUInt8(0, 2); // color palette
  entry.writeUInt8(0, 3);
  entry.writeUInt16LE(1, 4); // planes
  entry.writeUInt16LE(32, 6); // bit count
  entry.writeUInt32LE(pngBuffer.length, 8);
  entry.writeUInt32LE(6 + 16, 12); // offset to image data

  return Buffer.concat([header, entry, pngBuffer]);
}

async function main() {
  const source = fs.existsSync(sourceBackup) ? sourceBackup : srcIcon;
  if (!fs.existsSync(sourceBackup) && fs.existsSync(srcIcon)) {
    fs.copyFileSync(srcIcon, sourceBackup);
  }

  await circularPng(source, path.join(root, "app", "icon.png"), 512);
  await circularPng(source, path.join(root, "app", "apple-icon.png"), 180);

  const fav48 = await circularPngBuffer(source, 48);
  const ico = pngToIco(fav48);
  fs.writeFileSync(path.join(root, "app", "favicon.ico"), ico);
  fs.writeFileSync(path.join(root, "public", "favicon.ico"), ico);

  console.log("Circular favicon assets written.");
}

async function circularPngBuffer(input, size) {
  const resized = await sharp(input)
    .resize(size, size, { fit: "cover" })
    .ensureAlpha()
    .png()
    .toBuffer();
  const maskBuf = await sharp(
    Buffer.from(
      `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"><circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="white"/></svg>`,
    ),
  )
    .png()
    .toBuffer();
  return sharp(resized)
    .composite([{ input: maskBuf, blend: "dest-in" }])
    .png()
    .toBuffer();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
