import * as THREE from "three";
import type { BodyAnatomyProfile, SubRegionId } from "./anatomy-3d-data";

export interface OuterManifoldGeometry {
  positions: Float32Array;
  indices: Uint32Array;
  baseVertexCount: number;
  baseIndices: Uint32Array;
}

export interface MuscleDonorInput {
  nodeName: string;
  subRegion: SubRegionId;
  positions: Float32Array;
}

export interface SkinSubRegionMaps {
  general: SubRegionId[];
  female: SubRegionId[];
}

export const VOXEL_ORIGIN_X = -0.39;
export const VOXEL_ORIGIN_Y = -0.045;
export const VOXEL_ORIGIN_Z = -0.21;
export const VOXEL_CELL_SIZE = 0.015;
export const VOXEL_NX = 52;
export const VOXEL_NY = 122;
export const VOXEL_NZ = 28;

/** Clamped cubic Hermite smoothstep from `edge0` to `edge1`. */
export function smoothstep01(x: number, edge0: number, edge1: number): number {
  const span = edge1 - edge0;
  if (Math.abs(span) < 1e-9) return x >= edge1 ? 1 : 0;
  const t = Math.max(0, Math.min(1, (x - edge0) / span));
  return t * t * (3 - 2 * t);
}

/**
 * Splits lateral arm/hand coordinates (`|x| > armSplitX(y)`) cleanly from torso/pelvis
 * across the empty anatomical air gap between torso and hanging upper limbs.
 */
export function armSplitX(y: number): number {
  if (y >= 1.26) return 0.156;
  if (y >= 1.12) return 0.155;
  if (y <= 0.90) return 0.195;
  const t = (1.12 - y) / (1.12 - 0.90);
  return 0.155 + t * (0.195 - 0.155);
}

/**
 * Piecewise-linear anatomical arm centerline `( |x|, z )` in BodyParts3D meter space.
 */
export function armCenterXZ(y: number): [number, number] {
  const knots: ReadonlyArray<readonly [number, number, number]> = [
    [1.38, 0.172, -0.006],
    [1.26, 0.190, -0.012],
    [1.14, 0.210, -0.010],
    [1.04, 0.232, 0.002],
    [0.92, 0.258, 0.022],
    [0.80, 0.282, 0.036],
    [0.68, 0.295, 0.045],
  ];
  if (y >= knots[0][0]) return [knots[0][1], knots[0][2]];
  const last = knots[knots.length - 1];
  if (y <= last[0]) return [last[1], last[2]];
  for (let i = 0; i < knots.length - 1; i += 1) {
    const [y0, x0, z0] = knots[i];
    const [y1, x1, z1] = knots[i + 1];
    if (y <= y0 && y >= y1) {
      const t = (y0 - y) / (y0 - y1);
      return [x0 + t * (x1 - x0), z0 + t * (z1 - z0)];
    }
  }
  return [0.22, 0];
}

