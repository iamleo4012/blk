"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Pause, Play, Trash2 } from "lucide-react";
import type { Attachment } from "./AttachmentCapture";
import { useI18n } from "./I18nProvider";

type Status = "recording" | "paused";

/**
 * Inline circular audio recorder (Upgrade 10).
 * Replaces the idle blue Record button while a recording is active:
 * light-grey circle with a live black waveform, HH:MM:SS timer, and
 * pause / stop / discard controls. Stopping saves into the shared
 * session attachment collection; discarding removes only the current
 * unsaved take.
 */
export default function AudioRecorder({
  onSave,
  onDone,
}: {
  onSave: (attachment: Attachment) => void;
  /** Called after save or discard so the parent can restore the idle button. */
  onDone: () => void;
}) {
  const [status, setStatus] = useState<Status>("recording");
  const [seconds, setSeconds] = useState(0);
  const [error, setError] = useState(false);
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const { t } = useI18n();

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const rafRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const finishingRef = useRef(false);

  // Start capture on mount.
  useEffect(() => {
    let cancelled = false;

    async function start() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;

        const recorder = new MediaRecorder(stream);
        chunksRef.current = [];
        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) chunksRef.current.push(e.data);
        };
        recorder.start();
        recorderRef.current = recorder;

        // Live waveform driven by real microphone levels.
        const audioCtx = new AudioContext();
        audioCtxRef.current = audioCtx;
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 128;
        analyser.smoothingTimeConstant = 0.72;
        audioCtx.createMediaStreamSource(stream).connect(analyser);
        const data = new Uint8Array(analyser.frequencyBinCount);

        const draw = () => {
          rafRef.current = requestAnimationFrame(draw);
          const canvas = canvasRef.current;
          const ctx = canvas?.getContext("2d");
          if (!canvas || !ctx) return;
          analyser.getByteFrequencyData(data);

          const w = canvas.width;
          const h = canvas.height;
          ctx.clearRect(0, 0, w, h);
          const bars = 26;
          const step = Math.floor(data.length / bars);
          const barW = 5;
          const gap = (w - bars * barW) / (bars - 1);
          const mid = h / 2;

          ctx.fillStyle = "#111114";
          for (let i = 0; i < bars; i++) {
            const v = data[i * step] / 255;
            const barH = Math.max(7, v * (h * 0.78));
            const x = i * (barW + gap);
            ctx.beginPath();
            ctx.roundRect(x, mid - barH / 2, barW, barH, barW / 2);
            ctx.fill();
          }
        };
        draw();

        timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
      } catch {
        setError(true);
      }
    }

    void start();
    return () => {
      cancelled = true;
      cancelAnimationFrame(rafRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
      const rec = recorderRef.current;
      if (rec && rec.state !== "inactive") rec.stop();
      streamRef.current?.getTracks().forEach((t) => t.stop());
      void audioCtxRef.current?.close();
    };
  }, []);

  const teardown = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    if (timerRef.current) clearInterval(timerRef.current);
    const rec = recorderRef.current;
    if (rec && rec.state !== "inactive") rec.stop();
    streamRef.current?.getTracks().forEach((t) => t.stop());
    void audioCtxRef.current?.close();
  }, []);

  function togglePause() {
    const rec = recorderRef.current;
    if (!rec) return;
    if (status === "recording") {
      rec.pause();
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = null;
      setStatus("paused");
    } else {
      rec.resume();
      timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
      setStatus("recording");
    }
  }

  function stopAndSave() {
    const rec = recorderRef.current;
    if (!rec || finishingRef.current) return;
    finishingRef.current = true;
    const duration = seconds;
    rec.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: rec.mimeType || "audio/webm" });
      onSave({
        id: `a${Date.now()}`,
        kind: "audio",
        url: URL.createObjectURL(blob),
        duration,
      });
      teardown();
      onDone();
    };
    rec.stop();
  }

  function discard() {
    finishingRef.current = true;
    teardown();
    onDone();
  }

  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  const clock = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;

  if (error) {
    return (
      <div className="mt-[42px] flex h-[min(237px,61vw)] w-[min(237px,61vw)] flex-col items-center justify-center rounded-full bg-[#ECEEF6] px-8 text-center">
        <p className="text-[14px] leading-snug text-charcoal/70">{t("micUnavailable")}</p>
        <button
          type="button"
          onClick={() => {
            teardown();
            onDone();
          }}
          className="mt-4 rounded-full bg-white px-5 py-2 text-[14px] font-bold text-charcoal shadow"
        >
          {t("close")}
        </button>
      </div>
    );
  }

  return (
    <div className="mt-[42px] flex w-full flex-col items-center">
      {/* Circular waveform container */}
      <div className="flex h-[min(237px,61vw)] w-[min(237px,61vw)] flex-col items-center justify-center rounded-full border border-[#B9BCC7] bg-[#E9E9EC] shadow-[0_14px_34px_rgba(30,41,82,0.14)]">
        <canvas ref={canvasRef} width={170} height={60} className="w-[62%]" aria-hidden="true" />
        <span className="mt-[10px] text-[26px] font-bold tabular-nums leading-none text-[#111114]">
          {clock}
        </span>
      </div>

      {/* Controls */}
      <div className="mt-[24px] flex items-center gap-[38px]">
        <button
          type="button"
          aria-label={status === "recording" ? "Pause recording" : "Resume recording"}
          onClick={togglePause}
          className="flex h-[58px] w-[58px] items-center justify-center rounded-full border border-[#D7DAE3] bg-white text-charcoal shadow-[0_4px_12px_rgba(30,41,82,0.10)] transition active:scale-95"
        >
          {status === "recording" ? (
            <Pause className="h-[22px] w-[22px] fill-charcoal" />
          ) : (
            <Play className="ml-[2px] h-[22px] w-[22px] fill-charcoal" />
          )}
        </button>

        <button
          type="button"
          aria-label="Stop and save recording"
          onClick={stopAndSave}
          className="flex h-[66px] w-[66px] items-center justify-center rounded-full border-[3px] border-[#FF2D20] bg-white transition active:scale-95"
        >
          <span className="h-[22px] w-[22px] rounded-[5px] bg-[#FF2D20]" />
        </button>

        <button
          type="button"
          aria-label="Discard recording"
          onClick={() => setConfirmDiscard(true)}
          className="flex h-[58px] w-[58px] items-center justify-center rounded-full border border-[#D7DAE3] bg-white text-charcoal shadow-[0_4px_12px_rgba(30,41,82,0.10)] transition active:scale-95"
        >
          <Trash2 className="h-[22px] w-[22px]" strokeWidth={2} />
        </button>
      </div>

      {/* Discard confirmation */}
      {confirmDiscard && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40"
          role="dialog"
          aria-modal="true"
          aria-label="Discard recording confirmation"
          onClick={() => setConfirmDiscard(false)}
        >
          <div
            className="mx-6 w-full max-w-[300px] rounded-[28px] bg-white p-6 text-center shadow-[0_24px_60px_rgba(0,0,0,0.25)]"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-[20px] font-bold text-charcoal">{t("discardTitle")}</h2>
            <p className="mt-2 text-[14px] leading-snug text-charcoal/60">
              {t("discardBody")}
            </p>
            <button
              type="button"
              onClick={discard}
              className="mt-6 h-[50px] w-full rounded-full bg-end-red text-[17px] font-semibold text-white transition active:scale-[0.98]"
            >
              {t("discard")}
            </button>
            <button
              type="button"
              onClick={() => setConfirmDiscard(false)}
              className="mt-2 h-[50px] w-full rounded-full bg-[#F2F3F8] text-[17px] font-semibold text-charcoal/70 transition active:scale-[0.98]"
            >
              {t("cancel")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
