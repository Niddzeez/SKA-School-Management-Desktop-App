import { useParams } from "react-router-dom";
import { useStudents } from "../../context/StudentContext";
import { useClasses } from "../../context/ClassContext";
import { useSections } from "../../context/SectionContext";
import { useFeeLedger } from "../../context/FeeLedgerContext";
import { useAcademicYear } from "../../context/AcademicYearContext";
import { printReport } from "../Reports/Utils/PrintUtils";

function PaymentReceipt() {
  const { paymentId } = useParams<{ paymentId: string }>();

  const { students } = useStudents();
  const { classes } = useClasses();
  const { sections } = useSections();
  const { payments, ledgers, getReceiptNumber } = useFeeLedger();
  const { academicYear } = useAcademicYear();

  const payment = payments.find(p => p.id === paymentId);
  if (!payment) return <p>Payment not found.</p>;

  const ledger = ledgers.find(l => l.id === payment.ledgerId);
  if (!ledger) return <p>Ledger not found.</p>;

  const student = students.find(s => s.id === payment.studentId);
  if (!student) return <p>Student not found.</p>;

  const cls = classes.find(c => c.id === ledger.classId);
  const sec = sections.find(s => s.id === student.sectionID);

  const receiptNo = getReceiptNumber(payment.id);

  /* =========================
     PRINT HANDLER
  ========================= */

  const handlePrint = () => {
    printReport({
      title: `Receipt_${receiptNo}_${student.firstName}_${student.lastName}`,
      meta: {
        studentName: `${student.firstName} ${student.lastName}`,
        academicYear,
        reportType: "PAYMENT_RECEIPT",
        periodLabel: new Date(payment.createdAt).toLocaleDateString(),
      },
      sections: [
        {
          title: "Receipt Details",
          headers: ["Field", "Value"],
          rows: [
            { columns: ["Receipt No", receiptNo] },
            { columns: ["Date", new Date(payment.createdAt).toLocaleDateString()] },
            { columns: ["Academic Year", academicYear] },
          ],
        },
        {
          title: "Student Information",
          headers: ["Field", "Value"],
          rows: [
            {
              columns: [
                "Student Name",
                `${student.firstName} ${student.lastName}`,
              ],
            },
            {
              columns: ["Class", `Class ${cls?.ClassName ?? "-"}`],
            },
            {
              columns: ["Section", sec?.name ?? "—"],
            },
          ],
        },
        {
          title: "Payment Details",
          headers: ["Description", "Amount"],
          rows: [
            {
              columns: ["Fee Payment", `₹${payment.amount}`],
            },
          ],
        },
        {
          title: "Transaction Info",
          headers: ["Field", "Value"],
          rows: [
            { columns: ["Mode", payment.mode] },
            {
              columns: ["Reference", payment.reference ?? "-"],
            },
            {
              columns: ["Collected By", payment.collectedBy],
            },
          ],
        },
      ],
    });
  };

  /* =========================
     RENDER (PREVIEW ONLY)
  ========================= */

  return (
    <div style={{ padding: "20px" }}>
      <h2>Receipt Preview</h2>

      <p><strong>Receipt No:</strong> {receiptNo}</p>
      <p>
        <strong>Student:</strong> {student.firstName} {student.lastName}
      </p>
      <p><strong>Amount:</strong> ₹{payment.amount}</p>
      <p><strong>Mode:</strong> {payment.mode}</p>

      <button onClick={handlePrint}>
        Print / Save as PDF
      </button>
    </div>
  );
}

export default PaymentReceipt;
