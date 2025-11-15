import { useState } from "react";
import Sidebar from "../components/ui/Sidebar";
import Header from "../components/ui/Header";
import { Outlet, useLocation } from "react-router-dom";
import { AuthService } from "../services/Login/authService";

export default function MainLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  
  // Ambil role dari AuthService (localStorage)
  const userRole = AuthService.getUserRole();
  
  // Fallback: tentukan role berdasarkan path jika tidak ada di localStorage
  const getRoleFromPath = () => {
    if (location.pathname.includes('/admin')) return 'admin';
    if (location.pathname.includes('/guru')) return 'guru';
    if (location.pathname.includes('/ortu')) return 'ortu';
    return 'admin'; // default
  };
  
  const currentRole = userRole || getRoleFromPath();

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
      <Header
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      {/* Layout */}
      <div className="flex flex-1 relative">
        {/* Sidebar */}
        <div
          className={`
            fixed lg:static inset-y-0 left-0 z-40 transform
            ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
            lg:translate-x-0
            transition-transform duration-300 ease-in-out
            h-full lg:h-auto
          `}
        >
          <Sidebar role={currentRole} />
        </div>

        {/* Overlay ketika sidebar terbuka di mobile */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          ></div>
        )}

<main className="flex-1 relative min-w-0">
          {/* Background pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-white via-slate-50/80 to-gray-100/60"></div>
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-slate-200/30 to-transparent rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-emerald-200/30 to-transparent rounded-full blur-3xl"></div>
          </div>

          {/* Content */}
          <div className="relative z-10 p-8 min-h-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
