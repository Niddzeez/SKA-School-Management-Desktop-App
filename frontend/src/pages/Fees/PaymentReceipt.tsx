import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { apiClient } from "../../services/apiClient";
import { printReport } from "../Reports/Utils/PrintUtils";
import { useAcademicYear } from "../../context/AcademicYearContext";

interface ReceiptData {
  receiptNumber: string;
  paymentId: string;
  studentId: string;
  studentName: string;
  className: string;
  amount: number;
  mode: string;
  reference?: string;
  collectedBy: string;
  date: string;
}

function PaymentReceipt() {
  const { paymentId } = useParams<{ paymentId: string }>();
  const { activeYear } = useAcademicYear();

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<ReceiptData | null>(null);

  useEffect(() => {
    async function fetchReceipt() {
      if (!paymentId) {
        setError("No payment ID provided in URL");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await apiClient.get<ReceiptData>(`/api/receipts/${paymentId}`);
        setReceipt(data);
      } catch (err: any) {
        setError(err.message || "Failed to load receipt");
      } finally {
        setLoading(false);
      }
    }

    fetchReceipt();
  }, [paymentId]);

  if (loading) return <p style={{ padding: "20px" }}>Loading receipt...</p>;
  if (error) return <p style={{ padding: "20px", color: "red" }}>{error}</p>;
  if (!receipt) return <p style={{ padding: "20px" }}>Receipt not found.</p>;

  /* =========================
     PRINT HANDLER
  ========================= */
  const handlePrint = () => {
    printReport({
      title: `Receipt_${receipt.receiptNumber}_${receipt.studentName}`,
      meta: {
        studentName: receipt.studentName,
        academicYear: activeYear?.name || "Unknown Year",
        reportType: "PAYMENT_RECEIPT",
        periodLabel: new Date(receipt.date).toLocaleDateString(),
      },
      sections: [
        {
          title: "Receipt Details",
          headers: ["Field", "Value"],
          rows: [
            { columns: ["Receipt No", receipt.receiptNumber] },
            { columns: ["Date", new Date(receipt.date).toLocaleDateString()] },
            { columns: ["Academic Year", activeYear?.name || "Unknown Year"] },
          ],
        },
        {
          title: "Student Information",
          headers: ["Field", "Value"],
          rows: [
            { columns: ["Student Name", receipt.studentName] },
            { columns: ["Class", `Class ${receipt.className}`] },
          ],
        },
        {
          title: "Payment Details",
          headers: ["Description", "Amount"],
          rows: [{ columns: ["Fee Payment", `₹${receipt.amount}`] }],
        },
        {
          title: "Transaction Info",
          headers: ["Field", "Value"],
          rows: [
            { columns: ["Mode", receipt.mode] },
            { columns: ["Reference", receipt.reference || "-"] },
            { columns: ["Collected By", receipt.collectedBy] },
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

      <p><strong>Receipt No:</strong> {receipt.receiptNumber}</p>
      <p><strong>Student:</strong> {receipt.studentName}</p>
      <p><strong>Class:</strong> {receipt.className}</p>
      <p><strong>Amount:</strong> ₹{receipt.amount}</p>
      <p><strong>Mode:</strong> {receipt.mode}</p>
      {receipt.reference && <p><strong>Reference:</strong> {receipt.reference}</p>}
      <p><strong>Date:</strong> {new Date(receipt.date).toLocaleString()}</p>

      <button onClick={handlePrint}>Print / Save as PDF</button>
    </div>
  );
}

export default PaymentReceipt;
