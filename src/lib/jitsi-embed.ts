/**
 * Shared Jitsi Meet embed URL builder and postMessage lifecycle bridge.
 *
 * Prevents Jitsi's post-call 8x8 promotional close screen ("Jitsi as a Service —
 * Build a video solution for your workflow") from ever appearing inside RediHealth:
 * 1. Disables Jitsi's close/promotional/feedback screens and watermarks in hash config.
 * 2. Strips Jitsi's internal `hangup` toolbar button when RediHealth provides its own
 *    accessible "End call" control, eliminating accidental navigation to Jitsi's close page.
 * 3. Bridges Jitsi's built-in `postis` iframe API (`jitsi_meet_external_api_id`) over
 *    `window.postMessage` (zero third-party script tags, strict-CSP safe) so remote
 *    hang-ups (`video-conference-left` / `ready-to-close`) immediately unmount the iframe
 *    and show RediHealth's own post-call screen.
 */

export interface JitsiEmbedOptions {
  /** Base room URL (`https://meet.jit.si/redihealth-...`) without hash fragment. */
  baseRoomUrl: string;
  /** Numeric external API channel ID for Jitsi's `postis` bridge. */
  apiId?: number;
  /** Start audio-only with camera muted (patient voice consultations). */
  audioOnly?: boolean;
  /** Explicit Jitsi toolbar buttons; omit `hangup` when host UI renders End Call. */
  toolbarButtons?: readonly string[];
}

export const PATIENT_VOICE_TOOLBAR = ["microphone", "settings"] as const;

export const MEDIATOR_VIDEO_TOOLBAR = [
  "microphone",
  "camera",
  "desktop",
  "chat",
  "tileview",
  "settings",
] as const;

export const DOCTOR_WORKSPACE_TOOLBAR = [
  "microphone",
  "camera",
  "desktop",
  "chat",
  "tileview",
  "fullscreen",
  "settings",
  "hangup",
] as const;

export function buildJitsiEmbedUrl({
  baseRoomUrl,
  apiId = 1,
  audioOnly = false,
  toolbarButtons,
}: JitsiEmbedOptions): string {
  const cleanBase = baseRoomUrl.split("#")[0];
  const params: string[] = [
    `jitsi_meet_external_api_id=${apiId}`,
    "config.prejoinPageEnabled=false",
    "config.disableDeepLinking=true",
    "config.enableClosePage=false",
    "config.feedbackPercentage=0",
    "config.disableThirdPartyRequests=true",
    "interfaceConfig.SHOW_PROMOTIONAL_CLOSE_PAGE=false",
    "interfaceConfig.SHOW_JITSI_WATERMARK=false",
    "interfaceConfig.SHOW_BRAND_WATERMARK=false",
    "interfaceConfig.SHOW_POWERED_BY=false",
    "interfaceConfig.MOBILE_APP_PROMO=false",
  ];

  if (audioOnly) {
    params.push("config.startAudioOnly=true", "config.startWithVideoMuted=true");
  }

  if (toolbarButtons) {
    params.push(`config.toolbarButtons=${encodeURIComponent(JSON.stringify(toolbarButtons))}`);
  }

  return `${cleanBase}#${params.join("&")}`;
}

const CALL_ENDED_EVENTS = new Set([
  "video-conference-left",
  "ready-to-close",
]);

/**
 * Connects to Jitsi Meet's built-in `postis` message bus on the given `iframe`
 * and invokes `onCallEnded` immediately when the conference ends or closes.
 */
export function subscribeJitsiCallEnd(
  iframe: HTMLIFrameElement | null,
  apiId: number,
  onCallEnded: () => void,
): () => void {
  if (!iframe || typeof window === "undefined") {
    return () => {};
  }

  const scope = `jitsi_meet_external_api_${apiId}`;
  let expectedOrigin = "https://meet.jit.si";
  try {
    expectedOrigin = new URL(iframe.src).origin;
  } catch {
    // Keep default meet.jit.si origin fallback
  }

  const sendReadyAck = () => {
    try {
      iframe.contentWindow?.postMessage(
        JSON.stringify({ postis: true, scope, method: "__ready__" }),
        expectedOrigin,
      );
    } catch {
      // Ignore cross-origin frame teardown races
    }
  };

  let ended = false;
  const triggerEnd = () => {
    if (ended) return;
    ended = true;
    onCallEnded();
  };

  const handleMessage = (event: MessageEvent) => {
    if (event.origin !== expectedOrigin && !event.origin.endsWith(".jit.si")) {
      return;
    }
    if (event.source && iframe.contentWindow && event.source !== iframe.contentWindow) {
      return;
    }
    if (typeof event.data !== "string") return;

    let payload: {
      postis?: boolean;
      scope?: string;
      method?: string;
      params?: { type?: string; name?: string };
    } | null = null;
    try {
      payload = JSON.parse(event.data);
    } catch {
      return;
    }
    if (!payload || !payload.postis || payload.scope !== scope) return;

    if (payload.method === "__ready__") {
      sendReadyAck();
      return;
    }

    if (
      payload.method === "message" &&
      payload.params?.name &&
      CALL_ENDED_EVENTS.has(payload.params.name)
    ) {
      triggerEnd();
    }
  };

  window.addEventListener("message", handleMessage);
  iframe.addEventListener("load", sendReadyAck);
  sendReadyAck();

  return () => {
    window.removeEventListener("message", handleMessage);
    iframe.removeEventListener("load", sendReadyAck);
  };
}
