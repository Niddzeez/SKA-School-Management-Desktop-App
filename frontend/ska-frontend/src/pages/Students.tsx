import { students } from "../data/students";
import StudentTable from "../components/studentTables";

function Students(){
    return (
        <div>
            <h2>
                Students
            </h2>

            <StudentTable students={students} />
        </div>

    )
}

export default Students;