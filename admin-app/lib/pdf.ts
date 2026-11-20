import {
  fmtClock,
  fmtCoord,
  fmtDate,
  fmtDurLong,
  type Report,
} from "./data";

/**
 * Print-based PDF export. Opens a print window containing a clean report
 * document (staff identity, locations, media, both transcriptions, and
 * both AI reports) and triggers the browser's Save-as-PDF flow.
 */
export function downloadReportPdf(report: Report) {
  const started = new Date(report.startedAt);
  const duration = fmtDurLong(report.durationSec);

  const mediaHtml = report.media
    .map((m) =>
      m.kind === "photo"
        ? `<img src="${m.url}" style="width:130px;border-radius:8px;border:1px solid #ddd;object-fit:cover;height:90px"/>`
        : `<div style="width:130px;height:90px;border-radius:8px;border:1px solid #ddd;background:#46566a;color:#fff;display:flex;align-items:center;justify-content:center;font-size:12px">Video · ${Math.floor((m.duration ?? 0) / 60)}:${String((m.duration ?? 0) % 60).padStart(2, "0")}</div>`,
    )
    .join("");

  const transcriptions = report.audio
    .map(
      (a) => `
      <h3 style="margin:14px 0 6px">${a.name} (${fmtDurLong(a.durationSec)})</h3>
      <p style="margin:4px 0"><b>Original:</b> ${a.originalTranscript}</p>
      <p style="margin:4px 0"><b>English (UK):</b> ${a.transcriptEn}</p>
      <p style="margin:4px 0"><b>Arabic:</b> <span dir="rtl">${a.transcriptAr}</span></p>`,
    )
    .join("");

  const sectionsHtml = (lang: "en" | "ar") =>
    report.aiSections
      .map((s) => {
        const title = lang === "ar" ? s.titleAr : s.titleEn;
        const body = lang === "ar" ? (s.bodyAr ?? "") : (s.bodyEn ?? "");
        const bullets = lang === "ar" ? (s.bulletsAr ?? []) : (s.bulletsEn ?? []);
        const dir = lang === "ar" ? ' dir="rtl"' : "";
        return `<section${dir} style="margin:12px 0">
          <h3 style="margin:0 0 6px">${title}</h3>
          ${body ? `<p style="margin:4px 0">${body}</p>` : ""}
          ${bullets.length ? `<ul style="margin:4px 0; padding-inline-start:22px">${bullets.map((b) => `<li>${b}</li>`).join("")}</ul>` : ""}
        </section>`;
      })
      .join("");

  const doc = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Field Report — ${report.staffName}</title>
<style>
  body { font-family: -apple-system, 'Segoe UI', Arial, sans-serif; color: #1a2030; margin: 36px; }
  h1 { font-size: 26px; margin: 0 0 4px; }
  h2 { font-size: 19px; margin: 26px 0 8px; border-bottom: 2px solid #e8eaf2; padding-bottom: 6px; }
  h3 { font-size: 15px; margin: 8px 0 4px; }
  .meta { display:flex; gap:24px; align-items:center; margin: 18px 0; }
  .meta img { width:96px; height:96px; border-radius:16px; object-fit:cover; }
  .pill { display:inline-block; background:#e9f9ee; color:#1a8f36; border-radius:999px; padding:6px 14px; font-weight:600; }
  .mono { font-family: Consolas, monospace; }
</style>
</head>
<body>
  <h1>Field Report</h1>
  <div class="meta">
    <img src="${report.staffPhoto}" alt="staff"/>
    <div>
      <h1 style="font-size:22px">${report.staffName}</h1>
      <p style="margin:4px 0">${fmtDate(report.startedAt)}, ${fmtClock(report.startedAt)}</p>
      <span class="pill">Report Completed</span>
    </div>
  </div>

  <h2>Locations</h2>
  <p><b>Start:</b> <span class="mono">${fmtCoord(report.startLocation)}</span> at ${report.startLocation.time}</p>
  <p><b>End:</b> <span class="mono">${fmtCoord(report.endLocation)}</span> at ${report.endLocation.time}</p>
  <p><b>Task duration:</b> ${duration}</p>

  <h2>Photos &amp; Videos</h2>
  <div style="display:flex; gap:10px; flex-wrap:wrap">${mediaHtml}</div>

  <h2>Audio Recordings</h2>
  <p>${report.audio.map((a) => `${a.name} (${fmtDurLong(a.durationSec)})`).join(" · ")}</p>

  <h2>Complete Transcriptions</h2>
  ${transcriptions}

  <h2>AI Generated Report — English (UK)</h2>
  ${sectionsHtml("en")}

  <h2>AI Generated Report — العربية</h2>
  ${sectionsHtml("ar")}
</body>
</html>`;

  const win = window.open("", "_blank", "width=900,height=1000");
  if (!win) return;
  win.document.write(doc);
  win.document.close();
  win.focus();
  // Give the layout a beat, then open the print/save-as-PDF dialog.
  window.setTimeout(() => win.print(), 400);
}
