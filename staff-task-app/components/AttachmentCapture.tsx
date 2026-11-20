"use client";

import { useEffect, useRef, useState } from "react";
import { X, Camera, Video, Trash2, Play } from "lucide-react";
import { useCamera } from "./useCamera";
import AttachmentReview, { fmtHMS } from "./AttachmentReview";
import { useI18n } from "./I18nProvider";

/** An attachment captured live during the active session. */
export interface Attachment {
  id: string;
  kind: "photo" | "video" | "audio";
  /** Object URL of the captured media (blob: for video/audio, data: for photo). */
  url: string;
  /** Poster frame for video thumbnails/review. */
  poster?: string;
  /** Media duration in seconds (video/audio). */
  duration?: number;
}

type Mode = "photo" | "video";

/**
 * Add Attachment → live capture camera (Upgrade 03).
 * Rear-facing preview with a Photo/Video segmented selector, a bottom
 * control panel holding the latest-capture thumbnail with a count badge,
 * and a double-ring shutter. Tapping the thumbnail opens the in-app
 * review grid. No gallery/upload/switch/flash controls exist by design.
 */
export default function AttachmentCapture({
  attachments,
  onAdd,
  onRemove,
  onClose,
}: {
  attachments: Attachment[];
  onAdd: (attachment: Attachment) => void;
  onRemove: (id: string) => void;
  onClose: () => void;
}) {
  const { videoRef, ready, failed } = useCamera("environment");
  const { t } = useI18n();
  const [mode, setMode] = useState<Mode>("photo");
  const [flash, setFlash] = useState(false);
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [reviewing, setReviewing] = useState(false);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const posterFromRef = useRef<HTMLCanvasElement | null>(null);
  // Live recording length; state copies would be stale inside onstop.
  const secondsRef = useRef(0);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      const rec = recorderRef.current;
      if (rec && rec.state === "recording") rec.stop();
      // Stream tracks live on through useCamera's own cleanup.
    };
  }, []);

  function startTimer() {
    setSeconds(0);
    secondsRef.current = 0;
    timerRef.current = setInterval(() => {
      secondsRef.current += 1;
      setSeconds(secondsRef.current);
    }, 1000);
  }

  function stopTimer() {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
  }

  /** Grabs the current preview frame as a poster thumbnail. */
  function grabPoster(): string | undefined {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return undefined;
    const canvas = posterFromRef.current ?? document.createElement("canvas");
    posterFromRef.current = canvas;
    canvas.width = 240;
    canvas.height = Math.round((240 * video.videoHeight) / video.videoWidth);
    canvas.getContext("2d")?.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 0.7);
  }

  function capturePhoto() {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 1080;
    canvas.height = video.videoHeight || 1920;
    canvas.getContext("2d")?.drawImage(video, 0, 0, canvas.width, canvas.height);
    setFlash(true);
    window.setTimeout(() => setFlash(false), 180);
    onAdd({
      id: `p${Date.now()}`,
      kind: "photo",
      url: canvas.toDataURL("image/jpeg", 0.9),
    });
  }

  async function toggleRecording() {
    if (!recording) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" } },
          audio: true,
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => undefined);
        }
        chunksRef.current = [];
        const recorder = new MediaRecorder(stream);
        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) chunksRef.current.push(e.data);
        };
        recorder.onstop = () => {
          const duration = secondsRef.current;
          const poster = grabPoster();
          const blob = new Blob(chunksRef.current, { type: recorder.mimeType });
          onAdd({
            id: `v${Date.now()}`,
            kind: "video",
            url: URL.createObjectURL(blob),
            poster,
            duration,
          });
          // Keep the preview alive for further captures; tracks stop on unmount.
        };
        recorder.start();
        recorderRef.current = recorder;
        setRecording(true);
        startTimer();
      } catch {
        /* keep preview; the user can retry */
      }
    } else {
      recorderRef.current?.stop();
      setRecording(false);
      stopTimer();
    }
  }

  function switchMode(next: Mode) {
    if (recording) return;
    setMode(next);
  }

  const latest = attachments[attachments.length - 1];

  if (reviewing) {
    return (
      <AttachmentReview
        attachments={attachments}
        onRemove={onRemove}
        onClose={() => setReviewing(false)}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#111114]">
      {/* Live rear-camera preview */}
      <video
        ref={videoRef}
        playsInline
        muted
        autoPlay
        className="absolute inset-0 h-full w-full object-cover"
      />

      {failed && (
        <p className="absolute inset-x-10 top-1/2 z-10 -translate-y-1/2 text-center text-[15px] leading-relaxed text-white/80">
          {t("cameraUnavailable")}
        </p>
      )}
      {flash && <div className="absolute inset-0 z-10 animate-pulse bg-white/80" />}

      {/* Top navigation: close + heading */}
      <div className="relative z-20 flex items-center px-4 pt-4">
        <button
          type="button"
          aria-label="Close capture"
          onClick={onClose}
          className="flex h-[50px] w-[50px] items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm transition active:scale-95"
        >
          <X className="h-6 w-6" strokeWidth={2.2} />
        </button>
        <h1 className="absolute inset-x-0 top-[30px] text-center text-[28px] font-bold text-white">
          {t("addAttachments")}
        </h1>
      </div>

      {/* Photo / Video segmented selector */}
      <div className="relative z-20 mt-[12px] flex justify-center">
        <div className="flex h-[52px] w-[min(276px,80vw)] overflow-hidden rounded-full bg-[#3A3A3E]/90 backdrop-blur-sm">
          <Segment
            active={mode === "photo"}
            onClick={() => switchMode("photo")}
            icon={<Camera className="h-[20px] w-[20px]" strokeWidth={2} />}
            label={t("photo")}
          />
          <Segment
            active={mode === "video"}
            onClick={() => switchMode("video")}
            icon={<Video className="h-[20px] w-[20px]" strokeWidth={2} />}
            label={t("video")}
          />
        </div>
      </div>

      {/* Video timer pill — always visible in video mode, per the reference */}
      {mode === "video" && (
        <div className="absolute left-1/2 top-[150px] z-20 flex -translate-x-1/2 items-center gap-[10px] rounded-full bg-black/60 px-[18px] py-[10px] backdrop-blur-sm">
          <span
            className={`h-[14px] w-[14px] rounded-full bg-[#FF2D20] ${
              recording ? "animate-pulse" : ""
            }`}
            aria-hidden="true"
          />
          <span className="text-[19px] font-semibold tabular-nums text-white">
            {fmtHMS(recording ? seconds : 0)}
          </span>
        </div>
      )}

      {/* Bottom control panel */}
      <div className="relative z-20 mt-auto flex h-[130px] items-center justify-between bg-[#161618]/95 px-[26px]">
        {/* Latest capture thumbnail + count badge */}
        <button
          type="button"
          aria-label="Review attachments"
          onClick={() => setReviewing(true)}
          className="relative h-[58px] w-[58px] transition active:scale-95"
        >
          <span className="relative flex h-full w-full overflow-hidden rounded-[12px] border-[3px] border-white/90 bg-[#2A2A2E]">
            {latest ? (
              latest.kind === "photo" ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={latest.url} alt="Latest attachment" className="h-full w-full object-cover" />
              ) : (
                latest.poster && (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={latest.poster} alt="Latest attachment" className="h-full w-full object-cover" />
                    {/* Play glyph identifies the latest capture as a video */}
                    <span className="absolute inset-0 flex items-center justify-center">
                      <Play className="h-[22px] w-[22px] fill-white text-white drop-shadow" />
                    </span>
                  </>
                )
              )
            ) : null}
          </span>
          {attachments.length > 0 && (
            <span className="absolute -right-[10px] -top-[10px] flex h-[24px] min-w-[24px] items-center justify-center rounded-full bg-[#0A84FF] px-1 text-[13px] font-bold text-white">
              {attachments.length}
            </span>
          )}
        </button>

        {/* Double-ring shutter / red record button */}
        <button
          type="button"
          aria-label={mode === "photo" ? t("takePhoto") : recording ? t("stopRecording") : t("startRecording")}
          onClick={mode === "photo" ? capturePhoto : toggleRecording}
          disabled={!ready}
          className="absolute left-1/2 -translate-x-1/2"
        >
          {mode === "photo" ? (
            /* White photo shutter */
            <span className="flex h-[72px] w-[72px] items-center justify-center rounded-full border-[4px] border-white p-[5px] transition active:scale-95">
              <span className="h-full w-full rounded-full bg-white" />
            </span>
          ) : recording ? (
            /* Stop control while recording */
            <span className="flex h-[72px] w-[72px] items-center justify-center rounded-full border-[4px] border-white bg-[#FF2D20] p-[5px] transition active:scale-95">
              <span className="h-full w-full rounded-[7px] bg-white" />
            </span>
          ) : (
            /* Red record button, ready state */
            <span className="flex h-[76px] w-[76px] items-center justify-center rounded-full border-[4px] border-white bg-[#111114] p-[6px] transition active:scale-95">
              <span className="h-full w-full rounded-full bg-[#FF2D20]" />
            </span>
          )}
        </button>

        {/* Right spacer keeps the shutter truly centred */}
        <span className="h-[58px] w-[58px]" aria-hidden="true" />
      </div>
    </div>
  );
}

/** One half of the Photo/Video segmented pill. */
function Segment({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`flex flex-1 items-center justify-center gap-[8px] text-[17px] font-bold transition ${
        active ? "bg-white text-black" : "text-white"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

/** In-app review lives in AttachmentReview.tsx, shared with the session card. */
