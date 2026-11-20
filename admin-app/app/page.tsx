"use client";

import { useMemo, useState } from "react";
import { CalendarDays, ChevronRight, Filter, Search } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import DateRangePicker from "@/components/DateRangePicker";
import ReportDetail from "@/components/ReportDetail";
import { fmtClock, fmtDate, getReports } from "@/lib/data";

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export default function ReportsPage() {
  const allReports = useMemo(() => getReports(), []);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [appliedFrom, setAppliedFrom] = useState<Date>(new Date("2026-11-01"));
  const [appliedTo, setAppliedTo] = useState<Date>(new Date("2026-11-30"));

  const selected = selectedId ? (allReports.find((r) => r.id === selectedId) ?? null) : null;

  const filtered = useMemo(
    () =>
      allReports.filter((r) => {
        const matchesName = r.staffName
          .toLowerCase()
          .includes(query.trim().toLowerCase());
        const day = startOfDay(new Date(r.startedAt));
        const inRange = day >= startOfDay(appliedFrom) && day <= startOfDay(appliedTo);
        return matchesName && inRange;
      }),
    [allReports, query, appliedFrom, appliedTo],
  );

  return (
    <div className="min-h-screen bg-[#F4F5FB]">
      <Sidebar />
      <div className="ml-[232px] flex h-screen flex-col p-[18px_22px]">
        {/* Workspace header */}
        <div className="flex items-center justify-between gap-[20px]">
          <h1 className="text-[30px] font-bold tracking-[-0.01em] text-charcoal">
            Reports
          </h1>
          <div className="flex flex-1 items-center justify-center px-[16px]">
            <div className="flex h-[52px] w-full max-w-[560px] items-center gap-[12px] rounded-[14px] border border-[#E4E6F0] bg-white px-[18px] shadow-[0_1px_4px_rgba(30,41,82,0.06)]">
              <Search className="h-[20px] w-[20px] shrink-0 text-charcoal/45" strokeWidth={2} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name..."
                className="h-full w-full border-0 bg-transparent text-[16px] text-charcoal placeholder:text-charcoal/40 focus:outline-none"
              />
            </div>
          </div>
          <DateRangePicker
            from={appliedFrom}
            to={appliedTo}
            onApply={(f, t) => {
              setAppliedFrom(f);
              setAppliedTo(t);
              // Keep the selected report only if it stays inside the range;
              // otherwise fall back to the first available report.
              if (selected) {
                const day = startOfDay(new Date(selected.startedAt));
                const stillInRange = day >= startOfDay(f) && day <= startOfDay(t);
                if (!stillInRange) {
                  const next = allReports.find((r) => {
                    const d = startOfDay(new Date(r.startedAt));
                    return d >= startOfDay(f) && d <= startOfDay(t) && r.staffName.toLowerCase().includes(query.trim().toLowerCase());
                  });
                  setSelectedId(next ? next.id : null);
                }
              }
            }}
          />
        </div>

        {/* Workspace body: list panel + details */}
        <div className="mt-[14px] grid min-h-0 flex-1 grid-cols-1 gap-[16px] lg:grid-cols-[260px_minmax(0,1fr)]">
          {/* List panel */}
          <div className="flex min-h-0 flex-col rounded-[20px] border border-[#E7E9F1] bg-white p-[14px] shadow-[0_2px_10px_rgba(20,26,46,0.05)]">
            <div className="flex items-center justify-between px-1">
              <span className="text-[19px] font-bold text-charcoal">
                All Reports ({filtered.length})
              </span>
              <Filter className="h-[20px] w-[20px] text-charcoal/60" strokeWidth={2} />
            </div>

            <div className="mt-[12px] flex min-h-0 flex-1 flex-col gap-[10px] overflow-y-auto pr-[2px]">
              {filtered.length === 0 && (
                <p className="px-2 py-8 text-center text-[14px] text-charcoal/45">
                  No reports match this search or date range.
                </p>
              )}
              {filtered.map((r) => {
                const active = selectedId === r.id;
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setSelectedId(r.id)}
                    className={`flex items-center justify-between rounded-[16px] px-[16px] py-[13px] text-start transition ${
                      active
                        ? "bg-accent-soft"
                        : "border border-[#EEF0F6] hover:bg-[#F7F8FC]"
                    }`}
                  >
                    <span>
                      <span className="block text-[17px] font-bold leading-tight text-charcoal">
                        {r.staffName}
                      </span>
                      <span className="mt-[3px] flex items-center gap-[6px] text-[14px] text-charcoal/60">
                        <CalendarDays className="h-[14px] w-[14px]" strokeWidth={2} />
                        {fmtDate(r.startedAt)}, {fmtClock(r.startedAt)}
                      </span>
                    </span>
                    <ChevronRight
                      className={`h-[20px] w-[20px] shrink-0 ${active ? "text-accent" : "text-charcoal/40"}`}
                      strokeWidth={2.2}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Details */}
          {selected ? (
            <ReportDetail report={selected} onBack={() => setSelectedId(null)} />
          ) : (
            <div className="flex items-center justify-center rounded-[20px] border border-[#E7E9F1] bg-white shadow-[0_2px_10px_rgba(20,26,46,0.05)]">
              <div className="text-center">
                <p className="text-[19px] font-bold text-charcoal">Select a report</p>
                <p className="mt-1 text-[14px] text-charcoal/50">
                  Choose a report from the list to view its details.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
