"use client";

import { useEffect, useRef, useState } from "react";

export interface UseCameraResult {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  ready: boolean;
  /** True when the camera could not be started (permissions, no device). */
  failed: boolean;
}

/**
 * Opens a getUserMedia video stream attached to a <video> element.
 * Cleans up the stream when the component unmounts. Pass `enabled=false`
 * while the video element is not yet rendered (e.g. behind a form stage);
 * capture starts once it flips to true.
 */
export function useCamera(
  facingMode: "user" | "environment" = "environment",
  enabled = true,
): UseCameraResult {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    let stream: MediaStream | null = null;
    let cancelled = false;

    async function start() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: facingMode } },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => undefined);
          setReady(true);
        }
      } catch {
        setFailed(true);
      }
    }

    void start();
    return () => {
      cancelled = true;
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [facingMode, enabled]);

  return { videoRef, ready, failed };
}
