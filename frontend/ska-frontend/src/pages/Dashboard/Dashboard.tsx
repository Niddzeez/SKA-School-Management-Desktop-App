import DashboardKPIs from "../Dashboard/DashboardKPI";
import { useAcademicYear } from "../../context/AcademicYearContext";
import { exportBackup, importBackup } from "../../utils/Backup";

import "./dashboard.css";

function Dashboard() {
    const { academicYear, setAcademicYear, availableYears } =
        useAcademicYear();

    const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            await importBackup(file);
            alert("Backup restored successfully. Reloading…");
            window.location.reload();
        } catch {
            alert("Invalid backup file.");
        }
    };


    return (
        <div className="dashboard-page">
            {/* =========================
          Header
      ========================= */}
            <div className="dashboard-header">
                <h1>Dashboard</h1>

                <div className="dashboard-year-selector">
                    <label>Academic Year:</label>
                    <select
                        value={academicYear}
                        onChange={(e) => setAcademicYear(e.target.value)}
                    >
                        {availableYears.map((yr) => (
                            <option key={yr} value={yr}>
                                {yr}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* =========================
          KPI Section
      ========================= */}
            <DashboardKPIs />

            {/* =========================
          Future Sections (placeholder)
          Intentionally empty for now
      ========================= */}
            {/*
        <div className="dashboard-section">
          Charts / Pending Fees / Trends
        </div>
      */}


            <div>
                <button onClick={exportBackup}>
                    Export Full Backup
                </button>

                <input
                    type="file"
                    accept="application/json"
                    onChange={handleImport}
                />
            </div>
        </div>
    );
}

export default Dashboard;
