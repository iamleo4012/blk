"use client";

/**
 * Face-detection helper shared by the selfie-verification and staff
 * registration screens. Uses the native FaceDetector when available,
 * otherwise a chroma-based skin-tone density heuristic that works across
 * skin tones and lighting levels.
 */

/** Minimal shape of the experimental Shape Detection API, where available. */
interface DetectedFace {
  boundingBox: { width: number; height: number };
}
interface FaceDetectorLike {
  detect(source: HTMLCanvasElement): Promise<DetectedFace[]>;
}

export async function detectFace(canvas: HTMLCanvasElement): Promise<boolean> {
  const FaceDetectorCtor = (
    window as unknown as {
      FaceDetector?: new (options?: { fastMode?: boolean }) => FaceDetectorLike;
    }
  ).FaceDetector;
  if (FaceDetectorCtor) {
    try {
      const detector = new FaceDetectorCtor({ fastMode: true });
      const faces = await detector.detect(canvas);
      return faces.length > 0;
    } catch {
      /* fall through to the heuristic */
    }
  }

  // Heuristic: sample the central area and measure skin-tone coverage.
  // The classifier is chroma-based rather than brightness-based so darker
  // skin tones in dim lighting are not excluded.
  const ctx = canvas.getContext("2d");
  if (!ctx) return false;
  const w = Math.floor(canvas.width * 0.5);
  const h = Math.floor(canvas.height * 0.45);
  const x0 = Math.floor(canvas.width * 0.25);
  const y0 = Math.floor(canvas.height * 0.18);
  const data = ctx.getImageData(x0, y0, w, h).data;
  let skin = 0;
  let sampled = 0;
  for (let i = 0; i < data.length; i += 16) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    sampled++;
    // Skin chroma: red-dominant, warm hue, present across all brightness levels.
    if (
      r > 45 &&
      r > g &&
      g >= b - 6 &&
      r - b > 10 &&
      r - g > 4 &&
      r - g < 120
    ) {
      skin++;
    }
  }
  return sampled > 0 && skin / sampled > 0.14;
}
