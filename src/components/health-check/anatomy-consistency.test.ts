import fs from "node:fs";
import path from "node:path";
import { beforeAll, describe, expect, it } from "vitest";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";
import type { SubRegionId } from "./anatomy-3d-data";
import {
  ARM_MUSCLE_NODE_NAMES,
  armSplitX,
  bakeAndTuckMuscularScene,
  buildCompartmentSkinVoxels,
  classifySkinVertexSubRegions,
  computeFloat32Normals,
  extractOuterManifold,
  morphFemaleCoordinate,
  smoothPelvicGroinContour,
  VOXEL_CELL_SIZE,
  VOXEL_NX,
  VOXEL_NY,
  VOXEL_NZ,
  VOXEL_ORIGIN_X,
  VOXEL_ORIGIN_Y,
  VOXEL_ORIGIN_Z,
  type MuscleDonorInput,
} from "./anatomy-geometry";
import { buildPainAreaDiagramSvg } from "./pain-area-diagram";

interface AtlasPart {
  id: string;
  system: string;
  vertexCount: number;
  indexCount: number;
  positions: number;
  normals: number;
  indices: number;
}

interface AtlasManifest {
  parts: AtlasPart[];
}

const NODE_SUBREGION_SAMPLE: Record<string, SubRegionId> = {
  pec_major_upper: "pectoral",
  pec_major_mid: "pectoral",
  pec_major_lower: "pectoral",
  rectus_upper: "abdominals",
  rectus_lower: "abdominals",
  obliques: "obliques",
  delt_front: "deltoid",
  delt_side: "deltoid",
  bicep_long: "biceps",
  forearm_flexors: "forearm_flexor",
  forearm_extensors: "forearm_extensor",
  rectus_femoris: "quadriceps",
  glute_max: "gluteal",
  lats: "upper_back",
  erectors: "lower_back",
  gastroc_med: "calves",
};

function countBoundaryEdges(indices: Uint32Array): number {
  const counts = new Map<string, number>();
  for (let i = 0; i < indices.length; i += 3) {
    const tri = [indices[i], indices[i + 1], indices[i + 2]];
    for (let e = 0; e < 3; e += 1) {
      const u = tri[e];
      const v = tri[(e + 1) % 3];
      const k = u < v ? `${u}_${v}` : `${v}_${u}`;
      counts.set(k, (counts.get(k) ?? 0) + 1);
    }
  }
  let boundary = 0;
  for (const c of counts.values()) {
    if (c === 1) boundary += 1;
  }
  return boundary;
}

function countInvalidNormals(normals: Float32Array): number {
  let bad = 0;
  for (let i = 0; i < normals.length; i += 3) {
    const len = Math.hypot(normals[i], normals[i + 1], normals[i + 2]);
    if (!Number.isFinite(len) || len < 0.1) bad += 1;
  }
  return bad;
}

function measureWidthSpan(
  positions: Float32Array,
  indicesMask: (x: number, y: number, z: number, idx: number) => boolean
): { count: number; minX: number; maxX: number; span: number; maxAbsX: number } {
  let minX = Infinity;
  let maxX = -Infinity;
  let maxAbsX = 0;
  let count = 0;
  const n = positions.length / 3;
  for (let i = 0; i < n; i += 1) {
    const x = positions[i * 3];
    const y = positions[i * 3 + 1];
    const z = positions[i * 3 + 2];
    if (!indicesMask(x, y, z, i)) continue;
    count += 1;
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (Math.abs(x) > maxAbsX) maxAbsX = Math.abs(x);
  }
  return { count, minX, maxX, span: count > 0 ? maxX - minX : 0, maxAbsX };
}