function reconstructClinicalPelvicAndChestManifold(
  positions: number[],
  flatIndices: number[]
): { positions: Float32Array; indices: Uint32Array } {
  const edgeKey = (u: number, v: number) => (u < v ? `${u}_${v}` : `${v}_${u}`);
  let outPos = positions.slice();
  let tris: [number, number, number][] = [];
  for (let i = 0; i < flatIndices.length; i += 3) {
    tris.push([flatIndices[i], flatIndices[i + 1], flatIndices[i + 2]]);
  }

  // Topologically excise male external genital protrusion before any morphing
  const inGenitalExcision = (x: number, y: number, z: number): boolean => {
    if (y < 0.753 || y > 0.868 || Math.abs(x) > 0.043 || z < 0.012) return false;
    const rx = y < 0.805 ? 0.041 : 0.039;
    const ex = x / rx;
    const ey = (y - 0.808) / 0.058;
    return ex * ex + ey * ey < 1.0;
  };

  tris = tris.filter(([a, b, c]) => {
    const minTriY = Math.min(outPos[a * 3 + 1], outPos[b * 3 + 1], outPos[c * 3 + 1]);
    if (minTriY < 0.748) return true;
    return !(
      inGenitalExcision(outPos[a * 3], outPos[a * 3 + 1], outPos[a * 3 + 2]) ||
      inGenitalExcision(outPos[b * 3], outPos[b * 3 + 1], outPos[b * 3 + 2]) ||
      inGenitalExcision(outPos[c * 3], outPos[c * 3 + 1], outPos[c * 3 + 2])
    );
  });

  // Keep largest edge-connected component and prune ear / pinch triangles on the pelvic rim
  for (let iter = 0; iter < 15; iter += 1) {
    const edgeToTris = new Map<string, number[]>();
    for (let ti = 0; ti < tris.length; ti += 1) {
      const t = tris[ti];
      for (let e = 0; e < 3; e += 1) {
        const k = edgeKey(t[e], t[(e + 1) % 3]);
        let list = edgeToTris.get(k);
        if (!list) {
          list = [];
          edgeToTris.set(k, list);
        }
        list.push(ti);
      }
    }
    const tVis = new Uint8Array(tris.length);
    let bestComp: number[] = [];
    for (let s = 0; s < tris.length; s += 1) {
      if (tVis[s]) continue;
      const comp: number[] = [s];
      const queue: number[] = [s];
      tVis[s] = 1;
      while (queue.length > 0) {
        const ti = queue.pop()!;
        const t = tris[ti];
        for (let e = 0; e < 3; e += 1) {
          const adjTris = edgeToTris.get(edgeKey(t[e], t[(e + 1) % 3])) ?? [];
          for (const nj of adjTris) {
            if (!tVis[nj]) {
              tVis[nj] = 1;
              comp.push(nj);
              queue.push(nj);
            }
          }
        }
      }
      if (comp.length > bestComp.length) bestComp = comp;
    }
    tris = bestComp.map((ti) => tris[ti]);

    const ec = new Map<string, number>();
    for (const t of tris) {
      for (let e = 0; e < 3; e += 1) {
        const k = edgeKey(t[e], t[(e + 1) % 3]);
        ec.set(k, (ec.get(k) ?? 0) + 1);
      }
    }
    const outDeg = new Map<number, number>();
    for (const t of tris) {
      for (let e = 0; e < 3; e += 1) {
        if (ec.get(edgeKey(t[e], t[(e + 1) % 3])) === 1) {
          outDeg.set(t[e], (outDeg.get(t[e]) ?? 0) + 1);
        }
      }
    }
    const pinchSet = new Set<number>();
    for (const [u, deg] of outDeg.entries()) {
      if (deg > 1) pinchSet.add(u);
    }
    const nextTris = tris.filter((t) => {
      const minTriY = Math.min(outPos[t[0] * 3 + 1], outPos[t[1] * 3 + 1], outPos[t[2] * 3 + 1]);
      if (minTriY < 0.745) return true;
      let bEdges = 0;
      for (let e = 0; e < 3; e += 1) {
        if (ec.get(edgeKey(t[e], t[(e + 1) % 3])) === 1) bEdges += 1;
      }
      if (bEdges >= 2) return false;
      if (bEdges === 1 && (pinchSet.has(t[0]) || pinchSet.has(t[1]) || pinchSet.has(t[2]))) {
        return false;
      }
      return true;
    });
    if (nextTris.length === tris.length) break;
    tris = nextTris;
  }

  // Extract the single clean ordered pelvic boundary loop and bridge with a 4-ring harmonic patch
  const ecExc = new Map<string, number>();
  for (const t of tris) {
    for (let e = 0; e < 3; e += 1) {
      const k = edgeKey(t[e], t[(e + 1) % 3]);
      ecExc.set(k, (ecExc.get(k) ?? 0) + 1);
    }
  }
  const boundaryNextMap = new Map<number, number>();
  let hasMultiOutDeg = false;
  for (const t of tris) {
    for (let e = 0; e < 3; e += 1) {
      const u = t[e];
      const v = t[(e + 1) % 3];
      if (ecExc.get(edgeKey(u, v)) === 1) {
        if (boundaryNextMap.has(u)) hasMultiOutDeg = true;
        boundaryNextMap.set(u, v);
      }
    }
  }

  const loop: number[] = [];
  if (!hasMultiOutDeg && boundaryNextMap.size >= 8) {
    const start = boundaryNextMap.keys().next().value!;
    loop.push(start);
    let curr = boundaryNextMap.get(start);
    while (curr !== undefined && curr !== start && loop.length < 500) {
      loop.push(curr);
      curr = boundaryNextMap.get(curr);
    }
    if (curr !== start) loop.length = 0;
  }

  const patchDepth = new Map<number, number>();
  if (loop.length >= 8 && loop.length === boundaryNextMap.size) {
    // Symmetrize the lower midline rim before solving the harmonic cap
    for (const u of loop) {
      const ax = Math.abs(outPos[u * 3]);
      if (ax < 0.032 && outPos[u * 3 + 1] < 0.788) {
        outPos[u * 3 + 1] = Math.max(outPos[u * 3 + 1], 0.788 - 0.35 * ax);
      }
    }
    let lcx = 0;
    let lcy = 0;
    let lcz = 0;
    for (const u of loop) {
      lcx += outPos[u * 3];
      lcy += outPos[u * 3 + 1];
      lcz += outPos[u * 3 + 2];
    }
    lcx /= loop.length;
    lcy /= loop.length;
    lcz /= loop.length;

    const RINGS = 4;
    const M = loop.length;
    const ringIdx: number[][] = [loop];
    for (let r = 1; r < RINGS; r += 1) {
      const t = r / RINGS;
      const arr: number[] = [];
      for (let k = 0; k < M; k += 1) {
        const u = loop[k];
        const id = outPos.length / 3;
        outPos.push(
          outPos[u * 3] * (1 - t) + lcx * t,
          outPos[u * 3 + 1] * (1 - t) + lcy * t,
          outPos[u * 3 + 2] * (1 - t) + lcz * t
        );
        arr.push(id);
        patchDepth.set(id, Math.sin(t * Math.PI * 0.5));
      }
      ringIdx.push(arr);
    }
    const apexIdx = outPos.length / 3;
    outPos.push(lcx, lcy, lcz);
    patchDepth.set(apexIdx, 1.0);

    for (let r = 0; r < RINGS - 1; r += 1) {
      const outer = ringIdx[r];
      const inner = ringIdx[r + 1];
      for (let k = 0; k < M; k += 1) {
        const k1 = (k + 1) % M;
        tris.push([outer[k1], outer[k], inner[k]], [outer[k1], inner[k], inner[k1]]);
      }
    }
    const innermost = ringIdx[RINGS - 1];
    for (let k = 0; k < M; k += 1) {
      tris.push([innermost[(k + 1) % M], innermost[k], apexIdx]);
    }
  }

  // Compact away excised orphan genital vertices
  const rawVertCount = outPos.length / 3;
  const compactMap = new Int32Array(rawVertCount).fill(-1);
  const compPos: number[] = [];
  const compPatchDepthArr: number[] = [];
  const compLoopSet = new Set<number>();
  const loopOrigSet = new Set<number>(loop);

  for (const t of tris) {
    for (let e = 0; e < 3; e += 1) {
      const u = t[e];
      if (compactMap[u] === -1) {
        const nu = compPos.length / 3;
        compactMap[u] = nu;
        compPos.push(outPos[u * 3], outPos[u * 3 + 1], outPos[u * 3 + 2]);
        compPatchDepthArr.push(patchDepth.get(u) ?? 0);
        if (loopOrigSet.has(u)) compLoopSet.add(nu);
      }
      t[e] = compactMap[u];
    }
  }
  outPos = compPos;

  // 40 passes of Laplacian harmonic relaxation over patch interior + 1-ring boundary collar
  const nComp = outPos.length / 3;
  const nbrs: Array<Set<number>> = Array.from({ length: nComp }, () => new Set<number>());
  for (const [a, b, c] of tris) {
    nbrs[a].add(b);
    nbrs[a].add(c);
    nbrs[b].add(a);
    nbrs[b].add(c);
    nbrs[c].add(a);
    nbrs[c].add(b);
  }
  const collarSet = new Set<number>(compLoopSet);
  for (const u of compLoopSet) {
    for (const j of nbrs[u]) {
      if (compPatchDepthArr[j] === 0 && outPos[j * 3 + 1] > 0.768) {
        collarSet.add(j);
      }
    }
  }
  const sm = new Float32Array(outPos);
  const smTmp = new Float32Array(outPos);
  for (let pass = 0; pass < 40; pass += 1) {
    smTmp.set(sm);
    for (let i = 0; i < nComp; i += 1) {
      const inP = compPatchDepthArr[i] > 0;
      const inC = !inP && collarSet.has(i);
      if (!inP && !inC) continue;
      const alpha = inP ? 0.75 : 0.32;
      let sx = 0;
      let sy = 0;
      let sz = 0;
      for (const j of nbrs[i]) {
        sx += sm[j * 3];
        sy += sm[j * 3 + 1];
        sz += sm[j * 3 + 2];
      }
      const inv = 1 / nbrs[i].size;
      smTmp[i * 3] = sm[i * 3] + (sx * inv - sm[i * 3]) * alpha;
      smTmp[i * 3 + 1] = sm[i * 3 + 1] + (sy * inv - sm[i * 3 + 1]) * alpha;
      smTmp[i * 3 + 2] = sm[i * 3 + 2] + (sz * inv - sm[i * 3 + 2]) * alpha;
    }
    sm.set(smTmp);
  }

  for (let i = 0; i < nComp; i += 1) {
    const d = compPatchDepthArr[i];
    if (d > 0) {
      const upperMons = smoothstep01(sm[i * 3 + 1], 0.780, 0.845);
      sm[i * 3 + 2] += (0.0055 + 0.0025 * upperMons) * d;
      sm[i * 3 + 1] += 0.0045 * d;
    }
  }
  outPos = Array.from(sm);

  // 2-pass conforming edge-split refinement across the coarse anterior chest region
  const inChest = (u: number): boolean =>
    Math.abs(outPos[u * 3]) < 0.142 &&
    outPos[u * 3 + 1] > 1.158 &&
    outPos[u * 3 + 1] < 1.362 &&
    outPos[u * 3 + 2] > 0.032;

  for (let pass = 0; pass < 2; pass += 1) {
    const ec = new Map<string, number>();
    for (const t of tris) {
      for (let e = 0; e < 3; e += 1) {
        const k = edgeKey(t[e], t[(e + 1) % 3]);
        ec.set(k, (ec.get(k) ?? 0) + 1);
      }
    }
    const midMap = new Map<string, number>();
    for (const [k, cnt] of ec.entries()) {
      if (cnt !== 2) continue;
      const sep = k.indexOf("_");
      const u = Number(k.slice(0, sep));
      const v = Number(k.slice(sep + 1));
      if (!inChest(u) && !inChest(v)) continue;
      const len = Math.hypot(
        outPos[u * 3] - outPos[v * 3],
        outPos[u * 3 + 1] - outPos[v * 3 + 1],
        outPos[u * 3 + 2] - outPos[v * 3 + 2]
      );
      if (len > 0.0155) {
        const mid = outPos.length / 3;
        outPos.push(
          0.5 * (outPos[u * 3] + outPos[v * 3]),
          0.5 * (outPos[u * 3 + 1] + outPos[v * 3 + 1]),
          0.5 * (outPos[u * 3 + 2] + outPos[v * 3 + 2])
        );
        midMap.set(k, mid);
      }
    }
    const nextTris: [number, number, number][] = [];
    for (const [a, b, c] of tris) {
      const m0 = midMap.get(edgeKey(a, b));
      const m1 = midMap.get(edgeKey(b, c));
      const m2 = midMap.get(edgeKey(c, a));
      const splitCount = (m0 !== undefined ? 1 : 0) + (m1 !== undefined ? 1 : 0) + (m2 !== undefined ? 1 : 0);
      if (splitCount === 0) {
        nextTris.push([a, b, c]);
      } else if (splitCount === 3) {
        nextTris.push([a, m0!, m2!], [m0!, b, m1!], [m2!, m1!, c], [m0!, m1!, m2!]);
      } else if (splitCount === 1) {
        let v0 = a;
        let v1 = b;
        let v2 = c;
        let m = m0!;
        if (m1 !== undefined) {
          v0 = b;
          v1 = c;
          v2 = a;
          m = m1;
        } else if (m2 !== undefined) {
          v0 = c;
          v1 = a;
          v2 = b;
          m = m2;
        }
        nextTris.push([v0, m, v2], [m, v1, v2]);
      } else {
        let v0 = a;
        let v1 = b;
        let v2 = c;
        let ma = m0!;
        let mb = m1!;
        if (m0 === undefined) {
          v0 = b;
          v1 = c;
          v2 = a;
          ma = m1!;
          mb = m2!;
        } else if (m1 === undefined) {
          v0 = c;
          v1 = a;
          v2 = b;
          ma = m2!;
          mb = m0!;
        }
        nextTris.push([ma, v1, mb]);
        const dA = Math.hypot(
          outPos[v0 * 3] - outPos[mb * 3],
          outPos[v0 * 3 + 1] - outPos[mb * 3 + 1],
          outPos[v0 * 3 + 2] - outPos[mb * 3 + 2]
        );
        const dB = Math.hypot(
          outPos[v2 * 3] - outPos[ma * 3],
          outPos[v2 * 3 + 1] - outPos[ma * 3 + 1],
          outPos[v2 * 3 + 2] - outPos[ma * 3 + 2]
        );
        if (dA <= dB) {
          nextTris.push([v0, ma, mb], [v0, mb, v2]);
        } else {
          nextTris.push([v0, ma, v2], [ma, mb, v2]);
        }
      }
    }
    tris = nextTris;
  }

  const finalIndices = new Uint32Array(tris.length * 3);
  for (let i = 0; i < tris.length; i += 1) {
    finalIndices[i * 3] = tris[i][0];
    finalIndices[i * 3 + 1] = tris[i][1];
    finalIndices[i * 3 + 2] = tris[i][2];
  }
  return { positions: new Float32Array(outPos), indices: finalIndices };
}

