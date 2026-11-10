/**
 * Pure-TypeScript deterministic ISO/IEC 18004 QR Code matrix encoder (Byte mode, ECC Level L).
 * Zero external dependencies and zero network requests — works 100% offline inside the
 * "For the doctor" clinical handoff sheet with crisp SVG `<path shapeRendering="crispEdges">`.
 */

interface VersionSpec {
  /** Total codewords (data + EC) */
  totalCw: number;
  /** Error-correction codewords per block */
  ecPerBlock: number;
  /** Group 1 block count & data codewords per block */
  g1Blocks: number;
  g1DataCw: number;
  /** Group 2 block count & data codewords per block */
  g2Blocks: number;
  g2DataCw: number;
  /** Alignment pattern center coordinates */
  align: readonly number[];
}

/** ISO/IEC 18004 Table 9 — ECC Level L specs for Versions 1..15 (up to 520 UTF-8 bytes). */
const VERSION_SPECS_L: readonly VersionSpec[] = [
  { totalCw: 26, ecPerBlock: 7, g1Blocks: 1, g1DataCw: 19, g2Blocks: 0, g2DataCw: 0, align: [] },
  { totalCw: 44, ecPerBlock: 10, g1Blocks: 1, g1DataCw: 34, g2Blocks: 0, g2DataCw: 0, align: [6, 18] },
  { totalCw: 70, ecPerBlock: 15, g1Blocks: 1, g1DataCw: 55, g2Blocks: 0, g2DataCw: 0, align: [6, 22] },
  { totalCw: 100, ecPerBlock: 20, g1Blocks: 1, g1DataCw: 80, g2Blocks: 0, g2DataCw: 0, align: [6, 26] },
  { totalCw: 134, ecPerBlock: 26, g1Blocks: 1, g1DataCw: 108, g2Blocks: 0, g2DataCw: 0, align: [6, 30] },
  { totalCw: 172, ecPerBlock: 18, g1Blocks: 2, g1DataCw: 68, g2Blocks: 0, g2DataCw: 0, align: [6, 34] },
  { totalCw: 196, ecPerBlock: 20, g1Blocks: 2, g1DataCw: 78, g2Blocks: 0, g2DataCw: 0, align: [6, 22, 38] },
  { totalCw: 242, ecPerBlock: 24, g1Blocks: 2, g1DataCw: 97, g2Blocks: 0, g2DataCw: 0, align: [6, 24, 42] },
  { totalCw: 292, ecPerBlock: 30, g1Blocks: 2, g1DataCw: 116, g2Blocks: 0, g2DataCw: 0, align: [6, 26, 46] },
  { totalCw: 346, ecPerBlock: 18, g1Blocks: 2, g1DataCw: 68, g2Blocks: 2, g2DataCw: 69, align: [6, 28, 50] },
  { totalCw: 404, ecPerBlock: 20, g1Blocks: 4, g1DataCw: 81, g2Blocks: 0, g2DataCw: 0, align: [6, 30, 54] },
  { totalCw: 466, ecPerBlock: 24, g1Blocks: 2, g1DataCw: 92, g2Blocks: 2, g2DataCw: 93, align: [6, 32, 58] },
  { totalCw: 532, ecPerBlock: 26, g1Blocks: 4, g1DataCw: 107, g2Blocks: 0, g2DataCw: 0, align: [6, 34, 62] },
  { totalCw: 581, ecPerBlock: 30, g1Blocks: 3, g1DataCw: 115, g2Blocks: 1, g2DataCw: 116, align: [6, 26, 46, 66] },
  { totalCw: 655, ecPerBlock: 22, g1Blocks: 5, g1DataCw: 87, g2Blocks: 1, g2DataCw: 88, align: [6, 26, 48, 70] },
];

const GF_EXP = new Uint8Array(512);
const GF_LOG = new Uint8Array(256);

(function initGaloisField() {
  let x = 1;
  for (let i = 0; i < 255; i += 1) {
    GF_EXP[i] = x;
    GF_LOG[x] = i;
    x <<= 1;
    if (x & 0x100) x ^= 0x11d;
  }
  for (let i = 255; i < 512; i += 1) {
    GF_EXP[i] = GF_EXP[i - 255];
  }
})();

function gfMul(a: number, b: number): number {
  if (a === 0 || b === 0) return 0;
  return GF_EXP[GF_LOG[a] + GF_LOG[b]];
}

