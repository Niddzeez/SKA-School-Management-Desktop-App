import "../styles/TeacherForm.css";
import InputBox from "../components/FormInputBoxes";
import { useTeachers } from "../context/TeacherContext";
import { mapFormDataToTeacher } from "../mappers/formtoteachers";
import React from "react";
import type { Teacher } from "../types/Teachers";
import { useState } from "react";

function TeacherForm() {

  const [error, setError] = React.useState<{[key : string]: string}>({});
  const { addTeacher } = useTeachers();
  
  const initialFormData = {
    firstName: "",
    lastName: "",
    email: "",
    subjects: [],
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

  const [successMessage, setSuccessMessage] = React.useState("");


  // Handle input changes
  // It does a shallow merge of the previous state and the new state
  // A shallow merge means only the top-level properties are merged
  //It helps to update only the changed field in the form data
  const handleChange = (name: string, value: string) => {
    setFormData((prev) => (
      {
        ...prev,
        [name]: value,
      }
    ));
  };


  function validateForm() {
    const newErrors: {[key : string]: string} = {};

    // Example validation: Check if first name is empty
    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }

    if(!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }

    if(!formData.dob.trim()) {
      newErrors.dob = "Date of Birth is required";
    }

    if(!formData.dob.match(/^\d{4}-\d{2}-\d{2}$/)) {
      newErrors.dob = "Date of Birth must be in YYYY-MM-DD format";
    }

    if(!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    }else if (!formData.phone.match(/^[6-9]\d{9}$/)) {
      newErrors.phone = "Phone number must be a valid 10-digit Indian number";
    }
    

    if(!formData.aadhar.trim()){
      newErrors.aadhar = "Aadhar number is required";
    }else if (!formData.aadhar.match(/^\d{12}$/)) {
      newErrors.aadhar = "Aadhar number must be a valid 12-digit number";
    }

    return newErrors;
  }

  console.log("Validation Errors: ", validateForm());
  const isFormValid = Object.keys(validateForm()).length === 0;


  // Submit Handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const validateErrors = validateForm();

    setError(validateErrors);

    if(Object.keys(validateErrors).length > 0){
      return;
    }

    const teacher: Teacher = mapFormDataToTeacher(formData);
    addTeacher(teacher);
    setFormData(initialFormData);

    setError({});
    setSuccessMessage("Teacher added successfully!");

    setTimeout(() => setSuccessMessage(""), 3000);

  }

  return (
    <form className="teacher-form-page" onSubmit={handleSubmit}>
  <h1>Add New Teacher</h1>

  {successMessage && (
    <div className="success-message">{successMessage}</div>
  )}

  {/* Personal Information */}
  <div className="form-section">
    <h2 className="section-heading">Personal Information</h2>

    <div className="form-grid">
      <InputBox
        label="First Name"
        name="firstName"
        type="text"
        value={formData.firstName}
        onChange={handleChange}
        error={error.firstName}
        required
      />

      <InputBox
        label="Last Name"
        name="lastName"
        type="text"
        value={formData.lastName}
        onChange={handleChange}
        error={error.lastName}
        required
      />

      <InputBox
        label="Gender"
        name="gender"
        type="select"
        options={["Male", "Female", "Other"]}
        value={formData.gender}
        onChange={handleChange}
        required
      />

      <InputBox
        label="Date of Birth"
        name="dob"
        type="date"
        value={formData.dob}
        onChange={handleChange}
        error={error.dob}
        required
      />
    </div>
  </div>

  <hr />

  {/* Professional Information */}
  <div className="form-section">
    <h2 className="section-heading">Professional Information</h2>

    <div className="form-grid">
      <InputBox
        label="Subjects"
        name="subjects"
        type="text"
        value={Array.isArray(formData.subjects) ? formData.subjects.join(", ") : formData.subjects}
        onChange={handleChange}
      />

      <InputBox
        label="Years of Experience"
        name="yearsOfExperience"
        type="text"
        numericOnly
        value={formData.yearsOfExperience}
        onChange={handleChange}
      />

      <InputBox
        label="Date of Joining"
        name="dateOfJoining"
        type="date"
        value={formData.dateOfJoining}
        onChange={handleChange}
      />

      <InputBox
        label="Qualification"
        name="qualification"
        type="text"
        value={formData.qualification}
        onChange={handleChange}
      />

    </div>

  </div>

  <hr />

  {/* Contact Information */}
  <div className="form-section">
    <h2 className="section-heading">Contact Information</h2>

    <div className="form-grid">
      <InputBox
        label="Phone Number"
        name="phone"
        type="text"
        numericOnly
        maxLength={10}
        value={formData.phone}
        onChange={handleChange}
        error={error.phone}
        required
      />

      <InputBox
        label="Email"
        name="email"
        type="email"
        value={formData.email}
        onChange={handleChange}
      />

      <InputBox
        label="Address"
        name="address"
        type="textarea"
        value={formData.address}
        onChange={handleChange}
      />

      <InputBox
        label="Emergency Contact"
        name="emergencyContact"
        type="text"
        value={formData.emergencyContact}
        onChange={handleChange}
      />
    </div>
  </div>

  <hr />

  {/* Additional Information */}
  <div className="form-section">
    <h2 className="section-heading">Additional Information</h2>

    <div className="form-grid">
      <InputBox
        label="Aadhaar Number"
        name="aadhar"
        type="text"
        numericOnly
        maxLength={12}
        value={formData.aadhar}
        onChange={handleChange}
        error={error.aadhar}
        required
      />

      <InputBox
        label="Blood Group"
        name="bloodGroup"
        type="select"
        options={["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]}
        value={formData.bloodGroup}
        onChange={handleChange}
      />

      <InputBox
        label="Religion"
        name="religion"
        type="text"
        value={formData.religion}
        onChange={handleChange}
      />

      <InputBox
        label="Father's/Spouse's Name"
        name="guardian"
        type="text"
        value={formData.guardian}
        onChange={handleChange}
      />
    </div>
  </div>


  {/* Actions */}
  <div className="form-actions">
    <button type="submit" className="primary-btn" disabled={!isFormValid}>
      Add Teacher
    </button>

    <button
      type="button"
      className="secondary-btn"
      onClick={() => setFormData(initialFormData)}
    >
      Cancel
    </button>
  </div>
</form>

  );
}

export default TeacherForm;
  
  
