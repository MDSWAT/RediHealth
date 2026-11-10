/**
 * Pure-TypeScript deterministic ISO/IEC 18004 QR Code SVG encoder.
 * Zero external dependencies, zero network calls, crisp vector output for A4 clinical print seals.
 * Supports UTF-8 Byte mode (0100) across Versions 1–10 at Error Correction Level M (15% recovery).
 */

type VersionSpec = {
  version: number;
  totalCodewords: number;
  ecCodewordsPerBlock: number;
  numBlocksGroup1: number;
  dataCodewordsGroup1: number;
  numBlocksGroup2: number;
  dataCodewordsGroup2: number;
  alignmentCenters: number[];
};

const VERSION_SPECS_M: VersionSpec[] = [
  {
    version: 1,
    totalCodewords: 26,
    ecCodewordsPerBlock: 10,
    numBlocksGroup1: 1,
    dataCodewordsGroup1: 16,
    numBlocksGroup2: 0,
    dataCodewordsGroup2: 0,
    alignmentCenters: [],
  },
  {
    version: 2,
    totalCodewords: 44,
    ecCodewordsPerBlock: 16,
    numBlocksGroup1: 1,
    dataCodewordsGroup1: 28,
    numBlocksGroup2: 0,
    dataCodewordsGroup2: 0,
    alignmentCenters: [6, 18],
  },
  {
    version: 3,
    totalCodewords: 70,
    ecCodewordsPerBlock: 26,
    numBlocksGroup1: 1,
    dataCodewordsGroup1: 44,
    numBlocksGroup2: 0,
    dataCodewordsGroup2: 0,
    alignmentCenters: [6, 22],
  },
  {
    version: 4,
    totalCodewords: 100,
    ecCodewordsPerBlock: 18,
    numBlocksGroup1: 2,
    dataCodewordsGroup1: 32,
    numBlocksGroup2: 0,
    dataCodewordsGroup2: 0,
    alignmentCenters: [6, 26],
  },
  {
    version: 5,
    totalCodewords: 134,
    ecCodewordsPerBlock: 24,
    numBlocksGroup1: 2,
    dataCodewordsGroup1: 43,
    numBlocksGroup2: 0,
    dataCodewordsGroup2: 0,
    alignmentCenters: [6, 30],
  },
  {
    version: 6,
    totalCodewords: 172,
    ecCodewordsPerBlock: 16,
    numBlocksGroup1: 4,
    dataCodewordsGroup1: 27,
    numBlocksGroup2: 0,
    dataCodewordsGroup2: 0,
    alignmentCenters: [6, 34],
  },
  {
    version: 7,
    totalCodewords: 196,
    ecCodewordsPerBlock: 18,
    numBlocksGroup1: 4,
    dataCodewordsGroup1: 31,
    numBlocksGroup2: 0,
    dataCodewordsGroup2: 0,
    alignmentCenters: [6, 22, 38],
  },
  {
    version: 8,
    totalCodewords: 242,
    ecCodewordsPerBlock: 22,
    numBlocksGroup1: 2,
    dataCodewordsGroup1: 38,
    numBlocksGroup2: 2,
    dataCodewordsGroup2: 39,
    alignmentCenters: [6, 24, 42],
  },
  {
    version: 9,
    totalCodewords: 292,
    ecCodewordsPerBlock: 22,
    numBlocksGroup1: 3,
    dataCodewordsGroup1: 36,
    numBlocksGroup2: 2,
    dataCodewordsGroup2: 37,
    alignmentCenters: [6, 26, 46],
  },
  {
    version: 10,
    totalCodewords: 346,
    ecCodewordsPerBlock: 26,
    numBlocksGroup1: 4,
    dataCodewordsGroup1: 43,
    numBlocksGroup2: 1,
    dataCodewordsGroup2: 44,
    alignmentCenters: [6, 28, 50],
  },
];