function rsGeneratorPoly(degree: number): Uint8Array {
  let poly = new Uint8Array([1]);
  for (let i = 0; i < degree; i += 1) {
    const next = new Uint8Array(poly.length + 1);
    const root = GF_EXP[i];
    for (let j = 0; j < poly.length; j += 1) {
      next[j] ^= poly[j];
      next[j + 1] ^= gfMul(poly[j], root);
    }
    poly = next;
  }
  return poly;
}

function rsRemainder(data: Uint8Array, ecLen: number): Uint8Array {
  const gen = rsGeneratorPoly(ecLen);
  const rem = new Uint8Array(ecLen);
  for (let i = 0; i < data.length; i += 1) {
    const factor = data[i] ^ rem[0];
    rem.copyWithin(0, 1);
    rem[ecLen - 1] = 0;
    if (factor !== 0) {
      for (let j = 0; j < ecLen; j += 1) {
        rem[j] ^= gfMul(gen[j + 1], factor);
      }
    }
  }
  return rem;
}

function toSafeUtf8Bytes(text: string, maxBytes: number): Uint8Array {
  const encoder = new TextEncoder();
  const full = encoder.encode(text);
  if (full.length <= maxBytes) return full;
  // Truncate cleanly on a UTF-8 codepoint boundary and append ellipsis
  let cut = maxBytes - 3;
  while (cut > 0 && (full[cut] & 0xc0) === 0x80) cut -= 1;
  const out = new Uint8Array(cut + 3);
  out.set(full.subarray(0, cut), 0);
  out.set([0xe2, 0x80, 0xa6], cut); // "…"
  return out;
}

function pushBits(buf: number[], val: number, len: number) {
  for (let i = len - 1; i >= 0; i -= 1) {
    buf.push((val >>> i) & 1);
  }
}

function formatBitsLevelL(mask: number): number {
  // ECC Level L = 01
  const data = (0b01 << 3) | mask;
  let rem = data;
  for (let i = 0; i < 10; i += 1) {
    rem = (rem << 1) ^ ((rem >>> 9) * 0x537);
  }
  return ((data << 10) | rem) ^ 0x5412;
}

function versionBits(version: number): number {
  let rem = version;
  for (let i = 0; i < 12; i += 1) {
    rem = (rem << 1) ^ ((rem >>> 11) * 0x1f25);
  }
  return (version << 12) | rem;
}

