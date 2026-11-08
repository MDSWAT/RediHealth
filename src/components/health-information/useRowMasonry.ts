"use client";

import { useLayoutEffect, type RefObject } from "react";

const ROW_UNIT = 4;

/**
 * Masonry that keeps reading order row-first. The list stays a normal CSS grid in DOM order
 * (so Tab and screen readers go left to right, row by row); each item spans as many small rows
 * as its content needs, which packs cards of different heights without gaps.
 * Without JavaScript, or in a single column, it is a plain grid.
 */
export function useRowMasonry(listRef: RefObject<HTMLElement | null>, deps: unknown[]) {
  useLayoutEffect(() => {
    const list = listRef.current;
    if (!list) return;

    const layout = () => {
      const items = Array.from(list.children) as HTMLElement[];
      items.forEach((item) => {
        item.style.gridColumn = "";
        item.style.gridRow = "";
        item.style.gridRowEnd = "";
      });
      list.style.gridAutoRows = "";
      list.style.rowGap = "";

      const columns = getComputedStyle(list).gridTemplateColumns.split(" ").filter(Boolean).length;
      if (columns < 2) {
        return;
      }
      // The vertical gap becomes empty rows between stacked cards in each column.
      const gap = parseFloat(getComputedStyle(list).columnGap) || 16;
      const gapRows = Math.round(gap / ROW_UNIT);
      const heights = items.map((item) => {
        const content = item.firstElementChild as HTMLElement | null;
        return content ? content.getBoundingClientRect().height : 0;
      });

      list.style.gridAutoRows = `${ROW_UNIT}px`;
      list.style.rowGap = "0px";

      const colNextRow = new Array<number>(columns).fill(1);
      items.forEach((item, index) => {
        const col = index % columns;
        const startRow = colNextRow[col];
        const rowSpan = Math.max(1, Math.ceil(heights[index] / ROW_UNIT));
        item.style.gridColumn = `${col + 1}`;
        item.style.gridRow = `${startRow} / span ${rowSpan}`;
        colNextRow[col] = startRow + rowSpan + gapRows;
      });
    };

    layout();
    const observer = new ResizeObserver(layout);
    observer.observe(list);
    Array.from(list.children).forEach((item) => item.firstElementChild && observer.observe(item.firstElementChild));
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- re-run when the visible items change
  }, deps);
}
