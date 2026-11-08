/*
 * Caption cue types for the topic caption scripts (src/lib/media/topic-media-registry.ts).
 * The animated sidebar card that rendered these captions was removed from the topic pages
 * (it duplicated each page's main explainer); only the data types remain.
 */

export interface WordCue {
  word: string;
  start: number;
  end: number;
}

export interface SubtitleCue {
  start: number;
  end: number;
  text: string;
  words?: WordCue[];
}
