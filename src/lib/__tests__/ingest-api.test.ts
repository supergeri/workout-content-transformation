import { describe, it, expect } from "vitest";
import { ingestWorkout } from "../api/ingest";

const viteEnv = (import.meta as any).env || {};
const nodeEnv =
  (globalThis as any).process?.env ||
  (globalThis as any).process?.ENV ||
  {};

const runIngestE2E =
  Boolean(viteEnv.VITE_RUN_INGEST_E2E) ||
  Boolean(nodeEnv.VITE_RUN_INGEST_E2E);

const describeMaybe = runIngestE2E ? describe : describe.skip;

const INGEST_TIMEOUT_MS = Number(
  viteEnv.VITE_INGEST_E2E_TIMEOUT_MS ||
    nodeEnv.VITE_INGEST_E2E_TIMEOUT_MS ||
    30000
);

/**
 * When enabled, this will:
 *  - Call the real ingest service (VITE_WORKOUT_INGESTOR_API_URL)
 *  - Send a sample YouTube URL (VITE_INGEST_SAMPLE_YOUTUBE_URL)
 *  - Assert that the response matches the contract (title/source/blocks/provenance)
 *
 * This is your safety net when you refactor the YouTube ingest layer.
 */
describeMaybe("ingest API E2E – YouTube", () => {
  it(
    "ingests a sample YouTube workout URL into a valid response shape",
    async () => {
      const sampleUrl =
        viteEnv.VITE_INGEST_SAMPLE_YOUTUBE_URL ||
        nodeEnv.VITE_INGEST_SAMPLE_YOUTUBE_URL;

      if (!sampleUrl) {
        throw new Error(
          "VITE_INGEST_SAMPLE_YOUTUBE_URL is not set. " +
            "Set it to a known-good workout video URL before running this test."
        );
      }

      const started = Date.now();

      const result = await ingestWorkout({
        sourceType: "youtube",
        url: String(sampleUrl),
      });

      const ms = Date.now() - started;
      // eslint-disable-next-line no-console
      console.log(
        `[ingest-e2e] Completed in ${ms}ms, title="${result.title}", blocks=${Array.isArray(result.blocks) ? result.blocks.length : "N/A"}`
      );

      // Contract checks – keep these loose but meaningful
      expect(typeof result.title).toBe("string");
      expect(result.title.length).toBeGreaterThan(0);

      expect(result.source).toBe(String(sampleUrl));

      expect(Array.isArray(result.blocks)).toBe(true);

      // With your current backend and the Antonio Brown workout, this WILL be > 0
      // but we keep the assertion generic in case some videos return zero blocks.
      // If you want, you can uncomment this line for a stricter check:
      // expect(result.blocks.length).toBeGreaterThan(0);

      expect(result._provenance === undefined || typeof result._provenance === "object").toBe(
        true
      );
    },
    INGEST_TIMEOUT_MS
  );
});