/**
 * Separates the double-walled BodyParts3D integumentary meshes into their outer epidermis
 * manifold (`dotSum > 0`), discards floating slivers (< 25 verts), and optionally fans closed
 * small boundary loops (such as open eye slits on `skin_shell`) with outward-facing winding
 * and reconstructs a clean clinical pelvic/chest manifold when requested.
 */
export function extractOuterManifold(
  positions: Float32Array,
  normals: Int16Array,
  indices: Uint32Array,
  opts?: { closeSmallBoundaryLoops?: boolean; reconstructClinicalManifold?: boolean }
): OuterManifoldGeometry {
  const vCount = positions.length / 3;
  const adj: number[][] = Array.from({ length: vCount }, () => []);
  for (let i = 0; i < indices.length; i += 3) {
    const a = indices[i];
    const b = indices[i + 1];
    const c = indices[i + 2];
    adj[a].push(b, c);
    adj[b].push(a, c);
    adj[c].push(a, b);
  }

  const visited = new Uint8Array(vCount);
  const keepVert = new Uint8Array(vCount);
  for (let s = 0; s < vCount; s += 1) {
    if (visited[s]) continue;
    const comp: number[] = [];
    const queue: number[] = [s];
    visited[s] = 1;
    while (queue.length > 0) {
      const u = queue.pop()!;
      comp.push(u);
      for (const v of adj[u]) {
        if (!visited[v]) {
          visited[v] = 1;
          queue.push(v);
        }
      }
    }
    if (comp.length < 25) continue;

    let cx = 0;
    let cy = 0;
    let cz = 0;
    for (const u of comp) {
      cx += positions[u * 3];
      cy += positions[u * 3 + 1];
      cz += positions[u * 3 + 2];
    }
    cx /= comp.length;
    cy /= comp.length;
    cz /= comp.length;

    let dotSum = 0;
    for (const u of comp) {
      const dx = positions[u * 3] - cx;
      const dy = (positions[u * 3 + 1] - cy) * 0.25;
      const dz = positions[u * 3 + 2] - cz;
      const nx = normals[u * 3] / 32767;
      const ny = normals[u * 3 + 1] / 32767;
      const nz = normals[u * 3 + 2] / 32767;
      dotSum += dx * nx + dy * ny + dz * nz;
    }
    if (dotSum > 0) {
      for (const u of comp) keepVert[u] = 1;
    }
  }

  const remap = new Int32Array(vCount).fill(-1);
  const outPos: number[] = [];
  const outIdx: number[] = [];
  for (let i = 0; i < indices.length; i += 3) {
    const a = indices[i];
    const b = indices[i + 1];
    const c = indices[i + 2];
    if (!keepVert[a] || !keepVert[b] || !keepVert[c]) continue;
    for (const u of [a, b, c]) {
      if (remap[u] === -1) {
        remap[u] = outPos.length / 3;
        outPos.push(positions[u * 3], positions[u * 3 + 1], positions[u * 3 + 2]);
      }
    }
    outIdx.push(remap[a], remap[b], remap[c]);
  }

  const baseVertexCount = outPos.length / 3;
  const baseIndices = new Uint32Array(outIdx);

  if (opts?.closeSmallBoundaryLoops) {
    const baseNorms = computeFloat32Normals(new Float32Array(outPos), baseIndices);
    const undirectedCount = new Map<string, number>();
    const edgeKey = (u: number, v: number) => (u < v ? `${u}_${v}` : `${v}_${u}`);
    for (let i = 0; i < outIdx.length; i += 3) {
      const tri = [outIdx[i], outIdx[i + 1], outIdx[i + 2]];
      for (let e = 0; e < 3; e += 1) {
        const k = edgeKey(tri[e], tri[(e + 1) % 3]);
        undirectedCount.set(k, (undirectedCount.get(k) ?? 0) + 1);
      }
    }

    const nextMap = new Map<number, number[]>();
    for (let i = 0; i < outIdx.length; i += 3) {
      const tri = [outIdx[i], outIdx[i + 1], outIdx[i + 2]];
      for (let e = 0; e < 3; e += 1) {
        const u = tri[e];
        const v = tri[(e + 1) % 3];
        if (undirectedCount.get(edgeKey(u, v)) === 1) {
          let list = nextMap.get(u);
          if (!list) {
            list = [];
            nextMap.set(u, list);
          }
          list.push(v);
        }
      }
    }

    const used = new Set<string>();
    for (const [start, nexts] of nextMap.entries()) {
      for (const firstNext of nexts) {
        const firstKey = `${start}->${firstNext}`;
        if (used.has(firstKey)) continue;
        const loop: number[] = [start];
        used.add(firstKey);
        let curr = firstNext;
        let guard = 0;
        while (curr !== start && guard < 500) {
          guard += 1;
          loop.push(curr);
          const cand = nextMap.get(curr) ?? [];
          let chosen = -1;
          for (const nx of cand) {
            if (!used.has(`${curr}->${nx}`)) {
              chosen = nx;
              break;
            }
          }
          if (chosen === -1) break;
          used.add(`${curr}->${chosen}`);
          curr = chosen;
        }
        if (curr === start && loop.length >= 3 && loop.length <= 120) {
          let lx = 0;
          let ly = 0;
          let lz = 0;
          let anx = 0;
          let any = 0;
          let anz = 0;
          for (const u of loop) {
            lx += outPos[u * 3];
            ly += outPos[u * 3 + 1];
            lz += outPos[u * 3 + 2];
            anx += baseNorms[u * 3];
            any += baseNorms[u * 3 + 1];
            anz += baseNorms[u * 3 + 2];
          }
          lx /= loop.length;
          ly /= loop.length;
          lz /= loop.length;
          const al = Math.hypot(anx, any, anz) || 1;
          anx /= al;
          any /= al;
          anz /= al;

          let maxR = 0;
          for (const u of loop) {
            const r = Math.hypot(outPos[u * 3] - lx, outPos[u * 3 + 1] - ly, outPos[u * 3 + 2] - lz);
            if (r > maxR) maxR = r;
          }
          if (maxR < 0.095) {
            if (loop.length === 3) {
              const [a, b, c] = loop;
              const e1x = outPos[b * 3] - outPos[a * 3];
              const e1y = outPos[b * 3 + 1] - outPos[a * 3 + 1];
              const e1z = outPos[b * 3 + 2] - outPos[a * 3 + 2];
              const e2x = outPos[c * 3] - outPos[a * 3];
              const e2y = outPos[c * 3 + 1] - outPos[a * 3 + 1];
              const e2z = outPos[c * 3 + 2] - outPos[a * 3 + 2];
              const fnx = e1y * e2z - e1z * e2y;
              const fny = e1z * e2x - e1x * e2z;
              const fnz = e1x * e2y - e1y * e2x;
              if (fnx * anx + fny * any + fnz * anz >= 0) {
                outIdx.push(a, b, c);
              } else {
                outIdx.push(a, c, b);
              }
            } else {
              // Subtle outward dome so filled eye slits and skin seams compute outward normals
              const dome = ly > 1.56 && lz > 0.04 ? 0.0016 : 0.0006;
              lx += anx * dome;
              ly += any * dome;
              lz += anz * dome;
              let fnx = 0;
              let fny = 0;
              let fnz = 0;
              for (let k = 0; k < loop.length; k += 1) {
                const u = loop[(k + 1) % loop.length];
                const v = loop[k];
                const ux = outPos[u * 3] - lx;
                const uy = outPos[u * 3 + 1] - ly;
                const uz = outPos[u * 3 + 2] - lz;
                const vx = outPos[v * 3] - lx;
                const vy = outPos[v * 3 + 1] - ly;
                const vz = outPos[v * 3 + 2] - lz;
                fnx += uy * vz - uz * vy;
                fny += uz * vx - ux * vz;
                fnz += ux * vy - uy * vx;
              }
              const flip = fnx * anx + fny * any + fnz * anz < 0;
              const cIdx = outPos.length / 3;
              outPos.push(lx, ly, lz);
              for (let k = 0; k < loop.length; k += 1) {
                if (!flip) {
                  outIdx.push(cIdx, loop[(k + 1) % loop.length], loop[k]);
                } else {
                  outIdx.push(cIdx, loop[k], loop[(k + 1) % loop.length]);
                }
              }
            }
          }
        }
      }
    }
  }

  if (opts?.reconstructClinicalManifold) {
    const rebuilt = reconstructClinicalPelvicAndChestManifold(outPos, outIdx);
    return {
      positions: rebuilt.positions,
      indices: rebuilt.indices,
      baseVertexCount: rebuilt.positions.length / 3,
      baseIndices: rebuilt.indices,
    };
  }

  return {
    positions: new Float32Array(outPos),
    indices: new Uint32Array(outIdx),
    baseVertexCount,
    baseIndices,
  };
}

