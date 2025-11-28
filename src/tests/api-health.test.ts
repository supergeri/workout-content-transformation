// ui/src/tests/api-health.test.ts
import { describe, it, expect } from "vitest";

// Gate to avoid hitting real services unless explicitly enabled.
const runIntegration = process.env.VITE_RUN_API_HEALTH_TESTS === "true";

type ServiceConfig = {
  name: string;
  envVar: string;
};

/**
 * NOTE:
 * - mapper-api and garmin-sync-api are wired and running.
 * - calendar-api is still under development, so we do NOT include it here yet.
 *   When calendar-api has a real /health endpoint running in dev/docker:
 *
 *   1) Add this back into the array:
 *      { name: "calendar-api", envVar: "VITE_CALENDAR_API_URL" },
 *   2) Ensure VITE_CALENDAR_API_URL is set in your env.
 */
const services: ServiceConfig[] = [
  { name: "mapper-api", envVar: "VITE_MAPPER_API_URL" },
  // { name: "calendar-api", envVar: "VITE_CALENDAR_API_URL" }, // TODO: enable when ready
  { name: "garmin-sync-api", envVar: "VITE_GARMIN_SYNC_API_URL" },
];

type ResolvedService = {
  name: string;
  envVar: string;
  baseUrl: string;
};

const resolvedServices: ResolvedService[] = services
  .map((svc) => {
    const baseUrl = process.env[svc.envVar];
    if (!baseUrl) return null;
    return { ...svc, baseUrl };
  })
  .filter(Boolean) as ResolvedService[];

if (!runIntegration || resolvedServices.length === 0) {
  // Keep this suite visible in test output, but skipped by default.
  describe.skip(
    "API health integration (mapper-api, calendar-api, garmin-sync-api)",
    () => {
      it(
        "skipped: set VITE_RUN_API_HEALTH_TESTS and base URLs to enable",
        () => {
          expect(true).toBe(true);
        }
      );
    }
  );
} else {
  describe(
    "API health integration (mapper-api, calendar-api, garmin-sync-api)",
    () => {
      for (const svc of resolvedServices) {
        it(`${svc.name} responds OK on /health`, async () => {
          const base = svc.baseUrl.replace(/\/$/, "");
          const res = await fetch(`${base}/health`);

          expect(
            res.ok,
            `${svc.name} /health returned ${res.status} ${res.statusText}`
          ).toBe(true);
        });
      }
    }
  );
}