#!/usr/bin/env node
/**
 * Reproducible build pipeline for RediHealth's lazy-loaded Human Atlas skeletal bundle:
 *   - public/models/human-atlas-skeleton.bin
 *   - public/models/human-atlas-skeleton.json
 *
 * Source dataset:
 *   BodyParts3D 4.0 (© DBCLS, CC BY 4.0) via https://github.com/ashemag/human-atlas
 *   Pinned to upstream commit 1c38bf35c254a891200d3cedecfd57abebe83d8d for byte-stable builds.
 *
 * Coordinate space:
 *   Native BodyParts3D 4.0 meter / Y-up space — identical to public/models/human-atlas-layers.bin
 *   (skin_shell bounds: X [-0.334, 0.333], Y [0, 1.7194], Z [-0.145, 0.147], -X = Right, +Z = Front).
 *
 * Usage:
 *   node scripts/build-human-atlas-skeleton.mjs [--cache-dir <dir>]
 */

import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
import { fileURLToPath } from "node:url";
import { MeshoptSimplifier } from "meshoptimizer";

const UPSTREAM_COMMIT = "1c38bf35c254a891200d3cedecfd57abebe83d8d";
const UPSTREAM_BASE = `https://raw.githubusercontent.com/ashemag/human-atlas/${UPSTREAM_COMMIT}/public/models`;
const REQUIRED_CHUNKS = [0, 11, 12, 13];

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "..");
const OUTPUT_DIR = path.join(REPO_ROOT, "public/models");

function parseArgs(argv) {
  let cacheDir = process.env.ATLAS_CACHE_DIR || path.join(REPO_ROOT, ".cache/human-atlas");
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === "--cache-dir" && argv[i + 1]) {
      cacheDir = path.resolve(argv[i + 1]);
      i += 1;
    }
  }
  return { cacheDir };
}

