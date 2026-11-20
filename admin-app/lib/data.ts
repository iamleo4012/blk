/**
 * Admin data layer (mock).
 *
 * This module is the ONLY place report data comes from. It mirrors the
 * staff application's actual collection model: registered staff name +
 * face, session start/end timestamps, start/end GPS coordinates, duration,
 * captured photos/videos, individual audio recordings with per-recording
 * original transcription + English/Arabic translations, and the generated
 * AI report. When the backend API is ready, replace `getReports()` /
 * `getReport(id)` with fetch calls — the shapes stay identical.
 */

export interface GeoPoint {
  lat: number;
  lng: number;
  /** Recorded time for this point. */
  time: string;
}

export interface MediaItem {
  id: string;
  kind: "photo" | "video";
  /** data: or http: URL of the captured media. */
  url: string;
  /** Seconds, videos only. */
  duration?: number;
}

export interface AudioRecording {
  id: string;
  /** Sequence name shown in the UI, e.g. "Audio 1". */
  name: string;
  durationSec: number;
  /** Playable source (mock: generated silent WAV; real: server file URL). */
  url: string;
  /** Original verbatim transcription of this recording. */
  originalTranscript: string;
  /** British-English translation of the full spoken content. */
  transcriptEn: string;
  /** Arabic translation of the full spoken content. */
  transcriptAr: string;
}

export interface AiSection {
  id: string;
  icon: "summary" | "work" | "observations" | "warning" | "action" | "notes";
  titleEn: string;
  titleAr: string;
  /** Paragraph form (Executive Summary / Additional Notes). */
  bodyEn?: string;
  bodyAr?: string;
  bulletsEn?: string[];
  bulletsAr?: string[];
}

export interface Report {
  id: string;
  /** Registered staff member's name (from staff registration). */
  staffName: string;
  /** Registered staff face image. */
  staffPhoto: string;
  /** Session start timestamp (ISO). */
  startedAt: string;
  /** Session end timestamp (ISO). */
  endedAt: string;
  /** Task duration in seconds (endedAt - startedAt). */
  durationSec: number;
  startLocation: GeoPoint;
  endLocation: GeoPoint;
  media: MediaItem[];
  audio: AudioRecording[];
  aiSections: AiSection[];
  status: "completed";
}

export interface DateRange {
  from: string; // ISO date (yyyy-mm-dd)
  to: string;
}

/* ------------------------------------------------------------------ */
/* Placeholder media generators (mock only).                           */
/* ------------------------------------------------------------------ */

