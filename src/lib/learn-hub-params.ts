/**
 * The tabs of the "Learn and test yourself" page and how its address names them. A plain module
 * (no "use client"), so the page can read the address on the server and draw the right tab first.
 */

export const LEARN_HUB_TABS = ["guides", "topics", "quiz", "dictionary"] as const;
export type LearnHubTab = (typeof LEARN_HUB_TABS)[number];

export interface LearnHubInitialState {
  /** Tab named in the address (`?tab=`). */
  initialTab?: LearnHubTab;
  initialDictionarySub?: "dictionary" | "romanes";
  /** Word to look up in the dictionary straight away (`?q=`), for links from the site search. */
  initialDictionaryQuery?: string;
  /** Topic group to show open on the "All topics" tab (`?cat=`), for the way back from an article. */
  initialTopicCategory?: string;
}

/** Turns the `?tab=`, `?sub=`, `?q=` and `?cat=` of the page address into the hub's starting state. */
export function learnHubPropsFromSearchParams(params: {
  [key: string]: string | string[] | undefined;
}): LearnHubInitialState {
  const one = (value: string | string[] | undefined) => (typeof value === "string" ? value : undefined);
  const tab = one(params.tab);
  const query = one(params.q)?.trim().slice(0, 80) || undefined;
  const category = one(params.cat)?.trim().slice(0, 60) || undefined;
  if (tab === "romanes") {
    return { initialTab: "dictionary", initialDictionarySub: "romanes", initialDictionaryQuery: query };
  }
  if (tab === "dictionary") {
    return {
      initialTab: "dictionary",
      initialDictionarySub: one(params.sub) === "romanes" ? "romanes" : "dictionary",
      initialDictionaryQuery: query,
    };
  }
  if (tab === "quiz") return { initialTab: "quiz" };
  if (tab === "topics") return { initialTab: "topics", initialTopicCategory: category };
  if (tab === "guides") return { initialTab: "guides" };
  return {};
}