/**
 * Computes smooth vertex normals in a fresh Float32Array without mutating any shared buffers.
 */
export function computeFloat32Normals(positions: Float32Array, indices: ArrayLike<number>): Float32Array {
  const geom = new THREE.BufferGeometry();
  geom.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geom.setIndex(Array.from(indices));
  geom.computeVertexNormals();
  const norm = geom.getAttribute("normal") as THREE.BufferAttribute;
  const copy = new Float32Array(norm.array as Float32Array);
  geom.dispose();
  return copy;
}

/**
 * Unified C1 anthropometric female diffeomorphism applied identically across all anatomical layers
 * (skin, muscles, surface caps, bones, joints, and visceral organs) in BodyParts3D meter space.
 */
export function morphFemaleCoordinate(
  x: number,
  y: number,
  z: number,
  out: [number, number, number]
): void {
  const s = x < 0 ? -1 : 1;
  const absX = Math.abs(x);
  const splitX = armSplitX(y);
  const armW =
    y > 0.62 && y < 1.355
      ? smoothstep01(absX, splitX - 0.012, splitX + 0.012) * (1 - smoothstep01(y, 1.275, 1.355))
      : 0;
  const torsoW = 1 - armW;

  let tx = x;
  let ty = y;
  let tz = z;

  // 1. Slenderize neck and lower jawline while preserving cranium proportions
  if (y > 1.415 && y < 1.552 && absX < 0.095) {
    const wNeck =
      smoothstep01(y, 1.415, 1.455) *
      (1 - smoothstep01(y, 1.505, 1.552)) *
      (1 - smoothstep01(absX, 0.068, 0.095));
    tx *= 1 - 0.085 * wNeck;
    tz *= 1 - 0.065 * wNeck;
  }

  // 2. Narrow shoulders and upper ribcage; soften upper trapezius slope
  if (y > 1.15 && y < 1.46) {
    const wSh = smoothstep01(y, 1.15, 1.30) * (1 - smoothstep01(y, 1.41, 1.46));
    tx *= 1 - 0.092 * wSh;
    tz *= 1 - 0.04 * wSh;
    const wTrap =
      smoothstep01(y, 1.36, 1.41) *
      (1 - smoothstep01(y, 1.435, 1.465)) *
      smoothstep01(absX, 0.05, 0.11);
    ty -= 0.009 * wTrap;
  }

  // 3. Defined natural waist and narrower lower ribcage (protects arm via torsoW)
  if (y > 0.94 && y < 1.24) {
    const wWaist = Math.max(0, 1 - ((y - 1.055) / 0.115) ** 2);
    tx *= 1 - 0.098 * wWaist;
    tz *= z > 0 ? 1 - 0.065 * wWaist : 1 - 0.03 * wWaist;
  }

  // 4. Female lateral pelvic / iliac / trochanteric curve (guarded away from midline groin)
  if (y > 0.76 && y < 0.99) {
    const wHip = Math.max(0, 1 - ((y - 0.875) / 0.11) ** 2);
    const latPelvis = smoothstep01(absX, 0.035, 0.085);
    tx += s * 0.0115 * wHip * latPelvis;
    if (z < -0.02) {
      const wGlute = Math.max(0, 1 - ((y - 0.855) / 0.095) ** 2) * smoothstep01(-z, 0.02, 0.08);
      tz -= 0.008 * wGlute;
    }
  }

  // 5. Normalize square male pectoral shelf and sculpt natural female mammary contour
  if (absX < 0.142 && y > 1.168 && y < 1.362 && z > 0.032) {
    const frontChest = smoothstep01(z, 0.035, 0.082);
    const wOuterPec =
      Math.exp(-(((absX - 0.096) / 0.032) ** 2) - (((y - 1.284) / 0.042) ** 2)) * frontChest;
    const wMedialPec =
      Math.exp(-(((absX - 0.026) / 0.018) ** 2) - (((y - 1.284) / 0.040) ** 2)) * frontChest;
    const wNotch =
      Math.exp(-(((y - 1.228) / 0.018) ** 2)) *
      smoothstep01(absX, 0.016, 0.040) *
      (1 - smoothstep01(absX, 0.095, 0.130)) *
      frontChest;
    tz += -0.009 * wOuterPec - 0.0055 * wMedialPec + 0.0055 * wNotch;

    const cx = 0.062;
    const cy = 1.246;
    const rx = 0.057;
    const ry = y < cy ? 0.062 : 0.088;
    const r2 = ((absX - cx) / rx) ** 2 + ((y - cy) / ry) ** 2;
    const cleavageGuard = smoothstep01(absX, 0.011, 0.028);
    let wDome = 0;
    if (r2 < 1) {
      wDome =
        Math.pow(0.5 * (1 + Math.cos(Math.PI * Math.sqrt(r2))), 1.25) *
        frontChest *
        cleavageGuard;
    }
    const lowerBias = y < cy ? 1 + 0.14 * ((cy - y) / 0.062) : 1;
    const wTail =
      0.15 *
      Math.exp(-(((absX - 0.102) / 0.024) ** 2) - (((y - 1.292) / 0.028) ** 2)) *
      frontChest;
    const wBreast = wDome * lowerBias + wTail;
    tz += 0.039 * wBreast;
    ty -= 0.0085 * wDome;
    tx += s * 0.0042 * wDome;
  }

  // 6. Sleeker female thighs and calves around limb axis
  if (y > 0.07 && y <= 0.80) {
    const legCx = y > 0.48 ? 0.092 : 0.085;
    const legCz = y > 0.48 ? 0.006 : -0.006;
    const wLeg = (1 - smoothstep01(y, 0.72, 0.80)) * smoothstep01(y, 0.07, 0.13);
    tx = s * (legCx + (absX - legCx) * (1 - 0.115 * wLeg));
    tz = legCz + (tz - legCz) * (1 - 0.095 * wLeg);
  }

  // Upper limbs: shift inward cleanly with narrowed shoulder and radially slenderize bicep/forearm/hand
  let ax = x;
  const ay = y;
  let az = z;
  if (armW > 0) {
    const [cx, cz] = armCenterXZ(y);
    const tDown = smoothstep01(1.35 - y, 0, 0.55);
    const shiftIn = 0.0158 + 0.0075 * tDown;
    const newCx = cx - shiftIn;
    const isHand = smoothstep01(0.88 - y, 0, 0.06);
    const rScale = (1 - isHand) * 0.72 + isHand * 0.83;
    ax = s * (newCx + (absX - cx) * rScale);
    az = cz + (z - cz) * rScale;
  }

  out[0] = tx * torsoW + ax * armW;
  out[1] = ty * torsoW + ay * armW;
  out[2] = tz * torsoW + az * armW;
}

