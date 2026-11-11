export type PhonePlatform = "ios" | "android" | null;

type NavigatorLike = {
  userAgent?: string;
  platform?: string;
  maxTouchPoints?: number;
  userAgentData?: { platform?: string };
};

/**
 * Whether this is an iPhone/iPad or an Android device, so "Copy to notes" can hand the note to
 * the phone's own share sheet (Notes, Keep, Samsung Notes). A desktop browser returns null and
 * only copies.
 * - Android: the UA-CH platform when the browser gives one, else "Android" in the user agent.
 * - iPhone, iPod, iPad: the user agent. An iPad that asks for desktop sites calls itself a Mac,
 *   so a "Mac" with a touch screen counts as iOS too.
 */
export function detectPhonePlatform(nav: NavigatorLike | undefined = globalThis.navigator): PhonePlatform {
  if (!nav) return null;
  const ua = nav.userAgent ?? "";
  if (nav.userAgentData?.platform === "Android" || /Android/i.test(ua)) return "android";
  if (/iPhone|iPad|iPod/i.test(ua)) return "ios";
  if (/Mac/i.test(nav.platform ?? "") && (nav.maxTouchPoints ?? 0) > 1) return "ios";
  return null;
}