async function fetchOrReadCached(cacheDir, fileName) {
  fs.mkdirSync(cacheDir, { recursive: true });
  const localPath = path.join(cacheDir, fileName);
  if (fs.existsSync(localPath)) {
    return fs.readFileSync(localPath);
  }
  const url = `${UPSTREAM_BASE}/${fileName}`;
  console.log(`Fetching ${url} ...`);
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}: HTTP ${res.status} ${res.statusText}`);
  }
  const buf = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(localPath, buf);
  return buf;
}

/**
 * Group definitions matching RediHealth's SubRegionId contract with AnatomicalViewport3D.
 * Order determines output order in human-atlas-skeleton.json.
 */
const GROUP_SPECS = [
  { id: "skull_cranium", subRegion: "skull", showInHybrid: false },
  { id: "mandible", subRegion: "jaw_ear", showInHybrid: false },
  { id: "cervical_spine", subRegion: "cervical_spine", showInHybrid: true },
  { id: "thoracic_spine", subRegion: "thoracic_spine", showInHybrid: true },
  { id: "lumbar_spine", subRegion: "lumbar_spine", showInHybrid: true },
  { id: "sacrum_coccyx", subRegion: "sacroiliac_coccyx", showInHybrid: true },
  { id: "rib_cage", subRegion: "rib_cage", showInHybrid: false },
  { id: "clavicle_scapula", subRegion: "rotator_cuff", showInHybrid: false },
  { id: "pelvis", subRegion: "hip_groin", showInHybrid: false },
  { id: "humerus", subRegion: "biceps", showInHybrid: false },
  { id: "radius_ulna", subRegion: "forearm_extensor", showInHybrid: false },
  { id: "wrist_carpals", subRegion: "wrist_tendon", showInHybrid: false },
  { id: "hand_bones", subRegion: "hands_fingers", showInHybrid: false },
  { id: "femur", subRegion: "quadriceps", showInHybrid: false },
  { id: "patella", subRegion: "patellar_tendon", showInHybrid: false },
  { id: "tibia_fibula", subRegion: "calves", showInHybrid: false },
  { id: "foot_bones", subRegion: "feet_soles", showInHybrid: false },
];

/**
 * Classifies each real BodyParts3D skeletal mesh into one of the 17 anatomical groups
 * and assigns a tailored simplification target (targetTris, maxRelativeError) so hero
 * silhouettes stay museum-crisp while total payload stays <= 1.0 MB raw and <= 420 KB gzipped.
 */
function classifyBone(part) {
  const m = part.id.match(/^FJ(\d+)$/);
  if (!m) return null;
  const num = Number(m[1]);
  const inMainRange = num >= 3152 && num <= 3395;
  const inTeethRange = num >= 1254 && num <= 1281;
  if (!inMainRange && !inTeethRange) return null;

  const n = part.name.toLowerCase();

  // Exclude soft gum tissue and floating anterior hyoid bone
  if (n.includes("gingiva") || n.includes("hyoid")) return null;

  // Mandible + lower dental arch
  if (n.includes("mandible")) {
    return { group: "mandible", targetTris: 1050, maxError: 0.022 };
  }
  if (n.includes("tooth") && n.includes("lower")) {
    return { group: "mandible", targetTris: 36, maxError: 0.1 };
  }

  // Cranium + facial bones + upper dental arch
  if (n.includes("frontal bone")) return { group: "skull_cranium", targetTris: 1080, maxError: 0.02 };
  if (n.includes("parietal")) return { group: "skull_cranium", targetTris: 780, maxError: 0.02 };
  if (n.includes("occipital")) return { group: "skull_cranium", targetTris: 880, maxError: 0.02 };
  if (n.includes("temporal bone")) return { group: "skull_cranium", targetTris: 480, maxError: 0.03 };
  if (n.includes("maxilla")) return { group: "skull_cranium", targetTris: 620, maxError: 0.03 };
  if (n.includes("zygomatic")) return { group: "skull_cranium", targetTris: 240, maxError: 0.03 };
  if (n.includes("sphenoid")) return { group: "skull_cranium", targetTris: 420, maxError: 0.05 };
  if (n.includes("nasal bone")) return { group: "skull_cranium", targetTris: 96, maxError: 0.05 };
  if (n.includes("lacrimal")) return { group: "skull_cranium", targetTris: 80, maxError: 0.06 };
  if (n.includes("ethmoid")) return { group: "skull_cranium", targetTris: 160, maxError: 0.08 };
  if (n.includes("palatine") || n.includes("vomer") || n.includes("inferior nasal concha")) {
    return { group: "skull_cranium", targetTris: 80, maxError: 0.08 };
  }
  if (n.includes("tooth") && n.includes("upper")) {
    return { group: "skull_cranium", targetTris: 36, maxError: 0.1 };
  }

  // Intervertebral discs (check BEFORE vertebra rules because disc names end with "... vertebra")
  if (
    n.includes("disk of axis") ||
    (n.includes("cervical") && n.includes("disk"))
  ) {
    return { group: "cervical_spine", targetTris: 64, maxError: 0.08 };
  }
  if ((n.includes("thoracic") && n.includes("disk")) || n === "intervertebral disk") {
    return { group: "thoracic_spine", targetTris: 68, maxError: 0.08 };
  }
  if (n.includes("lumbar") && n.includes("disk")) {
    return { group: "lumbar_spine", targetTris: 84, maxError: 0.08 };
  }

  // Cervical spine (C1–C7)
  if (n === "atlas" || n === "axis" || n.includes("cervical vertebra")) {
    return { group: "cervical_spine", targetTris: 280, maxError: 0.05 };
  }

  // Thoracic spine (T1–T12)
  if (n.includes("thoracic vertebra")) {
    return { group: "thoracic_spine", targetTris: 310, maxError: 0.05 };
  }

  // Lumbar spine (L1–L5)
  if (n.includes("lumbar vertebra")) {
    return { group: "lumbar_spine", targetTris: 390, maxError: 0.05 };
  }

  // Sacrum & coccyx
  if (n.includes("sacrum") || n.includes("coccyx")) {
    return { group: "sacrum_coccyx", targetTris: 960, maxError: 0.035 };
  }

  // Rib cage (manubrium, sternum body, xiphoid, 24 ribs, 14 costal cartilages)
  if (n.includes("manubrium")) return { group: "rib_cage", targetTris: 380, maxError: 0.03 };
  if (n.includes("body of sternum")) return { group: "rib_cage", targetTris: 460, maxError: 0.03 };
  if (n.includes("xiphoid")) return { group: "rib_cage", targetTris: 100, maxError: 0.05 };
  if (n.includes("costal cartilage")) return { group: "rib_cage", targetTris: 112, maxError: 0.055 };
  if (n.includes("rib")) {
    const isShort = n.includes("first") || n.includes("eleventh") || n.includes("twelfth");
    return { group: "rib_cage", targetTris: isShort ? 210 : 300, maxError: 0.04 };
  }

  // Shoulder girdle (clavicles + scapulae)
  if (n.includes("clavicle")) return { group: "clavicle_scapula", targetTris: 340, maxError: 0.028 };
  if (n.includes("scapula")) return { group: "clavicle_scapula", targetTris: 980, maxError: 0.03 };

  // Pelvis & major long bones — already lean & crisp in upstream BodyParts3D, keep 100% fidelity!
  if (n.includes("hip bone")) return { group: "pelvis", targetTris: Infinity, maxError: 0 };
  if (n.includes("humerus")) return { group: "humerus", targetTris: Infinity, maxError: 0 };
  if (n.includes("radius") || n.includes("ulna")) return { group: "radius_ulna", targetTris: Infinity, maxError: 0 };
  if (n.includes("femur")) return { group: "femur", targetTris: Infinity, maxError: 0 };
  if (n.includes("patella")) return { group: "patella", targetTris: Infinity, maxError: 0 };
  if (n.includes("tibia") || n.includes("fibula")) return { group: "tibia_fibula", targetTris: Infinity, maxError: 0 };

  // Wrist carpals (16 bilateral carpal bones)
  if (
    n.includes("scaphoid") ||
    n.includes("lunate") ||
    n.includes("triquetral") ||
    n.includes("pisiform") ||
    n.includes("trapezium") ||
    n.includes("trapezoid") ||
    n.includes("capitate") ||
    n.includes("hamate")
  ) {
    return { group: "wrist_carpals", targetTris: 56, maxError: 0.08 };
  }

  // Hand bones (metacarpals + phalanges)
  if (n.includes("metacarpal")) return { group: "hand_bones", targetTris: 88, maxError: 0.06 };
  if (n.includes("finger") || n.includes("thumb")) {
    return { group: "hand_bones", targetTris: 52, maxError: 0.08 };
  }

  // Foot bones (tarsals + metatarsals + phalanges + sesamoids)
  if (n.includes("calcaneus") || n.includes("talus")) {
    return { group: "foot_bones", targetTris: 196, maxError: 0.045 };
  }
  if (n.includes("navicular") || n.includes("cuboid") || n.includes("cuneiform")) {
    return { group: "foot_bones", targetTris: 76, maxError: 0.07 };
  }
  if (n.includes("metatarsal")) return { group: "foot_bones", targetTris: 80, maxError: 0.065 };
  if (n.includes("toe")) return { group: "foot_bones", targetTris: 40, maxError: 0.09 };
  if (n.includes("sesamoid bone of")) return { group: "foot_bones", targetTris: 20, maxError: 0.1 };

  throw new Error(`Unclassified skeletal part: ${part.id} (${part.name})`);
}

/**
 * Welds coincident vertex positions (0.01 mm tolerance) within a single bone mesh,
 * drops degenerate triangles, and verifies outward-facing closed volume winding.
 */
function weldBoneMesh(rawPos, rawIdx) {
  const vCount = rawPos.length / 3;
  const map = new Map();
  const remap = new Uint32Array(vCount);
  const wp = [];

  for (let i = 0; i < vCount; i += 1) {
    const x = rawPos[i * 3];
    const y = rawPos[i * 3 + 1];
    const z = rawPos[i * 3 + 2];
    const key = `${Math.round(x * 1e5)},${Math.round(y * 1e5)},${Math.round(z * 1e5)}`;
    let idx = map.get(key);
    if (idx === undefined) {
      idx = wp.length / 3;
      map.set(key, idx);
      wp.push(x, y, z);
    }
    remap[i] = idx;
  }

  const outIdx = [];
  let signedVol = 0;
  for (let i = 0; i < rawIdx.length; i += 3) {
    const a = remap[rawIdx[i]];
    const b = remap[rawIdx[i + 1]];
    const c = remap[rawIdx[i + 2]];
    if (a === b || b === c || c === a) continue;
    outIdx.push(a, b, c);
    const ax = wp[a * 3], ay = wp[a * 3 + 1], az = wp[a * 3 + 2];
    const bx = wp[b * 3], by = wp[b * 3 + 1], bz = wp[b * 3 + 2];
    const cx = wp[c * 3], cy = wp[c * 3 + 1], cz = wp[c * 3 + 2];
    signedVol += (ax * (by * cz - bz * cy) + ay * (bz * cx - bx * cz) + az * (bx * cy - by * cx)) / 6;
  }

  // Guarantee outward winding
  if (signedVol < 0) {
    for (let i = 0; i < outIdx.length; i += 3) {
      const tmp = outIdx[i + 1];
      outIdx[i + 1] = outIdx[i + 2];
      outIdx[i + 2] = tmp;
    }
  }

  return {
    positions: new Float32Array(wp),
    indices: new Uint32Array(outIdx),
  };
}

/**
 * Reorders triangles canonically (rotating each triangle's 3 indices so the minimum
 * vertex index comes first while preserving CCW winding) and sorts triangles by first
 * index for better GPU vertex-cache reuse and HTTP gzip/brotli index compression.
 */
function sortTrianglesForLocality(indices) {
  const triCount = indices.length / 3;
  const tris = new Array(triCount);
  for (let t = 0; t < triCount; t += 1) {
    let a = indices[t * 3];
    let b = indices[t * 3 + 1];
    let c = indices[t * 3 + 2];
    if (b < a && b <= c) {
      tris[t] = [b, c, a];
    } else if (c < a && c < b) {
      tris[t] = [c, a, b];
    } else {
      tris[t] = [a, b, c];
    }
  }
  tris.sort((u, v) => (u[0] - v[0]) || (u[1] - v[1]) || (u[2] - v[2]));
  const out = new Uint32Array(indices.length);
  for (let t = 0; t < triCount; t += 1) {
    out[t * 3] = tris[t][0];
    out[t * 3 + 1] = tris[t][1];
    out[t * 3 + 2] = tris[t][2];
  }
  return out;
}

/**
 * Computes angle-weighted smooth vertex normals stored in signed Int16 [-32767, 32767],
 * quantized to 8-bit high-byte precision (`round(n * 127) * 256`) so the standard
 * Int16/32767 decoder reads clean ~0.45° smooth normals while gzip compresses the
 * redundant low noise byte by >60%.
 */
function computeAngleWeightedInt16Normals(positions, indices) {
  const vCount = positions.length / 3;
  const acc = new Float64Array(vCount * 3);

  for (let i = 0; i < indices.length; i += 3) {
    const a = indices[i];
    const b = indices[i + 1];
    const c = indices[i + 2];

    const ax = positions[a * 3], ay = positions[a * 3 + 1], az = positions[a * 3 + 2];
    const bx = positions[b * 3], by = positions[b * 3 + 1], bz = positions[b * 3 + 2];
    const cx = positions[c * 3], cy = positions[c * 3 + 1], cz = positions[c * 3 + 2];

    const abx = bx - ax, aby = by - ay, abz = bz - az;
    const acx = cx - ax, acy = cy - ay, acz = cz - az;
    const bcx = cx - bx, bcy = cy - by, bcz = cz - bz;

    const fnx = aby * acz - abz * acy;
    const fny = abz * acx - abx * acz;
    const fnz = abx * acy - aby * acx;
    const fLen = Math.hypot(fnx, fny, fnz);
    if (fLen < 1e-12) continue;
    const nx = fnx / fLen;
    const ny = fny / fLen;
    const nz = fnz / fLen;

    const abLen = Math.hypot(abx, aby, abz) || 1;
    const acLen = Math.hypot(acx, acy, acz) || 1;
    const bcLen = Math.hypot(bcx, bcy, bcz) || 1;

    const cosA = Math.max(-1, Math.min(1, (abx * acx + aby * acy + abz * acz) / (abLen * acLen)));
    const cosB = Math.max(-1, Math.min(1, ((-abx) * bcx + (-aby) * bcy + (-abz) * bcz) / (abLen * bcLen)));
    const cosC = Math.max(-1, Math.min(1, ((-acx) * (-bcx) + (-acy) * (-bcy) + (-acz) * (-bcz)) / (acLen * bcLen)));

    const angA = Math.acos(cosA);
    const angB = Math.acos(cosB);
    const angC = Math.acos(cosC);

    acc[a * 3] += nx * angA; acc[a * 3 + 1] += ny * angA; acc[a * 3 + 2] += nz * angA;
    acc[b * 3] += nx * angB; acc[b * 3 + 1] += ny * angB; acc[b * 3 + 2] += nz * angB;
    acc[c * 3] += nx * angC; acc[c * 3 + 1] += ny * angC; acc[c * 3 + 2] += nz * angC;
  }

  const out = new Int16Array(vCount * 3);
  for (let i = 0; i < vCount; i += 1) {
    const x = acc[i * 3];
    const y = acc[i * 3 + 1];
    const z = acc[i * 3 + 2];
    const len = Math.hypot(x, y, z);
    if (len < 1e-12) {
      out[i * 3] = 0;
      out[i * 3 + 1] = 127 * 256;
      out[i * 3 + 2] = 0;
    } else {
      const qx = Math.max(-127, Math.min(127, Math.round((x / len) * 127)));
      const qy = Math.max(-127, Math.min(127, Math.round((y / len) * 127)));
      const qz = Math.max(-127, Math.min(127, Math.round((z / len) * 127)));
      // Guard against zero-vector rounding (should never happen for unit vector)
      if (qx === 0 && qy === 0 && qz === 0) {
        out[i * 3] = 0;
        out[i * 3 + 1] = 127 * 256;
        out[i * 3 + 2] = 0;
      } else {
        out[i * 3] = qx * 256;
        out[i * 3 + 1] = qy * 256;
        out[i * 3 + 2] = qz * 256;
      }
    }
  }
  return out;
}

/**
 * Snaps Float32 coordinates to a 1/4096 m (0.244 mm) binary grid.
 * Preserves full Float32Array compatibility with <= 0.122 mm max error while
 * zeroing noisy low mantissa bits for much stronger HTTP gzip/brotli compression.
 */
function quantizePositionsBinaryGrid(positions, grid = 4096) {
  const inv = 1 / grid;
  const out = new Float32Array(positions.length);
  for (let i = 0; i < positions.length; i += 1) {
    out[i] = Math.round(positions[i] * grid) * inv;
  }
  return out;
}

function processBone(part, chunkBuf, targetTris, maxError) {
  const rawPos = new Float32Array(chunkBuf.buffer, chunkBuf.byteOffset + part.positions, part.vertexCount * 3);
  const rawIdx = new Uint32Array(chunkBuf.buffer, chunkBuf.byteOffset + part.indices, part.indexCount);

  const welded = weldBoneMesh(rawPos, rawIdx);
  let indices = welded.indices;
  const positions = welded.positions;

  const currentTris = indices.length / 3;
  if (Number.isFinite(targetTris) && currentTris > targetTris) {
    const targetIndices = Math.max(24, Math.floor(targetTris) * 3);
    const [simplified] = MeshoptSimplifier.simplify(
      indices,
      positions,
      3,
      Math.min(indices.length, targetIndices),
      maxError
    );
    if (simplified.length >= 12) {
      indices = simplified;
    }
  }

  // Compact first, then sort triangles for locality and re-compact so vertices follow index traversal order
  const [remap1, count1] = MeshoptSimplifier.compactMesh(indices);
  const pos1 = new Float32Array(count1 * 3);
  for (let oldIdx = 0; oldIdx < remap1.length; oldIdx += 1) {
    const newIdx = remap1[oldIdx];
    if (newIdx === 0xffffffff) continue;
    pos1[newIdx * 3] = positions[oldIdx * 3];
    pos1[newIdx * 3 + 1] = positions[oldIdx * 3 + 1];
    pos1[newIdx * 3 + 2] = positions[oldIdx * 3 + 2];
  }

  const sortedIdx = sortTrianglesForLocality(indices);
  const [remap2, compactCount] = MeshoptSimplifier.compactMesh(sortedIdx);
  const compactPos = new Float32Array(compactCount * 3);
  for (let oldIdx = 0; oldIdx < remap2.length; oldIdx += 1) {
    const newIdx = remap2[oldIdx];
    if (newIdx === 0xffffffff) continue;
    compactPos[newIdx * 3] = pos1[oldIdx * 3];
    compactPos[newIdx * 3 + 1] = pos1[oldIdx * 3 + 1];
    compactPos[newIdx * 3 + 2] = pos1[oldIdx * 3 + 2];
  }

  // Compute smooth normals on full-precision positions before binary-grid position snap
  const normals = computeAngleWeightedInt16Normals(compactPos, sortedIdx);
  const snappedPos = quantizePositionsBinaryGrid(compactPos, 4096);

  return {
    positions: snappedPos,
    normals,
    indices: sortedIdx,
    vertexCount: compactCount,
    indexCount: sortedIdx.length,
  };
}

async function main() {
  await MeshoptSimplifier.ready;
  const { cacheDir } = parseArgs(process.argv.slice(2));

  const atlasRaw = await fetchOrReadCached(cacheDir, "atlas.json");
  const atlas = JSON.parse(atlasRaw.toString("utf8"));

  const chunks = new Map();
  for (const chunkIdx of REQUIRED_CHUNKS) {
    const gz = await fetchOrReadCached(cacheDir, `body-${chunkIdx}.bin.gz`);
    chunks.set(chunkIdx, zlib.gunzipSync(gz));
  }

  const grouped = new Map(GROUP_SPECS.map((g) => [g.id, { spec: g, meshes: [], sourceIds: [] }]));

  for (const part of atlas.parts) {
    const cls = classifyBone(part);
    if (!cls) continue;
    const chunkBuf = chunks.get(part.chunk);
    if (!chunkBuf) {
      throw new Error(`Missing required chunk ${part.chunk} for part ${part.id} (${part.name})`);
    }
    const processed = processBone(part, chunkBuf, cls.targetTris, cls.maxError);
    const entry = grouped.get(cls.group);
    entry.meshes.push(processed);
    entry.sourceIds.push(part.id);
  }

  const segments = [];
  let byteOffset = 0;

  function appendAligned(typedArray) {
    const pad = (4 - (byteOffset % 4)) % 4;
    if (pad > 0) {
      segments.push(Buffer.alloc(pad));
      byteOffset += pad;
    }
    const start = byteOffset;
    const buf = Buffer.from(typedArray.buffer, typedArray.byteOffset, typedArray.byteLength);
    segments.push(buf);
    byteOffset += buf.length;
    return start;
  }

  const manifestParts = [];
  let totalVerts = 0;
  let totalTris = 0;
  let totalSourceMeshes = 0;
  const globalMin = [Infinity, Infinity, Infinity];
  const globalMax = [-Infinity, -Infinity, -Infinity];

  for (const spec of GROUP_SPECS) {
    const { meshes, sourceIds } = grouped.get(spec.id);
    if (meshes.length === 0) {
      throw new Error(`Skeleton group "${spec.id}" resolved zero source meshes!`);
    }

    let vTotal = 0;
    let iTotal = 0;
    for (const m of meshes) {
      vTotal += m.vertexCount;
      iTotal += m.indexCount;
    }

    const useUint16 = vTotal <= 65535;
    const mergedPos = new Float32Array(vTotal * 3);
    const mergedNorm = new Int16Array(vTotal * 3);
    const mergedIdx = useUint16 ? new Uint16Array(iTotal) : new Uint32Array(iTotal);

    const min = [Infinity, Infinity, Infinity];
    const max = [-Infinity, -Infinity, -Infinity];

    let vCursor = 0;
    let iCursor = 0;
    for (const m of meshes) {
      mergedPos.set(m.positions, vCursor * 3);
      mergedNorm.set(m.normals, vCursor * 3);
      for (let k = 0; k < m.indexCount; k += 1) {
        mergedIdx[iCursor + k] = m.indices[k] + vCursor;
      }
      for (let v = 0; v < m.vertexCount; v += 1) {
        const x = m.positions[v * 3];
        const y = m.positions[v * 3 + 1];
        const z = m.positions[v * 3 + 2];
        if (x < min[0]) min[0] = x;
        if (y < min[1]) min[1] = y;
        if (z < min[2]) min[2] = z;
        if (x > max[0]) max[0] = x;
        if (y > max[1]) max[1] = y;
        if (z > max[2]) max[2] = z;
      }
      vCursor += m.vertexCount;
      iCursor += m.indexCount;
    }

    for (let a = 0; a < 3; a += 1) {
      if (min[a] < globalMin[a]) globalMin[a] = min[a];
      if (max[a] > globalMax[a]) globalMax[a] = max[a];
    }

    const posOffset = appendAligned(mergedPos);
    const normOffset = appendAligned(mergedNorm);
    const idxOffset = appendAligned(mergedIdx);

    manifestParts.push({
      id: spec.id,
      system: "skeletal",
      subRegion: spec.subRegion,
      showInHybrid: spec.showInHybrid,
      sourceMeshCount: sourceIds.length,
      vertexCount: vTotal,
      indexCount: iTotal,
      positions: posOffset,
      normals: normOffset,
      indices: idxOffset,
      indexType: useUint16 ? "uint16" : "uint32",
      bounds: [min, max],
    });

    totalVerts += vTotal;
    totalTris += iTotal / 3;
    totalSourceMeshes += sourceIds.length;
  }

  // Final 4-byte alignment
  const tailPad = (4 - (byteOffset % 4)) % 4;
  if (tailPad > 0) {
    segments.push(Buffer.alloc(tailPad));
    byteOffset += tailPad;
  }

  const binBuffer = Buffer.concat(segments);
  const manifest = {
    version: "BodyParts3D 4.0",
    source: `https://github.com/ashemag/human-atlas@${UPSTREAM_COMMIT}`,
    license: "CC BY 4.0 (BodyParts3D 4.0, DBCLS)",
    totalBytes: binBuffer.length,
    parts: manifestParts,
  };

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  const binPath = path.join(OUTPUT_DIR, "human-atlas-skeleton.bin");
  const jsonPath = path.join(OUTPUT_DIR, "human-atlas-skeleton.json");
  fs.writeFileSync(binPath, binBuffer);
  fs.writeFileSync(jsonPath, JSON.stringify(manifest, null, 2) + "\n", "utf8");

  const gzipBytes = zlib.gzipSync(binBuffer, { level: 9 }).length;
  const brotliBytes = zlib.brotliCompressSync(binBuffer, {
    params: { [zlib.constants.BROTLI_PARAM_QUALITY]: 11 },
  }).length;

  console.log("\n=== RediHealth Human Atlas Skeleton Build Summary ===");
  for (const p of manifestParts) {
    console.log(
      `${p.id.padEnd(18)} | sub:${p.subRegion.padEnd(18)} | src:${String(p.sourceMeshCount).padStart(2)} | v:${String(p.vertexCount).padStart(5)} | t:${String(p.indexCount / 3).padStart(5)} | y:[${p.bounds[0][1].toFixed(3)},${p.bounds[1][1].toFixed(3)}] x:[${p.bounds[0][0].toFixed(3)},${p.bounds[1][0].toFixed(3)}]`
    );
  }
  console.log("-----------------------------------------------------");
  console.log(`Total groups:        ${manifestParts.length}`);
  console.log(`Total source bones:  ${totalSourceMeshes}`);
  console.log(`Total vertices:      ${totalVerts.toLocaleString()}`);
  console.log(`Total triangles:     ${totalTris.toLocaleString()}`);
  console.log(`Global bounds:       X [${globalMin[0].toFixed(4)}, ${globalMax[0].toFixed(4)}], Y [${globalMin[1].toFixed(4)}, ${globalMax[1].toFixed(4)}], Z [${globalMin[2].toFixed(4)}, ${globalMax[2].toFixed(4)}]`);
  console.log(`Binary raw size:     ${binBuffer.length.toLocaleString()} bytes (${(binBuffer.length / 1024).toFixed(1)} KB / ${(binBuffer.length / 1024 / 1024).toFixed(3)} MB)`);
  console.log(`Binary gzip-9 size:  ${gzipBytes.toLocaleString()} bytes (${(gzipBytes / 1024).toFixed(1)} KB)`);
  console.log(`Binary brotli size:  ${brotliBytes.toLocaleString()} bytes (${(brotliBytes / 1024).toFixed(1)} KB)`);
  console.log(`Manifest JSON size:  ${fs.statSync(jsonPath).size.toLocaleString()} bytes`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