function gfMultiply(x: number, y: number): number {
  let result = 0;
  for (let i = 7; i >= 0; i -= 1) {
    result = (result << 1) ^ ((result >>> 7) * 0x11d);
    result ^= ((y >>> i) & 1) * x;
  }
  return result;
}

function buildReedSolomonDivisor(degree: number): Uint8Array {
  const result = new Uint8Array(degree);
  result[degree - 1] = 1;
  let root = 1;
  for (let i = 0; i < degree; i += 1) {
    for (let j = 0; j < degree; j += 1) {
      result[j] = gfMultiply(result[j], root);
      if (j + 1 < degree) {
        result[j] ^= result[j + 1];
      }
    }
    root = gfMultiply(root, 0x02);
  }
  return result;
}

function computeReedSolomonRemainder(data: Uint8Array, divisor: Uint8Array): Uint8Array {
  const result = new Uint8Array(divisor.length);
  for (let i = 0; i < data.length; i += 1) {
    const factor = data[i] ^ result[0];
    result.copyWithin(0, 1);
    result[result.length - 1] = 0;
    for (let j = 0; j < divisor.length; j += 1) {
      result[j] ^= gfMultiply(divisor[j], factor);
    }
  }
  return result;
}

function appendBits(val: number, len: number, out: number[]): void {
  for (let i = len - 1; i >= 0; i -= 1) {
    out.push((val >>> i) & 1);
  }
}

function getBit(val: number, index: number): boolean {
  return ((val >>> index) & 1) !== 0;
}

function selectSpec(utf8Length: number): VersionSpec {
  for (const spec of VERSION_SPECS_M) {
    const countBits = spec.version <= 9 ? 8 : 16;
    const dataCodewords =
      spec.numBlocksGroup1 * spec.dataCodewordsGroup1 +
      spec.numBlocksGroup2 * spec.dataCodewordsGroup2;
    const capacityBits = dataCodewords * 8;
    const neededBits = 4 + countBits + utf8Length * 8;
    if (neededBits <= capacityBits) {
      return spec;
    }
  }
  return VERSION_SPECS_M[VERSION_SPECS_M.length - 1];
}

function encodeCodewords(payload: Uint8Array, spec: VersionSpec): Uint8Array {
  const countBits = spec.version <= 9 ? 8 : 16;
  const totalDataCodewords =
    spec.numBlocksGroup1 * spec.dataCodewordsGroup1 +
    spec.numBlocksGroup2 * spec.dataCodewordsGroup2;
  const capacityBits = totalDataCodewords * 8;
  const maxBytes = Math.min(payload.length, Math.floor((capacityBits - 4 - countBits) / 8));
  const bytes = payload.subarray(0, maxBytes);

  const bits: number[] = [];
  // Byte mode indicator (0100)
  appendBits(0b0100, 4, bits);
  appendBits(bytes.length, countBits, bits);
  for (let i = 0; i < bytes.length; i += 1) {
    appendBits(bytes[i], 8, bits);
  }

  // Terminator (up to 4 zero bits)
  appendBits(0, Math.min(4, capacityBits - bits.length), bits);
  // Pad to byte boundary
  appendBits(0, (8 - (bits.length % 8)) % 8, bits);

  // Pad alternating 0xEC / 0x11 codewords
  let padToggle = 0;
  while (bits.length < capacityBits) {
    appendBits(padToggle % 2 === 0 ? 0xec : 0x11, 8, bits);
    padToggle += 1;
  }

  const dataBytes = new Uint8Array(totalDataCodewords);
  for (let i = 0; i < bits.length; i += 1) {
    dataBytes[i >>> 3] |= bits[i] << (7 - (i & 7));
  }

  const divisor = buildReedSolomonDivisor(spec.ecCodewordsPerBlock);
  const dataBlocks: Uint8Array[] = [];
  const ecBlocks: Uint8Array[] = [];
  let offset = 0;

  for (let b = 0; b < spec.numBlocksGroup1; b += 1) {
    const block = dataBytes.subarray(offset, offset + spec.dataCodewordsGroup1);
    offset += spec.dataCodewordsGroup1;
    dataBlocks.push(block);
    ecBlocks.push(computeReedSolomonRemainder(block, divisor));
  }
  for (let b = 0; b < spec.numBlocksGroup2; b += 1) {
    const block = dataBytes.subarray(offset, offset + spec.dataCodewordsGroup2);
    offset += spec.dataCodewordsGroup2;
    dataBlocks.push(block);
    ecBlocks.push(computeReedSolomonRemainder(block, divisor));
  }

  const maxDataBlockLen = Math.max(spec.dataCodewordsGroup1, spec.dataCodewordsGroup2);
  const finalCodewords = new Uint8Array(spec.totalCodewords);
  let outIdx = 0;

  for (let col = 0; col < maxDataBlockLen; col += 1) {
    for (let b = 0; b < dataBlocks.length; b += 1) {
      if (col < dataBlocks[b].length) {
        finalCodewords[outIdx] = dataBlocks[b][col];
        outIdx += 1;
      }
    }
  }
  for (let col = 0; col < spec.ecCodewordsPerBlock; col += 1) {
    for (let b = 0; b < ecBlocks.length; b += 1) {
      finalCodewords[outIdx] = ecBlocks[b][col];
      outIdx += 1;
    }
  }

  return finalCodewords;
}

