"use client";

import { useState } from "react";
import { ArrowLeft, Trash2, Image as ImageIcon, Video as VideoIcon, Play, Plus, AudioWaveform } from "lucide-react";
import { useI18n } from "./I18nProvider";
import type { Attachment } from "./AttachmentCapture";

/** MM:SS for the card pill, per the reference. */
function fmtCard(total: number): string {
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

/** HH:MM:SS, used by the video timer pill and review labels. */
export function fmtHMS(total: number): string {
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

/**
 * Attachments review and management screen (Upgrade 06).
 * Light Apple-style gallery of the session's live-captured photos and
 * videos with delete confirmation, plus Add More (camera) and Done actions.
 * Shares the session's single attachment collection — no separate store.
 */
export default function AttachmentReview({
  attachments,
  onRemove,
  onClose,
  onAddMore,
}: {
  attachments: Attachment[];
  onRemove: (id: string) => void;
  onClose: () => void;
  /** Opens the existing camera; the caller decides where to return. */
  onAddMore?: () => void;
}) {
  const { t } = useI18n();
  const [pendingDelete, setPendingDelete] = useState<Attachment | null>(null);

  function confirmDelete() {
    if (pendingDelete) onRemove(pendingDelete.id);
    setPendingDelete(null);
  }

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-gradient-to-b from-[#F7F8FF] to-[#EDF1FF]">
      {/* Header */}
      <div className="relative flex items-center justify-center px-4 pt-5 pb-2">
        <button
          type="button"
          aria-label="Back"
          onClick={onClose}
          className="absolute left-4 flex h-[48px] w-[48px] items-center justify-center rounded-full bg-[#ECEEF6] text-charcoal transition active:scale-95"
        >
          <ArrowLeft className="h-[22px] w-[22px]" strokeWidth={2.2} />
        </button>
        <h1 className="text-[24px] font-bold tracking-[-0.01em] text-charcoal">
          {t("attachments")} ({attachments.length})
        </h1>
      </div>

      {/* Gallery grid */}
      <div className="flex-1 overflow-y-auto px-5 pt-3">
        {attachments.length === 0 ? (
          <p className="mt-24 text-center text-[15px] text-charcoal/50">
            {t("nothingCaptured")}
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-[14px] pb-4">
            {attachments.map((a) =>
              a.kind === "audio" ? (
                <div
                  key={a.id}
                  className="relative flex aspect-square flex-col items-center justify-center gap-[8px] rounded-[20px] border border-[#C9BEE8] bg-[#EFEAFB] shadow-[0_4px_14px_rgba(30,41,82,0.10)]"
                >
                  <AudioWaveform className="h-[38px] w-[38px] text-[#111114]" strokeWidth={1.8} />
                  <span className="text-[15px] font-bold tabular-nums text-[#111114]">
                    {fmtCard(a.duration ?? 0)}
                  </span>
                  <audio src={a.url} controls className="absolute inset-x-2 bottom-2 h-9 w-[calc(100%-16px)]" />
                  <button
                    type="button"
                    aria-label="Delete audio attachment"
                    onClick={() => setPendingDelete(a)}
                    className="absolute right-[8px] top-[8px] flex h-[38px] w-[38px] items-center justify-center rounded-full bg-white shadow-[0_2px_8px_rgba(0,0,0,0.18)] transition active:scale-90"
                  >
                    <Trash2 className="h-[18px] w-[18px] text-end-red" strokeWidth={2.2} />
                  </button>
                </div>
              ) : (
              <div
                key={a.id}
                className="relative aspect-square overflow-hidden rounded-[20px] shadow-[0_4px_14px_rgba(30,41,82,0.10)]"
              >
                {a.kind === "photo" ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={a.url} alt="Photo attachment" className="h-full w-full object-cover" />
                ) : (
                  <>
                    {a.poster && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={a.poster} alt="Video attachment" className="h-full w-full object-cover" />
                    )}
                    {/* subtle dark overlay */}
                    <span className="absolute inset-0 bg-black/25" aria-hidden="true" />
                    {/* centred play button */}
                    <span className="absolute inset-0 flex items-center justify-center">
                      <span className="flex h-[54px] w-[54px] items-center justify-center rounded-full bg-black/50 backdrop-blur-sm">
                        <Play className="ml-[3px] h-[24px] w-[24px] fill-white text-white" />
                      </span>
                    </span>
                    {/* video-camera indicator */}
                    <span className="absolute bottom-[10px] left-[10px]">
                      <VideoIcon className="h-[22px] w-[22px] text-white drop-shadow" strokeWidth={2} />
                    </span>
                    {/* duration pill */}
                    <span className="absolute bottom-[10px] right-[10px] rounded-full bg-black/60 px-[9px] py-[3px] text-[12px] font-semibold tabular-nums text-white">
                      {fmtCard(a.duration ?? 0)}
                    </span>
                  </>
                )}

                {/* photo image icon */}
                {a.kind === "photo" && (
                  <span className="absolute bottom-[10px] left-[10px]">
                    <ImageIcon className="h-[22px] w-[22px] text-white drop-shadow" strokeWidth={2} />
                  </span>
                )}

                {/* delete button */}
                <button
                  type="button"
                  aria-label={`Delete ${a.kind} attachment`}
                  onClick={() => setPendingDelete(a)}
                  className="absolute right-[8px] top-[8px] flex h-[38px] w-[38px] items-center justify-center rounded-full bg-white shadow-[0_2px_8px_rgba(0,0,0,0.18)] transition active:scale-90"
                >
                  <Trash2 className="h-[18px] w-[18px] text-end-red" strokeWidth={2.2} />
                </button>
              </div>
              )
            )}
          </div>
        )}
      </div>

      {/* Bottom actions */}
      <div className="px-5 pb-8 pt-2">
        <button
          type="button"
          onClick={onAddMore}
          className="flex h-[62px] w-full items-center justify-center gap-[12px] rounded-full bg-[#087BFA] text-[21px] font-bold text-white shadow-[0_12px_28px_rgba(8,123,250,0.35)] transition active:scale-[0.98]"
        >
          <span className="flex h-[28px] w-[28px] items-center justify-center rounded-full border-2 border-white">
            <Plus className="h-[16px] w-[16px]" strokeWidth={2.6} />
          </span>
          {t("addMore")}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="mt-[14px] h-[62px] w-full rounded-full bg-[#E9ECF8] text-[21px] font-bold text-charcoal transition active:scale-[0.98]"
        >
          {t("done")}
        </button>
      </div>

      {/* Delete confirmation */}
      {pendingDelete && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/35 backdrop-blur-[2px]"
          role="dialog"
          aria-modal="true"
          aria-label="Delete attachment confirmation"
          onClick={() => setPendingDelete(null)}
        >
          <div
            className="mx-6 w-full max-w-[300px] rounded-[28px] bg-white p-6 text-center shadow-[0_24px_60px_rgba(0,0,0,0.25)]"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-[20px] font-bold text-charcoal">
              {t("deleteTitle")}
            </h2>
            <p className="mt-2 text-[14px] leading-snug text-charcoal/60">
              {pendingDelete.kind === "video" ? t("deleteBodyVideo") : t("deleteBodyPhoto")}
            </p>
            <button
              type="button"
              onClick={confirmDelete}
              className="mt-6 h-[50px] w-full rounded-full bg-end-red text-[17px] font-semibold text-white transition active:scale-[0.98]"
            >
              {t("delete")}
            </button>
            <button
              type="button"
              onClick={() => setPendingDelete(null)}
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
