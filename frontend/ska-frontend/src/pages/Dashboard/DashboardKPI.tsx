import { useEffect, useState } from "react";
import { useAcademicYear } from "../../context/AcademicYearContext";
import { apiClient } from "../../services/apiClient";
import "./dashboard.css";
import { useNavigate } from "react-router-dom";

interface DashboardOverview {
    totalStudents: number;
    totalCollected: number;
    totalPending: number;
    totalAdjustments: number;
    totalExpenses: number;
    netBalance: number;
}

interface MonthlyCollection {
    month: string;
    total: number;
}

function DashboardKPIs() {
    const { activeYear } = useAcademicYear();
    const navigate = useNavigate();

    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const [overview, setOverview] = useState<DashboardOverview | null>(null);
    const [collections, setCollections] = useState<MonthlyCollection[]>([]);

    useEffect(() => {
        async function fetchDashboard() {
            if (!activeYear?.id) return;
            try {
                setLoading(true);
                setError(null);

                const [overviewRes, collectionsRes] = await Promise.all([
                    apiClient.get<DashboardOverview>(`/api/dashboard/overview?year=${activeYear.id}`),
                    apiClient.get<MonthlyCollection[]>(`/api/dashboard/monthly-collections?year=${activeYear.id}`)
                ]);

                setOverview(overviewRes);
                setCollections(collectionsRes);
            } catch (err: any) {
                setError(err.message || "Failed to load dashboard data");
            } finally {
                setLoading(false);
            }
        }
        fetchDashboard();
    }, [activeYear?.id]);

    if (loading) return <div className="kpi-loading">Loading Dashboard Data...</div>;
    if (error) return <div className="error">Error loading dashboard: {error}</div>;
    if (!overview) return null;

    return (
        <div className="dashboard-content">
            <div className="dashboard-kpis">
                <div className="kpi-row">
                    <div className="kpi-card income">
                        <h4>Total Income</h4>
                        <p className="kpi-value">₹{overview.totalCollected}</p>
                        <span className="kpi-sub">Academic Year {activeYear?.name}</span>
                    </div>

                    <div className="kpi-card expense">
                        <h4>Total Expense</h4>
                        <p className="kpi-value">₹{overview.totalExpenses}</p>
                        <span className="kpi-sub">Academic Year {activeYear?.name}</span>
                    </div>

                    <div className="kpi-card balance">
                        <h4>Net Balance</h4>
                        <p className={`kpi-value ${overview.netBalance >= 0 ? "positive" : "negative"}`}>
                            ₹{overview.netBalance}
                        </p>
                        <span className="kpi-sub">Income − Expense</span>
                    </div>
                </div>

                <div className="kpi-row">
                    <div className="kpi-card default-stat">
                        <h4>Total Students</h4>
                        <p className="kpi-value">{overview.totalStudents}</p>
                        <span className="kpi-sub">In Active Ledgers</span>
                    </div>

                    <div className="kpi-card warning">
                        <h4>Total Pending Fees</h4>
                        <p className="kpi-value">₹{overview.totalPending}</p>
                        <span className="kpi-sub">Academic Year {activeYear?.name}</span>
                    </div>

                    <div className="kpi-card warning cursor-pointer" onClick={() => navigate("/dashboard/pending-fees")}>
                        <h4>Total Adjustments</h4>
                        <p className="kpi-value">₹{overview.totalAdjustments}</p>
                        <span className="kpi-sub">Concessions / Waivers / Additions</span>
                    </div>
                </div>
            </div>

            <div className="dashboard-section monthly-collections">
                <h3>Monthly Collections</h3>
                {collections.length === 0 ? (
                    <p>No collections recorded for this year.</p>
                ) : (
                    <table className="report-table">
                        <thead>
                            <tr>
                                <th>Month</th>
                                <th>Collected Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {collections.map((m) => (
                                <tr key={m.month}>
                                    <td>{m.month}</td>
                                    <td className="amount">₹{m.total}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}

export default DashboardKPIs;