/**
 * Applies fold-free Laplacian polish over the reconstructed clinical pelvic arch (plus subtle
 * mons pubis fullness and upper arch shaping on "female") and blends the female anterior chest
 * contour without clamping vertices onto folded genital triangles.
 */
export function smoothPelvicGroinContour(
  positions: Float32Array,
  indices: ArrayLike<number>,
  profile: BodyAnatomyProfile
): Float32Array {
  const out = new Float32Array(positions);
  const n = out.length / 3;
  const nbrs: Array<Set<number>> = Array.from({ length: n }, () => new Set<number>());
  for (let i = 0; i < indices.length; i += 3) {
    const a = indices[i];
    const b = indices[i + 1];
    const c = indices[i + 2];
    nbrs[a].add(b);
    nbrs[a].add(c);
    nbrs[b].add(a);
    nbrs[b].add(c);
    nbrs[c].add(a);
    nbrs[c].add(b);
  }

  const weights = new Float32Array(n);
  const isFemale = profile === "female";

  for (let i = 0; i < n; i += 1) {
    const x = out[i * 3];
    const y = out[i * 3 + 1];
    const z = out[i * 3 + 2];
    const absX = Math.abs(x);
    let wi = 0;

    if (absX < 0.052 && y > 0.760 && y < 0.875 && z > 0.005) {
      wi = Math.max(
        wi,
        (1 - smoothstep01(absX, 0.032, 0.052)) *
          smoothstep01(y, 0.760, 0.778) *
          (1 - smoothstep01(y, 0.858, 0.875)) *
          smoothstep01(z, 0.005, 0.025) *
          0.28
      );
      if (isFemale) {
        const wMons =
          Math.exp(-((absX / 0.028) ** 2) - (((y - 0.835) / 0.032) ** 2)) *
          smoothstep01(z, 0.02, 0.05);
        const wArch =
          (1 - smoothstep01(absX, 0.015, 0.036)) *
          (1 - smoothstep01(y, 0.770, 0.815)) *
          smoothstep01(y, 0.758, 0.772) *
          smoothstep01(z, 0.01, 0.035);
        out[i * 3 + 2] += 0.0025 * wMons;
        out[i * 3 + 1] += 0.0045 * wArch;
      }
    }

    if (isFemale && absX > 0.008 && absX < 0.132 && y > 1.175 && y < 1.345 && z > 0.050) {
      wi = Math.max(
        wi,
        (1 - smoothstep01(absX, 0.105, 0.132)) *
          smoothstep01(y, 1.175, 1.195) *
          (1 - smoothstep01(y, 1.325, 1.345)) *
          smoothstep01(z, 0.050, 0.080) *
          0.26
      );
    }

    weights[i] = wi;
  }

  const passes = isFemale ? 6 : 4;
  const next = new Float32Array(out);
  for (let pass = 0; pass < passes; pass += 1) {
    next.set(out);
    for (let i = 0; i < n; i += 1) {
      const alpha = weights[i];
      if (alpha < 0.01 || nbrs[i].size === 0) continue;
      let sx = 0;
      let sy = 0;
      let sz = 0;
      for (const j of nbrs[i]) {
        sx += out[j * 3];
        sy += out[j * 3 + 1];
        sz += out[j * 3 + 2];
      }
      const inv = 1 / nbrs[i].size;
      next[i * 3] = out[i * 3] + (sx * inv - out[i * 3]) * alpha;
      next[i * 3 + 1] = out[i * 3 + 1] + (sy * inv - out[i * 3 + 1]) * alpha;
      next[i * 3 + 2] = out[i * 3 + 2] + (sz * inv - out[i * 3 + 2]) * alpha;
    }
    out.set(next);
  }

  return out;
}

