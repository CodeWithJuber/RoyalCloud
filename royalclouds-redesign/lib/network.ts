import { logger } from "./logger";

export type FetchWithRetryOptions = RequestInit & {
  timeoutMs?: number;
  retries?: number;
  baseDelayMs?: number;
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const jitter = (baseMs: number, attempt: number) => {
  const exponential = baseMs * 2 ** attempt;
  const random = Math.floor(Math.random() * Math.max(50, baseMs));
  return exponential + random;
};

export async function fetchWithRetry(url: string, options: FetchWithRetryOptions = {}) {
  const parsed = new URL(url);
  if (parsed.protocol !== "https:") {
    throw new Error("Only HTTPS URLs are allowed for outbound requests.");
  }

  const timeoutMs = options.timeoutMs ?? 6000;
  const retries = options.retries ?? 2;
  const baseDelayMs = options.baseDelayMs ?? 250;
  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      logger.info("fetch_attempt", { host: parsed.host, attempt });
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          "User-Agent": "royalclouds-redesign/1.0",
          Accept: "text/html,application/json;q=0.9,*/*;q=0.8",
          ...options.headers
        }
      });

      if (response.status === 429 || response.status >= 500) {
        throw new Error(`Upstream responded with ${response.status}`);
      }

      return response;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error("Unknown network error");
      logger.warn("fetch_retryable_error", { host: parsed.host, attempt, message: lastError.message });

      if (attempt === retries) {
        break;
      }

      await sleep(jitter(baseDelayMs, attempt));
    } finally {
      clearTimeout(timeout);
    }
  }

  throw new Error(`Request failed after ${retries + 1} attempts: ${lastError?.message ?? "unknown error"}`);
}