function maxSuperficialSignedDistance(
  queryPositions: Float32Array,
  isArmVertexFn: (x: number, y: number) => boolean,
  torsoVox: Int16Array,
  armVox: Int16Array,
  skinPositions: Float32Array,
  skinNormals: Float32Array
): number {
  const inv = 1 / VOXEL_CELL_SIZE;
  const count = queryPositions.length / 3;
  let maxSd = -Infinity;
  for (let i = 0; i < count; i += 1) {
    const x = queryPositions[i * 3];
    const y = queryPositions[i * 3 + 1];
    const z = queryPositions[i * 3 + 2];
    const ix = Math.floor((x - VOXEL_ORIGIN_X) * inv);
    const iy = Math.floor((y - VOXEL_ORIGIN_Y) * inv);
    const iz = Math.floor((z - VOXEL_ORIGIN_Z) * inv);
    if (ix < 0 || ix >= VOXEL_NX || iy < 0 || iy >= VOXEL_NY || iz < 0 || iz >= VOXEL_NZ) continue;
    const vox = isArmVertexFn(x, y) ? armVox : torsoVox;
    const si = vox[(ix * VOXEL_NY + iy) * VOXEL_NZ + iz];
    if (si < 0) continue;
    const dx = x - skinPositions[si * 3];
    const dy = y - skinPositions[si * 3 + 1];
    const dz = z - skinPositions[si * 3 + 2];
    const d = Math.hypot(dx, dy, dz);
    const sd = dx * skinNormals[si * 3] + dy * skinNormals[si * 3 + 1] + dz * skinNormals[si * 3 + 2];
    if (d < 0.016 && (sd <= 0 || sd / (d || 1) > 0.35) && sd > maxSd) {
      maxSd = sd;
    }
  }
  return maxSd;
}

