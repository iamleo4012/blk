"use client";

import { useState } from "react";
import { ArrowLeft, CalendarDays, CheckCircle2, Download } from "lucide-react";
import {
  fmtClock,
  fmtDate,
  fmtDurLong,
  type Report,
} from "@/lib/data";
import { downloadReportPdf } from "@/lib/pdf";
import LocationsCard from "./LocationsCard";
import AttachmentsCard from "./AttachmentsCard";
import TranscriptionControls, { type TransLang } from "./TranscriptionControls";
import TranscriptionsView from "./TranscriptionsView";
import AiReportCard from "./AiReportCard";

/** Details workspace for the selected report (two-column layout). */
export default function ReportDetail({
  report,
  onBack,
}: {
  report: Report;
  onBack: () => void;
}) {
  // Transcription language is independent of the AI report language.
  const [transLang, setTransLang] = useState<TransLang>("en");
  const [transOpen, setTransOpen] = useState(false);

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-[16px]">
      {/* Detail header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-[16px]">
          <button
            type="button"
            aria-label="Back"
            onClick={onBack}
            className="flex h-[42px] w-[42px] items-center justify-center rounded-full border border-[#E4E6F0] bg-white text-charcoal shadow-[0_1px_4px_rgba(30,41,82,0.06)] transition hover:border-[#c9cdda]"
          >
            <ArrowLeft className="h-[20px] w-[20px]" strokeWidth={2.2} />
          </button>
          <h2 className="text-[24px] font-bold text-charcoal">Report</h2>
        </div>
        <button
          type="button"
          onClick={() => downloadReportPdf(report)}
          className="flex h-[46px] items-center gap-[10px] rounded-full border border-[#E4E6F0] bg-white px-[20px] text-[16px] font-bold text-charcoal shadow-[0_1px_4px_rgba(30,41,82,0.06)] transition hover:border-[#c9cdda]"
        >
          <Download className="h-[19px] w-[19px]" strokeWidth={2} />
          Download (PDF)
        </button>
      </div>

      {/* Staff info card */}
      <div className="flex items-center justify-between rounded-[20px] border border-[#E7E9F1] bg-white px-[18px] py-[14px] shadow-[0_2px_10px_rgba(20,26,46,0.05)]">
        <div className="flex items-center gap-[18px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={report.staffPhoto}
            alt={report.staffName}
            className="h-[76px] w-[76px] rounded-[14px] object-cover"
          />
          <div>
            <p className="text-[24px] font-bold leading-tight text-charcoal">
              {report.staffName}
            </p>
            <p className="mt-[4px] flex items-center gap-[7px] text-[16px] text-charcoal/70">
              <CalendarDays className="h-[17px] w-[17px]" strokeWidth={2} />
              {fmtDate(report.startedAt)}, {fmtClock(report.startedAt)} ·{" "}
              {fmtDurLong(report.durationSec)}
            </p>
          </div>
        </div>
        <span className="flex items-center gap-[8px] rounded-full bg-[#E9F9EE] px-[16px] py-[9px] text-[15px] font-bold text-[#1A8F36]">
          <CheckCircle2 className="h-[18px] w-[18px]" strokeWidth={2.2} />
          Report Completed
        </span>
      </div>

      {/* Two-column workspace */}
      <div className="grid min-h-0 flex-1 grid-cols-1 gap-[16px] xl:grid-cols-[minmax(0,1fr)_minmax(0,0.92fr)]">
        <div className="flex min-h-0 flex-col gap-[16px] overflow-y-auto pr-1">
          <LocationsCard
            start={report.startLocation}
            end={report.endLocation}
          />
          <AttachmentsCard media={report.media} audio={report.audio} />
        </div>
        <div className="flex min-h-0 flex-col gap-[16px] overflow-y-auto pr-1">
          <TranscriptionControls
            lang={transLang}
            onLangChange={setTransLang}
            open={transOpen}
            onToggleOpen={() => setTransOpen((o: boolean) => !o)}
          />
          <AiReportCard sections={report.aiSections} />
          {transOpen && <TranscriptionsView audio={report.audio} lang={transLang} />}
        </div>
      </div>
    </div>
  );
}
