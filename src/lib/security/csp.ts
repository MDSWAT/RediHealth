type CspOptions = {
  nonce: string;
  isDevelopment: boolean;
  /** Origin of the video-meeting provider embedded in meeting pages. */
  meetingOrigin: string;
};

export function meetingOriginFromEnv(): string {
  const host = (process.env.JITSI_DOMAIN || "meet.jit.si").replace(/^https?:\/\//i, "").split("/")[0];
  return `https://${host}`;
}

export function buildContentSecurityPolicy({ nonce, isDevelopment, meetingOrigin }: CspOptions): string {
  const directives = [
    "default-src 'self'",
    // 'wasm-unsafe-eval' allows Three.js MeshoptDecoder to instantiate its WebAssembly geometry
    // decoder in production without permitting JavaScript eval(); React needs 'unsafe-eval' in dev only.
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' 'wasm-unsafe-eval'${isDevelopment ? " 'unsafe-eval'" : ""}`,
    // Leaflet and several components position elements through inline style attributes.
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data:",
    "worker-src 'self' blob:",
    "connect-src 'self' https://www.google.com/recaptcha/ https://www.gstatic.com/recaptcha/",
    `frame-src ${[...new Set([meetingOrigin, "https://meet.jit.si", "https://www.google.com/recaptcha/", "https://recaptcha.google.com/recaptcha/"])].join(" ")}`,
    "media-src 'self' blob:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ];

  if (!isDevelopment) {
    directives.push("upgrade-insecure-requests");
  }

  return directives.join("; ");
}

export function createNonce(): string {
  return btoa(crypto.randomUUID());
}
