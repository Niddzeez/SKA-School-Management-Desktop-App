import { useState } from "react";
import TeacherTable from "../components/teacherTables";
import { useTeachers } from "../context/TeacherContext";
import "../styles/Teachers.css";

function Teachers() {
  const { teachers } = useTeachers();
  const [searchTerm, setSearchTerm] = useState("");

  //Filter active teachers based on search term
  const activeTeachers = teachers.filter((teacher) => teacher.status === "Active");

  const filteredTeachers = activeTeachers.filter((teacher) => {
    const query = searchTerm.toLowerCase().trim();
    if (!query) return true;

    const searchableFields = [
        teacher.id,
        teacher.firstName,
        teacher.lastName,
        teacher.phone,
        teacher.currentClass?.className,
        teacher.currentClass?.section,
        teacher.gender,
    ];

    return searchableFields.some((field) =>
      String(field ?? "")
        .toLowerCase()
        .includes(query)
    );
  });


  // Render the Teachers Page

  return (
    <div className="teachers-page">
        <div className="teachers-header">
            <h1>Teachers</h1>

            <div className="search-wrapper">
                <input
                    type="text"
                    placeholder="Search teachers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />

                {searchTerm && (
                    <button
                        className="clear-search"
                        onClick={() => setSearchTerm("")}
                        aria-label="Clear search"
                    >×</button>
                )}
            </div>

        </div>

        <TeacherTable teachers={filteredTeachers} />

        {filteredTeachers.length === 0 && (searchTerm &&
            <p className="no-result">No teachers found matching "{searchTerm}"</p>
        )}
    </div>
  );
}

export default Teachers;