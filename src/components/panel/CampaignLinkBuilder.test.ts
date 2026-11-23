import { describe, expect, it } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { CampaignLinkBuilder } from "@/components/panel/CampaignLinkBuilder";
import { buildCampaignLink, mediumFor, slugify, validateCampaignLink } from "@/lib/campaign-links";
import { analyticsTranslations } from "@/lib/i18n/analytics-translations";
import { campaignFromSearch, cleanPagePath } from "@/lib/analytics";
import { languages } from "@/lib/i18n/languages";
import { formatDuration } from "@/components/panel/SavedCampaignLinks";

describe("campaign link builder", () => {
  it("turns campaign names into the lower-case form the statistics group by", () => {
    expect(slugify("Lansare Primăvara 2027!")).toBe("lansare-primavara-2027");
    expect(slugify("  Ștefan & Țara  ")).toBe("stefan-tara");
    expect(slugify("---")).toBe("");
  });

  it("uses the usual utm_medium names", () => {
    expect(mediumFor("social", "paid")).toBe("paid_social");
    expect(mediumFor("social", "free")).toBe("social");
    expect(mediumFor("search", "paid")).toBe("cpc");
    expect(mediumFor("messaging", "paid")).toBe("messaging");
    expect(mediumFor("print", "free")).toBe("print");
    expect(mediumFor("custom", "free")).toBe("referral");
  });

  it("builds links on redi.healthcare that the statistics read back exactly", () => {
    const url = buildCampaignLink({ lang: "ro", path: "/get-help", source: "instagram", medium: "paid_social", campaign: "lansare-2027", content: "video-1" });
    expect(url).toBe("https://redi.healthcare/ro/get-help?utm_source=instagram&utm_medium=paid_social&utm_campaign=lansare-2027&utm_content=video-1");
    const parsed = new URL(url);
    expect(cleanPagePath(parsed.pathname)).toEqual({ path: "/get-help", lang: "ro" });
    expect(campaignFromSearch(parsed.search)).toEqual({
      utm_source: "instagram",
      utm_medium: "paid_social",
      utm_campaign: "lansare-2027",
      utm_content: "video-1",
    });
    expect(buildCampaignLink({ lang: "en", path: "/", source: "google", medium: "cpc", campaign: "x" })).toBe(
      "https://redi.healthcare/en?utm_source=google&utm_medium=cpc&utm_campaign=x",
    );
  });

  it("renders in every language without missing text", () => {
    for (const { code } of languages) {
      const t = analyticsTranslations[code];
      for (const [key, value] of Object.entries(t)) {
        if (typeof value === "string") expect(value, `${code}.${key}`).not.toBe("");
      }
      const html = renderToStaticMarkup(createElement(CampaignLinkBuilder, { t, lang: code }));
      expect(html).toContain(t.campaignName);
      expect(html).toContain("Instagram");
      expect(html).toContain(t.needCampaign);
    }
  });

  it("only accepts links to our own pages and rebuilds the URL on the server", () => {
    const good = { label: "Instagram", lang: "ro", path: "/get-help", source: "instagram", medium: "paid_social", campaign: "lansare-2027", content: "video-1" };
    expect(validateCampaignLink(good)).toEqual({
      ...good,
      url: "https://redi.healthcare/ro/get-help?utm_source=instagram&utm_medium=paid_social&utm_campaign=lansare-2027&utm_content=video-1",
    });
    expect(validateCampaignLink({ ...good, content: "" })?.content).toBeNull();
    expect(validateCampaignLink({ ...good, url: "https://evil.example" })?.url).toContain("https://redi.healthcare/");
    for (const bad of [
      { ...good, path: "https://evil.example" },
      { ...good, path: "/panel" },
      { ...good, lang: "de" },
      { ...good, medium: "anything" },
      { ...good, source: "Insta Gram" },
      { ...good, campaign: "a\"><script>" },
      { ...good, campaign: "" },
      { ...good, label: "   " },
      null,
      "text",
    ]) {
      expect(validateCampaignLink(bad)).toBeNull();
    }
  });

  it("formats time on site as minutes and seconds", () => {
    expect(formatDuration(null)).toBe("–");
    expect(formatDuration(5)).toBe("0:05");
    expect(formatDuration(125.4)).toBe("2:05");
  });
});