/** Builds an O(1) 1.5cm nearest-vertex voxel index table over a skin manifold. */
export function buildSkinVoxelIndex(skinPositions: Float32Array): Int16Array {
  const n = skinPositions.length / 3;
  const total = VOXEL_NX * VOXEL_NY * VOXEL_NZ;
  const voxIdx = new Int16Array(total).fill(-1);
  const voxD2 = new Float32Array(total).fill(0.045 * 0.045);
  const inv = 1 / VOXEL_CELL_SIZE;

  for (let i = 0; i < n; i += 1) {
    const sx = skinPositions[i * 3];
    const sy = skinPositions[i * 3 + 1];
    const sz = skinPositions[i * 3 + 2];
    const cx = Math.floor((sx - VOXEL_ORIGIN_X) * inv);
    const cy = Math.floor((sy - VOXEL_ORIGIN_Y) * inv);
    const cz = Math.floor((sz - VOXEL_ORIGIN_Z) * inv);
    const x0 = Math.max(0, cx - 2);
    const x1 = Math.min(VOXEL_NX - 1, cx + 2);
    const y0 = Math.max(0, cy - 2);
    const y1 = Math.min(VOXEL_NY - 1, cy + 2);
    const z0 = Math.max(0, cz - 2);
    const z1 = Math.min(VOXEL_NZ - 1, cz + 2);

    for (let ix = x0; ix <= x1; ix += 1) {
      const px = VOXEL_ORIGIN_X + (ix + 0.5) * VOXEL_CELL_SIZE - sx;
      const px2 = px * px;
      for (let iy = y0; iy <= y1; iy += 1) {
        const py = VOXEL_ORIGIN_Y + (iy + 0.5) * VOXEL_CELL_SIZE - sy;
        const pxy2 = px2 + py * py;
        const base = (ix * VOXEL_NY + iy) * VOXEL_NZ;
        for (let iz = z0; iz <= z1; iz += 1) {
          const pz = VOXEL_ORIGIN_Z + (iz + 0.5) * VOXEL_CELL_SIZE - sz;
          const d2 = pxy2 + pz * pz;
          const cell = base + iz;
          if (d2 < voxD2[cell]) {
            voxD2[cell] = d2;
            voxIdx[cell] = i;
          }
        }
      }
    }
  }
  return voxIdx;
}

/**
 * Tucks vertices of a standalone `Float32Array` buffer at least `margin` meters inside the
 * given skin manifold using a prebuilt O(1) skin voxel index.
 */
export function tuckPositionsInsideSkin(
  positions: Float32Array,
  skinPositions: Float32Array,
  skinNormals: Float32Array,
  skinVoxelIdx: Int16Array,
  margin = 0.0024
): void {
  const inv = 1 / VOXEL_CELL_SIZE;
  const count = positions.length / 3;
  for (let i = 0; i < count; i += 1) {
    const mx = positions[i * 3];
    const my = positions[i * 3 + 1];
    const mz = positions[i * 3 + 2];
    const ix = Math.floor((mx - VOXEL_ORIGIN_X) * inv);
    const iy = Math.floor((my - VOXEL_ORIGIN_Y) * inv);
    const iz = Math.floor((mz - VOXEL_ORIGIN_Z) * inv);
    if (ix < 0 || ix >= VOXEL_NX || iy < 0 || iy >= VOXEL_NY || iz < 0 || iz >= VOXEL_NZ) continue;
    const si = skinVoxelIdx[(ix * VOXEL_NY + iy) * VOXEL_NZ + iz];
    if (si < 0) continue;
    const nx = skinNormals[si * 3];
    const ny = skinNormals[si * 3 + 1];
    const nz = skinNormals[si * 3 + 2];
    const sd =
      (mx - skinPositions[si * 3]) * nx +
      (my - skinPositions[si * 3 + 1]) * ny +
      (mz - skinPositions[si * 3 + 2]) * nz;
    if (sd > -margin) {
      const push = sd + margin;
      positions[i * 3] = mx - nx * push;
      positions[i * 3 + 1] = my - ny * push;
      positions[i * 3 + 2] = mz - nz * push;
    }
  }
}

export const ARM_MUSCLE_NODE_NAMES = new Set<string>([
  "delt_side",
  "delt_front",
  "delt_rear",
  "bicep_long",
  "bicep_short",
  "brachialis",
  "tricep_medial",
  "tricep_lateral",
  "tricep_long",
  "forearm_flexors",
  "brachioradialis",
  "forearm_extensors",
]);

/**
 * Classifies an un-morphed outer-skin vertex into upper-limb vs torso/leg compartment,
 * guarding medial upper-arm vertices whose X-normal faces the axillary fold.
 */
export function isArmSkinVertex(bx: number, by: number, bnx: number): boolean {
  if (by <= 0.62 || by >= 1.34) return false;
  if (by > 1.05 && by < 1.32 && Math.abs(bx) > 0.135 && (bx < 0 ? -1 : 1) * bnx < -0.25) {
    return true;
  }
  return Math.abs(bx) > armSplitX(by);
}

/**
 * Builds separate O(1) compartment-isolated voxel nearest-skin tables for torso/legs vs upper limbs
 * so axillary/ribcage muscles never cross-project onto the adjacent arm wall.
 */
export function buildCompartmentSkinVoxels(
  skinPositions: Float32Array,
  baseSkinPositions: Float32Array,
  baseSkinNormals: Float32Array,
  baseVertexCount: number
): { torsoVox: Int16Array; armVox: Int16Array } {
  const total = VOXEL_NX * VOXEL_NY * VOXEL_NZ;
  const torsoVox = new Int16Array(total).fill(-1);
  const torsoD2 = new Float32Array(total).fill(0.024 * 0.024);
  const armVox = new Int16Array(total).fill(-1);
  const armD2 = new Float32Array(total).fill(0.024 * 0.024);
  const inv = 1 / VOXEL_CELL_SIZE;
  const limit = Math.min(baseVertexCount, skinPositions.length / 3);

  for (let i = 0; i < limit; i += 1) {
    const isArm = isArmSkinVertex(
      baseSkinPositions[i * 3],
      baseSkinPositions[i * 3 + 1],
      baseSkinNormals[i * 3]
    );
    const targetIdx = isArm ? armVox : torsoVox;
    const targetD2 = isArm ? armD2 : torsoD2;

    const sx = skinPositions[i * 3];
    const sy = skinPositions[i * 3 + 1];
    const sz = skinPositions[i * 3 + 2];
    const cx = Math.floor((sx - VOXEL_ORIGIN_X) * inv);
    const cy = Math.floor((sy - VOXEL_ORIGIN_Y) * inv);
    const cz = Math.floor((sz - VOXEL_ORIGIN_Z) * inv);
    const x0 = Math.max(0, cx - 1);
    const x1 = Math.min(VOXEL_NX - 1, cx + 1);
    const y0 = Math.max(0, cy - 1);
    const y1 = Math.min(VOXEL_NY - 1, cy + 1);
    const z0 = Math.max(0, cz - 1);
    const z1 = Math.min(VOXEL_NZ - 1, cz + 1);

    for (let ix = x0; ix <= x1; ix += 1) {
      const px = VOXEL_ORIGIN_X + (ix + 0.5) * VOXEL_CELL_SIZE - sx;
      const px2 = px * px;
      for (let iy = y0; iy <= y1; iy += 1) {
        const py = VOXEL_ORIGIN_Y + (iy + 0.5) * VOXEL_CELL_SIZE - sy;
        const pxy2 = px2 + py * py;
        const base = (ix * VOXEL_NY + iy) * VOXEL_NZ;
        for (let iz = z0; iz <= z1; iz += 1) {
          const pz = VOXEL_ORIGIN_Z + (iz + 0.5) * VOXEL_CELL_SIZE - sz;
          const d2 = pxy2 + pz * pz;
          const cell = base + iz;
          if (d2 < targetD2[cell]) {
            targetD2[cell] = d2;
            targetIdx[cell] = i;
          }
        }
      }
    }
  }

  return { torsoVox, armVox };
}

