import type { Student } from "../types/Student";
import { useNavigate } from "react-router-dom";
import "../styles/studentTable.css";

type StudentTableProps = {
  students: Student[];
};

function StudentTable({ students }: StudentTableProps) {
    const navigate = useNavigate();
    if (students.length === 0) {
  return <p>No students admitted yet.</p>;
}

    return(
        <table className="student-table">
            <thead>
                <tr>
                    <th>Student-ID</th>
                    <th>Name</th>
                    <th>Class</th>
                    <th>Section</th>
                    <th>Gender</th>
                    <th>Phone number</th>
                    <th>City</th>
                </tr>
            </thead>

            <tbody>
                {students.map((student) => (
                    <tr key={student.id} 
                    onClick={() => navigate(`/students/${student.id}`)}>
                        <td>{student.id.slice(0, 8)}</td>
                        <td>{student.firstName} {student.lastName}</td>
                        <td>{student.academic.grade}</td>
                        <td>{student.academic.section || "-"}</td>
                        <td>{student.gender}</td>
                        <td>{student.phoneNumber}</td>
                        <td>{student.address.city}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}

export default StudentTable;