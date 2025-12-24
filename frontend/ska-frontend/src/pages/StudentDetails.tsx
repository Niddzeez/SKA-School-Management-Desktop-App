import { useParams, useNavigate } from "react-router-dom";
import type { Student } from "../types/Student";
import { students } from "../data/students";
import "../styles/studentDetails.css";

function StudentDetails() {

    const navigate = useNavigate();
    const {id} = useParams<{id: string}>();
    const student: Student | undefined = students.find((s) => s.id === id);

    if (!student) {
        return <div>Student not found</div>;
    }

    return (
        <div className="student-detail">
            <button 
                className="back-button"
                onClick={()=> navigate("/students")}
            > Back to Students </button>
            <h2>
                {student.firstName} {student.lastName} - Details
            </h2>
            <p><strong>Student ID:</strong> {student.id}</p>
            <p><strong>Gender:</strong> {student.gender}</p>
            <p><strong>Phone:</strong> {student.phoneNumber}</p>
            <p><strong>City:</strong> {student.address.city}</p>

            <h3>Father</h3>
            <p><strong>Father:</strong> {student.father.name}</p>
            <p><strong>Occupation:</strong> {student.father.occupation}</p>
            <p><strong>Phone:</strong> {student.father.phone}</p>
            <p><strong>Education:</strong> {student.father.education}</p>

            <h3>Mother</h3>
            <p><strong>Mother:</strong> {student.mother.name}</p>
            <p><strong>Occupation:</strong> {student.mother.occupation}</p>
            <p><strong>Phone:</strong> {student.mother.phone}</p>
            <p><strong>Education:</strong> {student.mother.education}</p>
        </div>
    )
}

export default StudentDetails;