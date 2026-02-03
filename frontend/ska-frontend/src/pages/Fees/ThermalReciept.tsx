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
     Filename
  ========================= */

  useEffect(() => {
    const originalTitle = document.title;
    document.title = `Receipt_${receiptNo}`;

    return () => {
      document.title = originalTitle;
    };
  }, [receiptNo]);

  /* =========================
     Thermal Print
  ========================= */

  const handlePrint = () => {
    const printWindow = window.open("", "_blank", "width=400,height=600");
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Receipt_${receiptNo}</title>
          <style>
            @page {
              size: 80mm auto;
              margin: 4mm;
            }

            body {
              font-family: monospace;
              font-size: 12px;
              margin: 0;
              padding: 0;
              color: #000;
            }

            .center {
              text-align: center;
            }

            .bold {
              font-weight: bold;
            }

            .line {
              border-top: 1px dashed #000;
              margin: 6px 0;
            }

            table {
              width: 100%;
              border-collapse: collapse;
            }

            td {
              padding: 2px 0;
              vertical-align: top;
            }

            .right {
              text-align: right;
            }

            .small {
              font-size: 11px;
            }
          </style>
        </head>
        <body>

          <div class="center bold">
            SMART KIDS ACADEMY
          </div>
          <div class="center small">
            Fee Payment Receipt
          </div>

          <div class="line"></div>

          <div class="small">
            Receipt No : ${receiptNo}<br/>
            Date       : ${new Date(payment.createdAt).toLocaleDateString()}<br/>
            Academic Yr: ${academicYear}
          </div>

          <div class="line"></div>

          <div class="small">
            Student : ${student.firstName} ${student.lastName}<br/>
            Class   : ${cls?.ClassName ?? "-"} ${sec?.name ?? ""}
          </div>

          <div class="line"></div>

          <table>
            <tr>
              <td>Fee Payment</td>
              <td class="right">₹${payment.amount}</td>
            </tr>
          </table>

          <div class="line"></div>

          <div class="small">
            Mode      : ${payment.mode}<br/>
            Reference : ${payment.reference ?? "-"}<br/>
            Collected : ${payment.collectedBy}
          </div>

          <div class="line"></div>

          <div class="center small">
            Thank you 🙏
          </div>

          <div class="center small">
            (System Generated)
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
     Preview (Screen Only)
  ========================= */

  return (
    <div style={{ padding: "20px" }}>
      <h3>Receipt Preview</h3>
      <p><strong>Receipt No:</strong> {receiptNo}</p>
      <p><strong>Student:</strong> {student.firstName} {student.lastName}</p>
      <p><strong>Amount:</strong> ₹{payment.amount}</p>
      <p><strong>Mode:</strong> {payment.mode}</p>

      <button onClick={handlePrint}>
        Print Thermal Receipt
      </button>
    </div>
  );
}

export default PaymentReceipt;
