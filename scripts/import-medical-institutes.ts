/**
 * Imports medical institutes from OpenStreetMap into the database.
 *
 *   npm run import:institutes            # RO, AL and IT
 *   npm run import:institutes -- IT      # a single country
 *
 * Super admins can also run the same import from /panel/institutes.
 */
import { existsSync } from "node:fs";
import { SUPPORTED_COUNTRIES, isSupportedCountry, type CountryCode } from "@/lib/medical-institutes";

if (existsSync(".env")) process.loadEnvFile(".env");

async function main() {
  const { getDatabase } = await import("@/lib/database");
  const { importCountryFromOsm } = await import("@/lib/osm-import");

  const requested = process.argv.slice(2).map((value) => value.toUpperCase());
  const countries: CountryCode[] = requested.length
    ? requested.filter(isSupportedCountry)
    : [...SUPPORTED_COUNTRIES];

  const db = getDatabase();
  for (const country of countries) {
    const started = Date.now();
    console.log(`Importing ${country} from OpenStreetMap…`);
    const result = await importCountryFromOsm(db, country);
    console.log(`  ${country}: ${result.imported} institutes saved in ${Math.round((Date.now() - started) / 1000)}s`);
  }
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
