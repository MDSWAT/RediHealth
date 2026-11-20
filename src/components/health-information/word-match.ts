/**
 * Forgiving word search for the dictionary and the article list: accents do not matter, the
 * entry whose name matches comes before one that only mentions the word, and one or two wrong
 * letters still find the word.
 */

export function foldForSearch(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** Edit distance between two short words, or `max + 1` as soon as it is known to be larger. */
export function editDistanceWithin(a: string, b: string, max: number): number {
  if (a === b) return 0;
  if (Math.abs(a.length - b.length) > max) return max + 1;
  let previous = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i += 1) {
    const current = [i];
    let rowMin = i;
    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      const value = Math.min(previous[j] + 1, current[j - 1] + 1, previous[j - 1] + cost);
      current.push(value);
      if (value < rowMin) rowMin = value;
    }
    if (rowMin > max) return max + 1;
    previous = current;
  }
  return previous[b.length];
}

function allowedTypos(length: number): number {
  if (length < 4) return 0;
  return length >= 8 ? 2 : 1;
}

/** True when a word of `text` is the query with one wrong letter (two for long words). */
export function hasNearWord(foldedQuery: string, foldedText: string): boolean {
  const max = allowedTypos(foldedQuery.length);
  if (max === 0) return false;
  for (const word of foldedText.split(/[^\p{L}\p{N}]+/u)) {
    if (!word) continue;
    // A longer word may simply start with what was typed so far, give or take a letter.
    const candidate = word.length > foldedQuery.length ? word.slice(0, foldedQuery.length) : word;
    if (editDistanceWithin(foldedQuery, candidate, max) <= max) return true;
    if (candidate !== word && editDistanceWithin(foldedQuery, word, max) <= max) return true;
  }
  return false;
}

/**
 * How well an entry answers a search, 0 meaning "not at all". `names` are what the entry is
 * called; `body` is the rest of its text.
 *
 * 5: a name starts with the query. 4: a name contains it. 3: the text mentions it.
 * 2: a name is the query with a typing mistake. Nothing lower is shown.
 */
export function scoreWordMatch(query: string, names: readonly string[], body = ""): number {
  const q = foldForSearch(query);
  if (!q) return 1;
  const foldedNames = names.map(foldForSearch);
  if (foldedNames.some((name) => name.startsWith(q) || name.split(/[^\p{L}\p{N}]+/u).some((w) => w.startsWith(q)))) {
    return 5;
  }
  if (foldedNames.some((name) => name.includes(q))) return 4;
  if (body && foldForSearch(body).includes(q)) return 3;
  if (foldedNames.some((name) => hasNearWord(q, name))) return 2;
  return 0;
}

/** Entries that answer the query, best first; ties keep their original order. */
export function rankByWordMatch<T>(
  items: readonly T[],
  query: string,
  describe: (item: T) => { names: readonly string[]; body?: string },
): T[] {
  if (!foldForSearch(query)) return [...items];
  return items
    .map((item, index) => {
      const { names, body } = describe(item);
      return { item, index, score: scoreWordMatch(query, names, body) };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .map((entry) => entry.item);
}
