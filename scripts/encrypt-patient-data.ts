/**
 * Encrypts patient fields that were stored as plaintext before DATA_ENCRYPTION_KEY_<CC> was set.
 * Safe to run repeatedly: values that are already encrypted are left alone.
 *
 *   npm run encrypt:patients -- RO       # one country
 *   npm run encrypt:patients -- RO IT    # several
 */
import { existsSync } from "node:fs";
import { parseCountry, type CountryCode } from "@/lib/countries";

for (const file of [".env.local", ".env"]) {
  if (existsSync(file)) process.loadEnvFile(file);
}

const BATCH_SIZE = 50;

async function encryptCountry(country: CountryCode) {
  const { getCountryDatabase } = await import("@/lib/database");
  const { encryptField, isEncrypted, isEncryptionConfigured } = await import("@/lib/security/field-encryption");

  if (!isEncryptionConfigured(country)) {
    throw new Error(`DATA_ENCRYPTION_KEY_${country} is not set; nothing would be encrypted.`);
  }

  const db = getCountryDatabase(country);
  let lastId = 0;
  let updated = 0;

  for (;;) {
    const [rows] = await db.query<
      { id: number; medical_history: string | null; profile_photo: string | null; photos: string | null }[] & import("@/lib/database").RowDataPacket[]
    >(
      "SELECT id, medical_history, profile_photo, photos FROM patients WHERE id > ? ORDER BY id LIMIT ?",
      [lastId, BATCH_SIZE],
    );
    if (rows.length === 0) break;

    for (const row of rows) {
      lastId = row.id;
      const pending = [row.medical_history, row.profile_photo, row.photos].some((value) => value && !isEncrypted(value));
      if (!pending) continue;

      await db.query("UPDATE patients SET medical_history = ?, profile_photo = ?, photos = ? WHERE id = ?", [
        encryptField(country, row.medical_history),
        encryptField(country, row.profile_photo),
        encryptField(country, row.photos),
        row.id,
      ]);
      updated += 1;
    }
  }

  console.log(`${country}: encrypted ${updated} patient record(s).`);
}

async function main() {
  const requested = process.argv.slice(2).map(parseCountry);
  if (requested.length === 0 || requested.includes(null)) {
    throw new Error("Usage: npm run encrypt:patients -- <country code> [<country code> ...]");
  }

  for (const country of requested as CountryCode[]) {
    await encryptCountry(country);
  }
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