function drawFunctionPatterns(
  spec: VersionSpec,
  modules: boolean[][],
  isFunction: boolean[][],
): void {
  const size = modules.length;

  const setFunc = (row: number, col: number, dark: boolean) => {
    if (row < 0 || row >= size || col < 0 || col >= size) return;
    modules[row][col] = dark;
    isFunction[row][col] = true;
  };

  // Timing patterns
  for (let i = 0; i < size; i += 1) {
    setFunc(6, i, i % 2 === 0);
    setFunc(i, 6, i % 2 === 0);
  }

  // Finder patterns + 1-module light separators
  const drawFinder = (centerRow: number, centerCol: number) => {
    for (let dy = -4; dy <= 4; dy += 1) {
      for (let dx = -4; dx <= 4; dx += 1) {
        const dist = Math.max(Math.abs(dx), Math.abs(dy));
        const r = centerRow + dy;
        const c = centerCol + dx;
        if (r >= 0 && r < size && c >= 0 && c < size) {
          setFunc(r, c, dist !== 2 && dist !== 4);
        }
      }
    }
  };
  drawFinder(3, 3);
  drawFinder(3, size - 4);
  drawFinder(size - 4, 3);

  // Alignment patterns
  const centers = spec.alignmentCenters;
  for (let i = 0; i < centers.length; i += 1) {
    for (let j = 0; j < centers.length; j += 1) {
      const isCornerFinder =
        (i === 0 && j === 0) ||
        (i === 0 && j === centers.length - 1) ||
        (i === centers.length - 1 && j === 0);
      if (isCornerFinder) continue;
      const cr = centers[i];
      const cc = centers[j];
      for (let dy = -2; dy <= 2; dy += 1) {
        for (let dx = -2; dx <= 2; dx += 1) {
          setFunc(cr + dy, cc + dx, Math.max(Math.abs(dx), Math.abs(dy)) !== 1);
        }
      }
    }
  }

  // Reserve format info slots + dark module
  drawFormatBits(0, modules, isFunction);

  // Draw version info for V7+
  if (spec.version >= 7) {
    let rem = spec.version;
    for (let i = 0; i < 12; i += 1) {
      rem = (rem << 1) ^ ((rem >>> 11) * 0x1f25);
    }
    const bits = (spec.version << 12) | rem;
    for (let i = 0; i < 18; i += 1) {
      const dark = getBit(bits, i);
      const a = size - 11 + (i % 3);
      const b = Math.floor(i / 3);
      setFunc(a, b, dark);
      setFunc(b, a, dark);
    }
  }
}

