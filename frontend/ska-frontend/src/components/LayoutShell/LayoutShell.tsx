import { Outlet } from "react-router-dom";
import "../styles/Layout.css";

function LayoutShell({
  sidebar,
  topbar,
}: {
  sidebar: React.ReactNode;
  topbar: React.ReactNode;
}) {
  return (
    <div className="app-layout no-print">
      <aside className="sidebar">{sidebar}</aside>

      <div className="main-area">
        <header className="topbar">{topbar}</header>
        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default LayoutShell;
