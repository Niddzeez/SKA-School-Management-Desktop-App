import { useMemo } from "react";
import { useSections } from "../../context/SectionContext";
import { useStudents } from "../../context/StudentContext";
import { useTeachers } from "../../context/TeacherContext";
import { useAcademicYear } from "../../context/AcademicYearContext";
import { exportToCSV } from "../../utils/exportTOCSV";
import { printReport } from "../Reports/Utils/printUtils";

type Props = {
  onClose: () => void;
  sectionId: string;
  sectionName: string;
  className: string;
};

export default function ClassRegisterModal({
  onClose,
  sectionId,
  sectionName,
  className,
}: Props) {
  const { sections }     = useSections();
  const { students }     = useStudents();
  const { teachers }     = useTeachers();
  const { academicYear } = useAcademicYear();

  const section = sections.find((s) => s.id === sectionId);

  const teacher = section?.classTeacherID
    ? teachers.find((t) => t.id === section.classTeacherID)
    : undefined;

  const teacherName = teacher
    ? `${teacher.firstName} ${teacher.lastName}`
    : "Not Assigned";

  const sectionStudents = useMemo(() => {
    if (!section) return [];
    return students.filter(
      (s) => s.classID === section.classID && s.sectionID === section.id
    );
  }, [students, section]);

  const sorted = useMemo(
    () =>
      [...sectionStudents].sort((a, b) => {
        const f = a.firstName.localeCompare(b.firstName);
        if (f !== 0) return f;
        return a.lastName.localeCompare(b.lastName);
      }),
    [sectionStudents]
  );

  /* ── Generate PDF ── */
  const handleGeneratePDF = () => {
    const printData = {
      title: "Student Register",
      meta: {
        academicYear,
        reportType:  "STATEMENT",
        granularity: "CLASS_WISE",
        periodLabel: `Class ${className} - Section ${sectionName}`,
      },
      sections: [
        {
          title:   "Class Information",
          headers: ["Field", "Value"],
          rows: [
            { columns: ["Class",         className]   },
            { columns: ["Section",       sectionName] },
            { columns: ["Class Teacher", teacherName] },
          ],
        },
        {
          title:   "Student Register",
          headers: ["Roll No", "First Name", "Last Name", "Phone"],
          rows: sorted.map((s, idx) => ({
            columns: [
              String(idx + 1),
              s.firstName,
              s.lastName,
              s.phoneNumber ?? s.father?.phone ?? "",
            ],
          })),
        },
      ],
    } as const;

    printReport(printData);
  };

  /* ── Export CSV ── */
  const handleExportCSV = () => {
    const rows = sorted.map((s, idx) => ({
      "Roll No":    idx + 1,
      "First Name": s.firstName,
      "Last Name":  s.lastName,
      Phone:        s.phoneNumber ?? s.father?.phone ?? "",
      Class:        className,
      Section:      sectionName,
    }));

    exportToCSV(
      rows,
      `Class-Register-${academicYear}-${className}-${sectionName}.csv`
    );
  };

  return (
    <div className="crm-overlay" onClick={onClose}>
      <div className="crm-card" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="crm-header">
          <div>
            <div className="crm-header-title">Generate Student Register</div>
            <div className="crm-header-sub">
              Class {className} &nbsp;·&nbsp; Section {sectionName}
            </div>
          </div>
          <button className="crm-close" onClick={onClose}>✕</button>
        </div>

        {/* Info strip */}
        <div className="crm-info-row">
          <div className="crm-info-item">
            <div className="crm-info-label">Class Teacher</div>
            <div className="crm-info-value">{teacherName}</div>
          </div>
          <div className="crm-info-item">
            <div className="crm-info-label">Total Students</div>
            <div className="crm-info-value">
              {sorted.length === 0
                ? "No students"
                : `${sorted.length} student${sorted.length > 1 ? "s" : ""}`}
            </div>
          </div>
          <div className="crm-info-item">
            <div className="crm-info-label">Academic Year</div>
            <div className="crm-info-value">{academicYear}</div>
          </div>
        </div>

        {/* Export format label */}
        <div className="crm-options-label">Choose export format</div>

        {/* Two export cards */}
        <div className="crm-options-row">
          <button className="crm-option-card" onClick={handleGeneratePDF}>
            <div className="crm-option-icon">📄</div>
            <div className="crm-option-title">Export PDF</div>
            <div className="crm-option-sub">Print-ready class register</div>
          </button>

          <button className="crm-option-card" onClick={handleExportCSV}>
            <div className="crm-option-icon">📊</div>
            <div className="crm-option-title">Export CSV</div>
            <div className="crm-option-sub">Spreadsheet-compatible file</div>
          </button>
        </div>

        {/* Cancel */}
        <button className="crm-cancel" onClick={onClose}>Cancel</button>

      </div>
    </div>
  );
}