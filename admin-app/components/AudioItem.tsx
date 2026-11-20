"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import { fmtDur, type AudioRecording } from "@/lib/data";

/** Deterministic decorative waveform bars (one per recording id). */
function waveform(seed: number, bars = 42): number[] {
  const heights: number[] = [];
  let x = seed * 7 + 3;
  for (let i = 0; i < bars; i++) {
    x = (x * 1103515245 + 12345) % 2147483648;
    heights.push(6 + (x % 22));
  }
  return heights;
}

function hashId(id: string): number {
  let h = 0;
  for (const c of id) h = (h * 31 + c.charCodeAt(0)) % 9973;
  return h;
}

/**
 * One audio recording row: custom play/pause, waveform, name, duration.
 * Uses the recording's own source (mock silent WAV / server audio).
 */
export default function AudioItem({ rec }: { rec: AudioRecording }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0); // 0..1
  const bars = waveform(hashId(rec.id));

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    const onTime = () => {
      if (el.duration > 0) setProgress(el.currentTime / el.duration);
    };
    const onEnd = () => {
      setPlaying(false);
      setProgress(0);
    };
    el.addEventListener("timeupdate", onTime);
    el.addEventListener("ended", onEnd);
    return () => {
      el.removeEventListener("timeupdate", onTime);
      el.removeEventListener("ended", onEnd);
    };
  }, []);

  function toggle() {
    const el = audioRef.current;
    if (!el) return;
    if (playing) {
      el.pause();
      setPlaying(false);
    } else {
      void el.play();
      setPlaying(true);
    }
  }

  return (
    <div className="flex items-center gap-[14px] rounded-[16px] border border-[#E7E9F1] bg-[#FBFBFE] px-[14px] py-[10px]">
      <button
        type="button"
        aria-label={playing ? "Pause" : "Play"}
        onClick={toggle}
        className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-full bg-white text-accent shadow-[0_2px_8px_rgba(30,41,82,0.12)] transition active:scale-95"
      >
        {playing ? (
          <Pause className="h-[20px] w-[20px] fill-accent" />
        ) : (
          <Play className="ml-[2px] h-[20px] w-[20px] fill-accent" />
        )}
      </button>

      <span className="shrink-0 text-[16px] font-bold text-charcoal">{rec.name}</span>

      {/* Waveform with playback progress */}
      <div className="relative flex h-[30px] flex-1 items-center gap-[3px] overflow-hidden">
        {bars.map((h, i) => {
          const done = i / bars.length <= progress;
          return (
            <span
              key={i}
              className={`w-[4px] rounded-full ${done ? "bg-accent" : "bg-[#B9BDD1]"}`}
              style={{ height: `${h + 8}px` }}
            />
          );
        })}
      </div>

      <span className="shrink-0 text-[15px] font-semibold tabular-nums text-charcoal/70">
        {fmtDur(rec.durationSec)}
      </span>

      <audio ref={audioRef} src={rec.url} preload="auto" className="hidden-audio" />
    </div>
  );
}
