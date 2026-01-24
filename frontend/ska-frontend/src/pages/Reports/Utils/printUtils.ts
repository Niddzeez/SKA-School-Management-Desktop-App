// src/pages/Reports/Utils/printUtils.ts
import html2pdf from "html2pdf.js";

/* =========================
   Types
========================= */

export type PrintRow = {
  columns: string[];
};

export type PrintSection = {
  title: string;
  headers: readonly string[];
  rows: readonly {
    columns: readonly string[];
  }[];
};


export type PrintMeta = {
  academicYear: string;
  reportType: "INCOME" | "EXPENSE" | "COMBINED" | "STATEMENT";
  granularity: "DAILY" | "MONTHLY" | "HALF_YEARLY" | "YEARLY";
  periodLabel: string; // "15 Mar 2027", "Jan 2026", "H1", etc
};

export type PrintOptions = {
  title: string;
  meta: PrintMeta;
  sections: readonly PrintSection[];
};

/* =========================
   Helpers
========================= */

function formatTimestamp() {
  return new Date().toLocaleString();
}

function generateReportRef(meta: PrintMeta) {
  const seq = Math.floor(Math.random() * 9000) + 1000;
  return `SKA/${meta.reportType}/${meta.granularity}/${meta.academicYear}/${seq}`;
}

function generateFilename(meta: PrintMeta, title: string) {
  const safeTitle = title.replace(/\s+/g, "-");
  return `${safeTitle}-${meta.academicYear}-${meta.periodLabel}.pdf`;
}

/* =========================
   MAIN EXPORT
========================= */

export async function printReport({
  title,
  meta,
  sections,
}: PrintOptions) {
  const reportRef = generateReportRef(meta);
  const filename = generateFilename(meta, title);
  const generatedOn = formatTimestamp();

  const container = document.createElement("div");

  container.innerHTML = `
    <style>
      body { font-family: Arial, sans-serif; color: #000; }
      h1, h2, h3 { text-align: center; margin: 6px 0; }
      table { width: 100%; border-collapse: collapse; margin-top: 12px; }
      th, td { border-bottom: 1px solid #ccc; padding: 6px; text-align: left; }
      th:last-child, td:last-child { text-align: right; }
      .section { margin-top: 24px; }
      .meta { text-align: center; font-size: 0.9rem; color: #555; }
      .footer { margin-top: 40px; text-align: center; font-size: 0.85rem; color: #777; }
    </style>

    <h1>Smart Kids Academy</h1>
    <h2>${title}</h2>

    <div class="meta">
      Academic Year: ${meta.academicYear}<br/>
      Period: ${meta.periodLabel}<br/>
      Reference No: ${reportRef}
    </div>

    ${sections
      .map(
        (section) => `
      <div class="section">
        <h3>${section.title}</h3>
        <table>
          <thead>
            <tr>
              ${section.headers.map((h) => `<th>${h}</th>`).join("")}
            </tr>
          </thead>
          <tbody>
            ${section.rows
              .map(
                (row) => `
              <tr>
                ${row.columns.map((c) => `<td>${c}</td>`).join("")}
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>
      </div>
    `
      )
      .join("")}

    <div class="footer">
      This is a system-generated report.<br/>
      Smart Kids Academy • Generated on ${generatedOn}
    </div>
  `;

  await html2pdf()
    .set({
      margin: 10,
      filename,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    })
    .from(container)
    .save();
}