function tuckVertexCompartment(
  x: number,
  y: number,
  z: number,
  vox: Int16Array,
  skinPositions: Float32Array,
  skinNormals: Float32Array,
  margin: number,
  out: [number, number, number]
): void {
  const inv = 1 / VOXEL_CELL_SIZE;
  let mx = x;
  let my = y;
  let mz = z;
  for (let pass = 0; pass < 3; pass += 1) {
    const ix = Math.floor((mx - VOXEL_ORIGIN_X) * inv);
    const iy = Math.floor((my - VOXEL_ORIGIN_Y) * inv);
    const iz = Math.floor((mz - VOXEL_ORIGIN_Z) * inv);
    if (ix < 0 || ix >= VOXEL_NX || iy < 0 || iy >= VOXEL_NY || iz < 0 || iz >= VOXEL_NZ) break;
    const si = vox[(ix * VOXEL_NY + iy) * VOXEL_NZ + iz];
    if (si < 0) break;
    const dx = mx - skinPositions[si * 3];
    const dy = my - skinPositions[si * 3 + 1];
    const dz = mz - skinPositions[si * 3 + 2];
    const d = Math.hypot(dx, dy, dz);
    const snx = skinNormals[si * 3];
    const sny = skinNormals[si * 3 + 1];
    const snz = skinNormals[si * 3 + 2];
    const sd = dx * snx + dy * sny + dz * snz;
    if (d < 0.018 && sd > -margin) {
      const push = (sd + margin) * 0.95;
      mx -= snx * push;
      my -= sny * push;
      mz -= snz * push;
    } else {
      break;
    }
  }
  out[0] = mx;
  out[1] = my;
  out[2] = mz;
}

/**
 * Bakes `muscular.glb` parent/node transforms into BodyParts3D meter space (`Y in [0, 1.72]`),
 * dequantizes interleaved `Int16Array` positions into standalone `Float32Array`s, preserves clean
 * standalone `Int8Array` normals, and runs compartment-aware 3-pass tucking inside BOTH General
 * and Female outer skin manifolds (`mesh.userData.bakedFemalePositions`).
 */
export function bakeAndTuckMuscularScene(
  gltfScene: THREE.Group,
  generalSkinPositions: Float32Array,
  generalTuckNormals: Float32Array,
  femaleSkinPositions: Float32Array,
  femaleTuckNormals: Float32Array,
  baseVertexCount: number
): void {
  const { torsoVox, armVox } = buildCompartmentSkinVoxels(
    generalSkinPositions,
    generalSkinPositions,
    generalTuckNormals,
    baseVertexCount
  );
  const { torsoVox: fTorsoVox, armVox: fArmVox } = buildCompartmentSkinVoxels(
    femaleSkinPositions,
    generalSkinPositions,
    generalTuckNormals,
    baseVertexCount
  );
  const margin = 0.0028;

  gltfScene.updateMatrixWorld(true);
  const normalVec = new THREE.Vector3();
  const normalMat = new THREE.Matrix3();
  const tuckTmp: [number, number, number] = [0, 0, 0];
  const morphTmp: [number, number, number] = [0, 0, 0];

  gltfScene.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (!mesh.isMesh) return;
    const geom = mesh.geometry;
    const posAttr = geom.getAttribute("position");
    const normAttr = geom.getAttribute("normal");
    if (!posAttr) return;

    const nodeName = mesh.parent?.name || mesh.name;
    const m = mesh.matrixWorld.elements;
    normalMat.getNormalMatrix(mesh.matrixWorld);
    const fPos = new Float32Array(posAttr.count * 3);
    const fFemalePos = new Float32Array(posAttr.count * 3);
    const fNorm = new Int8Array(posAttr.count * 3);

    for (let i = 0; i < posAttr.count; i += 1) {
      const lx = posAttr.getX(i);
      const ly = posAttr.getY(i);
      const lz = posAttr.getZ(i);
      const mx = m[0] * lx + m[4] * ly + m[8] * lz + m[12];
      const my = m[1] * lx + m[5] * ly + m[9] * lz + m[13];
      const mz = m[2] * lx + m[6] * ly + m[10] * lz + m[14];

      const isArm = ARM_MUSCLE_NODE_NAMES.has(nodeName) && my < 1.32;

      tuckVertexCompartment(
        mx,
        my,
        mz,
        isArm ? armVox : torsoVox,
        generalSkinPositions,
        generalTuckNormals,
        margin,
        tuckTmp
      );
      fPos[i * 3] = tuckTmp[0];
      fPos[i * 3 + 1] = tuckTmp[1];
      fPos[i * 3 + 2] = tuckTmp[2];

      morphFemaleCoordinate(tuckTmp[0], tuckTmp[1], tuckTmp[2], morphTmp);
      tuckVertexCompartment(
        morphTmp[0],
        morphTmp[1],
        morphTmp[2],
        isArm ? fArmVox : fTorsoVox,
        femaleSkinPositions,
        femaleTuckNormals,
        margin,
        tuckTmp
      );
      fFemalePos[i * 3] = tuckTmp[0];
      fFemalePos[i * 3 + 1] = tuckTmp[1];
      fFemalePos[i * 3 + 2] = tuckTmp[2];

      if (normAttr) {
        normalVec.set(normAttr.getX(i), normAttr.getY(i), normAttr.getZ(i)).applyMatrix3(normalMat).normalize();
        fNorm[i * 3] = Math.max(-127, Math.min(127, Math.round(normalVec.x * 127)));
        fNorm[i * 3 + 1] = Math.max(-127, Math.min(127, Math.round(normalVec.y * 127)));
        fNorm[i * 3 + 2] = Math.max(-127, Math.min(127, Math.round(normalVec.z * 127)));
      }
    }

    const freshGeom = new THREE.BufferGeometry();
    freshGeom.setAttribute("position", new THREE.BufferAttribute(fPos, 3));
    if (normAttr) {
      freshGeom.setAttribute("normal", new THREE.BufferAttribute(fNorm, 3, true));
    }
    const idx = geom.getIndex();
    if (idx) {
      const idxCopy = new Uint32Array(idx.count);
      for (let i = 0; i < idx.count; i += 1) idxCopy[i] = idx.getX(i);
      freshGeom.setIndex(new THREE.BufferAttribute(idxCopy, 1));
    }
    freshGeom.computeBoundingBox();
    freshGeom.computeBoundingSphere();
    mesh.geometry = freshGeom;
    mesh.userData.bakedFemalePositions = fFemalePos;
  });

  gltfScene.traverse((obj) => {
    obj.position.set(0, 0, 0);
    obj.quaternion.identity();
    obj.scale.set(1, 1, 1);
    obj.updateMatrix();
  });
  gltfScene.updateMatrixWorld(true);
}

/**
 * Classifies every vertex of `baseSkinPositions` (General profile outer skin) into an exact
 * `SubRegionId` for both `"general"` and `"female"` profiles so `surface` (Skin) mode renders
 * and highlights seamlessly on the opaque skin mesh with zero muscle or organ bleed-through.
 */
