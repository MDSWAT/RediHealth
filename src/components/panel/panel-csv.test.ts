import { describe, expect, it } from "vitest";
import { csvCell, csvTimestamp, toCsv } from "./panel-csv";

describe("panel CSV export", () => {
  it("quotes every cell and escapes quotes", () => {
    expect(csvCell('Ana "Ani" Pop')).toBe('"Ana ""Ani"" Pop"');
    expect(csvCell(null)).toBe('""');
    expect(toCsv(["Nume", "Telefon"], [["Ștefan", "0722"]])).toBe('"Nume","Telefon"\r\n"Ștefan","0722"');
  });

  it("neutralises spreadsheet formulas but keeps phone numbers intact", () => {
    expect(csvCell("=HYPERLINK(1)")).toBe(`"'=HYPERLINK(1)"`);
    expect(csvCell("@SUM(A1)")).toBe(`"'@SUM(A1)"`);
    expect(csvCell("-2+3")).toBe(`"'-2+3"`);
    expect(csvCell("+40 712 345 678")).toBe('"+40 712 345 678"');
  });

  it("writes a local sortable timestamp and leaves invalid input alone", () => {
    expect(csvTimestamp(new Date(2026, 10, 7, 9, 5).toISOString())).toBe("2026-11-07 09:05");
    expect(csvTimestamp("not a date")).toBe("not a date");
  });
});
