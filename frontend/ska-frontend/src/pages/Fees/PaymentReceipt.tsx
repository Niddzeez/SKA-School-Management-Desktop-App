import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useStudents } from "../../context/StudentContext";
import { useClasses } from "../../context/ClassContext";
import { useSections } from "../../context/SectionContext";
import { useFeeLedger } from "../../context/FeeLedgerContext";
import { useAcademicYear } from "../../context/AcademicYearContext";

function PaymentReceipt() {
  const { paymentId } = useParams<{ paymentId: string }>();

  const { students } = useStudents();
  const { classes } = useClasses();
  const { sections } = useSections();
  const {
    payments,
    ledgers,
    getReceiptNumber,
  } = useFeeLedger();
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
     PDF Filename
  ========================= */

  useEffect(() => {
    const originalTitle = document.title;
    document.title = `${student.firstName} ${student.lastName} - ${receiptNo}`;

    return () => {
      document.title = originalTitle;
    };
  }, [student, receiptNo]);

  /* =========================
     Print (Isolated)
  ========================= */

  const handlePrint = () => {
    const printWindow = window.open("", "_blank", "width=800,height=600");
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>${student.firstName} ${student.lastName} - ${receiptNo}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 20px;
            }
            h1 {
              text-align: center;
            }
            .section {
              margin-top: 16px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 8px;
            }
            td {
              padding: 6px;
            }
            .right {
              text-align: right;
            }
          </style>
        </head>
        <body>
          <h1>Smart Kids Academy</h1>
          <p style="text-align:center">Official Payment Receipt</p>

          <div class="section">
            <strong>Receipt No:</strong> ${receiptNo}<br/>
            <strong>Academic Year:</strong> ${ledger.academicYear}<br/>
            <strong>Date:</strong> ${new Date(payment.createdAt).toLocaleDateString()}
          </div>

          <div class="section">
            <strong>Student:</strong> ${student.firstName} ${student.lastName}<br/>
            <strong>Class:</strong> Class ${cls?.ClassName}<br/>
            <strong>Section:</strong> ${sec?.name ?? "—"}
          </div>

          <div class="section">
            <table>
              <tr>
                <td>Description</td>
                <td class="right">Amount</td>
              </tr>
              <tr>
                <td>Fee Payment</td>
                <td class="right">₹${payment.amount}</td>
              </tr>
            </table>
          </div>

          <div class="section">
            <strong>Mode:</strong> ${payment.mode}<br/>
            <strong>Reference:</strong> ${payment.reference ?? "-"}<br/>
            <strong>Collected By:</strong> ${payment.collectedBy}
          </div>

          <div class="section" style="margin-top:32px">
            <em>This is a system-generated receipt.</em>
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  /* =========================
     Render
  ========================= */

  return (
    <div style={{ padding: "20px" }}>
      <h2>Receipt Preview</h2>

      <p><strong>Receipt No:</strong> {receiptNo}</p>
      <p><strong>Student:</strong> {student.firstName} {student.lastName}</p>
      <p><strong>Amount:</strong> ₹{payment.amount}</p>
      <p><strong>Mode:</strong> {payment.mode}</p>

      <button onClick={handlePrint}>
        Print / Save as PDF
      </button>
    </div>
  );
}

export default PaymentReceipt;
