"use client";

import { FileText } from "lucide-react";

export type TransLang = "en" | "ar";

/**
 * Control bar above the AI Generated Report.
 * "View Original Transcription" opens the complete transcription
 * interface; the English/Arabic pills choose the transcription display
 * language — fully independent of the AI report's own language selector.
 */
export default function TranscriptionControls({
  lang,
  onLangChange,
  open,
  onToggleOpen,
}: {
  lang: TransLang;
  onLangChange: (lang: TransLang) => void;
  open: boolean;
  onToggleOpen: () => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-[20px] border border-[#E7E9F1] bg-white px-[16px] py-[12px] shadow-[0_2px_10px_rgba(20,26,46,0.05)]">
      <button
        type="button"
        onClick={onToggleOpen}
        aria-expanded={open}
        className="flex items-center gap-[10px] text-[17px] font-bold text-accent transition hover:opacity-80"
      >
        <FileText className="h-[22px] w-[22px]" strokeWidth={2} />
        View Original Transcription
      </button>

      <div className="flex items-center gap-[8px]">
        <span className="mx-[4px] h-[24px] w-[1px] bg-[#E7E9F1]" aria-hidden="true" />
        {(
          [
            { code: "en" as TransLang, label: "English (UK)" },
            { code: "ar" as TransLang, label: "Arabic (العربية)" },
          ]
        ).map((l) => (
          <button
            key={l.code}
            type="button"
            onClick={() => onLangChange(l.code)}
            aria-pressed={lang === l.code}
            className={`rounded-full px-[16px] py-[9px] text-[14px] font-bold transition ${
              lang === l.code
                ? "bg-accent text-white"
                : "border border-[#E7E9F1] text-charcoal/60 hover:border-[#c9cdda]"
            }`}
          >
            {l.label}
          </button>
        ))}
      </div>
    </div>
  );
}
