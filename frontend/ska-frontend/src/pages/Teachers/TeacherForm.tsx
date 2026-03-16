import "../../styles/TeacherForm.css";
import InputBox from "../../components/FormInputBoxes";
import { useTeachers } from "../../context/TeacherContext";
import { mapFormDataToTeacher } from "../../mappers/formtoteachers";
import React, { useState } from "react";
import type { Teacher } from "../../types/Teachers";

const NAV_SECTIONS = [
  { id: "personal",     label: "Personal Info",     icon: "👤" },
  { id: "professional", label: "Professional Info", icon: "🎓" },
  { id: "contact",      label: "Contact Info",      icon: "📞" },
];

function TeacherForm() {
  const [errors, setErrors]               = useState<{ [key: string]: string }>({});
  const [activeSection, setActiveSection] = useState("personal");
  const [successMessage, setSuccessMessage] = useState("");

  const { addTeacher } = useTeachers();

  const initialFormData = {
    firstName: "",
    lastName: "",
    email: "",
    subjects: [] as string[],
    yearsOfExperience: "",
    dateOfJoining: "",
    phone: "",
    qualification: "",
    address: "",
    emergencyContact: "",
    aadhar: "",
    gender: "" as "Male" | "Female" | "Other",
    dob: "",
    bloodGroup: "",
    religion: "",
    guardian: "",
    className: "",
    section: "",
  };

  const [formData, setFormData] = useState(initialFormData);

  /* ── Handlers ── */
  const handleChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  function validateForm() {
    const newErrors: { [key: string]: string } = {};

    if (!formData.firstName.trim())
      newErrors.firstName = "First name is required";

    if (!formData.lastName.trim())
      newErrors.lastName = "Last name is required";

    if (!formData.dob.trim())
      newErrors.dob = "Date of Birth is required";
    else if (!formData.dob.match(/^\d{4}-\d{2}-\d{2}$/))
      newErrors.dob = "Date of Birth must be in YYYY-MM-DD format";

    if (!formData.phone.trim())
      newErrors.phone = "Phone number is required";
    else if (!formData.phone.match(/^[6-9]\d{9}$/))
      newErrors.phone = "Phone number must be a valid 10-digit Indian number";

    if (!formData.aadhar.trim())
      newErrors.aadhar = "Aadhaar number is required";
    else if (!formData.aadhar.match(/^\d{12}$/))
      newErrors.aadhar = "Aadhaar number must be a valid 12-digit number";

    return newErrors;
  }

  const isFormValid = Object.keys(validateForm()).length === 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const validateErrors = validateForm();
    setErrors(validateErrors);
    if (Object.keys(validateErrors).length > 0) return;

    const teacher: Teacher = mapFormDataToTeacher(formData);
    addTeacher(teacher);
    setFormData(initialFormData);
    setErrors({});
    setSuccessMessage("Teacher added successfully!");
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  /* ── Navigation helpers ── */
  const currentIndex = NAV_SECTIONS.findIndex((s) => s.id === activeSection);
  const goNext = () => { if (currentIndex < NAV_SECTIONS.length - 1) setActiveSection(NAV_SECTIONS[currentIndex + 1].id); };
  const goPrev = () => { if (currentIndex > 0) setActiveSection(NAV_SECTIONS[currentIndex - 1].id); };

  /* ── Section content ── */
  const renderSection = () => {
    switch (activeSection) {

      /* ════ PERSONAL — includes all Additional fields ════ */
      case "personal":
        return (
          <div className="form-section">
            <div className="form-section-header">
              <div className="form-section-icon section-icon-personal">👤</div>
              <div>
                <p className="form-section-title">Personal Information</p>
                <p className="form-section-sub">Name, identity, health &amp; background</p>
              </div>
            </div>
            <div className="form-grid">
              {/* Original personal fields */}
              <InputBox label="First Name"    name="firstName" type="text"   value={formData.firstName} onChange={handleChange} error={errors.firstName} required />
              <InputBox label="Last Name"     name="lastName"  type="text"   value={formData.lastName}  onChange={handleChange} error={errors.lastName}  required />
              <InputBox label="Gender"        name="gender"    type="select" options={["Male","Female","Other"]} value={formData.gender} onChange={handleChange} required />
              <InputBox label="Date of Birth" name="dob"       type="date"   value={formData.dob}       onChange={handleChange} error={errors.dob}       required />

              {/* Merged from Additional Information */}
              <InputBox label="Aadhaar Number"           name="aadhar"     type="text"   numericOnly maxLength={12} value={formData.aadhar}     onChange={handleChange} error={errors.aadhar} required />
              <InputBox label="Blood Group"              name="bloodGroup" type="select" options={["A+","A-","B+","B-","AB+","AB-","O+","O-"]} value={formData.bloodGroup} onChange={handleChange} />
              <InputBox label="Religion"                 name="religion"   type="text"   value={formData.religion}  onChange={handleChange} />
              <InputBox label="Father's / Spouse's Name" name="guardian"   type="text"   value={formData.guardian}  onChange={handleChange} />
            </div>
          </div>
        );

      /* ════ PROFESSIONAL ════ */
      case "professional":
        return (
          <div className="form-section">
            <div className="form-section-header">
              <div className="form-section-icon section-icon-professional">🎓</div>
              <div>
                <p className="form-section-title">Professional Information</p>
                <p className="form-section-sub">Subjects, experience &amp; qualifications</p>
              </div>
            </div>
            <div className="form-grid">
              <InputBox
                label="Subjects"
                name="subjects"
                type="text"
                value={Array.isArray(formData.subjects) ? formData.subjects.join(", ") : formData.subjects}
                onChange={handleChange}
              />
              <InputBox label="Years of Experience" name="yearsOfExperience" type="text" numericOnly value={formData.yearsOfExperience} onChange={handleChange} />
              <InputBox label="Date of Joining"     name="dateOfJoining"     type="date"            value={formData.dateOfJoining}     onChange={handleChange} />
              <InputBox label="Qualification"       name="qualification"     type="text"            value={formData.qualification}     onChange={handleChange} />
            </div>
          </div>
        );

      /* ════ CONTACT ════ */
      case "contact":
        return (
          <div className="form-section">
            <div className="form-section-header">
              <div className="form-section-icon section-icon-contact">📞</div>
              <div>
                <p className="form-section-title">Contact Information</p>
                <p className="form-section-sub">Phone, email &amp; address</p>
              </div>
            </div>
            <div className="form-grid">
              <InputBox label="Phone Number"      name="phone"            type="text"     numericOnly maxLength={10} value={formData.phone}            onChange={handleChange} error={errors.phone} required />
              <InputBox label="Email"             name="email"            type="email"               value={formData.email}            onChange={handleChange} />
              <InputBox label="Address"           name="address"          type="textarea"            value={formData.address}          onChange={handleChange} />
              <InputBox label="Emergency Contact" name="emergencyContact" type="text"               value={formData.emergencyContact} onChange={handleChange} />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  /* ── Render ── */
  return (
    <form className="teacher-form-page" onSubmit={handleSubmit}>

      <div className="teacher-page-header">
        <h1 className="teacher-page-title">Add New Teacher</h1>
        <p className="teacher-page-sub">Smart Kids Academy · Fill in all required fields</p>
      </div>

      {successMessage && (
        <div className="success-message">{successMessage}</div>
      )}

      <div className="teacher-layout">

        {/* ── Sidebar ── */}
        <aside className="teacher-sidebar">
          <div className="teacher-sidebar-brand">
            <div className="teacher-sidebar-title">Teacher Form</div>
            <div className="teacher-sidebar-sub">Smart Kids Academy</div>
          </div>

          <div className="teacher-sidebar-label">Sections</div>

          {NAV_SECTIONS.map((sec) => (
            <button
              key={sec.id}
              type="button"
              className={`teacher-nav-item${activeSection === sec.id ? " active" : ""}`}
              onClick={() => setActiveSection(sec.id)}
            >
              <span className="teacher-nav-dot" />
              {sec.icon} {sec.label}
            </button>
          ))}
        </aside>

        {/* ── Body ── */}
        <div className="teacher-body">

          {renderSection()}

          <div className="form-actions">
            <div className="form-actions-left">
              {currentIndex > 0 && (
                <button type="button" className="secondary-btn" onClick={goPrev}>
                  ← Previous
                </button>
              )}
              {currentIndex < NAV_SECTIONS.length - 1 && (
                <button type="button" className="next-btn" onClick={goNext}>
                  Next →
                </button>
              )}
            </div>

            <button
              type="button"
              className="secondary-btn"
              onClick={() => setFormData(initialFormData)}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="primary-btn"
              disabled={!isFormValid}
            >
              Add Teacher
            </button>
          </div>

        </div>
      </div>
    </form>
  );
}

export default TeacherForm;