let svgSeed = 0;
function svgPhoto(label: string, hue: number): string {
  svgSeed += 1;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="220">
  <rect width="320" height="220" fill="hsl(${hue},28%,72%)"/>
  <rect x="0" y="150" width="320" height="70" fill="hsl(${hue},18%,48%)"/>
  <rect x="${30 + (svgSeed % 5) * 40}" y="90" width="70" height="70" fill="hsl(${(hue + 40) % 360},45%,55%)" rx="6"/>
  <rect x="${140 + (svgSeed % 3) * 30}" y="105" width="90" height="55" fill="hsl(${(hue + 90) % 360},35%,60%)" rx="6"/>
  <text x="160" y="205" font-family="sans-serif" font-size="14" fill="#fff" text-anchor="middle" opacity="0.85">${label}</text>
</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function svgVideoFrame(label: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="220">
  <rect width="320" height="220" fill="#5b6b7e"/>
  <rect x="0" y="160" width="320" height="60" fill="#46566a"/>
  <circle cx="160" cy="100" r="34" fill="#ffffff" opacity="0.9"/>
  <path d="M150 82 L186 100 L150 118 Z" fill="#2b3947"/>
  <text x="160" y="205" font-family="sans-serif" font-size="14" fill="#fff" text-anchor="middle" opacity="0.85">${label}</text>
</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function svgFace(name: string): string {
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("");
  const hue = (name.length * 47) % 360;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160">
  <rect width="160" height="160" fill="hsl(${hue},30%,80%)"/>
  <circle cx="80" cy="62" r="30" fill="hsl(${hue},25%,55%)"/>
  <path d="M30 160 C30 118 55 104 80 104 C105 104 130 118 130 160 Z" fill="hsl(${hue},35%,45%)"/>
  <text x="80" y="150" font-family="sans-serif" font-size="28" font-weight="bold" fill="#fff" text-anchor="middle">${initials}</text>
</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/** Generates a silent WAV data-URI of `seconds` length (mock playback). */
export function silentWavDataUri(seconds: number, sampleRate = 2000): string {
  const samples = Math.floor(seconds * sampleRate);
  const dataSize = samples * 2;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);
  const w = (offset: number, text: string) => {
    for (let i = 0; i < text.length; i++) view.setUint8(offset + i, text.charCodeAt(i));
  };
  w(0, "RIFF");
  view.setUint32(4, 36 + dataSize, true);
  w(8, "WAVE");
  w(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, 1, true); // mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  w(36, "data");
  view.setUint32(40, dataSize, true);
  let binary = "";
  const bytes = new Uint8Array(buffer);
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return `data:audio/wav;base64,${btoa(binary)}`;
}

/* ------------------------------------------------------------------ */
/* Content builders.                                                   */
/* ------------------------------------------------------------------ */

function kuwaitPoint(lat: number, lng: number, time: string): GeoPoint {
  return { lat, lng, time };
}

function leoSections(): AiSection[] {
  return [
    {
      id: "summary",
      icon: "summary",
      titleEn: "Executive Summary",
      titleAr: "الملخص التنفيذي",
      bodyEn:
        "The site inspection from Salmiya to Hawally covered ongoing road excavation work, safety arrangements, and a delay in progress due to utility relocation.",
      bodyAr:
        "غطّى التفتيش الميداني من السالمية إلى حولي أعمال حفر الطرق الجارية، وترتيبات السلامة، وتأخرًا في التقدم بسبب نقل المرافق.",
    },
    {
      id: "work",
      icon: "work",
      titleEn: "Work Performed",
      titleAr: "الأعمال المنفذة",
      bulletsEn: ["Road excavation and trenching for utility installation."],
      bulletsAr: ["حفر الطرق والحفر الخنادق لتركيب المرافق."],
    },
    {
      id: "observations",
      icon: "observations",
      titleEn: "Observations",
      titleAr: "الملاحظات",
      bulletsEn: [
        "Excavation work is in progress.",
        "Safety barriers are placed, but some areas are not properly covered.",
        "Heavy machinery was in operation during the visit.",
      ],
      bulletsAr: [
        "أعمال الحفر جارية.",
        "تم وضع حواجز السلامة، لكن بعض المناطق غير مغطاة بشكل صحيح.",
        "كانت الآلات الثقيلة تعمل خلال الزيارة.",
      ],
    },
    {
      id: "warning",
      icon: "warning",
      titleEn: "Issues / Concerns",
      titleAr: "المشاكل / المخاوف",
      bulletsEn: [
        "Risk of open trench in certain sections.",
        "Delay in progress due to utility relocation.",
      ],
      bulletsAr: [
        "خطر الخندق المفتوح في أقسام معينة.",
        "التأخر في التقدم بسبب نقل المرافق.",
      ],
    },
    {
      id: "action",
      icon: "action",
      titleEn: "Actions / Recommendations",
      titleAr: "الإجراءات / التوصيات",
      bulletsEn: [
        "Ensure full coverage and proper barricading of open areas.",
        "Coordinate with the utility team to confirm the revised completion date.",
      ],
      bulletsAr: [
        "ضمان التغطية الكاملة والسد المناسب للمناطق المفتوحة.",
        "التنسيق مع فريق المرافق لتأكيد تاريخ الإنجاز المنقح.",
      ],
    },
    {
      id: "notes",
      icon: "notes",
      titleEn: "Additional Notes",
      titleAr: "ملاحظات إضافية",
      bodyEn:
        "All details from both audio recordings are included, transcribed, translated, and organised without omitting any information.",
      bodyAr:
        "جميع التفاصيل من التسجيلين الصوتيين مدرجة ومنسوخة ومترجمة ومنظمة دون إغفال أي معلومة.",
    },
  ];
}

function genericSections(topic: string): AiSection[] {
  const T = topic;
  return [
    {
      id: "summary",
      icon: "summary",
      titleEn: "Executive Summary",
      titleAr: "الملخص التنفيذي",
      bodyEn: `Field visit completed covering ${T}. All spoken details from the recordings are transcribed and included in full.`,
      bodyAr: `اكتملت الزيارة الميدانية التي غطت ${T}. جميع التفاصيل المنطوقة من التسجيلات مكتوبة ومدرجة بالكامل.`,
    },
    {
      id: "work",
      icon: "work",
      titleEn: "Work Performed",
      titleAr: "الأعمال المنفذة",
      bulletsEn: [`Site inspection performed for ${T}.`],
      bulletsAr: [`تم إجراء تفتيش الموقع لـ ${T}.`],
    },
    {
      id: "observations",
      icon: "observations",
      titleEn: "Observations",
      titleAr: "الملاحظات",
      bulletsEn: [
        `General condition of the ${T} site was documented.`,
        "On-site personnel were present during the visit.",
      ],
      bulletsAr: [
        `تم توثيق الحالة العامة لموقع ${T}.`,
        "كان العاملون في الموقع حاضرين خلال الزيارة.",
      ],
    },
    {
      id: "action",
      icon: "action",
      titleEn: "Actions / Recommendations",
      titleAr: "الإجراءات / التوصيات",
      bulletsEn: ["Follow-up visit recommended to verify completion."],
      bulletsAr: ["يوصى بزيارة متابعة للتحقق من الإنجاز."],
    },
    {
      id: "notes",
      icon: "notes",
      titleEn: "Additional Notes",
      titleAr: "ملاحظات إضافية",
      bodyEn:
        "Every spoken detail from all recordings is preserved in the transcriptions section.",
      bodyAr: "كل تفصيلة منطوقة من جميع التسجيلات محفوظة في قسم النصوص.",
    },
  ];
}

function leoAudio(): AudioRecording[] {
  const a1 = {
    id: "leo-a1",
    name: "Audio 1",
    durationSec: 36,
    originalTranscript:
      "ഇവിടെ റോഡ് ഉഴുമുന്നു, സേഫ്റ്റി ബാരിക്കേഡ് വെച്ചിട്ടുണ്ട്, പക്ഷേ ചില ഭാഗം കവറായിട്ടില്ല. ജെസിബി ജോലി ചെയ്യുന്നുണ്ട്.",
    transcriptEn:
      "Road excavation is going on here. Safety barricades are placed, but some sections are still uncovered. The JCB (excavator) is working.",
    transcriptAr:
      "حفر الطرق جارٍ هنا. تم وضع حواجز السلامة، لكن بعض الأقسام لا تزال غير مغطاة. الحفارة تعمل.",
  };
  const a2 = {
    id: "leo-a2",
    name: "Audio 2",
    durationSec: 72,
    originalTranscript:
      "യൂട്ടിലിറ്റി ടീം ലൈൻ മാറ്റുന്നത് കൊണ്ട് വർക്ക് ഡീലേ ആണ്. ഓപ്പൺ ട്രെഞ്ച് ഭാഗത്ത് ബാരിക്കേഡ് പൂർത്തിയാക്കണം, നാളെ ചെക്ക് ചെയ്യാം.",
    transcriptEn:
      "Work is delayed because the utility team is relocating the line. Barricading of the open trench section must be completed; we can check again tomorrow.",
    transcriptAr:
      "العمل متأخر لأن فريق المرافق ينقل الخط. يجب إكمال سد قسم الخندق المفتوح؛ يمكننا التحقق مرة أخرى غدًا.",
  };
  return [
    { ...a1, url: silentWavDataUri(a1.durationSec) },
    { ...a2, url: silentWavDataUri(a2.durationSec) },
  ];
}

function genericAudio(index: number, dur: number): AudioRecording[] {
  const rec: AudioRecording = {
    id: `gen-${index}-a1`,
    name: "Audio 1",
    durationSec: dur,
    originalTranscript: "സൈറ്റ് വിസിറ്റ് പൂർത്തിയായി, എല്ലാം നന്നായിട്ടുണ്ട്.",
    transcriptEn: "The site visit is complete; everything is in order.",
    transcriptAr: "اكتملت زيارة الموقع؛ كل شيء على ما يرام.",
    url: "",
  };
  rec.url = silentWavDataUri(dur);
  return [rec];
}

/* ------------------------------------------------------------------ */
/* Mock report set — 24 reports, latest first.                         */
/* ------------------------------------------------------------------ */

const NAMED: Array<Partial<Report> & { staffName: string }> = [
  {
    staffName: "Leo Joseph",
    startedAt: "2026-11-19T10:00:00",
    endedAt: "2026-11-19T10:58:00",
    startLocation: kuwaitPoint(29.3759, 47.9774, "10:00 AM"),
    endLocation: kuwaitPoint(29.3117, 48.0123, "10:58 AM"),
    media: [
      { id: "m1", kind: "photo", url: svgPhoto("Salmiya Road", 20) },
      { id: "m2", kind: "photo", url: svgPhoto("Excavator", 30) },
      { id: "m3", kind: "photo", url: svgPhoto("Open Trench", 24) },
      { id: "m4", kind: "video", url: svgVideoFrame("Site Video"), duration: 24 },
    ],
    audio: leoAudio(),
    aiSections: leoSections(),
  },
  {
    staffName: "Akhil Raj",
    startedAt: "2026-11-19T09:12:00",
    endedAt: "2026-11-19T09:47:00",
    startLocation: kuwaitPoint(29.3378, 47.9421, "09:12 AM"),
    endLocation: kuwaitPoint(29.3512, 47.9395, "09:47 AM"),
    media: [
      { id: "am1", kind: "photo", url: svgPhoto("Warehouse Bay", 210) },
      { id: "am2", kind: "photo", url: svgPhoto("Stock Shelves", 200) },
    ],
    audio: genericAudio(2, 41),
  },
  {
    staffName: "Sameer Khan",
    startedAt: "2026-11-18T15:40:00",
    endedAt: "2026-11-18T16:21:00",
    startLocation: kuwaitPoint(29.2907, 48.0524, "03:40 PM"),
    endLocation: kuwaitPoint(29.2761, 48.0701, "04:21 PM"),
    media: [{ id: "sm1", kind: "photo", url: svgPhoto("Ahmadi Yard", 35) }],
    audio: genericAudio(3, 28),
  },
  {
    staffName: "Nisha Thomas",
    startedAt: "2026-11-18T10:31:00",
    endedAt: "2026-11-18T11:03:00",
    startLocation: kuwaitPoint(29.3661, 47.9461, "10:31 AM"),
    endLocation: kuwaitPoint(29.3725, 47.9522, "11:03 AM"),
    media: [
      { id: "nm1", kind: "photo", url: svgPhoto("Hawally Store", 260) },
      { id: "nm2", kind: "video", url: svgVideoFrame("Store Walkthrough"), duration: 18 },
    ],
    audio: genericAudio(4, 33),
  },
  {
    staffName: "Ravi Kumar",
    startedAt: "2026-11-17T15:04:00",
    endedAt: "2026-11-17T15:36:00",
    startLocation: kuwaitPoint(29.2431, 47.9718, "03:04 PM"),
    endLocation: kuwaitPoint(29.2588, 47.9892, "03:36 PM"),
    media: [{ id: "rm1", kind: "photo", url: svgPhoto("Fahaheel Site", 45) }],
    audio: genericAudio(5, 52),
  },
];

const OTHER_NAMES = [
  "Fatima Ali", "Joseph Mathew", "Anwar Sadat", "Meera Nair", "Hassan Rahim",
  "Divya Krishnan", "Omar Farooq", "Sneha Wilson", "Kareem Aziz", "Rinta James",
  "Basil Mohammed", "Lakshmi Menon", "Tariq Salman", "Arjun Pillai", "Zainab Noor",
  "Vivek Chowdhary", "Muneer Ahmad", "Priya Varma", "Suhail Ameen",
];

function buildReports(): Report[] {
  const reports: Report[] = [];
  let day = new Date("2026-11-17T08:00:00");

  // The five named reports (dates fixed per the spec).
  for (const named of NAMED) {
    const started = new Date(named.startedAt as string);
    const ended = new Date(named.endedAt as string);
    reports.push({
      id: `r-${named.staffName.split(" ")[0].toLowerCase()}`,
      staffName: named.staffName,
      staffPhoto: svgFace(named.staffName),
      startedAt: started.toISOString(),
      endedAt: ended.toISOString(),
      durationSec: Math.round((ended.getTime() - started.getTime()) / 1000),
      startLocation: named.startLocation as GeoPoint,
      endLocation: named.endLocation as GeoPoint,
      media: named.media as MediaItem[],
      audio: named.audio as AudioRecording[],
      aiSections: (named.aiSections as AiSection[]) ?? genericSections("the site visit"),
      status: "completed",
    });
  }

  // Nineteen additional generated reports.
  OTHER_NAMES.forEach((staffName, i) => {
    const started = new Date(day.getTime() + i * 47 * 60 * 1000);
    const duration = 35 + ((i * 17) % 50);
    const ended = new Date(started.getTime() + duration * 60 * 1000);
    const topic = ["warehouse audit", "delivery check", "equipment survey", "maintenance round"][i % 4];
    const lat = 29.25 + (i % 10) * 0.015;
    const lng = 47.9 + (i % 7) * 0.02;
    reports.push({
      id: `r-gen-${i}`,
      staffName,
      staffPhoto: svgFace(staffName),
      startedAt: started.toISOString(),
      endedAt: ended.toISOString(),
      durationSec: duration * 60,
      startLocation: kuwaitPoint(lat, lng, fmtTime(started)),
      endLocation: kuwaitPoint(lat + 0.012, lng + 0.018, fmtTime(ended)),
      media: [
        { id: `gm-${i}-1`, kind: "photo", url: svgPhoto(`Report ${i + 6}`, (i * 33) % 360) },
        ...(i % 3 === 0
          ? [{ id: `gm-${i}-2`, kind: "video" as const, url: svgVideoFrame(`Clip ${i + 6}`), duration: 15 }]
          : []),
      ],
      audio: genericAudio(6 + i, 20 + (i * 7) % 40),
      aiSections: genericSections(topic),
      status: "completed",
    });
  });

  return reports.sort((a, b) => b.startedAt.localeCompare(a.startedAt));
}

function fmtTime(d: Date): string {
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
}

const REPORTS = buildReports();

/** All reports, newest first. Replace with the admin API call. */
export function getReports(): Report[] {
  return REPORTS;
}

/** A single report by id. Replace with the admin API call. */
export function getReport(id: string): Report | undefined {
  return REPORTS.find((r) => r.id === id);
}

/** Human date, e.g. "19 Nov 2026". */
export function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** Human time, e.g. "10:24 AM". */
export function fmtClock(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

/** mm:ss from seconds. */
export function fmtDur(total: number): string {
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

/** h:mm:ss from seconds. */
export function fmtDurLong(total: number): string {
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return h > 0
    ? `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
    : `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

/** Coordinate in DMS-ish display: 29.3759° N, 47.9774° E. */
export function fmtCoord(pt: GeoPoint): string {
  const ns = pt.lat >= 0 ? "N" : "S";
  const ew = pt.lng >= 0 ? "E" : "W";
  return `${Math.abs(pt.lat).toFixed(4)}° ${ns}, ${Math.abs(pt.lng).toFixed(4)}° ${ew}`;
}
