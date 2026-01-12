import { useParams, useNavigate } from "react-router-dom";
import type { Student } from "../types/Student";
//import { students } from "../data/students";
import "../styles/studentDetails.css";
import { useStudents } from "../context/StudentContext";
import { useClasses } from "../context/ClassContext";
import { useSections } from "../context/SectionContext";
import { useState, useEffect } from "react";

function StudentDetails() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { students, UpdateStudentStatus, assignStudenttoSection } =
    useStudents();
  const { classes } = useClasses();
  const { sections } = useSections();

  const student: Student | undefined = students.find((s) => s.id === id);
  if (!student) {
    return <div>Student not found</div>;
  }


  const [tempClassID, setTempClassID] = useState("");
const [tempSectionID, setTempSectionID] = useState("");


  const availableSections = sections.filter(
    (sec) => sec.classID === tempClassID
  );

  const handleDeactivate = () => {
    UpdateStudentStatus(student.id, "Inactive");
    navigate("/students");
  };

  const handleActivate = () => {
    UpdateStudentStatus(student.id, "Active");
    navigate("/students");
  };

  return (
    <div className="student-detail">
      <button className="back-button" onClick={() => navigate("/students")}>
        {" "}
        Back to Students{" "}
      </button>
      <h2>
        {student.firstName} {student.lastName} - Details
      </h2>
      <p>
        <strong>Status:</strong>{" "}
        <span className={`status ${student.status.toLowerCase()}`}>
          {student.status}
        </span>
      </p>
      <div className="student-actions">
        {student.status === "Active" ? (
          <button className="danger-btn" onClick={handleDeactivate}>
            Deactivate Student
          </button>
        ) : (
          <button className="primary-btn" onClick={handleActivate}>
            Activate Student
          </button>
        )}
      </div>

      <p>
        <strong>Student ID:</strong> {student.id}
      </p>
      <p>
        <strong>Gender:</strong> {student.gender}
      </p>
      <p>
        <strong>Phone:</strong> {student.phoneNumber}
      </p>
      <p>
        <strong>City:</strong> {student.address.city}
      </p>

      <h3>Class & Section</h3>

<p>
  <strong>Assigned:</strong>{" "}
  {student.classID && student.sectionID
    ? `Class ${
        classes.find(c => c.id === student.classID)?.ClassName
      } - Section ${
        sections.find(s => s.id === student.sectionID)?.name
      }`
    : "Not Assigned"}
</p>

<div className="assignment-row">
  <select
    value={tempClassID}
    onChange={(e) => {
      setTempClassID(e.target.value);
      setTempSectionID("");
    }}
  >
    <option value="">Select Class</option>
    {classes.map((cls) => (
      <option key={cls.id} value={cls.id}>
        Class {cls.ClassName}
      </option>
    ))}
  </select>

  <select
    value={tempSectionID}
    disabled={!tempClassID}
    onChange={(e) => setTempSectionID(e.target.value)}
  >
    <option value="">Select Section</option>
    {sections
      .filter((sec) => sec.classID === tempClassID)
      .map((sec) => (
        <option key={sec.id} value={sec.id}>
          Section {sec.name}
        </option>
      ))}
  </select>

  <button
    disabled={!tempClassID || !tempSectionID}
    onClick={() => {
      assignStudenttoSection(student.id, tempClassID, tempSectionID);
      setTempClassID("");
      setTempSectionID("");
    }}
  >
    Assign
  </button>
</div>


      <h3>Father</h3>
      <p>
        <strong>Father:</strong> {student.father.name}
      </p>
      <p>
        <strong>Occupation:</strong> {student.father.occupation}
      </p>
      <p>
        <strong>Phone:</strong> {student.father.phone}
      </p>
      <p>
        <strong>Education:</strong> {student.father.education}
      </p>

      <h3>Mother</h3>
      <p>
        <strong>Mother:</strong> {student.mother.name}
      </p>
      <p>
        <strong>Occupation:</strong> {student.mother.occupation}
      </p>
      <p>
        <strong>Phone:</strong> {student.mother.phone}
      </p>
      <p>
        <strong>Education:</strong> {student.mother.education}
      </p>
    </div>
  );
}

export default StudentDetails;
