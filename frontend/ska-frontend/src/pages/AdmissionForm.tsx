import "../styles/AdmissionForm.css";
import InputBox from "../components/FormInputBoxes";
import { useState } from "react";
import { mapFormDataToStudent } from "../mappers/formtostudents";
import type { Student } from "../types/Student";
import { useStudents } from "../context/StudentContext";

function AdmissionForm() {
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const { addStudent } = useStudents();

  const initialFormData = {
    firstName: "",
    lastName: "",
    dob: "",
    gender: "" as "Male" | "Female" | "Other",
    address: "",
    city: "",
    state: "",
    pinCode: "",
    phone: "",
    email: "",
    grade: "",
    feeDiscount: "",
    admissionDate: "",

    religion: "",
    caste: "",
    category: "",
    minorityStatus: "",
    aadhaar: "",
    previousSchool: "",
    guardianName: "",
    siblings: "",
    transport: "",
    emergencyContact: "",
    medicalConditions: "",
    bloodGroup: "",
    disabilityStatus: "",

    fatherName: "",
    fatherPhone: "",
    fatherOccupation: "",
    fatherAadhaar: "",
    fatherEducation: "",
    fatherIncome: "",

    motherName: "",
    motherPhone: "",
    motherOccupation: "",
    motherAadhaar: "",
    motherEducation: "",
    motherIncome: "",
  };

  const [formData, setFormData] = useState(initialFormData);

  const [successMessage, setSuccessMessage] = useState("");

  const handleChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  function validateForm() {
    const newErrors: { [key: string]: string } = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }

    if (!formData.gender) {
      newErrors.gender = "Gender is required";
    }

    if (!formData.dob) {
      newErrors.dob = "Date of birth is required";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\d{10}$/.test(formData.phone)) {
      newErrors.phone = "Phone number must be 10 digits";
    }

    if (!formData.fatherPhone.trim()) {
      newErrors.fatherPhone = "Father's phone number is required";
    } else if (!/^\d{10}$/.test(formData.fatherPhone)) {
      newErrors.fatherPhone = "Father's phone number must be 10 digits";
    }

    if (!formData.aadhaar.trim()) {
      newErrors.aadhaar = "Aadhaar number is required";
    } else if (!/^\d{12}$/.test(formData.aadhaar)) {
      newErrors.aadhaar = "Aadhaar number must be 12 digits";
    }

    return newErrors;
  }

  console.log("Validation errors:", validateForm());
  const isFormValid = Object.keys(validateForm()).length === 0;


  // Submit Handler
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const validationErrors = validateForm();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    const student: Student = mapFormDataToStudent(formData);
    addStudent(student);
    console.log("STORED STUDENT:", student);

    setFormData(initialFormData);
    
    setErrors({});
    setSuccessMessage("Admission submitted successfully");

    setTimeout(() => setSuccessMessage(""), 3000);
  }

  return (
    <form className="admission-form-page" onSubmit={handleSubmit}>
      <h1 className="heading">Admission Form</h1>
      {successMessage && (
        <div className="success-message">{successMessage}</div>
      )}

      {/* Student Information */}
      <div className="form-section">
        <h2 className="section-heading">Student Information</h2>
        <div className="form-grid">
          <InputBox
            label="First Name"
            name="firstName"
            type="text"
            value={formData.firstName}
            onChange={handleChange}
            error={errors.firstName}
            required
          />
          <InputBox
            label="Last Name"
            name="lastName"
            type="text"
            value={formData.lastName}
            onChange={handleChange}
            error={errors.lastName}
            required
          />
          <InputBox
            label="Date of Birth"
            name="dob"
            type="date"
            value={formData.dob}
            onChange={handleChange}
            error={errors.dob}
            required
          />
          <InputBox
            label="Gender"
            name="gender"
            type="select"
            options={["Male", "Female", "Other"]}
            value={formData.gender}
            onChange={handleChange}
            error={errors.gender}
            required
          />
          <InputBox
            label="Address"
            name="address"
            type="textarea"
            value={formData.address}
            onChange={handleChange}
          />
          <InputBox
            label="City"
            name="city"
            type="text"
            value={formData.city}
            onChange={handleChange}
          />
          <InputBox
            label="State"
            name="state"
            type="select"
            options={[
              "Andhra Pradesh",
              "Arunachal Pradesh",
              "Assam",
              "Bihar",
              "Chhattisgarh",
              "Goa",
              "Gujarat",
              "Haryana",
              "Himachal Pradesh",
              "Jharkhand",
              "Karnataka",
              "Kerala",
              "Madhya Pradesh",
              "Maharashtra",
              "Manipur",
              "Meghalaya",
              "Mizoram",
              "Nagaland",
              "Odisha",
              "Punjab",
              "Rajasthan",
              "Sikkim",
              "Tamil Nadu",
              "Telangana",
              "Tripura",
              "Uttar Pradesh",
              "Uttarakhand",
              "West Bengal",

              // Union Territories
              "Andaman and Nicobar Islands",
              "Chandigarh",
              "Dadra and Nagar Haveli and Daman and Diu",
              "Delhi (NCT)",
              "Jammu and Kashmir",
              "Ladakh",
              "Lakshadweep",
              "Puducherry",
            ]}
            value={formData.state}
            onChange={handleChange}
          />
          <InputBox
            label="Pin Code"
            name="pinCode"
            type="text"
            value={formData.pinCode}
            onChange={handleChange}
          />
          <InputBox
            label="Phone Number"
            name="phone"
            type="text"
            value={formData.phone}
            numericOnly
            maxLength={10}
            onChange={handleChange}
            error={errors.phoneNumber}
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
            label="Grade Applying For"
            name="grade"
            type="select"
            options={["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"]}
            value={formData.grade}
            onChange={handleChange}
          />
          <InputBox
            label="Fees Discount %"
            name="feeDiscount"
            type="text"
            value={formData.feeDiscount}
            onChange={handleChange}
          />
          <InputBox
            label="Date of Admission"
            name="admissionDate"
            type="date"
            value={formData.admissionDate}
            onChange={handleChange}
          />
        </div>
      </div>

      <hr />

      {/* Additional Details */}
      <div className="form-section">
        <h2 className="section-heading">Additional Details</h2>
        <div className="form-grid">
          <InputBox
            label="Religion"
            name="religion"
            type="select"
            options={[
              "Hindu",
              "Muslim",
              "Christian",
              "Sikh",
              "Buddhist",
              "Jain",
              "Parsi",
              "Jewish",
              "Other",
            ]}
            value={formData.religion}
            onChange={handleChange}
          />
          <InputBox
            label="Caste"
            name="caste"
            type="text"
            value={formData.caste}
            onChange={handleChange}
          />
          <InputBox
            label="Category"
            name="category"
            type="select"
            options={["General", "OBC", "SC", "ST", "VJ", "NT", "Other"]}
            value={formData.category}
            onChange={handleChange}
          />
          <InputBox
            label="Minority Status"
            name="minorityStatus"
            type="select"
            options={["Yes", "No"]}
            value={formData.minorityStatus}
            onChange={handleChange}
          />
          <InputBox
            label="Aadhaar Number"
            name="aadhaar"
            type="text"
            numericOnly
            maxLength={12}
            value={formData.aadhaar}
            onChange={handleChange}
            error={errors.aadhaar}
            required
          />
          <InputBox
            label="Previous School"
            name="previousSchool"
            type="text"
            value={formData.previousSchool}
            onChange={handleChange}
          />
          <InputBox
            label="Guardian's Name"
            name="guardianName"
            type="text"
            value={formData.guardianName}
            onChange={handleChange}
          />
          <InputBox
            label="Total Siblings"
            name="siblings"
            type="text"
            numericOnly
            maxLength={1}
            value={formData.siblings}
            onChange={handleChange}
          />
          <InputBox
            label="Transport Required"
            name="transport"
            type="select"
            options={["Yes", "No"]}
            value={formData.transport}
            onChange={handleChange}
          />
          <InputBox
            label="Emergency Contact"
            name="emergencyContact"
            type="text"
            value={formData.emergencyContact}
            onChange={handleChange}
          />
          <InputBox
            label="Medical Conditions"
            name="medicalConditions"
            type="textarea"
            value={formData.medicalConditions}
            onChange={handleChange}
          />
          <InputBox
            label="Blood Group"
            name="bloodGroup"
            type="select"
            options={[
              "A+",
              "A-",
              "B+",
              "B-",
              "AB+",
              "AB-",
              "O+",
              "O-",
              "Bombay Blood Group",
              "Unknown",
            ]}
            value={formData.bloodGroup}
            onChange={handleChange}
          />
          <InputBox
            label="Disability Status"
            name="disabilityStatus"
            type="select"
            options={["Yes", "No"]}
            value={formData.disabilityStatus}
            onChange={handleChange}
          />
        </div>
      </div>

      <hr />

      {/* Father */}
      <div className="form-section">
        <h2 className="section-heading">Father's Information</h2>
        <div className="form-grid">
          <InputBox
            label="Name"
            name="fatherName"
            type="text"
            value={formData.fatherName}
            onChange={handleChange}
          />
          <InputBox
            label="Phone Number"
            name="fatherPhone"
            type="text"
            numericOnly
            maxLength={10}
            value={formData.fatherPhone}
            onChange={handleChange}
            error={errors.fatherPhone}
            required
          />
          <InputBox
            label="Occupation"
            name="fatherOccupation"
            type="text"
            value={formData.fatherOccupation}
            onChange={handleChange}
          />
          <InputBox
            label="Aadhaar Number"
            name="fatherAadhaar"
            type="text"
            numericOnly
            maxLength={12}
            value={formData.fatherAadhaar}
            onChange={handleChange}
          />
          <InputBox
            label="Education"
            name="fatherEducation"
            type="text"
            value={formData.fatherEducation}
            onChange={handleChange}
          />
          <InputBox
            label="Income"
            name="fatherIncome"
            type="text"
            value={formData.fatherIncome}
            onChange={handleChange}
          />
        </div>
      </div>

      <hr />

      {/* Mother */}
      <div className="form-section">
        <h2 className="section-heading">Mother's Information</h2>
        <div className="form-grid">
          <InputBox
            label="Name"
            name="motherName"
            type="text"
            value={formData.motherName}
            onChange={handleChange}
          />
          <InputBox
            label="Phone Number"
            name="motherPhone"
            type="text"
            numericOnly
            maxLength={10}
            value={formData.motherPhone}
            onChange={handleChange}
          />
          <InputBox
            label="Occupation"
            name="motherOccupation"
            type="text"
            value={formData.motherOccupation}
            onChange={handleChange}
          />
          <InputBox
            label="Aadhaar Number"
            name="motherAadhaar"
            type="text"
            numericOnly
            maxLength={12}
            value={formData.motherAadhaar}
            onChange={handleChange}
          />
          <InputBox
            label="Education"
            name="motherEducation"
            type="text"
            value={formData.motherEducation}
            onChange={handleChange}
          />
          <InputBox
            label="Income"
            name="motherIncome"
            type="text"
            value={formData.motherIncome}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="form-actions">
        <button type="submit" className="primary-btn" disabled={!isFormValid}>
          Submit Admission
        </button>

        <button
          type="button"
          className="secondary-btn"
          onClick={() => console.log("Cancelled")}
        >
          Cancel
        </button>
      </div>

      {/* Debug (remove later) */}
      <pre style={{ marginTop: 20 }}>{JSON.stringify(formData, null, 2)}</pre>
    </form>
  );
}

export default AdmissionForm;
