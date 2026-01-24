import { useParams, useNavigate } from "react-router-dom";
import type { Teacher } from "../../types/Teachers";
import "../../styles/studentDetails.css";
import { useTeachers } from "../../context/TeacherContext";

function TeacherDetails() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { teachers, updateTeacherStatus } = useTeachers();

  const teacher: Teacher | undefined = teachers.find(
    (t) => t.id === id
  );

  if (!teacher) {
    return <div>Teacher not found</div>;
  }

  const handleDeactivate = () => {
    updateTeacherStatus(teacher.id, "Inactive");
    navigate("/teachers");
  };

  const handleActivate = () => {
    updateTeacherStatus(teacher.id, "Active");
    navigate("/teachers");
  };

  return (
    <div className="student-detail">
      <button
        className="back-button"
        onClick={() => navigate("/teachers")}
      >
        Back to Teachers
      </button>

      <h2>
        {teacher.firstName} {teacher.lastName} – Details
      </h2>

      <p>
        <strong>Status:</strong>{" "}
        <span className={`status ${teacher.status.toLowerCase()}`}>
          {teacher.status}
        </span>
      </p>

      <div className="student-actions">
        {teacher.status === "Active" ? (
          <button className="danger-btn" onClick={handleDeactivate}>
            Deactivate Teacher
          </button>
        ) : (
          <button className="primary-btn" onClick={handleActivate}>
            Activate Teacher
          </button>
        )}
      </div>

      <p>
        <strong>Teacher ID:</strong> {teacher.id}
      </p>

      <p>
        <strong>Gender:</strong> {teacher.gender}
      </p>

      <p>
        <strong>Phone:</strong> {teacher.phone}
      </p>

      {teacher.email && (
        <p>
          <strong>Email:</strong> {teacher.email}
        </p>
      )}

      <p>
        <strong>Date of Joining:</strong> {teacher.dateOfJoining}
      </p>

      <h3>Additional Information</h3>

      <p>
        <strong>Qualification:</strong>{" "}
        {teacher.information.qualification}
      </p>

      <p>
        <strong>Experience:</strong>{" "}
        {teacher.information.experienceYears ?? "-"} years
      </p>

      <p>
        <strong>Subjects:</strong>{" "}
        {teacher.information.subjects.join(", ")}
      </p>

      <p>
        <strong>Emergency Contact:</strong>{" "}
        {teacher.information.emergencyContact}
      </p>

      {teacher.information.bloodGroup && (
        <p>
          <strong>Blood Group:</strong>{" "}
          {teacher.information.bloodGroup}
        </p>
      )}

      {teacher.information.religion && (
        <p>
          <strong>Religion:</strong>{" "}
          {teacher.information.religion}
        </p>
      )}
    </div>
  );
}

export default TeacherDetails;
