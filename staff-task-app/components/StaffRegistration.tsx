"use client";

import { useCallback, useState } from "react";
import {
  ArrowLeft,
  Check,
  Plus,
  ScanFace,
  UserRound,
} from "lucide-react";
import { useCamera } from "./useCamera";
import { useI18n } from "./I18nProvider";
import { detectFace } from "@/lib/faceDetect";
import { addRegisteredUser } from "@/lib/users";

/**
 * Staff Face & Name registration screen (Upgrade 14).
 * Light card-based page: mandatory name card, live camera with corner
 * guides and a green-ring shutter, three illustrated pose instructions,
 * three capture slots, and a validated Register button. Live capture
 * only — no gallery/upload/camera switching exists here by design.
 */
export default function StaffRegistration({ onClose }: { onClose: () => void }) {
  const { t } = useI18n();
  const { videoRef, ready, failed } = useCamera("user");
  const [name, setName] = useState("");
  const [shots, setShots] = useState<(string | null)[]>([null, null, null]);
  const [step, setStep] = useState(0); // which pose is captured next
  const [validation, setValidation] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [busy, setBusy] = useState(false);

  const captured = shots.filter(Boolean).length;

  const capture = useCallback(async () => {
    const video = videoRef.current;
    if (!video || !ready || busy) return;
    setBusy(true);
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 720;
    canvas.height = video.videoHeight || 1280;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      // Stored un-mirrored so identification matches real appearance.
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    }
    const faceFound = await detectFace(canvas);
    setBusy(false);
    if (!faceFound) {
      setValidation("noFace");
      return;
    }
    setValidation(null);
    setShots((prev) => {
      const next = [...prev];
      next[step] = canvas.toDataURL("image/jpeg", 0.9);
      return next;
    });
    // Advance to the next open slot (sequential straight → left → right).
    setStep((prev) => {
      const filled = [...shots];
      filled[prev] = "filled";
      const open = filled.findIndex((s, i) => i > prev && !s);
      return open === -1 ? Math.min(prev + 1, 2) : open;
    });
  }, [videoRef, ready, busy, shots, step]);

  /** Clears a captured slot so it can be retaken. */
  function retake(index: number) {
    setShots((prev) => {
      const next = [...prev];
      next[index] = null;
      return next;
    });
    setStep(index);
    setSuccess(false);
  }

  function register() {
    if (!name.trim()) {
      setValidation("nameRequired");
      return;
    }
    if (captured < 3) {
      setValidation("threeRequired");
      return;
    }
    setValidation(null);
    // Persist into the shared staff registry (backend face-embedding
    // generation slots in here — the three images travel with the record).
    addRegisteredUser(
      name.trim(),
      shots.filter((s): s is string => s !== null),
    );
    setSuccess(true);
    window.setTimeout(onClose, 1400);
  }

  const validationText =
    validation === "nameRequired"
      ? "Please enter your full name."
      : validation === "threeRequired"
        ? "Capture all 3 face images before registering."
        : validation === "noFace"
          ? "No face detected — centre your face in the frame and try again"
          : null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-gradient-to-br from-bg-start to-bg-end">
      <div className="mx-auto w-full max-w-[440px] px-5 pb-8">
        {/* Header */}
        <div className="relative flex items-center justify-center pt-5 pb-3">
          <button
            type="button"
            aria-label={t("back")}
            onClick={onClose}
            className="absolute left-0 flex h-[44px] w-[44px] items-center justify-center rounded-full text-charcoal transition active:scale-95"
          >
            <ArrowLeft className="h-[24px] w-[24px]" strokeWidth={2.4} />
          </button>
          <h1 className="text-[26px] font-bold tracking-[-0.01em] text-charcoal">
            {t("registerTitle")}
          </h1>
        </div>

        {/* Name card */}
        <div className="mt-2 flex items-center gap-[16px] rounded-[24px] bg-white p-[18px] shadow-[0_6px_18px_rgba(30,41,82,0.08)]">
          <UserRound className="h-[34px] w-[34px] shrink-0 text-charcoal" strokeWidth={1.8} />
          <div className="min-w-0 flex-1">
            <label htmlFor="staff-name" className="text-[19px] font-bold text-charcoal">
              {t("yourName")} <span className="text-end-red">*</span>
            </label>
            <input
              id="staff-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("namePlaceholder")}
              className="mt-[6px] h-[48px] w-full rounded-[12px] border border-[#D8DCE8] px-4 text-[16px] text-charcoal placeholder:text-charcoal/35 focus:outline-none focus:ring-2 focus:ring-[#008A18]/30"
            />
          </div>
        </div>

        {/* Camera preview */}
        <div className="relative mt-4 aspect-[4/3.4] w-full overflow-hidden rounded-[24px] bg-[#B9BCC2] shadow-[0_6px_18px_rgba(30,41,82,0.10)]">
          <video
            ref={videoRef}
            playsInline
            muted
            autoPlay
            className={`h-full w-full scale-x-[-1] object-cover transition-opacity duration-500 ${
              ready ? "opacity-100" : "opacity-0"
            }`}
          />
          {!ready && (
            <p className="absolute inset-0 flex items-center justify-center text-[15px] text-white/80">
              {failed ? t("cameraUnavailable") : t("startingCamera")}
            </p>
          )}

          {/* Four white corner guides */}
          {(["top-[18px] left-[18px] border-t-[5px] border-l-[5px] rounded-tl-[14px]",
            "top-[18px] right-[18px] border-t-[5px] border-r-[5px] rounded-tr-[14px]",
            "bottom-[78px] left-[18px] border-b-[5px] border-l-[5px] rounded-bl-[14px]",
            "bottom-[78px] right-[18px] border-b-[5px] border-r-[5px] rounded-br-[14px]",
          ] as const).map((cls) => (
            <span key={cls} aria-hidden="true" className={`absolute h-[46px] w-[46px] border-white ${cls}`} />
          ))}

          {/* Capture button — white with green ring */}
          <button
            type="button"
            aria-label={t("registerCapture")}
            onClick={capture}
            disabled={!ready || busy}
            className="absolute bottom-[16px] left-1/2 flex h-[64px] w-[64px] -translate-x-1/2 items-center justify-center rounded-full border-[4px] border-[#008A18] bg-white p-[4px] shadow-[0_6px_18px_rgba(0,0,0,0.25)] transition active:scale-95 disabled:opacity-40"
          >
            <span className="h-full w-full rounded-full border-[3px] border-[#008A18] bg-white" />
          </button>
        </div>

        {/* Instruction card */}
        <div className="mt-4 rounded-[24px] bg-[#E7F8EC] p-[16px]">
          <div className="flex items-center gap-[12px]">
            <ScanFace className="h-[30px] w-[30px] shrink-0 text-charcoal" strokeWidth={1.8} />
            <div>
              <p className="text-[19px] font-bold leading-tight text-charcoal">
                {t("captureHeading")}
              </p>
              <p className="text-[15px] leading-tight text-charcoal/70">
                {t("captureSub")}
              </p>
            </div>
          </div>
          <div className="mt-[12px] grid grid-cols-3 gap-[10px]">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={`rounded-[16px] px-1 pb-[8px] pt-[10px] text-center ${
                  step === i ? "bg-white shadow-[0_2px_10px_rgba(0,138,24,0.18)]" : "bg-white/70"
                }`}
              >
                <PoseIllustration pose={i as 0 | 1 | 2} />
                <span className="mx-auto mt-[6px] block w-fit rounded-full bg-[#008A18] px-[10px] py-[2px] text-[12px] font-bold text-white">
                  {t(`stepLabel${i + 1}` as "stepLabel1")}
                </span>
                <p className="mt-[4px] text-[13px] font-semibold leading-tight text-charcoal">
                  {t(`stepDesc${i + 1}` as "stepDesc1")}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Captured images */}
        <h2 className="mt-5 text-[21px] font-bold text-charcoal">
          {t("capturedImages")} ({captured}/3)
        </h2>
        <div className="mt-[10px] grid grid-cols-3 gap-[12px]">
          {shots.map((shot, i) =>
            shot ? (
              <button
                key={i}
                type="button"
                aria-label={`${t("retake")} ${i + 1}`}
                onClick={() => retake(i)}
                className="relative aspect-[3/2] overflow-hidden rounded-[14px] border border-[#D8DCE8] transition active:scale-95"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={shot} alt={`Face ${i + 1}`} className="h-full w-full object-cover" />
                <span className="absolute right-[5px] top-[5px] flex h-[20px] w-[20px] items-center justify-center rounded-full bg-[#008A18]">
                  <Check className="h-[13px] w-[13px] text-white" strokeWidth={3.2} />
                </span>
              </button>
            ) : (
              <div
                key={i}
                aria-hidden="true"
                className="flex aspect-[3/2] items-center justify-center rounded-[14px] border border-[#D8DCE8] bg-[#F3F4F9]"
              >
                <Plus className="h-[26px] w-[26px] text-charcoal/30" strokeWidth={2.4} />
              </div>
            ),
          )}
        </div>

        {/* Validation / success feedback */}
        {validationText && (
          <p className="mt-3 text-center text-[14px] font-semibold text-end-red">
            {validationText}
          </p>
        )}
        {success && (
          <p className="mt-3 text-center text-[15px] font-bold text-[#008A25]">
            {t("registeredDone")}
          </p>
        )}

        {/* Register */}
        <button
          type="button"
          onClick={register}
          className="mt-4 h-[62px] w-full rounded-full bg-[#008A18] text-[21px] font-bold text-white shadow-[0_12px_28px_rgba(0,138,24,0.30)] transition active:scale-[0.98]"
        >
          {t("register")}
        </button>
      </div>
    </div>
  );
}