export function encodeQrMatrix(text: string): boolean[][] {
  // Max payload in Version 15 Level L (5*87 + 88 = 523 data cw, minus 3 header bytes = 520 bytes)
  const payload = toSafeUtf8Bytes(text || "RediHealth", 520);

  let version = 1;
  let spec = VERSION_SPECS_L[0];
  for (let v = 1; v <= VERSION_SPECS_L.length; v += 1) {
    const candidate = VERSION_SPECS_L[v - 1];
    const dataCap = candidate.g1Blocks * candidate.g1DataCw + candidate.g2Blocks * candidate.g2DataCw;
    const headerBits = 4 + (v <= 9 ? 8 : 16);
    if (payload.length * 8 + headerBits <= dataCap * 8) {
      version = v;
      spec = candidate;
      break;
    }
  }

  const totalDataCw = spec.g1Blocks * spec.g1DataCw + spec.g2Blocks * spec.g2DataCw;
  const bits: number[] = [];
  // Byte mode indicator = 0100
  pushBits(bits, 0b0100, 4);
  pushBits(bits, payload.length, version <= 9 ? 8 : 16);
  for (let i = 0; i < payload.length; i += 1) {
    pushBits(bits, payload[i], 8);
  }
  // Terminator (up to 4 zero bits)
  const capacityBits = totalDataCw * 8;
  pushBits(bits, 0, Math.min(4, capacityBits - bits.length));
  while (bits.length % 8 !== 0) bits.push(0);

  const dataBytes = new Uint8Array(totalDataCw);
  for (let i = 0; i < bits.length / 8; i += 1) {
    let b = 0;
    for (let j = 0; j < 8; j += 1) b = (b << 1) | bits[i * 8 + j];
    dataBytes[i] = b;
  }
  for (let i = bits.length / 8, padIdx = 0; i < totalDataCw; i += 1, padIdx += 1) {
    dataBytes[i] = padIdx % 2 === 0 ? 0xec : 0x11;
  }

  // Split into RS blocks and interleave
  const dataBlocks: Uint8Array[] = [];
  const ecBlocks: Uint8Array[] = [];
  let offset = 0;
  const totalBlocks = spec.g1Blocks + spec.g2Blocks;
  for (let b = 0; b < totalBlocks; b += 1) {
    const blockLen = b < spec.g1Blocks ? spec.g1DataCw : spec.g2DataCw;
    const slice = dataBytes.subarray(offset, offset + blockLen);
    offset += blockLen;
    dataBlocks.push(slice);
    ecBlocks.push(rsRemainder(slice, spec.ecPerBlock));
  }

  const finalCodewords: number[] = [];
  const maxDataLen = Math.max(spec.g1DataCw, spec.g2DataCw);
  for (let i = 0; i < maxDataLen; i += 1) {
    for (let b = 0; b < totalBlocks; b += 1) {
      if (i < dataBlocks[b].length) finalCodewords.push(dataBlocks[b][i]);
    }
  }
  for (let i = 0; i < spec.ecPerBlock; i += 1) {
    for (let b = 0; b < totalBlocks; b += 1) {
      finalCodewords.push(ecBlocks[b][i]);
    }
  }

  const size = 17 + version * 4;
  const modules: boolean[][] = Array.from({ length: size }, () => Array<boolean>(size).fill(false));
  const isFunc: boolean[][] = Array.from({ length: size }, () => Array<boolean>(size).fill(false));

  function setFunctionModule(x: number, y: number, dark: boolean) {
    if (x < 0 || y < 0 || x >= size || y >= size) return;
    modules[y][x] = dark;
    isFunc[y][x] = true;
  }

  function drawFinder(cx: number, cy: number) {
    for (let dy = -4; dy <= 4; dy += 1) {
      for (let dx = -4; dx <= 4; dx += 1) {
        const dist = Math.max(Math.abs(dx), Math.abs(dy));
        setFunctionModule(cx + dx, cy + dy, dist !== 2 && dist !== 4);
      }
    }
  }

  function drawAlignment(cx: number, cy: number) {
    for (let dy = -2; dy <= 2; dy += 1) {
      for (let dx = -2; dx <= 2; dx += 1) {
        setFunctionModule(cx + dx, cy + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1);
      }
    }
  }

  // Timing patterns
  for (let i = 0; i < size; i += 1) {
    setFunctionModule(6, i, i % 2 === 0);
    setFunctionModule(i, 6, i % 2 === 0);
  }

  // Finder patterns
  drawFinder(3, 3);
  drawFinder(size - 4, 3);
  drawFinder(3, size - 4);

  // Alignment patterns
  const align = spec.align;
  for (let i = 0; i < align.length; i += 1) {
    for (let j = 0; j < align.length; j += 1) {
      const isFinderCorner =
        (i === 0 && j === 0) ||
        (i === 0 && j === align.length - 1) ||
        (i === align.length - 1 && j === 0);
      if (!isFinderCorner) drawAlignment(align[i], align[j]);
    }
  }

  // Reserve format info modules + dark module
  for (let i = 0; i <= 8; i += 1) {
    if (i !== 6) {
      setFunctionModule(8, i, false);
      setFunctionModule(i, 8, false);
    }
  }
  for (let i = 0; i < 8; i += 1) {
    setFunctionModule(size - 1 - i, 8, false);
    setFunctionModule(8, size - 1 - i, false);
  }
  setFunctionModule(8, size - 8, true);

  // Version info for v >= 7
  if (version >= 7) {
    const vBits = versionBits(version);
    for (let i = 0; i < 18; i += 1) {
      const bit = ((vBits >>> i) & 1) !== 0;
      const a = size - 11 + (i % 3);
      const b = Math.floor(i / 3);
      setFunctionModule(a, b, bit);
      setFunctionModule(b, a, bit);
    }
  }

  // Zig-zag codeword placement
  let bitIdx = 0;
  const totalBits = finalCodewords.length * 8;
  for (let right = size - 1; right >= 1; right -= 2) {
    if (right === 6) right = 5;
    for (let vert = 0; vert < size; vert += 1) {
      for (let j = 0; j < 2; j += 1) {
        const x = right - j;
        const upward = ((right + 1) & 2) === 0;
        const y = upward ? size - 1 - vert : vert;
        if (!isFunc[y][x] && bitIdx < totalBits) {
          const cw = finalCodewords[bitIdx >>> 3];
          const dark = ((cw >>> (7 - (bitIdx & 7))) & 1) !== 0;
          modules[y][x] = dark;
          bitIdx += 1;
        }
      }
    }
  }

  function applyFormatBits(target: boolean[][], mask: number) {
    const fBits = formatBitsLevelL(mask);
    for (let i = 0; i <= 5; i += 1) target[i][8] = ((fBits >>> i) & 1) !== 0;
    target[7][8] = ((fBits >>> 6) & 1) !== 0;
    target[8][8] = ((fBits >>> 7) & 1) !== 0;
    target[8][7] = ((fBits >>> 8) & 1) !== 0;
    for (let i = 9; i < 15; i += 1) target[8][14 - i] = ((fBits >>> i) & 1) !== 0;

    for (let i = 0; i < 8; i += 1) target[8][size - 1 - i] = ((fBits >>> i) & 1) !== 0;
    for (let i = 8; i < 15; i += 1) target[size - 15 + i][8] = ((fBits >>> i) & 1) !== 0;
    target[size - 8][8] = true;
  }

  function maskTest(mask: number, x: number, y: number): boolean {
    switch (mask) {
      case 0:
        return (x + y) % 2 === 0;
      case 1:
        return y % 2 === 0;
      case 2:
        return x % 3 === 0;
      case 3:
        return (x + y) % 3 === 0;
      case 4:
        return (Math.floor(y / 2) + Math.floor(x / 3)) % 2 === 0;
      case 5:
        return ((x * y) % 2) + ((x * y) % 3) === 0;
      case 6:
        return (((x * y) % 2) + ((x * y) % 3)) % 2 === 0;
      default:
        return (((x + y) % 2) + ((x * y) % 3)) % 2 === 0;
    }
  }

  function penaltyScore(grid: boolean[][]): number {
    let score = 0;
    // Run-length horizontal & vertical
    for (let y = 0; y < size; y += 1) {
      let runH = 1;
      let runV = 1;
      for (let x = 1; x < size; x += 1) {
        if (grid[y][x] === grid[y][x - 1]) {
          runH += 1;
          if (runH === 5) score += 3;
          else if (runH > 5) score += 1;
        } else runH = 1;

        if (grid[x][y] === grid[x - 1][y]) {
          runV += 1;
          if (runV === 5) score += 3;
          else if (runV > 5) score += 1;
        } else runV = 1;
      }
    }
    // 2x2 blocks
    for (let y = 0; y < size - 1; y += 1) {
      for (let x = 0; x < size - 1; x += 1) {
        const c = grid[y][x];
        if (c === grid[y][x + 1] && c === grid[y + 1][x] && c === grid[y + 1][x + 1]) {
          score += 3;
        }
      }
    }
    return score;
  }

  let bestGrid = modules;
  let bestPenalty = Infinity;
  for (let mask = 0; mask < 8; mask += 1) {
    const candidate = modules.map((row, y) =>
      row.map((val, x) => (!isFunc[y][x] && maskTest(mask, x, y) ? !val : val)),
    );
    applyFormatBits(candidate, mask);
    const p = penaltyScore(candidate);
    if (p < bestPenalty) {
      bestPenalty = p;
      bestGrid = candidate;
    }
  }

  return bestGrid;
}

/**
 * Converts a QR boolean matrix into a compact horizontal-run-merged SVG `<path>` string
 * suitable for `<svg viewBox="0 0 {size} {size}" shapeRendering="crispEdges">`.
 */
export function renderClinicalQrSvgData(
  text: string,
  quietZone = 2,
): { size: number; path: string } {
  const matrix = encodeQrMatrix(text);
  const n = matrix.length;
  const totalSize = n + quietZone * 2;
  const segments: string[] = [];

  for (let y = 0; y < n; y += 1) {
    const row = matrix[y];
    let x = 0;
    while (x < n) {
      if (!row[x]) {
        x += 1;
        continue;
      }
      let run = 1;
      while (x + run < n && row[x + run]) run += 1;
      segments.push(`M${x + quietZone} ${y + quietZone}h${run}v1h-${run}z`);
      x += run;
    }
  }

  return {
    size: totalSize,
    path: segments.join(""),
  };
}
