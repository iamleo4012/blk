"use client";

import type { AudioRecording } from "@/lib/data";
import type { TransLang } from "./TranscriptionControls";

/**
 * Complete-transcription view. The original verbatim transcript is always
 * shown; the displayed translation follows the language chosen in the
 * transcription control bar (independent of the AI report language).
 */
export default function TranscriptionsView({
  audio,
  lang,
}: {
  audio: AudioRecording[];
  lang: TransLang;
}) {
  return (
    <div className="rounded-[20px] border border-[#E7E9F1] bg-white px-[18px] py-[16px] shadow-[0_2px_10px_rgba(20,26,46,0.05)]">
      {audio.map((rec) => (
        <div key={rec.id} className="mb-5 last:mb-0">
          <p className="text-[16px] font-bold text-charcoal">
            {rec.name} — {Math.floor(rec.durationSec / 60)}:
            {String(rec.durationSec % 60).padStart(2, "0")}
          </p>

          <p className="mt-2 text-[13px] font-semibold uppercase tracking-wide text-charcoal/45">
            Original
          </p>
          <p className="mt-[2px] rounded-[10px] bg-[#F7F8FC] p-[10px] text-[14px] leading-relaxed text-charcoal/80">
            {rec.originalTranscript}
          </p>

          {lang === "en" ? (
            <>
              <p className="mt-3 text-[13px] font-semibold uppercase tracking-wide text-charcoal/45">
                English (UK)
              </p>
              <p className="mt-[2px] rounded-[10px] bg-[#F7F8FC] p-[10px] text-[14px] leading-relaxed text-charcoal/80">
                {rec.transcriptEn}
              </p>
            </>
          ) : (
            <>
              <p
                dir="rtl"
                className="mt-3 text-[13px] font-semibold uppercase tracking-wide text-charcoal/45"
              >
                العربية
              </p>
              <p
                dir="rtl"
                className="mt-[2px] rounded-[10px] bg-[#F7F8FC] p-[10px] text-[14px] leading-relaxed text-charcoal/80"
              >
                {rec.transcriptAr}
              </p>
            </>
          )}
        </div>
      ))}
    </div>
  );
}
