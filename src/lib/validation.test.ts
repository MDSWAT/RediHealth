import { describe, expect, it } from "vitest";
import {
  isPatientPriority,
  isPatientStatus,
  isValidRasterImageDataUrl,
  sanitizeRasterDownloadFilename,
  validateFollowupInput,
  validatePhotoInput,
} from "@/lib/validation";

describe("enum guards", () => {
  it("accepts only known priorities", () => {
    expect(isPatientPriority("critical")).toBe(true);
    expect(isPatientPriority("urgent")).toBe(false);
    expect(isPatientPriority(42)).toBe(false);
  });

  it("accepts only known statuses", () => {
    expect(isPatientStatus("active")).toBe(true);
    expect(isPatientStatus("deleted")).toBe(false);
  });
});

describe("validateFollowupInput", () => {
  it("accepts a well-formed follow-up and re-derives safe fields", () => {
    const result = validateFollowupInput({
      title: "  Recovery check  ",
      date: "2026-01-15",
      status: "scheduled",
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.title).toBe("Recovery check");
      expect(result.value.reminder_set).toBe(true);
    }
  });

  it("rejects a missing title", () => {
    expect(validateFollowupInput({ date: "2026-01-15" }).ok).toBe(false);
  });

  it("rejects an invalid date", () => {
    expect(validateFollowupInput({ title: "x", date: "15/01/2026" }).ok).toBe(false);
  });

  it("rejects non-objects", () => {
    expect(validateFollowupInput("nope").ok).toBe(false);
  });

  it("falls back to 'scheduled' for an unknown status", () => {
    const result = validateFollowupInput({
      title: "x",
      date: "2026-01-15",
      status: "bogus",
    });
    expect(result.ok && result.value.status).toBe("scheduled");
  });
});

describe("validatePhotoInput", () => {
  const dataUrl = "data:image/png;base64,iVBORw0KGgo=";

  it("accepts an image data URL", () => {
    const result = validatePhotoInput({ data_url: dataUrl, name: "Scan" });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.name).toBe("Scan");
    }
  });

  it("rejects a non-image data URL", () => {
    expect(validatePhotoInput({ data_url: "data:text/plain;base64,AAAA" }).ok).toBe(
      false,
    );
  });

  it("rejects an oversized payload", () => {
    const huge = `data:image/png;base64,${"A".repeat(7_000_001)}`;
    expect(validatePhotoInput({ data_url: huge }).ok).toBe(false);
  });

  it("rejects SVG uploads and spoofed non-raster magic bytes", () => {
    const svgBase64 = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>').toString("base64");
    expect(validatePhotoInput({ data_url: `data:image/svg+xml;base64,${svgBase64}`, name: "lab.svg" }).ok).toBe(false);
    expect(validatePhotoInput({ data_url: "data:image/svg+xml,<svg onload=alert(1)>", name: "lab.svg" }).ok).toBe(false);
    expect(validatePhotoInput({ data_url: `data:image/png;base64,${svgBase64}`, name: "spoofed.png" }).ok).toBe(false);
    expect(validatePhotoInput({ data_url: "data:image/png;base64,AAAA", name: "bad-magic.png" }).ok).toBe(false);
  });

  it("accepts valid JPEG, WebP, and GIF magic headers", () => {
    const jpeg = `data:image/jpeg;base64,${Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10]).toString("base64")}`;
    const webp = `data:image/webp;base64,${Buffer.from("RIFF\x24\x00\x00\x00WEBPVP8 ").toString("base64")}`;
    const gif = `data:image/gif;base64,${Buffer.from("GIF89a\x01\x00\x01\x00").toString("base64")}`;
    expect(isValidRasterImageDataUrl(jpeg)).toBe(true);
    expect(isValidRasterImageDataUrl(webp)).toBe(true);
    expect(isValidRasterImageDataUrl(gif)).toBe(true);
    expect(validatePhotoInput({ data_url: jpeg, name: "photo.jpg" }).ok).toBe(true);
    expect(validatePhotoInput({ data_url: webp, name: "photo.webp" }).ok).toBe(true);
    expect(validatePhotoInput({ data_url: gif, name: "photo.gif" }).ok).toBe(true);
  });

  it("sanitizes download filenames to force safe raster extensions", () => {
    const jpeg = `data:image/jpeg;base64,${Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10]).toString("base64")}`;
    expect(sanitizeRasterDownloadFilename("lab.svg", dataUrl)).toBe("lab.png");
    expect(sanitizeRasterDownloadFilename("../../evil.html", jpeg)).toBe(".. .. evil.jpg");
    expect(sanitizeRasterDownloadFilename("Scan", dataUrl)).toBe("Scan.png");
  });
});
