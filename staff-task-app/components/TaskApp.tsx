"use client";

import { useCallback, useEffect, useState } from "react";
import { Play, Camera, Timer, ChevronRight, Image as ImageIcon, Video as VideoIcon, Check, AudioWaveform, Globe, CircleUserRound } from "lucide-react";
import Waves from "./Waves";
import SelfieVerification from "./SelfieVerification";
import StaffRegistration from "./StaffRegistration";
import AttachmentCapture from "./AttachmentCapture";
import AttachmentReview from "./AttachmentReview";
import AudioRecorder from "./AudioRecorder";
import LanguageSheet from "./LanguageSheet";
import EndDialog from "./EndDialog";
import { useI18n } from "./I18nProvider";
import { identifyUser } from "@/lib/users";
import { fmtHMS } from "./AttachmentReview";
import type { Attachment } from "./AttachmentCapture";
import type { TKey } from "@/lib/i18n";

type Overlay = "none" | "selfie" | "attachments" | "review" | "end" | "language" | "register";

/** Active session, started only after successful face verification. */
interface Session {
  userName: string;
  startedAt: number;
  /** Set once the task is completed via the End confirmation modal. */
  completed?: boolean;
  /** Wall-clock end time and frozen duration, saved on completion. */
  endedAt?: number;
  finalSeconds?: number;
}

const SESSION_KEY = "nassim-staff-session";

/** Restores a session after a temporary interruption (reload, tab close). */
function restoreSession(): Session | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Session;
    return typeof parsed.startedAt === "number" && typeof parsed.userName === "string"
      ? parsed
      : null;
  } catch {
    return null;
  }
}

function saveSession(session: Session | null) {
  if (session) sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  else sessionStorage.removeItem(SESSION_KEY);
}

/**
 * Main task screen — recreated from the reference image.
 * All metrics are pixel measurements of the reference mapped onto a
 * 393 × 852 viewport (vertical ÷1.803, horizontal ÷2.606):
 *   Start circle 254px @ y=64 · pills 242×64 · Record circle 237px @ y=528
 * Active-session state (Upgrade 02): greeting + green timer pill replace the
 * Start circle; timer pill 281×100 @ y=221 per the session reference.
 */
