import { cookies, headers } from "next/headers";
import {
  RegionalHealthRibbonClient,
  type RibbonArticle,
} from "@/components/news/RegionalHealthRibbonClient";
import { ALL_ITALY } from "@/components/ui/romania-county-map-helpers";
import {
  NEWS_ARTICLES,
  articleCountry,
  getLocalizedArticle,
  isCountryWide,
} from "@/lib/data/news";
import { resolveCountyFromHeaders, USER_COUNTY_COOKIE } from "@/lib/geo-ip-server";
import { getRequestLang } from "@/lib/i18n/server-routing";
import { translations } from "@/lib/i18n/translations";

/**
 * RegionalHealthRibbon: server wrapper that localizes news headlines and resolves initial county
 * on the server so the 163 KB news dictionary and 236 KB translations dictionary never ship to
 * the homepage client bundle.
 */
export async function RegionalHealthRibbon() {
  const lang = await getRequestLang();
  const cookieStore = await cookies();
  const requestHeaders = await headers();
  const savedCounty = cookieStore.get(USER_COUNTY_COOKIE)?.value;
  const cookieString = savedCounty ? `${USER_COUNTY_COOKIE}=${encodeURIComponent(savedCounty)}` : undefined;
  const initialCounty = resolveCountyFromHeaders(requestHeaders, cookieString);

  const articles: RibbonArticle[] = NEWS_ARTICLES.map((article) => {
    const localized = getLocalizedArticle(article, lang);
    return {
      slug: localized.slug,
      title: localized.title,
      categoryLabel: localized.categoryLabel,
      county: article.county,
      country: articleCountry(article),
      countryWide: isCountryWide(article),
      hasEpidemicSeverity: Boolean(article.epidemicSeverity),
    };
  });

  const t = translations[lang] ?? translations.ro;
  const nr = t.newsRibbon;

  return (
    <RegionalHealthRibbonClient
      lang={lang}
      initialCounty={initialCounty}
      articles={articles}
      copy={{
        ariaLabel: nr.ariaLabel,
        changeLabel: nr.changeLabel,
        noActiveAlerts: nr.noActiveAlerts,
        allCountiesNational: nr.allCountiesNational,
        viewAllNews: nr.viewAllNews,
        allItaly: t.countyMap?.allItaly ?? ALL_ITALY,
      }}
    />
  );
}