/** Simple friendly vector face illustration for the three pose steps. */
function PoseIllustration({ pose }: { pose: 0 | 1 | 2 }) {
  // Hair tuft + head + shirt; eyes/nose shift with the pose angle.
  const nose = pose === 0 ? "M35 33 l2 5 l-2 1" : pose === 1 ? "M32 33 l0 5 l-2 1" : "M38 33 l0 5 l2 1";
  const eyeL = pose === 2 ? null : { cx: 29, r: 1.8 };
  const eyeR = pose === 1 ? null : { cx: 41, r: 1.8 };
  return (
    <svg viewBox="0 0 70 62" className="mx-auto h-[64px]" aria-hidden="true">
      {/* shirt */}
      <path d="M14 62 C14 50 26 46 35 46 C44 46 56 50 56 62 Z" fill="#4A6FA5" />
      {/* neck */}
      <rect x="30" y="38" width="10" height="10" rx="3" fill="#E8B27D" />
      {/* head */}
      <ellipse cx="35" cy="26" rx="14" ry="16" fill="#F2C08C" />
      {/* hair */}
      <path d="M21 24 C20 12 29 8 35 8 C41 8 50 12 49 24 C49 18 44 15 35 15 C26 15 21 18 21 24 Z" fill="#3B3430" />
      {/* ears */}
      <circle cx="20.5" cy="27" r="2.6" fill="#F2C08C" />
      <circle cx="49.5" cy="27" r="2.6" fill="#F2C08C" />
      {/* eyes */}
      {eyeL && <circle cx={eyeL.cx} cy="27" r={eyeL.r} fill="#2B2B2E" />}
      {eyeR && <circle cx={eyeR.cx} cy="27" r={eyeR.r} fill="#2B2B2E" />}
      {/* brows */}
      {eyeL && <path d="M26 23.5 q3 -2 6 0" stroke="#3B3430" strokeWidth="1.2" fill="none" />}
      {eyeR && <path d="M38 23.5 q3 -2 6 0" stroke="#3B3430" strokeWidth="1.2" fill="none" />}
      {/* nose */}
      <path d={nose} stroke="#D99C62" strokeWidth="1.4" fill="none" strokeLinecap="round" />
      {/* smile */}
      <path d="M31 41 q4 3 8 0" stroke="#B4704B" strokeWidth="1.4" fill="none" strokeLinecap="round" />
    </svg>
  );
}
