"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { X, Check } from "lucide-react";
import { useCamera } from "./useCamera";
import { useI18n } from "./I18nProvider";
import { detectFace } from "@/lib/faceDetect";

type Stage = "camera" | "checking" | "retry" | "verified";

/**
 * Start → full-screen selfie verification camera.
 * Layout follows the feature reference: dark charcoal backdrop, headings at
 * the top, mirrored front-camera preview with an oval face guide, and a
 * dark camera-control panel with a double-ring white shutter.
 * Capture runs face detection; on success the caller starts the session
 * via onVerified — the session timer begins only at that moment.
 */
export default function SelfieVerification({
  onClose,
  onVerified,
}: {
  onClose: () => void;
  onVerified: () => void;
}) {
  const { videoRef, ready, failed } = useCamera("user");
  const { t } = useI18n();
  const [stage, setStage] = useState<Stage>("camera");
  const [shotUrl, setShotUrl] = useState<string | null>(null);
  const ovalRef = useRef<HTMLDivElement | null>(null);

  // Keep the retry notice visible for a moment before returning to the camera.
  useEffect(() => {
    if (stage !== "retry") return;
    const t = setTimeout(() => {
      setStage("camera");
      setShotUrl(null);
    }, 2200);
    return () => clearTimeout(t);
  }, [stage]);

  const capture = useCallback(async () => {
    const video = videoRef.current;
    const oval = ovalRef.current;
    if (!video || !ready) return;

    // Grab the mirrored frame at the oval's aspect so the guide matches
    // what the user saw.
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 720;
    canvas.height = video.videoHeight || 1280;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    setShotUrl(canvas.toDataURL("image/jpeg", 0.9));
    setStage("checking");

    const faceFound = await detectFace(canvas);
    setStage(faceFound ? "verified" : "retry");
  }, [videoRef, ready]);

  // Identity verification succeeded — hand off to the main screen, which
  // starts the session (and its timer) from this point onward.
  useEffect(() => {
    if (stage !== "verified") return;
    const t = setTimeout(onVerified, 1400);
    return () => clearTimeout(t);
  }, [stage, onVerified]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[linear-gradient(180deg,#2A2A2E_0%,#1C1C1E_45%,#141416_100%)]">
      {/* Live mirrored preview fills the screen behind the overlays */}
      <video
        ref={videoRef}
        playsInline
        muted
        autoPlay
        className={`absolute inset-0 h-full w-full scale-x-[-1] object-cover transition-opacity duration-500 ${
          ready ? "opacity-100" : "opacity-0"
        }`}
      />

      {stage === "camera" && (
        <>
          {/* Headings */}
          <div className="pointer-events-none absolute inset-x-0 top-[44px] z-10 text-center">
            <h1 className="text-[32px] font-bold leading-tight text-white">
              {t("takeSelfie")}
            </h1>
            <p className="mt-1 text-[19px] text-white/70">
              {t("positionFace")}
            </p>
          </div>

          {/* Oval face-positioning guide */}
          <div
            ref={ovalRef}
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-1/2 z-10 h-[58vh] max-h-[560px] w-[76vw] max-w-[330px] -translate-x-1/2 -translate-y-[56%] rounded-[50%] border-4 border-white"
          />
        </>
      )}

      {/* Status / feedback states */}
      {!ready && !failed && stage === "camera" && (
        <p className="absolute inset-x-0 top-1/2 z-10 -translate-y-1/2 text-center text-[15px] text-white/70">
          {t("startingCamera")}
        </p>
      )}
      {failed && (
        <p className="absolute inset-x-10 top-1/2 z-10 -translate-y-1/2 text-center text-[15px] leading-relaxed text-white/80">
          {t("cameraUnavailable")}
        </p>
      )}
      {stage === "checking" && shotUrl && (
        <Review url={shotUrl} label={t("checkingFace")} />
      )}
      {stage === "retry" && shotUrl && (
        <Review url={shotUrl} label={t("noFace")} />
      )}
      {stage === "verified" && shotUrl && (
        <Review
          url={shotUrl}
          label={t("identityVerified")}
          icon={<Check className="h-7 w-7 text-white" strokeWidth={3} />}
        />
      )}

      {/* Close — top-left per the reference */}
      <button
        type="button"
        aria-label="Close camera"
        onClick={onClose}
        className="absolute left-4 top-4 z-20 flex h-12 w-12 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm transition active:scale-95"
      >
        <X className="h-6 w-6" strokeWidth={2.2} />
      </button>

      {/* Camera-control panel with double-ring shutter */}
      <div className="relative z-20 mt-auto flex h-[150px] items-center justify-center bg-[#1B1B1E]/95">
        <button
          type="button"
          aria-label="Capture selfie"
          onClick={capture}
          disabled={!ready || stage !== "camera"}
          className="flex h-[76px] w-[76px] items-center justify-center rounded-full border-[3px] border-white bg-transparent p-[5px] transition active:scale-95 disabled:opacity-40"
        >
          <span className="h-full w-full rounded-full bg-white" />
        </button>
      </div>
    </div>
  );
}

/** Frozen frame used while checking, retrying, or confirming. */
function Review({
  url,
  label,
  icon,
}: {
  url: string;
  label: string;
  icon?: React.ReactNode;
}) {
  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={url}
        alt="Captured selfie"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-x-0 top-[120px] z-10 flex justify-center">
        <div className="flex items-center gap-2.5 rounded-full bg-black/60 px-5 py-2.5 backdrop-blur-sm">
          {icon}
          <span className="text-[15px] font-semibold text-white">{label}</span>
        </div>
      </div>
    </>
  );
}
