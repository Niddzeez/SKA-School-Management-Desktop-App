import { useMemo, useState } from "react";
import { printReport } from "../Reports/Utils/PrintUtils";
import { useClasses } from "../../context/ClassContext";
import { useSections } from "../../context/SectionContext";
import { useStudents } from "../../context/StudentContext";
import { useTeachers } from "../../context/TeacherContext";
import { useAcademicYear } from "../../context/AcademicYearContext";
import { exportToCSV } from "../../utils/exportTOCSV";


type Props = {
    onClose: () => void;
};

export default function ClassRegisterModal({ onClose }: Props) {
    const { classes } = useClasses();
    const { sections } = useSections();
    const { students } = useStudents();
    const { teachers } = useTeachers();
    const { academicYear } = useAcademicYear();

    const [selectedClassID, setSelectedClassID] = useState<string>("");
    const [selectedSectionID, setSelectedSectionID] = useState<string>("");

    /* =========================
       Derived Data
    ========================= */

    const classSections = useMemo(() => {
        if (!selectedClassID) return [];
        return sections.filter(
            (s) => s.classID === selectedClassID
        );
    }, [sections, selectedClassID]);

    const selectedClass = classes.find(
        (c) => c.id === selectedClassID
    );

    const selectedSection = sections.find(
        (s) =>
            s.id === selectedSectionID &&
            s.classID === selectedClassID
    );


    const classStudents = useMemo(() => {
        if (!selectedClassID) return [];
        return students.filter(
            (s) => s.classID === selectedClassID
        );
    }, [students, selectedClassID]);

    /* =========================
       Generate Register
    ========================= */

    const handleGenerate = () => {
        if (!selectedClass || !selectedSection) return;

        const teacherFind =
            teachers.find(
                (t) => t.id === selectedSection.classTeacherID
            )

        const teacherName = teacherFind
            ? `${teacherFind.firstName} ${teacherFind.lastName}`
            : "—";

        console.log("Class teacher:", teacherName);

        const sorted = [...classStudents].sort((a, b) => {
            const f = a.firstName.localeCompare(b.firstName);
            if (f !== 0) return f;
            return a.lastName.localeCompare(b.lastName);
        });

        console.log("Selected Section:", selectedSection);
        console.log("Resolved Teacher:",
            teachers.find(t => t.id === selectedSection?.classTeacherID)
        );


        const printData = {
            title: "Student Register",
            meta: {
                academicYear,
                reportType: "STATEMENT",
                granularity: "CLASS_WISE",
                periodLabel: `Class ${selectedClass.ClassName} - Section ${selectedSection.name}`,
            },
            sections: [
                {
                    title: "Class Information",
                    headers: ["Field", "Value"],
                    rows: [
                        {
                            columns: ["Class", selectedClass.ClassName],
                        },
                        {
                            columns: ["Section", selectedSection.name],
                        },
                        {
                            columns: ["Class Teacher", teacherName],
                        },
                    ],
                },
                {
                    title: "Student Register",
                    headers: [
                        "Roll No",
                        "First Name",
                        "Last Name",
                        "Phone",
                    ],
                    rows: sorted.map((s, idx) => ({
                        columns: [
                            String(idx + 1),
                            s.firstName,
                            s.lastName,
                            s.phoneNumber ?? s.father.phone ?? "",
                        ],
                    })),
                },
            ],

        } as const;

        printReport(printData);
    };


    const handleExportCSV = () => {
        if (!selectedClass || !selectedSection) return;

        const teacherName =
            teachers.find(
                (t) => t.id === selectedSection.classTeacherID
            )?.firstName +
            " " +
            teachers.find(
                (t) => t.id === selectedSection.classTeacherID
            )?.lastName || "Not Assigned";

        const sorted = [...classStudents].sort((a, b) => {
            const f = a.firstName.localeCompare(b.firstName);
            if (f !== 0) return f;
            return a.lastName.localeCompare(b.lastName);
        });

        const rows = sorted.map((s, idx) => ({
            "Roll No": idx + 1,
            "First Name": s.firstName,
            "Last Name": s.lastName,
            Phone: s.phoneNumber ?? s.father?.phone ?? "",
            Class: selectedClass.ClassName,
            Section: selectedSection.name,
        }));

        exportToCSV(
            rows,
            `Class-Register-${academicYear}-${selectedClass.ClassName}-${selectedSection.name}.csv`
        );
    };


    /* =========================
       Render
    ========================= */

    return (
        <div className="modal-overlay">
            <div className="modal-card">
                <h3>Generate Student Register</h3>

                <label>
                    Class
                    <select
                        value={selectedClassID}
                        onChange={(e) => {
                            setSelectedClassID(e.target.value);
                            setSelectedSectionID("");
                        }}
                    >
                        <option value="">Select Class</option>
                        {classes.map((cls) => (
                            <option key={cls.id} value={cls.id}>
                                {cls.ClassName}
                            </option>
                        ))}
                    </select>
                </label>

                <label>
                    Section
                    <select
                        value={selectedSectionID}
                        onChange={(e) =>
                            setSelectedSectionID(e.target.value)
                        }
                        disabled={!selectedClassID}
                    >
                        <option value="">Select Section</option>
                        {classSections.map((sec) => (
                            <option key={sec.id} value={sec.id}>
                                {sec.name}
                            </option>
                        ))}
                    </select>
                </label>

                <div className="modal-actions">
                    <button
                        onClick={handleGenerate}
                        disabled={!selectedClassID || !selectedSectionID}
                    >
                        Generate PDF
                    </button>

                    <button
                        className="secondary"
                        onClick={handleExportCSV}
                        disabled={!selectedClassID || !selectedSectionID}
                    >
                        Export CSV
                    </button>

                    <button className="secondary" onClick={onClose}>
                        Cancel
                    </button>
                </div>

            </div>
        </div>
    );
}
