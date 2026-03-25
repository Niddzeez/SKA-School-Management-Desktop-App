import "../../styles/AdmissionForm.css";
import InputBox from "../../components/FormInputBoxes";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { mapFormDataToStudent } from "../../mappers/formtostudents";
import { useStudents } from "../../context/StudentContext";
import { useClasses } from "../../context/ClassContext";
import { useSections } from "../../context/SectionContext";
import { useAuth } from "../../context/AuthContext";
import { can } from "../../auth/permissions";
import { printAdmission } from "../../utils/printAdmission";  // ✅ kept from main

/* ── Sidebar nav sections ── */
const NAV_SECTIONS = [
  { id: "student",     label: "Student Info",       icon: "🎓" },
  { id: "additional",  label: "Additional Details",  icon: "📋" },
  { id: "father",      label: "Father's Info",       icon: "👨" },
  { id: "mother",      label: "Mother's Info",       icon: "👩" },
];

function AdmissionForm() {
  const [errors, setErrors]               = useState<{ [key: string]: string }>({});
  const [activeSection, setActiveSection] = useState("student");
  const [successMessage]                  = useState("");   // ✅ no setter — not used in submit

  const { role }       = useAuth();
  const { addStudent } = useStudents();
  const { classes }    = useClasses();
  const { sections }   = useSections();
  const navigate       = useNavigate();

  /* ── Access guard ── */
  if (!role || !can(role, "ADMIT_STUDENT")) {   // ✅ full guard from main
    return (
      <div className="unauthorized">
        <h2>Access Denied</h2>
        <p>You do not have permission to admit new students.</p>
      </div>
    );
  }

  /* ── Initial form state ── */
  const initialFormData = {
    firstName: "", lastName: "", dob: "",
    gender: "" as "Male" | "Female" | "Other",
    address: "", city: "", state: "", pinCode: "",
    phone: "", email: "", grade: "",
    feeDiscount: "", admissionDate: "",
    classID: "", sectionID: "",

    religion: "", caste: "", category: "",
    minorityStatus: "", aadhaar: "", previousSchool: "",
    guardianName: "", siblings: "", transport: "",
    emergencyContact: "", medicalConditions: "",
    bloodGroup: "", disabilityStatus: "",

    fatherName: "", fatherPhone: "", fatherOccupation: "",
    fatherAadhaar: "", fatherEducation: "", fatherIncome: "",

    motherName: "", motherPhone: "", motherOccupation: "",
    motherAadhaar: "", motherEducation: "", motherIncome: "",
  };

  const [formData, setFormData] = useState(initialFormData);
function capitalizeName(name: string) {
  return name
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}
  /* ── Handlers ── */
  const handleChange = (name: string, value: string) => {
     const nameFields = [
    "firstName",
    "lastName",
    "fatherName",
    "motherName",
    "guardianName",
  ];

  const formattedValue = nameFields.includes(name)
    ? capitalizeName(value)
    : value;
    setFormData((prev) => ({ ...prev, [name]: formattedValue }));
  };

  function validateForm() {
    const newErrors: { [key: string]: string } = {};

    if (!formData.firstName.trim())  newErrors.firstName  = "First name is required";
    if (!formData.lastName.trim())   newErrors.lastName   = "Last name is required";
    if (!formData.gender)            newErrors.gender     = "Gender is required";
    if (!formData.dob)               newErrors.dob        = "Date of birth is required";

    if (!formData.phone.trim())
      newErrors.phone = "Phone number is required";
    else if (!/^\d{10}$/.test(formData.phone))
      newErrors.phone = "Phone number must be 10 digits";

    if (!formData.fatherPhone.trim())
      newErrors.fatherPhone = "Father's phone number is required";
    else if (!/^\d{10}$/.test(formData.fatherPhone))
      newErrors.fatherPhone = "Father's phone number must be 10 digits";

    if (!formData.aadhaar.trim())
      newErrors.aadhaar = "Aadhaar number is required";
    else if (!/^\d{12}$/.test(formData.aadhaar))
      newErrors.aadhaar = "Aadhaar number must be 12 digits";

    return newErrors;
  }

  console.log("Validation errors:", validateForm());  // ✅ kept from main
  const isFormValid = Object.keys(validateForm()).length === 0;

  /* ── Submit ── */
  async function handleSubmit(e: React.FormEvent) {   // ✅ async from main
    e.preventDefault();

    if (!role || !can(role, "ADMIT_STUDENT")) {
      alert("You do not have permission to admit students.");
      return;
    }

    const validationErrors = validateForm();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    const payload = mapFormDataToStudent(formData);
    const createdStudent = await addStudent(payload);  // ✅ awaited, return value used

    printAdmission(                                    // ✅ kept from main
      createdStudent,
      createdStudent.academic?.dateOfAdmission?.slice(0, 4) ?? ""
    );

    setFormData(initialFormData);
    setErrors({});
  }

  /* ── Extracted state options ── */
  const stateOptions = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
    "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
    "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
    "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana",
    "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
    "Andaman and Nicobar Islands", "Chandigarh",
    "Dadra and Nagar Haveli and Daman and Diu", "Delhi (NCT)",
    "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry",
  ];

  /* ── Section renderer ── */
  const renderSection = () => {
    switch (activeSection) {

      /* ════ STUDENT INFO ════ */
      case "student":
        return (
          <div className="form-section">
            <div className="form-section-header">
              <div className="form-section-icon section-icon-student">🎓</div>
              <div>
                <p className="form-section-title">Student Information</p>
                <p className="form-section-sub">Basic personal &amp; academic details</p>
              </div>
            </div>
            <div className="form-grid">
              <InputBox label="First Name"    name="firstName"    type="text"  value={formData.firstName}  onChange={handleChange} error={errors.firstName} required />
              <InputBox label="Last Name"     name="lastName"     type="text"  value={formData.lastName}   onChange={handleChange} error={errors.lastName}  required />
              <InputBox label="Date of Birth" name="dob"          type="date"  value={formData.dob}        onChange={handleChange} error={errors.dob}       required />
              <InputBox label="Gender"        name="gender"       type="select" options={["Male", "Female", "Other"]} value={formData.gender} onChange={handleChange} error={errors.gender} required />
              <InputBox label="Address"       name="address"      type="textarea" value={formData.address} onChange={handleChange} />
              <InputBox label="City"          name="city"         type="text"  value={formData.city}       onChange={handleChange} />
              <InputBox label="State"         name="state"        type="select" options={stateOptions}     value={formData.state}  onChange={handleChange} />
              <InputBox label="Pin Code"      name="pinCode"      type="text"  value={formData.pinCode}    onChange={handleChange} />
              <InputBox label="Phone Number"  name="phone"        type="text"  value={formData.phone}      onChange={handleChange} error={errors.phone} numericOnly maxLength={10} required />
              <InputBox label="Email"         name="email"        type="email" value={formData.email}      onChange={handleChange} />
              <InputBox label="Fees Discount %" name="feeDiscount" type="text" value={formData.feeDiscount} onChange={handleChange} />
              <InputBox label="Date of Admission" name="admissionDate" type="date" value={formData.admissionDate} onChange={handleChange} />
              <InputBox
                label="Class" name="classID" type="select"
                options={classes.map((c) => c.ClassName)}
                value={classes.find((c) => c.id === formData.classID)?.ClassName || ""}
                onChange={(name, value) => {
                  const selectedClass = classes.find((c) => c.ClassName === value);
                  setFormData((prev) => ({ ...prev, classID: selectedClass?.id || "", sectionID: "" }));
                }}
                required
              />
              <InputBox
                label="Section" name="sectionID" type="select"
                options={sections.filter((s) => s.classID === formData.classID).map((s) => s.name)}
                value={sections.find((s) => s.id === formData.sectionID)?.name || ""}
                onChange={(name, value) => {
                  const selectedSection = sections.find((s) => s.classID === formData.classID && s.name === value);
                  setFormData((prev) => ({ ...prev, sectionID: selectedSection?.id || "" }));
                }}
                required
              />
            </div>
          </div>
        );

      /* ════ ADDITIONAL DETAILS ════ */
      case "additional":
        return (
          <div className="form-section">
            <div className="form-section-header">
              <div className="form-section-icon section-icon-additional">📋</div>
              <div>
                <p className="form-section-title">Additional Details</p>
                <p className="form-section-sub">Religion, health &amp; background info</p>
              </div>
            </div>
            <div className="form-grid">
              <InputBox label="Religion"          name="religion"         type="select" options={["Hindu","Muslim","Christian","Sikh","Buddhist","Jain","Parsi","Jewish","Other"]} value={formData.religion} onChange={handleChange} />
              <InputBox label="Caste"             name="caste"            type="text"   value={formData.caste}           onChange={handleChange} />
              <InputBox label="Category"          name="category"         type="select" options={["General","OBC","SC","ST","VJ","NT","Other"]} value={formData.category} onChange={handleChange} />
              <InputBox label="Minority Status"   name="minorityStatus"   type="select" options={["Yes","No"]} value={formData.minorityStatus} onChange={handleChange} />
              <InputBox label="Aadhaar Number"    name="aadhaar"          type="text"   value={formData.aadhaar} onChange={handleChange} error={errors.aadhaar} numericOnly maxLength={12} required />
              <InputBox label="Previous School"   name="previousSchool"   type="text"   value={formData.previousSchool} onChange={handleChange} />
              <InputBox label="Guardian's Name"   name="guardianName"     type="text"   value={formData.guardianName}   onChange={handleChange} />
              <InputBox label="Total Siblings"    name="siblings"         type="text"   value={formData.siblings} onChange={handleChange} numericOnly maxLength={1} />
              <InputBox label="Transport Required" name="transport"        type="select" options={["Yes","No"]} value={formData.transport} onChange={handleChange} />
              <InputBox label="Emergency Contact"  name="emergencyContact" type="text"  value={formData.emergencyContact} onChange={handleChange} />
              <InputBox label="Medical Conditions" name="medicalConditions" type="textarea" value={formData.medicalConditions} onChange={handleChange} />
              <InputBox label="Blood Group"        name="bloodGroup"       type="select" options={["A+","A-","B+","B-","AB+","AB-","O+","O-","Bombay Blood Group","Unknown"]} value={formData.bloodGroup} onChange={handleChange} />
              <InputBox label="Disability Status"  name="disabilityStatus" type="select" options={["Yes","No"]} value={formData.disabilityStatus} onChange={handleChange} />
            </div>
          </div>
        );

      /* ════ FATHER'S INFO ════ */
      case "father":
        return (
          <div className="form-section">
            <div className="form-section-header">
              <div className="form-section-icon section-icon-father">👨</div>
              <div>
                <p className="form-section-title">Father's Information</p>
                <p className="form-section-sub">Guardian contact &amp; background</p>
              </div>
            </div>
            <div className="form-grid">
              <InputBox label="Name"           name="fatherName"       type="text" value={formData.fatherName}       onChange={handleChange} />
              <InputBox label="Phone Number"   name="fatherPhone"      type="text" value={formData.fatherPhone}      onChange={handleChange} error={errors.fatherPhone} numericOnly maxLength={10} required />
              <InputBox label="Occupation"     name="fatherOccupation" type="text" value={formData.fatherOccupation} onChange={handleChange} />
              <InputBox label="Aadhaar Number" name="fatherAadhaar"    type="text" value={formData.fatherAadhaar}    onChange={handleChange} numericOnly maxLength={12} />
              <InputBox label="Education"      name="fatherEducation"  type="text" value={formData.fatherEducation}  onChange={handleChange} />
              <InputBox label="Income"         name="fatherIncome"     type="text" value={formData.fatherIncome}     onChange={handleChange} />
            </div>
          </div>
        );

      /* ════ MOTHER'S INFO ════ */
      case "mother":
        return (
          <div className="form-section">
            <div className="form-section-header">
              <div className="form-section-icon section-icon-mother">👩</div>
              <div>
                <p className="form-section-title">Mother's Information</p>
                <p className="form-section-sub">Guardian contact &amp; background</p>
              </div>
            </div>
            <div className="form-grid">
              <InputBox label="Name"           name="motherName"       type="text" value={formData.motherName}       onChange={handleChange} />
              <InputBox label="Phone Number"   name="motherPhone"      type="text" value={formData.motherPhone}      onChange={handleChange} numericOnly maxLength={10} />
              <InputBox label="Occupation"     name="motherOccupation" type="text" value={formData.motherOccupation} onChange={handleChange} />
              <InputBox label="Aadhaar Number" name="motherAadhaar"    type="text" value={formData.motherAadhaar}    onChange={handleChange} numericOnly maxLength={12} />
              <InputBox label="Education"      name="motherEducation"  type="text" value={formData.motherEducation}  onChange={handleChange} />
              <InputBox label="Income"         name="motherIncome"     type="text" value={formData.motherIncome}     onChange={handleChange} />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  /* ── Render ── */
  return (
    <form className="admission-form-page" onSubmit={handleSubmit}>

      {/* Page header */}
      <div className="admission-page-header">
        <h1 className="admission-page-title">New Student Admission</h1>
        <p className="admission-page-sub">Fill in all required fields</p>
      </div>

      {successMessage && (
        <div className="success-message">{successMessage}</div>
      )}

      {/* Main layout: sidebar + body */}
      <div className="admission-layout">

        {/* ── Sidebar ── */}
        <aside className="admission-sidebar">
          <div className="admission-sidebar-brand">
            <div className="admission-sidebar-title">Admission Form</div>
            <div className="admission-sidebar-sub">Smart Kids Academy</div>
          </div>

          <div className="admission-sidebar-label">Sections</div>

          {NAV_SECTIONS.map((sec) => (
            <button
              key={sec.id}
              type="button"
              className={`admission-nav-item ${activeSection === sec.id ? "active" : ""}`}
              onClick={() => setActiveSection(sec.id)}
            >
              <span className="admission-nav-dot" />
              {sec.icon} {sec.label}
            </button>
          ))}
        </aside>

        {/* ── Body ── */}
        <div className="admission-body">

          {renderSection()}

          {/* Actions */}
          <div className="form-actions">

            {/* Previous / Next */}
            <div style={{ display: "flex", gap: 8, marginRight: "auto" }}>
              {NAV_SECTIONS.indexOf(NAV_SECTIONS.find((s) => s.id === activeSection)!) > 0 && (
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={() => {
                    const idx = NAV_SECTIONS.findIndex((s) => s.id === activeSection);
                    if (idx > 0) setActiveSection(NAV_SECTIONS[idx - 1].id);
                  }}
                >
                  ← Previous
                </button>
              )}
              {activeSection !== "mother" && (
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={() => {
                    const idx = NAV_SECTIONS.findIndex((s) => s.id === activeSection);
                    if (idx < NAV_SECTIONS.length - 1) setActiveSection(NAV_SECTIONS[idx + 1].id);
                  }}
                >
                  Next →
                </button>
              )}
            </div>

            {/* Cancel / Submit */}
            <button
              type="button"
              className="secondary-btn"
              onClick={() => navigate(-1)}   // ✅ from frontend
            >
              Cancel
            </button>
            <button
              type="submit"
              className="primary-btn"
              disabled={!isFormValid}
            >
              Submit Admission
            </button>
          </div>

        </div>
      </div>
    </form>
  );
}

export default AdmissionForm;