export function classifySkinVertexSubRegions(
  baseSkinPositions: Float32Array,
  muscleDonors: MuscleDonorInput[],
  rectusBox: THREE.Box3 | null,
  lumbarWindow: { maxY: number; maxX: number } | null
): SkinSubRegionMaps {
  const total = VOXEL_NX * VOXEL_NY * VOXEL_NZ;
  const subList: SubRegionId[] = [];
  const subToIdx = new Map<SubRegionId, number>();
  const regSub = (id: SubRegionId): number => {
    let idx = subToIdx.get(id);
    if (idx === undefined) {
      idx = subList.length;
      subList.push(id);
      subToIdx.set(id, idx);
    }
    return idx;
  };

  const cellSub = new Int16Array(total).fill(-1);
  const cellD2 = new Float32Array(total).fill(0.055 * 0.055);
  const inv = 1 / VOXEL_CELL_SIZE;

  const covered = (nodeName: string, x: number, y: number, z: number): SubRegionId | null => {
    if (
      nodeName === "obliques" &&
      rectusBox !== null &&
      Math.abs(x) <= rectusBox.max.x &&
      y >= rectusBox.min.y &&
      y <= rectusBox.max.y &&
      z >= rectusBox.min.z
    ) {
      return "abdominals";
    }
    if (
      nodeName === "lats" &&
      lumbarWindow !== null &&
      y <= lumbarWindow.maxY &&
      Math.abs(x) <= lumbarWindow.maxX
    ) {
      return "lower_back";
    }
    return null;
  };

  for (const donor of muscleDonors) {
    const pos = donor.positions;
    const count = pos.length / 3;
    const defaultIdx = regSub(donor.subRegion);
    for (let i = 0; i < count; i += 2) {
      const x = pos[i * 3];
      const y = pos[i * 3 + 1];
      const z = pos[i * 3 + 2];
      const cov = covered(donor.nodeName, x, y, z);
      const srIdx = cov ? regSub(cov) : defaultIdx;
      const cx = Math.floor((x - VOXEL_ORIGIN_X) * inv);
      const cy = Math.floor((y - VOXEL_ORIGIN_Y) * inv);
      const cz = Math.floor((z - VOXEL_ORIGIN_Z) * inv);
      const x0 = Math.max(0, cx - 2);
      const x1 = Math.min(VOXEL_NX - 1, cx + 2);
      const y0 = Math.max(0, cy - 2);
      const y1 = Math.min(VOXEL_NY - 1, cy + 2);
      const z0 = Math.max(0, cz - 2);
      const z1 = Math.min(VOXEL_NZ - 1, cz + 2);
      for (let ix = x0; ix <= x1; ix += 1) {
        const px = VOXEL_ORIGIN_X + (ix + 0.5) * VOXEL_CELL_SIZE - x;
        const px2 = px * px;
        for (let iy = y0; iy <= y1; iy += 1) {
          const py = VOXEL_ORIGIN_Y + (iy + 0.5) * VOXEL_CELL_SIZE - y;
          const pxy2 = px2 + py * py;
          const base = (ix * VOXEL_NY + iy) * VOXEL_NZ;
          for (let iz = z0; iz <= z1; iz += 1) {
            const pz = VOXEL_ORIGIN_Z + (iz + 0.5) * VOXEL_CELL_SIZE - z;
            const d2 = pxy2 + pz * pz;
            const c = base + iz;
            if (d2 < cellD2[c]) {
              cellD2[c] = d2;
              cellSub[c] = srIdx;
            }
          }
        }
      }
    }
  }

  const vCount = baseSkinPositions.length / 3;
  const general = new Array<SubRegionId>(vCount);
  const female = new Array<SubRegionId>(vCount);

  const fallbackZone = (x: number, y: number, z: number): SubRegionId => {
    const absX = Math.abs(x);
    if (absX > armSplitX(y)) {
      if (y >= 1.32) return z >= 0 ? "deltoid" : "rotator_cuff";
      if (y >= 1.12) return z >= 0 ? "biceps" : "triceps";
      if (y >= 0.90) return z >= 0 ? "forearm_flexor" : "forearm_extensor";
      return "hands_fingers";
    }
    if (y < 0.48) return "calves";
    if (y < 0.80) return z >= 0 ? "quadriceps" : "hamstrings";
    if (z < 0) return y > 1.12 ? "upper_back" : y > 0.94 ? "lower_back" : "gluteal";
    return y > 1.18 ? "pectoral" : "abdominals";
  };

  for (let i = 0; i < vCount; i += 1) {
    const x = baseSkinPositions[i * 3];
    const y = baseSkinPositions[i * 3 + 1];
    const z = baseSkinPositions[i * 3 + 2];
    const absX = Math.abs(x);
    const inArm = absX > armSplitX(y);

    let gSub: SubRegionId | null = null;
    let fSub: SubRegionId | null = null;

    if (!inArm && y >= 1.492 && absX < 0.115) {
      if (z < -0.022 && y >= 1.505) gSub = "cranium_occipital";
      else if (y >= 1.555) gSub = "head_face";
      else gSub = absX >= 0.036 || z < 0.045 ? "jaw_ear" : "head_face";
    } else if (!inArm && y >= 1.415 && y < 1.492 && absX < 0.095) {
      gSub = z < -0.018 ? "cervical_spine" : "neck";
    } else if (inArm && y < 0.915) {
      gSub = y >= 0.855 ? "wrist_tendon" : "hands_fingers";
    } else if (inArm && y >= 1.085 && y <= 1.145 && z < -0.018) {
      gSub = "elbow_tendon";
    } else if (y < 0.125) {
      gSub = z < -0.025 && y > 0.022 ? "achilles" : "feet_soles";
    } else if (!inArm && y >= 0.445 && y <= 0.510 && z > 0.018 && absX < 0.135) {
      gSub = "patellar_tendon";
    } else if (!inArm) {
      if (absX >= 0.105 && absX <= 0.162 && y >= 1.245 && y <= 1.350 && z >= -0.050 && z <= 0.055) {
        gSub = "axilla";
      } else if (absX >= 0.014 && absX <= 0.132 && y >= 1.182 && y <= 1.342 && z > 0.048) {
        gSub = "pectoral";
        fSub = "breast";
      } else if (
        (absX < 0.020 && y >= 1.19 && y <= 1.34 && z > 0.070) ||
        (absX >= 0.068 && absX <= 0.148 && y >= 1.115 && y < 1.195 && z > 0.025)
      ) {
        gSub = "rib_cage";
      } else if (z < -0.042 && y >= 1.125 && y < 1.385 && absX <= 0.028) {
        gSub = "thoracic_spine";
      } else if (z < -0.042 && y >= 0.955 && y < 1.125 && absX <= 0.030) {
        gSub = "lumbar_spine";
      } else if (z < -0.042 && y >= 0.840 && y < 0.955 && absX <= 0.055) {
        gSub = "sacroiliac_coccyx";
      } else if (y >= 0.750 && y <= 0.945 && z >= -0.032 && absX <= 0.165) {
        if (absX <= 0.052 && y < 0.842 && z <= 0.078) {
          gSub = "pelvic_floor";
        } else if (absX <= 0.068 && y >= 0.878 && y <= 0.928 && z > 0.042) {
          fSub = "uterus_ovaries";
          gSub = absX <= 0.056 && y <= 0.916 ? "bladder" : "abdominals";
        } else if (absX <= 0.056 && y >= 0.842 && y < 0.916 && z > 0.042) {
          gSub = "bladder";
        } else if (absX >= 0.056 && y >= 0.835 && z > -0.025) {
          gSub = "hip_groin";
        }
      }
    }

    if (gSub === null) {
      const ix = Math.floor((x - VOXEL_ORIGIN_X) * inv);
      const iy = Math.floor((y - VOXEL_ORIGIN_Y) * inv);
      const iz = Math.floor((z - VOXEL_ORIGIN_Z) * inv);
      if (ix >= 0 && ix < VOXEL_NX && iy >= 0 && iy < VOXEL_NY && iz >= 0 && iz < VOXEL_NZ) {
        const si = cellSub[(ix * VOXEL_NY + iy) * VOXEL_NZ + iz];
        if (si >= 0) gSub = subList[si];
      }
      if (gSub === null) gSub = fallbackZone(x, y, z);
    }

    general[i] = gSub;
    female[i] = fSub ?? gSub;
  }

  return { general, female };
}
