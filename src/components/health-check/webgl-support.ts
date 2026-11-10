import type { Lang } from "@/lib/i18n/translations";

let cached: boolean | null = null;

/**
 * True when this browser can give us a WebGL context (checked once, on a throwaway canvas).
 * Kept out of the three.js chunk so the page can choose its layout before that chunk loads.
 */
export function hasWebGL(): boolean {
  if (cached !== null) return cached;
  try {
    const probe = document.createElement("canvas");
    const gl = probe.getContext("webgl2") ?? probe.getContext("webgl");
    gl?.getExtension("WEBGL_lose_context")?.loseContext();
    cached = Boolean(gl);
  } catch {
    cached = false;
  }
  return cached;
}

/** Shown in place of the 3D body when this device cannot draw it. */
export const WEBGL_ERROR: Record<Lang, string> = {
  ro: "Corpul 3D nu se poate deschide pe acest dispozitiv. Alege zona din listă.",
  en: "The 3D body cannot open on this device. Choose the area from the list.",
  sq: "Trupi 3D nuk hapet në këtë pajisje. Zgjidh zonën nga lista.",
  it: "Il corpo 3D non si apre su questo dispositivo. Scegli la zona dall'elenco.",
  hr: "3D prikaz tijela ne može se otvoriti na ovom uređaju. Odaberi područje s popisa.",
  rom: "O 3D trupo nashti phuterel pe pe kadava aparati. Alosar o than katar i lista.",
};
