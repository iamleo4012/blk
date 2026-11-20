"use client";

import { Clock, MapPin } from "lucide-react";
import MapView from "./MapView";
import { fmtCoord, type GeoPoint } from "@/lib/data";

function LocationRow({
  color,
  title,
  point,
}: {
  color: string;
  title: string;
  point: GeoPoint;
}) {
  return (
    <div className="flex gap-[12px]">
      {/* Vertical connector */}
      <div className="flex flex-col items-center pt-[3px]">
        <span className={`h-[14px] w-[14px] rounded-full border-[3px] ${color}`} />
        <span className="mt-1 w-[2px] flex-1 rounded-full bg-[#E2E4EE]" />
      </div>
      <div className="pb-[14px]">
        <p className="text-[16px] font-bold text-charcoal">{title}</p>
        <p className="mt-[4px] flex items-center gap-[6px] text-[15px] text-charcoal/75">
          <MapPin className="h-[15px] w-[15px] text-charcoal/55" strokeWidth={2} />
          {fmtCoord(point)}
        </p>
        <p className="mt-[2px] flex items-center gap-[6px] text-[15px] text-charcoal/75">
          <Clock className="h-[15px] w-[15px] text-charcoal/55" strokeWidth={2} />
          {point.time}
        </p>
      </div>
    </div>
  );
}

/** Locations card: start/end coordinates with times + route map. */
export default function LocationsCard({
  start,
  end,
}: {
  start: GeoPoint;
  end: GeoPoint;
}) {
  return (
    <div className="rounded-[20px] border border-[#E7E9F1] bg-white p-[18px] shadow-[0_2px_10px_rgba(20,26,46,0.05)]">
      <div className="flex items-center gap-[10px]">
        <MapPin className="h-[22px] w-[22px] text-charcoal" strokeWidth={2} />
        <h2 className="text-[20px] font-bold text-charcoal">Locations</h2>
      </div>

      <div className="mt-[12px] flex flex-col gap-[14px] xl:flex-row">
        <div className="min-w-[220px] flex-1">
          <LocationRow color="border-[#1FA33A] bg-white" title="Start Location" point={start} />
          <LocationRow color="border-[#E5231B] bg-white" title="End Location" point={end} />
        </div>
        <div className="h-[180px] w-full shrink-0 xl:h-auto xl:w-[210px]">
          <MapView start={start} end={end} height={186} />
        </div>
      </div>
    </div>
  );
}
