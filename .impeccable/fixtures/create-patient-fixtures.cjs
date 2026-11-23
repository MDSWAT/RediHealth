const fs = require('node:fs/promises');
const path = require('node:path');
const sharp = require('sharp');

(async () => {
  for (const [name, width, height] of [['portrait', 600, 900], ['landscape', 1000, 600]]) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><rect width="100%" height="100%" fill="white"/><rect x="20" y="20" width="${width - 40}" height="${height - 40}" fill="none" stroke="#1d3557" stroke-width="3"/><rect x="50" y="60" width="180" height="36" fill="#1d3557"/><text x="65" y="85" font-family="Arial" font-size="18" fill="white">DEMO ONLY</text><text x="50" y="155" font-family="Arial" font-size="30" font-weight="bold" fill="#172b43">Sample document</text><text x="50" y="200" font-family="Arial" font-size="20" fill="#58697c">For interface testing only.</text><text x="50" y="240" font-family="Arial" font-size="18" fill="#58697c">This is a fictional attachment.</text>${[300,350,400,450].map(y=>`<line x1="50" y1="${y}" x2="${width-50}" y2="${y}" stroke="#dde4eb" stroke-width="2"/>`).join('')}<text x="50" y="${height-65}" font-family="Arial" font-size="18" fill="#58697c">Full image: ${width} x ${height}</text></svg>`;
    await sharp(Buffer.from(svg)).png().toFile(path.join(__dirname, `patient-${name}.png`));
  }
})();