function drawFormatBits(
  mask: number,
  modules: boolean[][],
  isFunction: boolean[][],
): void {
  const size = modules.length;
  // EC Level M format indicator = 00 (0)
  const data = (0 << 3) | mask;
  let rem = data;
  for (let i = 0; i < 10; i += 1) {
    rem = (rem << 1) ^ ((rem >>> 9) * 0x537);
  }
  const bits = ((data << 10) | rem) ^ 0x5412;

  const setFunc = (row: number, col: number, dark: boolean) => {
    modules[row][col] = dark;
    isFunction[row][col] = true;
  };

  // First copy around top-left finder
  for (let i = 0; i <= 5; i += 1) setFunc(i, 8, getBit(bits, i));
  setFunc(7, 8, getBit(bits, 6));
  setFunc(8, 8, getBit(bits, 7));
  setFunc(8, 7, getBit(bits, 8));
  for (let i = 9; i < 15; i += 1) setFunc(8, 14 - i, getBit(bits, i));

  // Second copy across top-right & bottom-left
  for (let i = 0; i < 8; i += 1) setFunc(8, size - 1 - i, getBit(bits, i));
  for (let i = 8; i < 15; i += 1) setFunc(size - 15 + i, 8, getBit(bits, i));

  // Fixed dark module
  setFunc(size - 8, 8, true);
}

function placeCodewords(
  codewords: Uint8Array,
  modules: boolean[][],
  isFunction: boolean[][],
): void {
  const size = modules.length;
  let bitIdx = 0;
  let upward = true;

  for (let right = size - 1; right >= 1; right -= 2) {
    if (right === 6) right = 5;
    for (let vert = 0; vert < size; vert += 1) {
      const row = upward ? size - 1 - vert : vert;
      for (let j = 0; j < 2; j += 1) {
        const col = right - j;
        if (!isFunction[row][col]) {
          let dark = false;
          if (bitIdx < codewords.length * 8) {
            dark = getBit(codewords[bitIdx >>> 3], 7 - (bitIdx & 7));
          }
          modules[row][col] = dark;
          bitIdx += 1;
        }
      }
    }
    upward = !upward;
  }
}

function maskPredicate(mask: number, row: number, col: number): boolean {
  switch (mask) {
    case 0:
      return (row + col) % 2 === 0;
    case 1:
      return row % 2 === 0;
    case 2:
      return col % 3 === 0;
    case 3:
      return (row + col) % 3 === 0;
    case 4:
      return (Math.floor(row / 2) + Math.floor(col / 3)) % 2 === 0;
    case 5:
      return ((row * col) % 2) + ((row * col) % 3) === 0;
    case 6:
      return (((row * col) % 2) + ((row * col) % 3)) % 2 === 0;
    default:
      return (((row + col) % 2) + ((row * col) % 3)) % 2 === 0;
  }
}

function applyMask(mask: number, modules: boolean[][], isFunction: boolean[][]): void {
  const size = modules.length;
  for (let r = 0; r < size; r += 1) {
    for (let c = 0; c < size; c += 1) {
      if (!isFunction[r][c] && maskPredicate(mask, r, c)) {
        modules[r][c] = !modules[r][c];
      }
    }
  }
}

