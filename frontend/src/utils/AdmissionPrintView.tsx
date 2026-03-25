import "./admissionPrint.css";
import SchoolLogo from "../assets/logo.png";
import PrintLayout from "../components/print/PrintLayout";
import type { Student } from "../types/Student";

type Props = {
  student: Student;
  academicYear: string;
  className?: string;   // resolved class name (e.g. "Class 10")
  sectionName?: string; // resolved section name (e.g. "A")
};

const schoolLogoUrl = SchoolLogo;

function Row({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div className="data-cell">
      <span className="data-label">{label}:</span>
      <span className="data-value">{value || " "}</span>
    </div>
  );
}

export default function AdmissionPrintView({ student, academicYear, className, sectionName }: Props) {
  const dob = student.dateOfBirth
    ? new Date(student.dateOfBirth).toLocaleDateString("en-IN")
    : "—";

  const admissionDate = student.academic?.dateOfAdmission
    ? new Date(student.academic.dateOfAdmission).toLocaleDateString("en-IN")
    : "—";

  const address = [
    student.address?.addressLine,
    student.address?.city,
    student.address?.state,
    student.address?.pinCode,
  ]
    .filter(Boolean)
    .join(", ") || "—";

  const classDisplay = className || "—";
  const sectionDisplay = sectionName || "—";

  return (
    <PrintLayout>
      {/* ===== HEADER ===== */}
      <header className="print-header">
        <div className="header-left">
          <div className="logo-box">
            <img src={schoolLogoUrl} className="logo-svg" alt="School Logo" />
          </div>
          <div className="school-text">
            <h1>SMART KIDS ACADEMY</h1>
            <div className="letterhead">
              Late Shankarsheth Lodha Memorial Education Society · Sonai
            </div>
            <div className="contact-line">
              📞 9890908475 | 9860622678 · Sonai, Maharashtra
            </div>
          </div>
        </div>
        <div className="header-right">
          <div className="photo-box">Student<br />Photo</div>
          <span className="academic-year">AY {academicYear}</span>
        </div>
      </header>

      {/* ===== TITLE ===== */}
      <div className="form-title-bar">ADMISSION FORM</div>

      {/* ===== STUDENT DETAILS ===== */}
      <div className="af-section">
        <div className="af-section-title">Student Details</div>
        <div className="af-section-body">
          <div className="data-grid data-grid-3">
            <div className="data-cell span-2">
              <span className="data-label">Full Name:</span>
              <span className="data-value" style={{ fontWeight: 700, fontSize: "10px" }}>
                {student.firstName} {student.lastName}
              </span>
            </div>
            <Row label="Date of Birth" value={dob} />
            <Row label="Gender" value={student.gender} />

            <Row label="Class" value={classDisplay} />
            <Row label="Section" value={sectionDisplay} />
            <Row label="Admission Date" value={admissionDate} />
            <Row label="Blood Group" value={student.bloodGroup} />

            <Row label="Phone" value={student.phoneNumber} />
            <Row label="Email" value={student.email} />
            <Row label="Aadhaar No." value={student.aadhaarNumber} />
            <Row label="Nationality" value={student.nationality || "Indian"} />

            <Row label="Religion" value={student.religion} />
            <Row label="Caste" value={student.caste} />
            <Row label="Category" value={student.category} />
            <Row label="Minority Status" value={student.minorityStatus} />

            <Row label="Previous School" value={student.academic?.previousSchool} />
            <Row label="Guardian Name" value={student.guardianName} />
            <Row label="Emergency Contact" value={student.emergencyContact} />
            <Row label="Total Siblings" value={student.totalSiblings?.toString()} />

            <Row label="Disability Status" value={student.disabilityStatus} />
            <Row label="Transport Req." value={student.transportationNeeds} />
            <div className="data-cell span-2">
              <span className="data-label">Medical Conditions:</span>
              <span className="data-value">{student.medicalConditions || " "}</span>
            </div>

            <div className="data-cell span-3">
              <span className="data-label">Address:</span>
              <span className="data-value">{address}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ===== PARENT DETAILS ===== */}
      <div className="af-section">
        <div className="af-section-title">Parent / Guardian Details</div>
        <div className="af-section-body" style={{ padding: "3px 0 2px" }}>
          <table className="parents-table">
            <thead>
              <tr>
                <th style={{ width: "80px" }}>Field</th>
                <th>Father's Details</th>
                <th>Mother's Details</th>
              </tr>
            </thead>
            <tbody>
              {[
                { label: "Name", father: student.father?.name, mother: student.mother?.name },
                { label: "Phone", father: student.father?.phone, mother: student.mother?.phone },
                { label: "Occupation", father: student.father?.occupation, mother: student.mother?.occupation },
                { label: "Education", father: student.father?.education, mother: student.mother?.education },
                { label: "Annual Income", father: student.father?.income ? `₹${student.father.income}` : "", mother: student.mother?.income ? `₹${student.mother.income}` : "" },
                { label: "Aadhaar No.", father: student.father?.aadhaar, mother: student.mother?.aadhaar },
              ].map(({ label, father, mother }) => (
                <tr key={label}>
                  <td className="field-label">{label}</td>
                  <td className="field-value">{father || " "}</td>
                  <td className="field-value">{mother || " "}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ===== DECLARATION ===== */}
      <div className="af-section">
        <div className="af-section-title">Declaration</div>
        <div className="declaration-text">
          I / We hereby declare that the information provided above is true, correct and complete to the best of my/our knowledge.
          I / We agree to abide by the rules and regulations of Smart Kids Academy and understand that any false information may
          result in cancellation of admission.
        </div>
      </div>

      {/* ===== SIGNATURES ===== */}
      <div className="signatures-row">
        <div className="sig-block">
          <div className="sig-line" />
          <div>Parent / Guardian Signature</div>
          <div style={{ marginTop: "2px", color: "#777", fontSize: "8px" }}>Date: ___________</div>
        </div>

        <div className="stamp-box">INSTITUTE<br />STAMP</div>

        <div className="sig-block">
          <div className="sig-line" />
          <div>Authorized Signatory</div>
          <div style={{ marginTop: "2px", color: "#777", fontSize: "8px" }}>Date: ___________</div>
        </div>
      </div>
    </PrintLayout>
  );
}