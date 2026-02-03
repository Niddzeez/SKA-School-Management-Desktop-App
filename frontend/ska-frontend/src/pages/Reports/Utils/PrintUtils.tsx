// src/pages/Reports/Utils/printUtils.ts

import ReactDOM from "react-dom/client";
import PrintLayout from "../../../components/print/PrintLayout";
import PrintHeader from "../../../components/print/PrintHeader";
import schoolLogoUrl from "../../../assets/logo.svg";

type PrintRow = {
  readonly columns: readonly string[];
};

type PrintSection = {
  readonly title: string;
  readonly headers: readonly string[];
  readonly rows: readonly PrintRow[];
  readonly footer?: readonly string[];
};

type PrintData = {
  readonly title: string;
  readonly meta?: {
    readonly studentName?: string;
    readonly academicYear?: string;
    readonly reportType?: string;
    readonly granularity?: string;
    readonly periodLabel?: string;
  };
  readonly sections: readonly PrintSection[];
};

const generatedAt = new Date();

const timestamp = generatedAt.toLocaleString("en-IN", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});



export function printReport(data: PrintData) {
  const originalTitle = document.title;

  // 1️⃣ Create isolated print root
  const printRoot = document.createElement("div");
  document.body.appendChild(printRoot);

  // 2️⃣ Set filename via document.title
  const parts = [
    data.title,
    data.meta?.studentName,
    data.meta?.periodLabel,
    data.meta?.academicYear,
  ].filter(Boolean);

  document.title = parts.join(" ").replace(/\s+/g, "_");

  // 3️⃣ Render print layout
  const root = ReactDOM.createRoot(printRoot);
  root.render(
    <>
      <PrintLayout watermark={
        <img
          src={schoolLogoUrl}
          className="watermark"
          alt="School Watermark"
        />}>
        <PrintHeader
          logo={<img
            src={schoolLogoUrl}
            className="logo-svg"
            alt="School Logo"
          />}
          title="SMART KIDS ACADEMY"
          subtitle={data.title}
          rightSlot={
            <div style={{ fontSize: "12px", textAlign: "right" }}>
              {data.meta?.academicYear && (
                <div>AY {data.meta.academicYear}</div>
              )}
              {data.meta?.periodLabel && (
                <div>{data.meta.periodLabel}</div>
              )}
            </div>
          }
        />

        <hr />

        {/* ================= REPORT CONTENT ================= */}
        {data.sections.map((section, idx) => (
          <section className="card" key={idx}>
            <h3>{section.title}</h3>

            <table className="report-table">
              <thead>
                <tr>
                  {section.headers.map((h) => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {section.rows.map((row, rIdx) => (
                  <tr key={rIdx}>
                    {row.columns.map((col, cIdx) => (
                      <td key={cIdx}>{col}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            {section.footer && (
              <div className="section-footer">
                {section.footer}
              </div>
            )}

          </section>
        ))}
        {/* ================= FOOTER ================= */}
        <div className="report-footer card compact">
          <span style={{ fontSize: "11px", color: "#666" }}>
            Generated on: {timestamp}
          </span>
        </div>
      </PrintLayout>
      
    </>
  );

  // 4️⃣ Print and cleanup
  setTimeout(() => {
    window.print();

    document.title = originalTitle;
    root.unmount();
    document.body.removeChild(printRoot);
  }, 300);
}
