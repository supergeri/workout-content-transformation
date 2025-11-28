export type IngestSourceType = "youtube" | "image" | "text";

export interface IngestRequest {
  sourceType: IngestSourceType;
  url?: string;
  // later you can extend with: imageUrls, rawText, etc.
}

export interface IngestExercise {
  name: string;
  sets: number | null;
  reps: number | null;
  reps_range: string | null;
  duration_sec: number | null;
  rest_sec: number | null;
  distance_m: number | null;
  distance_range: string | null;
  type: string;
  notes: string | null;
}

export interface IngestBlock {
  label: string | null;
  structure: string | null;
  exercises: IngestExercise[];
  rounds: number | null;
  sets: number | null;
  time_cap_sec: number | null;
  time_work_sec: number | null;
  time_rest_sec: number | null;
  rest_between_rounds_sec: number | null;
  rest_between_sets_sec: number | null;
  rest_between_sec: number | null;
  default_reps_range: string | null;
  default_sets: number | null;
  supersets?: {
    exercises: IngestExercise[];
    rest_between_sec: number | null;
  }[];
}

export interface IngestResponse {
  title: string;
  source: string;
  blocks: IngestBlock[];
  _provenance?: Record<string, unknown>;
}

function getEnv() {
  const viteEnv = (import.meta as any).env || {};
  const nodeEnv =
    (globalThis as any).process?.env ||
    (globalThis as any).process?.ENV ||
    {};

  return { viteEnv, nodeEnv };
}

function getIngestBaseUrl(): string {
  const { viteEnv, nodeEnv } = getEnv();
  const raw =
    (viteEnv.VITE_WORKOUT_INGESTOR_API_URL as string | undefined) ||
    (nodeEnv.VITE_WORKOUT_INGESTOR_API_URL as string | undefined);

  if (!raw) {
    throw new Error(
      "VITE_WORKOUT_INGESTOR_API_URL is not configured. " +
        "Set it in your .env or export it before running ingest E2E tests or UI flows."
    );
  }

  return raw.replace(/\/$/, "");
}

function getClientTimeoutMs(): number {
  const { viteEnv, nodeEnv } = getEnv();
  const raw =
    (viteEnv.VITE_INGEST_CLIENT_TIMEOUT_MS as string | undefined) ||
    (nodeEnv.VITE_INGEST_CLIENT_TIMEOUT_MS as string | undefined) ||
    "20000";

  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 20000;
}

/**
 * Thin client around the workout ingest service.
 *
 * Contract:
 *  - For `sourceType: "youtube"`, we POST to `${baseUrl}/ingest/youtube`
 *    with `{ sourceType: "youtube", url }`.
 */
export async function ingestWorkout(
  payload: IngestRequest
): Promise<IngestResponse> {
  const baseUrl = getIngestBaseUrl();
  const timeoutMs = getClientTimeoutMs();

  const url = String(payload.url || "");

  const path =
    payload.sourceType === "youtube"
      ? `${baseUrl}/ingest/youtube`
      : `${baseUrl}/ingest`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  let res: Response;
  try {
    res = await fetch(path, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
  } catch (err: any) {
    if (err?.name === "AbortError") {
      throw new Error(
        `Ingest request to ${path} timed out after ${timeoutMs}ms for URL: ${url}`
      );
    }

    throw new Error(
      `Ingest request to ${path} failed for URL: ${url} – ${String(err)}`
    );
  } finally {
    clearTimeout(timeoutId);
  }

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `Ingest failed: ${res.status} ${res.statusText} for ${url}${
        text ? ` – ${text}` : ""
      }`
    );
  }

  const json = (await res.json()) as IngestResponse;
  return json;
}
