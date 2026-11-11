import { describe, expect, it } from "vitest";
import { detectPhonePlatform } from "./phone-platform";

describe("detectPhonePlatform", () => {
  it("recognises an iPhone", () => {
    const userAgent =
      "Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1 Mobile/15E148 Safari/604.1";
    expect(detectPhonePlatform({ userAgent, platform: "iPhone", maxTouchPoints: 5 })).toBe("ios");
  });

  it("recognises Chrome on iPhone", () => {
    const userAgent =
      "Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/131.0.0.0 Mobile/15E148 Safari/604.1";
    expect(detectPhonePlatform({ userAgent, platform: "iPhone", maxTouchPoints: 5 })).toBe("ios");
  });

  it("recognises an iPad that asks for desktop sites", () => {
    const userAgent =
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1 Safari/605.1.15";
    expect(detectPhonePlatform({ userAgent, platform: "MacIntel", maxTouchPoints: 5 })).toBe("ios");
  });

  it("recognises Android from the user agent", () => {
    const userAgent =
      "Mozilla/5.0 (Linux; Android 14; SM-A546B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36";
    expect(detectPhonePlatform({ userAgent, platform: "Linux armv81", maxTouchPoints: 5 })).toBe("android");
  });

  it("recognises Android from client hints when the user agent is reduced", () => {
    const userAgent =
      "Mozilla/5.0 (Linux; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36";
    expect(detectPhonePlatform({ userAgent, userAgentData: { platform: "Android" } })).toBe("android");
  });

  it("recognises Samsung Internet and Firefox on Android", () => {
    expect(
      detectPhonePlatform({
        userAgent:
          "Mozilla/5.0 (Linux; Android 13; SAMSUNG SM-S911B) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/25.0 Chrome/121.0.0.0 Mobile Safari/537.36",
      }),
    ).toBe("android");
    expect(
      detectPhonePlatform({ userAgent: "Mozilla/5.0 (Android 14; Mobile; rv:133.0) Gecko/133.0 Firefox/133.0" }),
    ).toBe("android");
  });

  it("treats desktop browsers as not a phone", () => {
    const mac =
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1 Safari/605.1.15";
    const windows =
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";
    expect(detectPhonePlatform({ userAgent: mac, platform: "MacIntel", maxTouchPoints: 0 })).toBeNull();
    expect(detectPhonePlatform({ userAgent: windows, platform: "Win32", maxTouchPoints: 10 })).toBeNull();
    expect(detectPhonePlatform(undefined)).toBeNull();
  });
});
