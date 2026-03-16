// src/pages/Students/BonafideCertificate.tsx

import { useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useStudents } from "../../context/StudentContext";
import { useClasses } from "../../context/ClassContext";
import { useSections } from "../../context/SectionContext";
import { useAcademicYear } from "../../context/AcademicYearContext";
import PrintLayout from "../../components/print/PrintLayout";
import PrintHeader from "../../components/print/PrintHeader";
import SchoolLogo from "../../assets/logo.svg?react";
import "./bonafide.css";


function BonafideCertificate() {
    const navigate = useNavigate();
    const location = useLocation();
    const { id } = useParams<{ id: string }>();

    const { students } = useStudents();
    const { classes } = useClasses();
    const { sections } = useSections();
    const { academicYear } = useAcademicYear();

    // Student can come from route param OR navigation state
    const student =
        location.state?.student ||
        students.find((s) => s.id === id);

    if (!student) {
        return <p>Student not found.</p>;
    }

    const cls = classes.find((c) => c.id === student.classID);
    const sec = sections.find((s) => s.id === student.sectionID);

    /* =========================
       Filename handling
    ========================= */

    useEffect(() => {
        const originalTitle = document.title;
        document.title = `Bonafide Certificate - ${student.firstName} ${student.lastName}`;

        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                window.print();
            });
        });


        return () => {
            document.title = originalTitle;
        };
    }, [student]);

    /* =========================
       Render
    ========================= */

    return (
        <>
            {/* Screen-only controls */}
            <div className="print-controls">
                <button onClick={() => window.print()}>Re-print</button>
                <button onClick={() => navigate(-1)}>Back</button>
            </div>

            <PrintLayout watermark={<SchoolLogo className="watermark" />}>
                <PrintHeader
                    logo={<SchoolLogo className="logo-svg" />}
                    title="SMART KIDS ACADEMY"
                    subtitle="Late Shankarsheth Lodha Memorial Education Society · Sonai"
                    rightSlot={
                        <div style={{ fontSize: "12px", textAlign: "right" }}>
                            <div><strong>Academic Year:</strong> {academicYear}</div>
                            <div><strong>Date:</strong> {new Date().toLocaleDateString()}</div>
                        </div>
                    }
                />

                <hr />

                {/* ================= CERTIFICATE BODY ================= */}
                <section className="card compact">
                    <h3 style={{ textAlign: "center", marginBottom: "20px" }}>
                        BONAFIDE CERTIFICATE
                    </h3>

                    <p style={{ fontSize: "15px", lineHeight: "1.8", textAlign: "justify" }}>
                        This is to certify that <strong>{student.firstName} {student.lastName}</strong>,
                        son/daughter of <strong>{student.father.name}</strong>, is a
                        bonafide student of <strong>Smart Kids Academy</strong>.
                    </p>

                    <p style={{ fontSize: "15px", lineHeight: "1.8", textAlign: "justify" }}>
                        He/She is currently studying in <strong>Class {cls?.ClassName}</strong>
                        {sec ? `, Section ${sec.name}` : ""} during the academic year{" "}
                        <strong>{academicYear}</strong>.
                    </p>

                    <p style={{ fontSize: "15px", lineHeight: "1.8", textAlign: "justify" }}>
                        This certificate is issued upon the request of the student/parent
                        for whatever purpose it may serve.
                    </p>

                    <div style={{ marginTop: "40px", display: "flex", justifyContent: "space-between" }}>
                        <div>
                            <p>Date: {new Date().toLocaleDateString()}</p>
                            <p>Place: Sonai</p>
                        </div>

                        <div style={{ textAlign: "right" }}>
                            <p style={{ marginBottom: "40px" }}>______________________</p>
                            <p><strong>Authorized Signatory</strong></p>
                            <p>Smart Kids Academy</p>
                        </div>
                    </div>
                </section>
            </PrintLayout>
        </>
    );
}

export default BonafideCertificate;