describe("3D & 2D anatomical consistency across General and Female profiles", () => {
  let manifest: AtlasManifest;
  let atlasBuffer: ArrayBuffer;
  let skinRawPositions: Float32Array;
  let skinIndices: Uint32Array;
  let skinBaseVertexCount = 0;
  let generalSkinPositions: Float32Array;
  let generalSkinNormals: Float32Array;
  let generalTuckNormals: Float32Array;
  let femaleSkinPositions: Float32Array;
  let femaleSkinNormals: Float32Array;
  let femaleTuckNormals: Float32Array;
  let integumentaryCaps: Map<string, { rawCount: number; outerCount: number; badNormals: number }>;
  let muscleEntries: Array<{ nodeName: string; general: Float32Array; female: Float32Array }>;
  let muscleDonors: MuscleDonorInput[];

  beforeAll(async () => {
    const root = process.cwd();
    manifest = JSON.parse(
      fs.readFileSync(path.join(root, "public/models/human-atlas-layers.json"), "utf8")
    ) as AtlasManifest;
    const binBuf = fs.readFileSync(path.join(root, "public/models/human-atlas-layers.bin"));
    atlasBuffer = binBuf.buffer.slice(binBuf.byteOffset, binBuf.byteOffset + binBuf.byteLength);
    integumentaryCaps = new Map();

    for (const part of manifest.parts) {
      const rawPos = new Float32Array(atlasBuffer, part.positions, part.vertexCount * 3);
      const rawNorm = new Int16Array(atlasBuffer, part.normals, part.vertexCount * 3);
      const rawIdx = new Uint32Array(atlasBuffer, part.indices, part.indexCount);

      if (part.id === "skin_shell") {
        skinRawPositions = extractOuterManifold(rawPos, rawNorm, rawIdx, {
          closeSmallBoundaryLoops: false,
        }).positions;
        const outer = extractOuterManifold(rawPos, rawNorm, rawIdx, {
          closeSmallBoundaryLoops: true,
          reconstructClinicalManifold: true,
        });
        skinIndices = outer.indices;
        skinBaseVertexCount = outer.baseVertexCount;
        generalSkinPositions = smoothPelvicGroinContour(outer.positions, skinIndices, "general");
        generalSkinNormals = computeFloat32Normals(generalSkinPositions, skinIndices);
        generalTuckNormals = computeFloat32Normals(generalSkinPositions, outer.baseIndices);

        const femaleRaw = new Float32Array(outer.positions.length);
        const tmp: [number, number, number] = [0, 0, 0];
        for (let i = 0; i < outer.positions.length / 3; i += 1) {
          morphFemaleCoordinate(
            outer.positions[i * 3],
            outer.positions[i * 3 + 1],
            outer.positions[i * 3 + 2],
            tmp
          );
          femaleRaw[i * 3] = tmp[0];
          femaleRaw[i * 3 + 1] = tmp[1];
          femaleRaw[i * 3 + 2] = tmp[2];
        }
        femaleSkinPositions = smoothPelvicGroinContour(femaleRaw, skinIndices, "female");
        femaleSkinNormals = computeFloat32Normals(femaleSkinPositions, skinIndices);
        femaleTuckNormals = computeFloat32Normals(femaleSkinPositions, outer.baseIndices);
      } else if (part.system === "integumentary") {
        const outerCap = extractOuterManifold(rawPos, rawNorm, rawIdx, { closeSmallBoundaryLoops: false });
        const norm = computeFloat32Normals(outerCap.positions, outerCap.indices);
        integumentaryCaps.set(part.id, {
          rawCount: part.vertexCount,
          outerCount: outerCap.positions.length / 3,
          badNormals: countInvalidNormals(norm),
        });
      }
    }

    await MeshoptDecoder.ready;
    const glbBuf = fs.readFileSync(path.join(root, "public/models/muscular.glb"));
    const glbAb = glbBuf.buffer.slice(glbBuf.byteOffset, glbBuf.byteOffset + glbBuf.byteLength);
    const gltf = await new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).parseAsync(glbAb, "");
    const generalMuscles = gltf.scene;

    bakeAndTuckMuscularScene(
      generalMuscles,
      generalSkinPositions,
      generalTuckNormals,
      femaleSkinPositions,
      femaleTuckNormals,
      skinBaseVertexCount
    );

    muscleEntries = [];
    muscleDonors = [];
    generalMuscles.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (!mesh.isMesh) return;
      const posAttr = mesh.geometry.getAttribute("position") as THREE.BufferAttribute;
      const gen = new Float32Array(posAttr.array as Float32Array);
      const fem = new Float32Array(mesh.userData.bakedFemalePositions as Float32Array);
      const nodeName = mesh.parent?.name || mesh.name;
      muscleEntries.push({ nodeName, general: gen, female: fem });
      const subRegion = NODE_SUBREGION_SAMPLE[nodeName] ?? "abdominals";
      muscleDonors.push({ nodeName, subRegion, positions: gen });
    });
  });

  it("extracts closed watertight outer skin with zero degenerate normals across skin and caps", () => {
    expect(countBoundaryEdges(skinIndices)).toBe(0);
    expect(countInvalidNormals(generalSkinNormals)).toBe(0);
    expect(countInvalidNormals(femaleSkinNormals)).toBe(0);
    expect(integumentaryCaps.size).toBe(5);
    for (const [, info] of integumentaryCaps.entries()) {
      expect(info.outerCount).toBeGreaterThan(100);
      expect(info.outerCount).toBeLessThan(info.rawCount);
      expect(info.badNormals).toBe(0);
    }
  });

  it("removes anterior male groin protrusion on both General and Female outer skin contours", () => {
    const inspectGroin = (pos: Float32Array, maxAbsX: number, minYBound: number, minZ = 0.046) => {
      let maxZ = -Infinity;
      let minY = Infinity;
      const n = pos.length / 3;
      for (let i = 0; i < n; i += 1) {
        const x = pos[i * 3];
        const y = pos[i * 3 + 1];
        const z = pos[i * 3 + 2];
        if (Math.abs(x) < maxAbsX && y >= minYBound && y <= 0.865 && z > minZ) {
          if (z > maxZ) maxZ = z;
          if (y < minY) minY = y;
        }
      }
      return { maxZ, minY };
    };

    const rawGroin = inspectGroin(skinRawPositions, 0.015, 0.750, 0.046);
    const generalMidlineGroin = inspectGroin(generalSkinPositions, 0.015, 0.750, 0.046);
    const femaleMidlineGroin = inspectGroin(femaleSkinPositions, 0.015, 0.750, 0.046);
    const generalWidePelvis = inspectGroin(generalSkinPositions, 0.040, 0.755, 0.015);
    const femaleWidePelvis = inspectGroin(femaleSkinPositions, 0.040, 0.755, 0.015);

    expect(rawGroin.maxZ).toBeGreaterThan(0.10);
    expect(rawGroin.minY).toBeLessThan(0.770);

    expect(generalMidlineGroin.maxZ).toBeLessThan(0.075);
    expect(generalMidlineGroin.minY).toBeGreaterThanOrEqual(0.790);

    expect(femaleMidlineGroin.maxZ).toBeLessThan(0.075);
    expect(femaleMidlineGroin.minY).toBeGreaterThanOrEqual(0.794);

    expect(generalWidePelvis.maxZ).toBeLessThan(0.075);
    expect(femaleWidePelvis.maxZ).toBeLessThan(0.075);

    // Verify zero inverted/folded triangles between General and Female across groin and anterior chest
    let flippedPelvicTris = 0;
    let flippedChestTris = 0;
    for (let i = 0; i < skinIndices.length; i += 3) {
      const a = skinIndices[i];
      const b = skinIndices[i + 1];
      const c = skinIndices[i + 2];
      const cx = (generalSkinPositions[a * 3] + generalSkinPositions[b * 3] + generalSkinPositions[c * 3]) / 3;
      const cy =
        (generalSkinPositions[a * 3 + 1] + generalSkinPositions[b * 3 + 1] + generalSkinPositions[c * 3 + 1]) /
        3;
      const cz =
        (generalSkinPositions[a * 3 + 2] + generalSkinPositions[b * 3 + 2] + generalSkinPositions[c * 3 + 2]) /
        3;
      const inPelvis = Math.abs(cx) < 0.060 && cy >= 0.74 && cy <= 0.89;
      const inChest = Math.abs(cx) < 0.140 && cy >= 1.16 && cy <= 1.36 && cz > 0.03;
      if (!inPelvis && !inChest) continue;

      const g1x = generalSkinPositions[b * 3] - generalSkinPositions[a * 3];
      const g1y = generalSkinPositions[b * 3 + 1] - generalSkinPositions[a * 3 + 1];
      const g1z = generalSkinPositions[b * 3 + 2] - generalSkinPositions[a * 3 + 2];
      const g2x = generalSkinPositions[c * 3] - generalSkinPositions[a * 3];
      const g2y = generalSkinPositions[c * 3 + 1] - generalSkinPositions[a * 3 + 1];
      const g2z = generalSkinPositions[c * 3 + 2] - generalSkinPositions[a * 3 + 2];
      const gnx = g1y * g2z - g1z * g2y;
      const gny = g1z * g2x - g1x * g2z;
      const gnz = g1x * g2y - g1y * g2x;

      const f1x = femaleSkinPositions[b * 3] - femaleSkinPositions[a * 3];
      const f1y = femaleSkinPositions[b * 3 + 1] - femaleSkinPositions[a * 3 + 1];
      const f1z = femaleSkinPositions[b * 3 + 2] - femaleSkinPositions[a * 3 + 2];
      const f2x = femaleSkinPositions[c * 3] - femaleSkinPositions[a * 3];
      const f2y = femaleSkinPositions[c * 3 + 1] - femaleSkinPositions[a * 3 + 1];
      const f2z = femaleSkinPositions[c * 3 + 2] - femaleSkinPositions[a * 3 + 2];
      const fnx = f1y * f2z - f1z * f2y;
      const fny = f1z * f2x - f1x * f2z;
      const fnz = f1x * f2y - f1y * f2x;

      if (gnx * fnx + gny * fny + gnz * fnz <= 0) {
        if (inPelvis) flippedPelvicTris += 1;
        if (inChest) flippedChestTris += 1;
      }
    }
    expect(flippedPelvicTris).toBe(0);
    expect(flippedChestTris).toBe(0);
  });

  it("keeps female limbs, waist, chest, and hips proportionally consistent across BOTH skin and muscular layers", () => {
    // 1. Skin comparisons
    const gUpperArm = measureWidthSpan(
      generalSkinPositions,
      (x, y) => x > 0 && x > armSplitX(y) && y >= 1.18 && y <= 1.24
    );
    const fUpperArm = measureWidthSpan(
      femaleSkinPositions,
      (_x, y, _z, i) =>
        generalSkinPositions[i * 3] > 0 &&
        generalSkinPositions[i * 3] > armSplitX(y) &&
        generalSkinPositions[i * 3 + 1] >= 1.18 &&
        generalSkinPositions[i * 3 + 1] <= 1.24
    );
    expect(fUpperArm.span).toBeLessThanOrEqual(gUpperArm.span * 0.80);

    const gForearm = measureWidthSpan(
      generalSkinPositions,
      (x, y) => x > 0 && x > armSplitX(y) && y >= 0.95 && y <= 1.05
    );
    const fForearm = measureWidthSpan(
      femaleSkinPositions,
      (_x, _y, _z, i) =>
        generalSkinPositions[i * 3] > 0 &&
        generalSkinPositions[i * 3] > armSplitX(generalSkinPositions[i * 3 + 1]) &&
        generalSkinPositions[i * 3 + 1] >= 0.95 &&
        generalSkinPositions[i * 3 + 1] <= 1.05
    );
    expect(fForearm.span).toBeLessThanOrEqual(gForearm.span * 0.80);

    const gHand = measureWidthSpan(
      generalSkinPositions,
      (x, y) => x > 0 && x > armSplitX(y) && y >= 0.78 && y <= 0.88
    );
    const fHand = measureWidthSpan(
      femaleSkinPositions,
      (_x, _y, _z, i) =>
        generalSkinPositions[i * 3] > 0 &&
        generalSkinPositions[i * 3] > armSplitX(generalSkinPositions[i * 3 + 1]) &&
        generalSkinPositions[i * 3 + 1] >= 0.78 &&
        generalSkinPositions[i * 3 + 1] <= 0.88
    );
    expect(fHand.span).toBeLessThan(gHand.span);

    const gShoulder = measureWidthSpan(generalSkinPositions, (_x, y) => y >= 1.33 && y <= 1.39);
    const fShoulder = measureWidthSpan(femaleSkinPositions, (_x, y) => y >= 1.33 && y <= 1.39);
    expect(fShoulder.maxAbsX).toBeLessThan(gShoulder.maxAbsX);

    const gWaist = measureWidthSpan(
      generalSkinPositions,
      (x, y) => Math.abs(x) < armSplitX(y) && y >= 1.03 && y <= 1.08
    );
    const fWaist = measureWidthSpan(
      femaleSkinPositions,
      (_x, _y, _z, i) =>
        Math.abs(generalSkinPositions[i * 3]) < armSplitX(generalSkinPositions[i * 3 + 1]) &&
        generalSkinPositions[i * 3 + 1] >= 1.03 &&
        generalSkinPositions[i * 3 + 1] <= 1.08
    );
    expect(fWaist.maxAbsX).toBeLessThan(gWaist.maxAbsX);

    const gHips = measureWidthSpan(
      generalSkinPositions,
      (x, y) => Math.abs(x) < armSplitX(y) && y >= 0.85 && y <= 0.90
    );
    const fHips = measureWidthSpan(
      femaleSkinPositions,
      (_x, _y, _z, i) =>
        Math.abs(generalSkinPositions[i * 3]) < armSplitX(generalSkinPositions[i * 3 + 1]) &&
        generalSkinPositions[i * 3 + 1] >= 0.85 &&
        generalSkinPositions[i * 3 + 1] <= 0.90
    );
    expect(fHips.maxAbsX).toBeGreaterThan(gHips.maxAbsX);

    const gThigh = measureWidthSpan(generalSkinPositions, (x, y) => x > 0.01 && y >= 0.55 && y <= 0.65);
    const fThigh = measureWidthSpan(
      femaleSkinPositions,
      (_x, _y, _z, i) =>
        generalSkinPositions[i * 3] > 0.01 &&
        generalSkinPositions[i * 3 + 1] >= 0.55 &&
        generalSkinPositions[i * 3 + 1] <= 0.65
    );
    expect(fThigh.span).toBeLessThan(gThigh.span);

    const gCalf = measureWidthSpan(generalSkinPositions, (x, y) => x > 0.01 && y >= 0.30 && y <= 0.40);
    const fCalf = measureWidthSpan(
      femaleSkinPositions,
      (_x, _y, _z, i) =>
        generalSkinPositions[i * 3] > 0.01 &&
        generalSkinPositions[i * 3 + 1] >= 0.30 &&
        generalSkinPositions[i * 3 + 1] <= 0.40
    );
    expect(fCalf.span).toBeLessThan(gCalf.span);

    let gChestMaxZ = -Infinity;
    let fChestMaxZ = -Infinity;
    for (let i = 0; i < generalSkinPositions.length / 3; i += 1) {
      const gx = generalSkinPositions[i * 3];
      const gy = generalSkinPositions[i * 3 + 1];
      const gz = generalSkinPositions[i * 3 + 2];
      if (Math.abs(gx) >= 0.03 && Math.abs(gx) <= 0.10 && gy >= 1.22 && gy <= 1.29 && gz > 0.04) {
        if (gz > gChestMaxZ) gChestMaxZ = gz;
        if (femaleSkinPositions[i * 3 + 2] > fChestMaxZ) fChestMaxZ = femaleSkinPositions[i * 3 + 2];
      }
    }
    expect(fChestMaxZ - gChestMaxZ).toBeGreaterThanOrEqual(0.020);

    // Refined anterior chest triangulation + unimodal female breast curvature
    let maxChestEdge = 0;
    for (let i = 0; i < skinIndices.length; i += 3) {
      const a = skinIndices[i];
      const b = skinIndices[i + 1];
      const c = skinIndices[i + 2];
      const cx = (generalSkinPositions[a * 3] + generalSkinPositions[b * 3] + generalSkinPositions[c * 3]) / 3;
      const cy =
        (generalSkinPositions[a * 3 + 1] + generalSkinPositions[b * 3 + 1] + generalSkinPositions[c * 3 + 1]) /
        3;
      const cz =
        (generalSkinPositions[a * 3 + 2] + generalSkinPositions[b * 3 + 2] + generalSkinPositions[c * 3 + 2]) /
        3;
      if (Math.abs(cx) < 0.130 && cy > 1.18 && cy < 1.34 && cz > 0.045) {
        for (const [u, v] of [
          [a, b],
          [b, c],
          [c, a],
        ]) {
          const edgeLen = Math.hypot(
            generalSkinPositions[u * 3] - generalSkinPositions[v * 3],
            generalSkinPositions[u * 3 + 1] - generalSkinPositions[v * 3 + 1],
            generalSkinPositions[u * 3 + 2] - generalSkinPositions[v * 3 + 2]
          );
          if (edgeLen > maxChestEdge) maxChestEdge = edgeLen;
        }
      }
    }
    expect(maxChestEdge).toBeGreaterThan(0);
    expect(maxChestEdge).toBeLessThanOrEqual(0.016);

    const avgBreastZ = (yMin: number, yMax: number) => {
      let sum = 0;
      let count = 0;
      for (let i = 0; i < femaleSkinPositions.length / 3; i += 1) {
        const ax = Math.abs(femaleSkinPositions[i * 3]);
        const y = femaleSkinPositions[i * 3 + 1];
        const z = femaleSkinPositions[i * 3 + 2];
        if (ax >= 0.045 && ax <= 0.068 && y >= yMin && y <= yMax && z > 0.05) {
          sum += z;
          count += 1;
        }
      }
      return count > 0 ? sum / count : 0;
    };
    const apexZ = avgBreastZ(1.235, 1.255);
    const upperPoleZ = avgBreastZ(1.305, 1.325);
    const lowerRibZ = avgBreastZ(1.175, 1.195);
    expect(apexZ - upperPoleZ).toBeGreaterThanOrEqual(0.020);
    expect(apexZ - lowerRibZ).toBeGreaterThanOrEqual(0.020);

    // 2. Muscular GLB comparisons (all 93 baked & compartment-tucked primitives)
    expect(muscleEntries.length).toBe(93);
    const totalFloats = muscleEntries.reduce((acc, e) => acc + e.general.length, 0);
    const allGeneralM = new Float32Array(totalFloats);
    const allFemaleM = new Float32Array(totalFloats);
    let offset = 0;
    for (const entry of muscleEntries) {
      allGeneralM.set(entry.general, offset);
      allFemaleM.set(entry.female, offset);
      offset += entry.general.length;
    }

    const gmUpperArm = measureWidthSpan(
      allGeneralM,
      (x, y) => x > 0 && x > armSplitX(y) && y >= 1.18 && y <= 1.24
    );
    const fmUpperArm = measureWidthSpan(
      allFemaleM,
      (_x, _y, _z, i) =>
        allGeneralM[i * 3] > 0 &&
        allGeneralM[i * 3] > armSplitX(allGeneralM[i * 3 + 1]) &&
        allGeneralM[i * 3 + 1] >= 1.18 &&
        allGeneralM[i * 3 + 1] <= 1.24
    );
    expect(fmUpperArm.span).toBeLessThanOrEqual(gmUpperArm.span * 0.80);

    const gmForearm = measureWidthSpan(
      allGeneralM,
      (x, y) => x > 0 && x > armSplitX(y) && y >= 0.95 && y <= 1.05
    );
    const fmForearm = measureWidthSpan(
      allFemaleM,
      (_x, _y, _z, i) =>
        allGeneralM[i * 3] > 0 &&
        allGeneralM[i * 3] > armSplitX(allGeneralM[i * 3 + 1]) &&
        allGeneralM[i * 3 + 1] >= 0.95 &&
        allGeneralM[i * 3 + 1] <= 1.05
    );
    expect(fmForearm.span).toBeLessThanOrEqual(gmForearm.span * 0.80);

    const gmWaist = measureWidthSpan(
      allGeneralM,
      (x, y) => Math.abs(x) < armSplitX(y) && y >= 1.03 && y <= 1.08
    );
    const fmWaist = measureWidthSpan(
      allFemaleM,
      (_x, _y, _z, i) =>
        Math.abs(allGeneralM[i * 3]) < armSplitX(allGeneralM[i * 3 + 1]) &&
        allGeneralM[i * 3 + 1] >= 1.03 &&
        allGeneralM[i * 3 + 1] <= 1.08
    );
    expect(fmWaist.maxAbsX).toBeLessThan(gmWaist.maxAbsX);

    const gmThigh = measureWidthSpan(allGeneralM, (x, y) => x > 0.01 && y >= 0.55 && y <= 0.65);
    const fmThigh = measureWidthSpan(
      allFemaleM,
      (_x, _y, _z, i) =>
        allGeneralM[i * 3] > 0.01 &&
        allGeneralM[i * 3 + 1] >= 0.55 &&
        allGeneralM[i * 3 + 1] <= 0.65
    );
    expect(fmThigh.span).toBeLessThan(gmThigh.span);
  });

  it("tucks all 93 muscular primitives strictly inside both General and Female outer skin compartments", () => {
    const { torsoVox, armVox } = buildCompartmentSkinVoxels(
      generalSkinPositions,
      generalSkinPositions,
      generalTuckNormals,
      skinBaseVertexCount
    );
    const { torsoVox: fTorsoVox, armVox: fArmVox } = buildCompartmentSkinVoxels(
      femaleSkinPositions,
      generalSkinPositions,
      generalTuckNormals,
      skinBaseVertexCount
    );

    for (const entry of muscleEntries) {
      const isArmNode = ARM_MUSCLE_NODE_NAMES.has(entry.nodeName);
      const isArmVertex = (_x: number, y: number) => isArmNode && y < 1.32;

      const gMaxSd = maxSuperficialSignedDistance(
        entry.general,
        isArmVertex,
        torsoVox,
        armVox,
        generalSkinPositions,
        generalTuckNormals
      );
      expect(gMaxSd).toBeLessThan(-0.0005);

      const fMaxSd = maxSuperficialSignedDistance(
        entry.female,
        isArmVertex,
        fTorsoVox,
        fArmVox,
        femaleSkinPositions,
        femaleTuckNormals
      );
      expect(fMaxSd).toBeLessThan(-0.0005);
    }
  });

  it("classifies female-specific breast and uterus_ovaries zones strictly on the Female profile", () => {
    const maps = classifySkinVertexSubRegions(
      generalSkinPositions,
      muscleDonors,
      new THREE.Box3(new THREE.Vector3(-0.07, 0.92, 0.04), new THREE.Vector3(0.07, 1.18, 0.14)),
      { maxY: 1.12, maxX: 0.08 }
    );

    const gBreast = maps.general.filter((s) => s === "breast").length;
    const gUterus = maps.general.filter((s) => s === "uterus_ovaries").length;
    const fBreast = maps.female.filter((s) => s === "breast").length;
    const fUterus = maps.female.filter((s) => s === "uterus_ovaries").length;

    expect(gBreast).toBe(0);
    expect(gUterus).toBe(0);
    expect(fBreast).toBeGreaterThan(20);
    expect(fUterus).toBeGreaterThan(5);
  });

  it("renders proportionally consistent 2D clinical silhouettes for Female vs General profiles", () => {
    const gArmSvg = buildPainAreaDiagramSvg({
      part: "arm",
      subRegion: "forearm_flexor",
      side: "Right",
      bodyProfile: "general",
      lang: "en",
    });
    const fArmSvg = buildPainAreaDiagramSvg({
      part: "arm",
      subRegion: "forearm_flexor",
      side: "Right",
      bodyProfile: "female",
      lang: "en",
    });
    expect(fArmSvg).not.toBe(gArmSvg);

    const cxGeneral = Number(gArmSvg.match(/<ellipse cx="([\d.]+)" cy="74"/)?.[1] ?? "0");
    const cxFemale = Number(fArmSvg.match(/<ellipse cx="([\d.]+)" cy="74"/)?.[1] ?? "0");
    expect(cxGeneral).toBeGreaterThan(0);
    expect(cxFemale).toBeGreaterThan(0);
    expect(Math.abs(50 - cxFemale)).toBeLessThan(Math.abs(50 - cxGeneral));

    // Auto-select female silhouette for female-only anatomical subRegions
    const explicitFemaleBreast = buildPainAreaDiagramSvg({
      part: "chest",
      subRegion: "breast",
      bodyProfile: "female",
      lang: "ro",
    });
    const autoFemaleBreast = buildPainAreaDiagramSvg({
      part: "chest",
      subRegion: "breast",
      lang: "ro",
    });
    expect(autoFemaleBreast).toBe(explicitFemaleBreast);

    const autoFemaleUterus = buildPainAreaDiagramSvg({
      part: "pelvis",
      subRegion: "uterus_ovaries",
      lang: "ro",
    });
    const generalPelvis = buildPainAreaDiagramSvg({
      part: "pelvis",
      subRegion: "bladder",
      bodyProfile: "general",
      lang: "ro",
    });
    expect(autoFemaleUterus).not.toContain(generalPelvis.match(/<path d="([^"]+)"/)?.[1] ?? "");
  });
});
