"use client";

import { useState } from "react";
import {
  AlertTriangle,
  ChevronDown,
  FileText,
  Sparkles,
  Wrench,
  CheckCircle2,
  AudioWaveform,
  FileBarChart2,
} from "lucide-react";
import type { AiSection } from "@/lib/data";

const SECTION_ICONS = {
  summary: FileText,
  work: Wrench,
  observations: FileBarChart2,
  warning: AlertTriangle,
  action: CheckCircle2,
  notes: FileText,
} as const;

const SECTION_TINT = {
  summary: "bg-accent-soft",
  work: "bg-[#EAF2FF]",
  observations: "bg-[#F0F4FF]",
  warning: "bg-[#FFEBEB]",
  action: "bg-[#E9F9EE]",
  notes: "bg-[#F5F3FF]",
} as const;

type Lang = "en" | "ar";

/**
 * AI Generated Report card. Language pills switch the report body between
 * British English and Arabic (RTL). Sections are collapsible; headings are
 * dynamic — whatever the backend generated for this report.
 */
export default function AiReportCard({ sections }: { sections: AiSection[] }) {
  const [lang, setLang] = useState<Lang>("en");
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const rtl = lang === "ar";

  return (
    <div className="rounded-[20px] border border-[#E7E9F1] bg-white p-[18px] shadow-[0_2px_10px_rgba(20,26,46,0.05)]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-[10px]">
          <Sparkles className="h-[24px] w-[24px] text-accent" strokeWidth={2} />
          <h2 className="text-[21px] font-bold text-accent">AI Generated Report</h2>
        </div>
        <div className="flex overflow-hidden rounded-full border border-[#E7E9F1] text-[14px] font-bold">
          <button
            type="button"
            onClick={() => setLang("en")}
            className={`px-[18px] py-[9px] transition ${
              lang === "en" ? "bg-accent text-white" : "text-charcoal/60"
            }`}
          >
            English (UK)
          </button>
          <button
            type="button"
            onClick={() => setLang("ar")}
            className={`px-[18px] py-[9px] transition ${
              lang === "ar" ? "bg-accent text-white" : "text-charcoal/60"
            }`}
          >
            العربية
          </button>
        </div>
      </div>

      {/* Report body — direction flips for Arabic */}
      <div dir={rtl ? "rtl" : "ltr"} className="mt-[14px] flex flex-col gap-[10px]">
        {sections.map((s) => {
          const Icon = SECTION_ICONS[s.icon] ?? FileText;
          const title = rtl ? s.titleAr : s.titleEn;
          const isCollapsed = collapsed[s.id];
          return (
            <div
              key={s.id}
              className="overflow-hidden rounded-[16px] border border-[#EEF0F6] bg-white"
            >
              <button
                type="button"
                onClick={() => setCollapsed((c) => ({ ...c, [s.id]: !c[s.id] }))}
                className="flex w-full items-center gap-[12px] px-[14px] py-[12px] text-start"
                aria-expanded={!isCollapsed}
              >
                <span
                  className={`flex h-[36px] w-[36px] shrink-0 items-center justify-center rounded-[10px] ${SECTION_TINT[s.icon]}`}
                >
                  <Icon className="h-[19px] w-[19px] text-accent" strokeWidth={2} />
                </span>
                <span className="flex-1 text-[17px] font-bold text-charcoal">{title}</span>
                <ChevronDown
                  className={`h-[20px] w-[20px] shrink-0 text-charcoal/50 transition-transform ${
                    isCollapsed ? "" : "rotate-180"
                  }`}
                />
              </button>

              {!isCollapsed && (
                <div className="border-t border-[#F0F1F7] px-[16px] py-[12px]">
                  {s.bodyEn && (
                    <p className="text-[15px] leading-relaxed text-charcoal/80">
                      {rtl ? s.bodyAr : s.bodyEn}
                    </p>
                  )}
                  {(() => {
                    const bullets = rtl ? s.bulletsAr : s.bulletsEn;
                    if (!bullets) return null;
                    return (
                      <ul className="flex list-disc flex-col gap-[5px] ps-[22px]">
                        {bullets.map((b, i) => (
                          <li key={i} className="text-[15px] leading-relaxed text-charcoal/80">
                            {b}
                          </li>
                        ))}
                      </ul>
                    );
                  })()}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
