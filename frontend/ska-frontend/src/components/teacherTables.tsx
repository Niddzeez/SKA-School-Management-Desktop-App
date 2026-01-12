import type { Teacher } from "../types/Teachers";
import { useNavigate } from "react-router-dom";
import "../styles/studentTable.css"
type TeacherTableProps = {
  teachers: Teacher[];
};

function TeacherTable({ teachers }: TeacherTableProps) {
    const navigate = useNavigate(); 
    if (teachers.length === 0) {    
    return <p>No teachers available!</p>;
    }

    function getAge(dob: string): number {
        const birthDate = new Date(dob);
        const today = new Date();

        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();

        if(monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }

        return age;
    }

    return (
        <table className="student-table">
            <thead>
                <tr>
                    <th>Teacher ID</th>
                    <th>Name</th>
                    <th>Phone</th>
                    <th>Class Teachership</th>
                    <th>Gender</th>
                    <th>Age</th>
                </tr>
            </thead>

            <tbody>
                {teachers.map((teacher) => (
                    <tr key={teacher.id} 
                    onClick={() => navigate(`/teachers/${teacher.id}`)}>
                        <td>{teacher.id.slice(0, 8)}</td>
                        <td>{teacher.firstName} {teacher.lastName}</td>
                        <td>{teacher.phone}</td>
                        <td>{teacher.currentClass ? `${teacher.currentClass.className}-${teacher.currentClass.section}` : "-"}</td>
                        <td>{teacher.gender}</td>
                        <td>{getAge(teacher.dob)}</td>
                    </tr>
                ))}
            </tbody>

        </table>
    );

}

export default TeacherTable;