function computePenaltyScore(modules: boolean[][]): number {
  const size = modules.length;
  let penalty = 0;

  // Rule 1: runs of >= 5 identical modules in rows and columns
  const scoreLineRuns = (getCell: (idx: number) => boolean) => {
    let runColor = getCell(0);
    let runLen = 1;
    for (let i = 1; i < size; i += 1) {
      const c = getCell(i);
      if (c === runColor) {
        runLen += 1;
        if (runLen === 5) penalty += 3;
        else if (runLen > 5) penalty += 1;
      } else {
        runColor = c;
        runLen = 1;
      }
    }
  };

  for (let r = 0; r < size; r += 1) {
    scoreLineRuns((c) => modules[r][c]);
  }
  for (let c = 0; c < size; c += 1) {
    scoreLineRuns((r) => modules[r][c]);
  }

  // Rule 2: 2x2 blocks of identical color
  for (let r = 0; r < size - 1; r += 1) {
    for (let c = 0; c < size - 1; c += 1) {
      const color = modules[r][c];
      if (
        color === modules[r][c + 1] &&
        color === modules[r + 1][c] &&
        color === modules[r + 1][c + 1]
      ) {
        penalty += 3;
      }
    }
  }

  // Rule 3: finder-like 1:1:3:1:1 patterns with 4 light modules on either side
  const scoreFinderLike = (getCell: (idx: number) => boolean) => {
    let bits = 0;
    for (let i = 0; i < size; i += 1) {
      bits = ((bits << 1) & 0x7ff) | (getCell(i) ? 1 : 0);
      if (i >= 10 && (bits === 0x05d || bits === 0x5d0)) {
        penalty += 40;
      }
    }
  };
  for (let r = 0; r < size; r += 1) {
    scoreFinderLike((c) => modules[r][c]);
  }
  for (let c = 0; c < size; c += 1) {
    scoreFinderLike((r) => modules[r][c]);
  }

  // Rule 4: dark module balance
  let darkCount = 0;
  for (let r = 0; r < size; r += 1) {
    for (let c = 0; c < size; c += 1) {
      if (modules[r][c]) darkCount += 1;
    }
  }
  const total = size * size;
  const k = Math.ceil(Math.abs(darkCount * 20 - total * 10) / total) - 1;
  if (k > 0) penalty += k * 10;

  return penalty;
}

export function encodeQrMatrix(text: string): boolean[][] {
  const utf8 = new TextEncoder().encode(text || "https://redihealth.org");
  const spec = selectSpec(utf8.length);
  const size = spec.version * 4 + 17;

  const modules: boolean[][] = Array.from({ length: size }, () =>
    Array.from({ length: size }, () => false),
  );
  const isFunction: boolean[][] = Array.from({ length: size }, () =>
    Array.from({ length: size }, () => false),
  );

  drawFunctionPatterns(spec, modules, isFunction);
  const codewords = encodeCodewords(utf8, spec);
  placeCodewords(codewords, modules, isFunction);

  let bestMask = 0;
  let bestScore = Number.POSITIVE_INFINITY;

  for (let mask = 0; mask < 8; mask += 1) {
    applyMask(mask, modules, isFunction);
    drawFormatBits(mask, modules, isFunction);
    const score = computePenaltyScore(modules);
    if (score < bestScore) {
      bestScore = score;
      bestMask = mask;
    }
    applyMask(mask, modules, isFunction);
  }

  applyMask(bestMask, modules, isFunction);
  drawFormatBits(bestMask, modules, isFunction);

  return modules;
}

export function encodeQrSvg(
  text: string,
  quietZone = 3,
): { viewBoxSize: number; moduleCount: number; pathD: string } {
  const matrix = encodeQrMatrix(text);
  const moduleCount = matrix.length;
  const viewBoxSize = moduleCount + quietZone * 2;
  const segments: string[] = [];

  for (let r = 0; r < moduleCount; r += 1) {
    let c = 0;
    while (c < moduleCount) {
      if (!matrix[r][c]) {
        c += 1;
        continue;
      }
      let run = 1;
      while (c + run < moduleCount && matrix[r][c + run]) {
        run += 1;
      }
      const x = c + quietZone;
      const y = r + quietZone;
      segments.push(`M${x} ${y}h${run}v1h-${run}z`);
      c += run;
    }
  }

  return {
    viewBoxSize,
    moduleCount,
    pathD: segments.join(""),
  };
}
