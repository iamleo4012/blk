"use client";

import { X } from "lucide-react";
import { useI18n } from "./I18nProvider";

/**
 * End-task confirmation modal (Upgrade 07).
 * Dark translucent overlay + centred white card with stop icon, heading,
 * and No, Cancel / Yes, End Task actions. Confirming hands off to
 * onConfirm, which completes the session — the popup itself never ends it.
 */
export default function EndDialog({
  onClose,
  onConfirm,
  ending,
}: {
  onClose: () => void;
  onConfirm: () => void;
  ending: boolean;
}) {
  const { t } = useI18n();
  return (
    <div
      className="fixed inset-0 z-[65] flex items-center justify-center bg-black/60"
      role="dialog"
      aria-modal="true"
      onClick={ending ? undefined : onClose}
    >
      <div
        className="relative mx-6 w-full max-w-[310px] rounded-[30px] bg-white px-6 pb-6 pt-7 text-center shadow-[0_30px_70px_rgba(0,0,0,0.35)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          type="button"
          aria-label={t("close")}
          onClick={onClose}
          disabled={ending}
          className="absolute right-[16px] top-[16px] flex h-[36px] w-[36px] items-center justify-center rounded-full text-[#8E8E93] transition active:scale-95 disabled:opacity-40"
        >
          <X className="h-[24px] w-[24px]" strokeWidth={2.2} />
        </button>

        {/* Stop icon badge */}
        <div className="mx-auto flex h-[64px] w-[64px] items-center justify-center rounded-full bg-[#FDE2E0]">
          <span className="flex h-[24px] w-[24px] items-center justify-center rounded-[6px] bg-[#FF1F1F]" />
        </div>

        <h2 className="mt-[16px] text-[23px] font-bold leading-[1.25] tracking-[-0.01em] text-charcoal">
          {t("endConfirmTitle")}
        </h2>
        <p className="mt-[8px] text-[17px] leading-snug text-[#8E8E93]">
          {t("endConfirmBody")}
        </p>

        {/* Actions */}
        <div className="mt-[22px] flex gap-[12px]">
          <button
            type="button"
            onClick={onClose}
            disabled={ending}
            className="h-[54px] flex-1 rounded-full bg-[#ECEEF6] text-[17px] font-bold text-charcoal transition active:scale-[0.98] disabled:opacity-50"
          >
            {t("cancelNo")}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={ending}
            className="h-[54px] flex-1 rounded-full bg-[#FF1F1F] text-[17px] font-bold text-white shadow-[0_8px_20px_rgba(255,31,31,0.35)] transition active:scale-[0.98] disabled:opacity-60"
          >
            {ending ? t("ending") : t("endYes")}
          </button>
        </div>
      </div>
    </div>
  );
}
