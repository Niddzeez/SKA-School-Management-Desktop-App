import { useState, useEffect } from "react";
import { useClasses } from "../../context/ClassContext";
import { useSections } from "../../context/SectionContext";
import { useTeachers } from "../../context/TeacherContext";
import "../../styles/Classes.css";
import ClassRegisterModal from "./ClassRegisterModal";

/* =========================
   Fixed Class List
========================= */



function Classes() {
  const { orderedClasses } = useClasses();
  const { sections, addSection, assignClassTeacher, loadAllSections} = useSections();
  const { teachers } = useTeachers();

  const [newSectionNames, setNewSectionNames] = useState<
    Record<string, string>
  >({});

  const [showRegisterModal, setShowRegisterModal] = useState(false);


  /* =========================
     Add Section
  ========================= */

  const handleAddSection = async (classID: string) => {
    const sectionName = newSectionNames[classID];
    if (!sectionName?.trim()) return;

    try {
      await addSection(classID, sectionName.trim());
    } catch (err: any) {
      alert(err.message); // or toast
    }


    setNewSectionNames((prev) => ({
      ...prev,
      [classID]: "",
    }));
  };

  useEffect(() => {
    loadAllSections();
  }, []);




  /* =========================
     Render
  ========================= */

  return (
    <div className="page-container">
      <h1>Classes & Sections</h1>

      <button
        className="primary"
        onClick={() => setShowRegisterModal(true)}
      >
        Generate Class Register
      </button>

      {/* Class Cards */}
      <div className="class-list">
        {orderedClasses.map((cls) => {
          const classSections = sections.filter(
            (sec) => sec.classID === cls.id
          );

          return (
            <div key={cls.id} className="class-card">
              <h2>Class {cls.ClassName}</h2>

              <ul className="section-list">
                {classSections.length === 0 && (
                  <li className="empty">No sections added</li>
                )}

                {classSections.map((sec) => {
                  const assignedTeacher = teachers.find(
                    (t) => t.id === sec.classTeacherID
                  );

                  return (
                    <li key={sec.id} className="section-item">
                      <div>
                        <strong>Section {sec.name}</strong>
                        <div className="teacher-name">
                          Class Teacher:{" "}
                          {assignedTeacher
                            ? `${assignedTeacher.firstName} ${assignedTeacher.lastName}`
                            : "Not Assigned"}
                        </div>
                      </div>

                      <select
                        value={sec.classTeacherID || ""}
                        onChange={(e) =>
                          assignClassTeacher(
                            sec.id,
                            e.target.value
                          )
                        }
                      >
                        <option value="">
                          Assign Teacher
                        </option>
                        {teachers
                          .filter(
                            (t) => t.status === "Active"
                          )
                          .map((teacher) => (
                            <option
                              key={teacher.id}
                              value={teacher.id}
                            >
                              {teacher.firstName}{" "}
                              {teacher.lastName}
                            </option>
                          ))}
                      </select>
                    </li>
                  );
                })}
              </ul>

              {/* Add Section */}
              <div className="add-section">
                <input
                  type="text"
                  placeholder="Section (A, B, C)"
                  value={newSectionNames[cls.id] || ""}
                  onChange={(e) =>
                    setNewSectionNames((prev) => ({
                      ...prev,
                      [cls.id]: e.target.value,
                    }))
                  }
                />
                <button
                  onClick={() => handleAddSection(cls.id)}
                >
                  Add Section
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Register Modal */}
      {showRegisterModal && (
        <ClassRegisterModal
          onClose={() => setShowRegisterModal(false)}
        />
      )}
    </div>
  );
}

export default Classes;