export default function TaskApp() {
  const [overlay, setOverlay] = useState<Overlay>("none");
  const [session, setSession] = useState<Session | null>(null);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  // True while the inline circular audio recorder replaces the Record button.
  const [audioRecording, setAudioRecording] = useState(false);
  // Where the camera returns to when closed: the gallery opens the camera
  // via Add More, and the camera hands back to it on close.
  const [cameraReturnTo, setCameraReturnTo] = useState<"none" | "review">("none");

  const addAttachment = useCallback((a: Attachment) => {
    setAttachments((prev) => [...prev, a]);
  }, []);
  const removeAttachment = useCallback((id: string) => {
    setAttachments((prev) => {
      const target = prev.find((a) => a.id === id);
      if (target?.url.startsWith("blob:")) URL.revokeObjectURL(target.url);
      return prev.filter((a) => a.id !== id);
    });
  }, []);

  const [ending, setEnding] = useState(false);
  const [endError, setEndError] = useState<TKey | null>(null);
  const { t } = useI18n();

  // Keep the session alive across temporary interruptions.
  useEffect(() => setSession(restoreSession()), []);

  // Called only after successful face identification — never on camera open.
  const handleVerified = useCallback(async () => {
    const user = await identifyUser();
    const started: Session = { userName: user.fullName, startedAt: Date.now() };
    saveSession(started);
    setSession(started);
    setOverlay("none");
  }, []);

  /**
   * Completes the task: freezes the timer, saves the final duration, and
   * marks the session completed. Active photo/video capture is impossible
   * here (the End button is only reachable from the session screen, while
   * capture overlays cover it), so there is nothing to interrupt safely.
   * GPS start/end locations are not yet captured by this app; the fields
   * are reserved in the completed record.
   */
  const handleEndTask = useCallback(async () => {
    if (!session || session.completed) return;
    setEnding(true);
    setEndError(null);
    try {
      // Simulate the latency of persisting the completed session.
      await new Promise((r) => setTimeout(r, 600));
      const endedAt = Date.now();
      const completed: Session = {
        ...session,
        completed: true,
        endedAt,
        finalSeconds: Math.max(0, Math.floor((endedAt - session.startedAt) / 1000)),
      };
      saveSession(completed);
      setSession(completed);
      setOverlay("none");
    } catch {
      setEndError("endError");
    } finally {
      setEnding(false);
    }
  }, [session]);

  return (
    <main className="relative h-dvh w-full overflow-hidden bg-gradient-to-br from-bg-start to-bg-end">
      <Waves />

      {/* Top-right icon pair: language + account (staff registration) */}
      <div className="absolute right-[16px] top-[16px] z-20 flex items-center gap-[6px]">
        <button
          type="button"
          aria-label="Select language"
          onClick={() => setOverlay("language")}
          className="flex h-[44px] w-[44px] items-center justify-center transition active:scale-95"
        >
          <Globe className="h-[32px] w-[32px] text-charcoal" strokeWidth={1.8} />
        </button>
        <button
          type="button"
          aria-label="Register staff"
          onClick={() => setOverlay("register")}
          className="flex h-[44px] w-[44px] items-center justify-center transition active:scale-95"
        >
          <CircleUserRound className="h-[34px] w-[34px] text-charcoal" strokeWidth={1.8} />
        </button>
      </div>

      <div className="relative z-10 mx-auto flex h-full w-full max-w-[440px] flex-col items-center">
        {session ? (
          <>
            {/* Greeting */}
            <div className="mt-[58px] max-w-[88vw] px-4 text-center">
              <p className="text-[24px] font-bold leading-tight tracking-[-0.01em] text-charcoal">
                {t(greetingKey())},
              </p>
              <h1 className="mt-[2px] break-words text-[42px] font-bold leading-tight tracking-[-0.02em] text-charcoal">
                {session.userName}
              </h1>
            </div>

            {/* Session timer pill */}
            <div className="mt-[18px] flex h-[100px] w-[min(281px,76vw)] items-center justify-center gap-[16px] rounded-full border-2 border-[#26C940] bg-[#DFFDDE] shadow-[0_12px_30px_rgba(0,160,60,0.25)]">
              <Timer
                className="h-[44px] w-[44px] text-[#1E9E33]"
                strokeWidth={2}
              />
              <span className="h-[44px] w-[2px] rounded-full bg-[#26C940]/70" aria-hidden="true" />
              <SessionTimer
                startedAt={session.startedAt}
                frozenSeconds={session.completed ? session.finalSeconds : undefined}
              />
            </div>

            {/* Attachments preview card */}
            <div className="mt-[18px] w-[min(330px,90vw)] rounded-[24px] bg-white p-[16px] shadow-[0_10px_28px_rgba(30,41,82,0.10)]">
              <button
                type="button"
                onClick={() => setOverlay("review")}
                aria-label="Review attachments"
                className="flex w-full items-center justify-between"
              >
                <span className="text-[21px] font-bold tracking-[-0.01em] text-charcoal">
                  {t("attachments")} ({attachments.length})
                </span>
                <ChevronRight className="h-[22px] w-[22px] text-charcoal" strokeWidth={2.4} />
              </button>
              <div className="mt-[12px] flex gap-[10px] overflow-x-auto pb-[2px]">
                {attachments.map((a) =>
                  a.kind === "audio" ? (
                    <button
                      key={a.id}
                      type="button"
                      aria-label="Preview audio recording"
                      onClick={() => setOverlay("review")}
                      className="flex h-[72px] w-[72px] shrink-0 flex-col items-center justify-center gap-[4px] rounded-[14px] border border-[#C9BEE8] bg-[#EFEAFB] transition active:scale-95"
                    >
                      <AudioWaveform className="h-[26px] w-[26px] text-[#111114]" strokeWidth={2} />
                      <span className="text-[11px] font-semibold tabular-nums text-[#111114]">
                        {fmtMMSS(a.duration ?? 0)}
                      </span>
                    </button>
                  ) : (
                    <button
                      key={a.id}
                      type="button"
                      aria-label={`Preview ${a.kind} attachment`}
                      onClick={() => setOverlay("review")}
                      className="relative h-[72px] w-[72px] shrink-0 overflow-hidden rounded-[14px] bg-[#EDF0F8]"
                    >
                      {a.kind === "photo" ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={a.url} alt="Photo attachment" className="h-full w-full object-cover" />
                      ) : (
                        a.poster && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={a.poster} alt="Video attachment" className="h-full w-full object-cover" />
                        )
                      )}
                      {a.kind === "photo" ? (
                        <span className="absolute right-[5px] top-[5px]">
                          <ImageIcon className="h-[16px] w-[16px] text-white drop-shadow" strokeWidth={2.2} />
                        </span>
                      ) : (
                        <>
                          <span className="absolute inset-0 flex items-center justify-center">
                            <Play className="h-[24px] w-[24px] fill-white text-white drop-shadow" />
                          </span>
                          <span className="absolute right-[5px] top-[5px]">
                            <VideoIcon className="h-[16px] w-[16px] text-white drop-shadow" strokeWidth={2.2} />
                          </span>
                          <span className="absolute inset-x-[6px] bottom-[5px] rounded-full bg-black/60 px-[6px] py-[2px] text-center text-[10px] font-semibold tabular-nums text-white">
                            {fmtHMS(a.duration ?? 0)}
                          </span>
                        </>
                      )}
                    </button>
                  ),
                )}
                {/* Add More tile */}
                <button
                  type="button"
                  onClick={() => setOverlay("attachments")}
                  className="flex h-[72px] w-[72px] shrink-0 flex-col items-center justify-center gap-[4px] rounded-[14px] border border-[#E4E8F2] bg-white shadow-[0_2px_8px_rgba(30,41,82,0.06)] transition active:scale-95"
                >
                  <Camera className="h-[22px] w-[22px] text-charcoal" strokeWidth={1.8} />
                  <span className="text-[12px] font-bold text-charcoal">{t("addMore")}</span>
                </button>
              </div>
            </div>
          </>
        ) : (
          /* Start */
          <button
            type="button"
            aria-label="Start"
            onClick={() => setOverlay("selfie")}
            className="action-circle mt-[64px] h-[min(254px,66vw)] w-[min(254px,66vw)] bg-[linear-gradient(180deg,#2BD248_0%,#029220_100%)] shadow-[0_22px_50px_rgba(1,150,40,0.42)]"
          >
            <span className="flex -translate-y-[8px] flex-col items-center">
              <Play
                className="-ml-1 h-[53px] w-[53px] fill-white stroke-white"
                strokeWidth={1.5}
              />
              <span className="mt-[18px] text-[42px] font-bold leading-none tracking-[-0.02em]">
                Start
              </span>
            </span>
          </button>
        )}

        {/* Add Attachments */}
        <button
          type="button"
          onClick={() => setOverlay("attachments")}
          className="action-pill mt-[26px] h-[64px] w-[min(242px,64vw)] shadow-[0_8px_22px_rgba(30,41,82,0.12)]"
        >
          <Camera
            className="h-[24px] w-[24px] text-charcoal"
            strokeWidth={1.8}
          />
          <span className="ml-[12px] text-[19px] font-bold tracking-[-0.01em] text-charcoal">
            {t("addAttachments")}
          </span>
        </button>

        {/* Completed status pill — replaces End once the task is finished */}
        {session?.completed ? (
          <div
            className="mt-[16px] flex h-[64px] w-[min(242px,64vw)] items-center justify-center gap-[12px] rounded-full bg-[linear-gradient(180deg,#DFFCE6_0%,#D2F7DC_100%)] shadow-[0_10px_24px_rgba(0,138,37,0.20)]"
            aria-label="Task completed"
          >
            <span className="flex h-[30px] w-[30px] items-center justify-center rounded-full bg-[#008A25]">
              <Check className="h-[17px] w-[17px] text-white" strokeWidth={3} />
            </span>
            <span className="text-[21px] font-bold tracking-[-0.01em] text-[#008A25]">
              {t("completed")}
            </span>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setOverlay("end")}
            className="action-pill mt-[16px] h-[64px] w-[min(242px,64vw)] shadow-[0_8px_22px_rgba(30,41,82,0.12)]"
          >
            <SquareFilled className="h-[18px] w-[18px]" />
            <span className="ml-[12px] text-[19px] font-bold tracking-[-0.01em] text-end-red">
              {t("end")}
            </span>
          </button>
        )}

        {/* Record — idle button, or the inline circular recorder while active */}
        {audioRecording ? (
          <AudioRecorder
            onSave={addAttachment}
            onDone={() => setAudioRecording(false)}
          />
        ) : (
          <button
            type="button"
            aria-label="Record"
            onClick={() => setAudioRecording(true)}
            className="action-circle mt-[42px] h-[min(237px,61vw)] w-[min(237px,61vw)] bg-[linear-gradient(180deg,#018FFD_0%,#015DE9_100%)] shadow-[0_22px_50px_rgba(1,93,233,0.42)]"
          >
            <span className="flex -translate-y-[12px] flex-col items-center">
              <MicIcon className="h-[72px] w-[72px]" />
              <span className="mt-[13px] text-[33px] font-bold leading-none tracking-[-0.02em]">
                {t("record")}
              </span>
            </span>
          </button>
        )}
      </div>

      {overlay === "selfie" && (
        <SelfieVerification
          onClose={() => setOverlay("none")}
          onVerified={handleVerified}
        />
      )}
      {overlay === "attachments" && (
        <AttachmentCapture
          attachments={attachments}
          onAdd={addAttachment}
          onRemove={removeAttachment}
          onClose={() => setOverlay(cameraReturnTo)}
        />
      )}
      {overlay === "review" && (
        <AttachmentReview
          attachments={attachments}
          onRemove={removeAttachment}
          onClose={() => setOverlay("none")}
          onAddMore={() => {
            setCameraReturnTo("review");
            setOverlay("attachments");
          }}
        />
      )}
      {overlay === "end" && (
        <EndDialog
          onClose={() => setOverlay("none")}
          onConfirm={handleEndTask}
          ending={ending}
        />
      )}
      {endError && overlay === "end" && (
        <p className="fixed inset-x-10 bottom-24 z-[66] text-center text-[14px] font-semibold text-end-red">
          {endError}
        </p>
      )}
      {overlay === "language" && <LanguageSheet onClose={() => setOverlay("none")} />}
      {overlay === "register" && <StaffRegistration onClose={() => setOverlay("none")} />}
    </main>
  );
}

