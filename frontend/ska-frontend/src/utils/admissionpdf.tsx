import "./admissionPrint.css";
import SchoolLogo from "../assets/logo.svg?react";
import PrintLayout from "../components/print/PrintLayout";
import PrintHeader from "../components/print/PrintHeader";

type Props = {
  student: any;
  academicYear: string;
};

export default function AdmissionPrintView({ student, academicYear }: Props) {
  return (
    <PrintLayout watermark={<SchoolLogo className="watermark" />}>
      <PrintHeader
        logo={<SchoolLogo className="logo-svg" />}
        title="SMART KIDS ACADEMY"
        subtitle="Late Shankarsheth Lodha Memorial Education Society · Sonai"
        rightSlot={
          <div>
            <div className="photo-box">
              Student Photo
            </div>
            <span className="academic-year">
              AY {academicYear}
            </span>
          </div>
        }
      />

      <hr />

      {/* ================= STUDENT DETAILS ================= */}
      <section className="card compact">
        <h3>Student Details</h3>

        <div className="form-grid">
          <div><strong>Name:</strong></div><div>{student.firstName} {student.lastName}</div>
          <div><strong>Date of Birth:</strong></div><div>{student.dateOfBirth}</div>

          <div><strong>Gender:</strong></div><div>{student.gender}</div>
          <div><strong>Blood Group:</strong></div><div>{student.bloodGroup}</div>

          <div><strong>Class:</strong></div><div>{student.grade}</div>
          <div><strong>Aadhaar:</strong></div><div>{student.aadhaarNumber || "-"}</div>

          <div><strong>Admission Date:</strong></div><div>{student.academic.dateOfAdmission}</div>
        </div>

      </section>


      {/* ================= ADDRESS ================= */}
      <section className="card">
        <h3>Address</h3>
        <p className="address-line">
          {student.address.addressLine}, {student.address.city},
          {student.address.state} – {student.address.pinCode}
        </p>

      </section>

      {/* ================= ADDITIONAL DETAILS ================= */}
      <section className="card">
        <h3>Additional Details</h3>

        <div className="details-grid">
          <div><strong>Religion:</strong> {student.religion}</div>
          <div><strong>Caste:</strong> {student.caste}</div>
          <div><strong>Category:</strong> {student.category}</div>

          <div><strong>Minority:</strong> {student.minorityStatus}</div>
          <div><strong>Transport:</strong> {student.transportationNeeds}</div>
          <div><strong>Siblings:</strong> {student.totalSiblings}</div>

          <div><strong>Disability:</strong> {student.disabilityStatus}</div>
          <div><strong>Guardian Name: </strong>{student.guardianName}</div>
          <div><strong>Transport Required: </strong>{student.transportationNeeds}</div>

          <div className="span-2">
            <strong>Emergency Contact:</strong> {student.emergencyContact}
          </div>

          <div className="span-3">
            <strong>Medical Conditions:</strong> {student.medicalConditions}
          </div>
        </div>
      </section>


      {/* ================= PARENTS (ONE HORIZONTAL BLOCK) ================= */}
      <section className="card">
        <h3>Parent Details</h3>

        <div className="parents-horizontal">
          {/* Father */}
          <div className="parent-col">
            <h4>Father</h4>
            <p><strong>Name:</strong> {student.father.name}</p>
            <p><strong>Phone:</strong> {student.father.phone}</p>
            <p><strong>Occupation:</strong> {student.father.occupation}</p>
            <p><strong>Education:</strong> {student.father.education}</p>
            <p><strong>Income:</strong> {student.father.income}</p>
            <p><strong>Aadhar Number:</strong> {student.father.aadhaar}</p>
          </div>

          {/* Mother */}
          <div className="parent-col">
            <h4>Mother</h4>
            <p><strong>Name:</strong> {student.mother.name}</p>
            <p><strong>Phone:</strong> {student.mother.phone}</p>
            <p><strong>Occupation:</strong> {student.mother.occupation}</p>
            <p><strong>Education:</strong> {student.mother.education}</p>
            <p><strong>Income:</strong> {student.mother.income}</p>
            <p><strong>Aadhar Number:</strong> {student.mother.aadhaar}</p>
          </div>
        </div>
      </section>

      {/* ================= DECLARATION ================= */}
      <section className="card">
        <h3>Declaration</h3>
        <p>
          I hereby declare that the information provided above is true and correct
          to the best of my knowledge. I agree to abide by the rules and regulations
          of the institution.
        </p>
      </section>

      {/* ================= SIGNATURES ================= */}
      <footer className="signatures">
        <div>
          _________________________
          <p>Parent / Guardian</p>
        </div>

        <div className="stamp-box">INSTITUTE STAMP</div>

        <div>
          _________________________
          <p>Authorized Signatory</p>
        </div>
      </footer>

    </PrintLayout>
  );
}
