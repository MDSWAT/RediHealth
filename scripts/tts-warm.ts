import { collectSpokenSegments } from "@/components/health-check/spoken-segments";
import {
  isAzureTtsConfigured,
  synthesizeAzureMp3,
  TtsQuotaExceededError,
} from "@/lib/audio/azure-tts";
import { SUPPORTED_TTS_LANGS } from "@/lib/audio/tts-voices";

const F0_PACING_DELAY_MS = 3500;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  if (!process.env.AZURE_SPEECH_KEY?.trim() || !isAzureTtsConfigured()) {
    console.log(
      [
        "Skipping TTS cache warm: AZURE_SPEECH_KEY (or AZURE_SPEECH_REGION) is not set.",
        "To pre-warm Azure Speech neural MP3 segments into cache:",
        "  1. Add AZURE_SPEECH_KEY and AZURE_SPEECH_REGION to .env.local",
        "  2. Optionally add TTS_R2_ACCOUNT_ID, TTS_R2_ACCESS_KEY_ID, TTS_R2_SECRET_ACCESS_KEY, TTS_R2_BUCKET",
        "  3. Run: npm run tts:warm",
      ].join("\n"),
    );
    return;
  }

  let total = 0;
  let cachedCount = 0;
  let synthesizedCount = 0;
  let failedCount = 0;

  for (const lang of SUPPORTED_TTS_LANGS) {
    const segments = collectSpokenSegments(lang);
    console.log(`Warming ${segments.length} segments for '${lang}'...`);

    for (const segment of segments) {
      total += 1;
      try {
        const result = await synthesizeAzureMp3({ lang, text: segment });
        if (result.cached) {
          cachedCount += 1;
        } else {
          synthesizedCount += 1;
          // Stay below Azure Speech F0's 20 requests/minute ceiling after live synthesis.
          await sleep(F0_PACING_DELAY_MS);
        }
      } catch (error) {
        if (error instanceof TtsQuotaExceededError) {
          console.error(
            `Azure Speech F0 quota exceeded (429) while warming '${lang}'. Stopping early.`,
          );
          console.log(
            `Summary: ${total} visited, ${synthesizedCount} synthesized, ${cachedCount} cached, ${failedCount} failed.`,
          );
          process.exitCode = 1;
          return;
        }
        failedCount += 1;
        console.warn(`Failed segment in '${lang}':`, error);
      }
    }
  }

  console.log(
    `TTS warm complete: ${total} segments checked, ${synthesizedCount} synthesized, ${cachedCount} already cached, ${failedCount} failed.`,
  );
  if (failedCount > 0) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error("TTS warm failed:", error);
  process.exitCode = 1;
});
