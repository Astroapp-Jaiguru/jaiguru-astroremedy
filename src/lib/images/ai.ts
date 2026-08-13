
/**
 * AI image generation for niche products Unsplash cannot match.
 * Primary provider: OpenAI DALL-E 3 (returns base64 PNG directly).
 * Fallback: Replicate Flux.1.1 Pro (returns URL we can fetch once).
 * Every image is downloaded/saved into SiteImage so we always own the bytes
 * and never hotlink a provider URL.
 */

export interface GeneratedImage {
  bytes: Buffer;
  mimeType: string;
  width: number;
  height: number;
}

const AI_PROMPT =
  "A high-resolution, crisp commercial product photograph of %TITLE%, " +
  "professional studio lighting, clean solid background, sharp focus, " +
  "natural textures, photorealistic, no watermarks, no text, premium " +
  "e-commerce style.";

export function buildPrompt(title: string): string {
  const clean = title.replace(/\s+/g, " ").trim().slice(0, 90);
  return AI_PROMPT.replace("%TITLE%", clean);
}

/** Generate via OpenAI DALL-E 3. Resolves null when the key is missing. */
export async function generateWithDalle(
  prompt: string,
  timeoutMs = 20000
): Promise<GeneratedImage | null> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;

  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "dall-e-3",
        prompt,
        n: 1,
        size: "1024x1024",
        response_format: "b64_json",
      }),
      signal: controller.signal,
    });
    if (!res.ok) {
      console.error("[images] DALL-E error", res.status, await res.text());
      return null;
    }
    const body = (await res.json()) as {
      data?: Array<{ b64_json?: string }>;
    };
    const b64 = body.data?.[0]?.b64_json;
    if (!b64) return null;
    return {
      bytes: Buffer.from(b64, "base64"),
      mimeType: "image/png",
      width: 1024,
      height: 1024,
    };
  } catch (e) {
    console.error("[images] DALL-E fetch failed:", e);
    return null;
  } finally {
    clearTimeout(t);
  }
}

interface ReplicateResponse {
  id?: string;
  urls?: { get?: string };
  status?: string;
  output?: string | string[];
  error?: string | null;
}

/**
 * Fallback: Flux.1.1 Pro on Replicate. We poll the prediction until it
 * completes, then download the output image. Consumers pass the token for
 * both create + poll + download so no extra config is needed.
 */
export async function generateWithFlux(
  prompt: string,
  timeoutMs = 25000
): Promise<GeneratedImage | null> {
  const token = process.env.REPLICATE_API_TOKEN;
  if (!token) return null;

  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const create = await fetch(
      "https://api.replicate.com/v1/models/black-forest-labs/flux-1.1-pro/predictions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Prefer: "wait=10",
        },
        body: JSON.stringify({
          input: { prompt, aspect_ratio: "1:1", output_format: "png" },
        }),
        signal: controller.signal,
      }
    );
    if (!create.ok) {
      console.error("[images] Flux create error", create.status);
      return null;
    }
    const job = (await create.json()) as ReplicateResponse;
    if (job.error) {
      console.error("[images] Flux job error:", job.error);
      return null;
    }

    const getUrl = job.urls?.get;
    if (!getUrl) return null;

    let output: string | string[] | undefined;
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
      const poll = await fetch(getUrl, {
        headers: { Authorization: `Bearer ${token}` },
        signal: controller.signal,
      });
      if (!poll.ok) break;
      const state = (await poll.json()) as ReplicateResponse;
      if (state.status === "succeeded") {
        output = state.output;
        break;
      }
      if (state.status === "failed") {
        console.error("[images] Flux failed:", state.error);
        return null;
      }
      await new Promise((r) => setTimeout(r, 1500));
    }
    const outUrl = typeof output === "string" ? output : output?.[0];
    if (!outUrl) return null;

    const img = await fetch(outUrl, { signal: controller.signal });
    if (!img.ok) return null;
    const bytes = Buffer.from(await img.arrayBuffer());
    return { bytes, mimeType: "image/png", width: 1024, height: 1024 };
  } catch (e) {
    console.error("[images] Flux fetch failed:", e);
    return null;
  } finally {
    clearTimeout(t);
  }
}

/** DALL-E first, Flux as fallback. Returns null when nothing works. */
export async function generateImage(prompt: string): Promise<GeneratedImage | null> {
  const dall = await generateWithDalle(prompt);
  if (dall) return dall;
  return generateWithFlux(prompt);
}