"use client";

import { useState } from "react";
import { Globe } from "lucide-react";
import { useI18n } from "./I18nProvider";
import { LANGS, type Lang } from "@/lib/i18n";

/**
 * Language-selection bottom sheet (Upgrade 12).
 * ~60% height white sheet with the six native-language options, radio
 * rows, and an Apply pill. Selection commits only on Apply; closing
 * without Apply keeps the previous language.
 */
export default function LanguageSheet({ onClose }: { onClose: () => void }) {
  const { lang, setLang, t } = useI18n();
  const [picked, setPicked] = useState<Lang>(lang);

  return (
    <div
      className="fixed inset-0 z-[65] flex items-end bg-black/60"
      role="dialog"
      aria-modal="true"
      aria-label={t("selectLanguage")}
      onClick={onClose}
    >
      <div
        className="h-[60dvh] w-full flex flex-col rounded-t-[32px] bg-white px-5 pb-7 pt-3 shadow-[0_-16px_50px_rgba(0,0,0,0.30)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag indicator */}
        <span className="mx-auto h-[5px] w-[64px] rounded-full bg-[#C9CCD6]" aria-hidden="true" />

        {/* Header */}
        <div className="mt-[14px] flex items-center justify-center gap-[12px]">
          <Globe className="h-[30px] w-[30px] text-charcoal" strokeWidth={1.8} />
          <h2 className="text-[24px] font-bold tracking-[-0.01em] text-charcoal">
            {t("selectLanguage")}
          </h2>
        </div>

        {/* Options */}
        <div className="mt-[16px] flex flex-col gap-[10px] overflow-y-auto">
          {LANGS.map((l) => {
            const selected = picked === l.code;
            return (
              <button
                key={l.code}
                type="button"
                onClick={() => setPicked(l.code)}
                aria-pressed={selected}
                className={`flex min-h-[62px] w-full items-center justify-between rounded-full px-[22px] py-[8px] text-start transition ${
                  selected ? "bg-[#DFF7E4]" : "bg-[#F1F2F6]"
                }`}
              >
                <span>
                  <span className="block text-[20px] font-bold leading-tight text-charcoal">
                    {l.label}
                  </span>
                  {l.default && (
                    <span className="block text-[13px] leading-tight text-charcoal/70">
                      {t("defaultTag")}
                    </span>
                  )}
                </span>
                {/* radio */}
                <span
                  aria-hidden="true"
                  className={`flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full border-2 ${
                    selected ? "border-[#008A25]" : "border-[#9CA0AC]"
                  }`}
                >
                  {selected && (
                    <span className="h-[16px] w-[16px] rounded-full bg-[#008A25]" />
                  )}
                </span>
              </button>
            );
          })}
        </div>

        {/* Apply */}
        <button
          type="button"
          onClick={() => {
            setLang(picked);
            onClose();
          }}
          className="mt-auto h-[62px] w-full rounded-full bg-[#008A18] text-[21px] font-bold text-white shadow-[0_10px_26px_rgba(0,138,24,0.30)] transition active:scale-[0.98]"
        >
          {t("apply")}
        </button>
      </div>
    </div>
  );
}
