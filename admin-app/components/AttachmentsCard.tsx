"use client";

import { useState } from "react";
import { Image as ImageIcon, Mic, Play, X } from "lucide-react";
import { fmtDur, type MediaItem } from "@/lib/data";
import AudioItem from "./AudioItem";
import type { AudioRecording } from "@/lib/data";

type Tab = "media" | "audio";

/**
 * Attachments card: Photos & Videos tab (horizontal thumbnail grid with
 * larger preview modal + in-app video playback) and Audio Recordings tab
 * (separate list with playback). Counts reflect the session data.
 */
export default function AttachmentsCard({
  media,
  audio,
}: {
  media: MediaItem[];
  audio: AudioRecording[];
}) {
  const [tab, setTab] = useState<Tab>("media");
  const [preview, setPreview] = useState<MediaItem | null>(null);

  return (
    <div className="rounded-[20px] border border-[#E7E9F1] bg-white p-[18px] shadow-[0_2px_10px_rgba(20,26,46,0.05)]">
      <div className="flex items-center gap-[10px]">
        <ImageIcon className="h-[22px] w-[22px] text-charcoal" strokeWidth={2} />
        <h2 className="text-[20px] font-bold text-charcoal">Attachments</h2>
      </div>

      {/* Tabs */}
      <div className="mt-[14px] grid grid-cols-2 overflow-hidden rounded-full border border-[#E7E9F1] text-[15px] font-semibold">
        <button
          type="button"
          onClick={() => setTab("media")}
          className={`py-[10px] transition ${
            tab === "media" ? "bg-accent-soft font-bold text-accent" : "text-charcoal/60"
          }`}
        >
          Photos &amp; Videos ({media.length})
        </button>
        <button
          type="button"
          onClick={() => setTab("audio")}
          className={`py-[10px] transition ${
            tab === "audio" ? "bg-accent-soft font-bold text-accent" : "text-charcoal/60"
          }`}
        >
          Audio Recordings ({audio.length})
        </button>
      </div>

      {tab === "media" && (
        <div className="mt-[14px] flex gap-[12px] overflow-x-auto pb-1">
          {media.map((m) => (
            <button
              key={m.id}
              type="button"
              aria-label={`Preview ${m.kind}`}
              onClick={() => setPreview(m)}
              className="relative h-[104px] w-[148px] shrink-0 overflow-hidden rounded-[14px] transition hover:opacity-90"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={m.url} alt={m.kind} className="h-full w-full object-cover" />
              {m.kind === "photo" ? (
                <span className="absolute right-[6px] top-[6px] flex h-[20px] w-[20px] items-center justify-center rounded-full bg-black/45">
                  <ImageIcon className="h-[12px] w-[12px] text-white" strokeWidth={2.2} />
                </span>
              ) : (
                <>
                  <span className="absolute inset-0 bg-black/20" />
                  <span className="absolute inset-0 flex items-center justify-center">
                    <Play className="h-[30px] w-[30px] fill-white text-white drop-shadow" />
                  </span>
                  <span className="absolute bottom-[6px] right-[6px] rounded-full bg-black/65 px-[8px] py-[2px] text-[11px] font-semibold tabular-nums text-white">
                    {fmtDur(m.duration ?? 0)}
                  </span>
                </>
              )}
            </button>
          ))}
        </div>
      )}

      {tab === "audio" && (
        <div className="mt-[14px] flex flex-col gap-[10px]">
          {audio.map((rec) => (
            <AudioItem key={rec.id} rec={rec} />
          ))}
        </div>
      )}

      {/* Larger preview modal — photos inline, videos playable */}
      {preview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-8"
          role="dialog"
          aria-modal="true"
          onClick={() => setPreview(null)}
        >
          <div
            className="relative max-h-[86vh] max-w-[860px] overflow-hidden rounded-[20px] bg-black"
            onClick={(e) => e.stopPropagation()}
          >
            {preview.kind === "photo" ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview.url} alt={preview.kind} className="max-h-[80vh] w-auto object-contain" />
            ) : (
              <video src={preview.url} controls autoPlay className="max-h-[80vh] w-auto" />
            )}
            <button
              type="button"
              aria-label="Close preview"
              onClick={() => setPreview(null)}
              className="absolute right-[10px] top-[10px] flex h-[36px] w-[36px] items-center justify-center rounded-full bg-black/60 text-white transition active:scale-95"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {/* Audio tab indicator icon (kept for parity with reference header) */}
      {tab === "audio" && (
        <div className="sr-only">
          <Mic />
        </div>
      )}
    </div>
  );
}