/** MM:SS for the audio tile, per the reference. */
function fmtMMSS(total: number): string {
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

/** Time-of-day greeting key from the user's local clock. */
function greetingKey(): TKey {
  const h = new Date().getHours();
  if (h < 12) return "greetingMorning";
  if (h < 18) return "greetingAfternoon";
  return "greetingEvening";
}

/**
 * Live session counter. Seconds tick from the session start time, so the
 * count survives overlay navigation, reloads and interruptions. Once the
 * task is completed, the counter freezes at the saved final duration.
 */
function SessionTimer({
  startedAt,
  frozenSeconds,
}: {
  startedAt: number;
  frozenSeconds?: number;
}) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (frozenSeconds !== undefined) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [frozenSeconds]);

  const total =
    frozenSeconds !== undefined
      ? frozenSeconds
      : Math.max(0, Math.floor((now - startedAt) / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const mm = String(m).padStart(2, "0");
  const ss = String(s).padStart(2, "0");
  const text = h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;

  return (
    <span
      className="text-[44px] font-bold leading-none tracking-[-0.01em] text-[#0A6E17] tabular-nums"
      role="timer"
      aria-label="Session time"
    >
      {text}
    </span>
  );
}

/** Filled red stop square with softly rounded corners, as in the reference. */
function SquareFilled({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={className} aria-hidden="true">
      <rect x="0" y="0" width="20" height="20" rx="4.5" fill="#FF3B30" />
    </svg>
  );
}

/**
 * Microphone as in the reference: solid white capsule, outlined cradle arc,
 * stem and base. Lucide-style geometry with a filled capsule.
 */
function MicIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      aria-hidden="true"
      fill="none"
      stroke="white"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="9" y="2" width="6" height="12" rx="3" fill="white" />
      <path d="M19 10v1a7 7 0 0 1-14 0v-1" />
      <line x1="12" y1="18" x2="12" y2="21.5" />
      <line x1="8" y1="21.5" x2="16" y2="21.5" />
    </svg>
  );
}
