import { useEffect, useState } from "react";
import logo from "../../assets/logo.png";
import { FaBars } from "react-icons/fa";
import { AuthService } from "../../services/Login/authService";

export default function Header({ onToggleSidebar }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Ambil data user dari localStorage
    const userData = {
      nama: AuthService.getUserName(),
      role: AuthService.getUserRole(),
      username: AuthService.getUserUsername(),
    };
    
    // Set user data jika ada
    if (userData.nama && userData.role) {
      setUser(userData);
    }
  }, []);
  return (
    <div className="w-full px-4 md:px-6 py-3 flex flex-col md:flex-row items-center justify-between text-white shadow-lg relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-slate-700 via-slate-600 to-slate-700"></div>
      <div className="absolute inset-0 bg-gradient-to-r from-slate-800/30 to-transparent"></div>

      {/* Content */}
      <div className="relative z-10 flex items-center justify-between w-full gap-3">
        {/* Left Section */}
        <div className="flex items-center gap-3">
          {/* Hamburger (mobile only) */}
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-md hover:bg-white/10"
          >
            <FaBars />
          </button>

          {/* Logo + Title */}
          <div className="flex items-center gap-3">
            <img
              src={logo}
              alt="logo"
              className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover border-2 border-white/20 shadow-lg"
            />
            <div>
              <h1 className="text-base md:text-xl font-bold text-white drop-shadow-lg">
                SDN 1 Langensari
              </h1>
              <p className="text-[10px] md:text-xs text-slate-200 font-medium">
                Sistem Monitoring Nilai Siswa
              </p>
            </div>
          </div>
        </div>

        {/* Right Section → User Info */}
        <div className="text-center md:text-right">
          <h2 className="text-sm md:text-lg font-semibold text-white drop-shadow-md">
            Selamat Datang, {user?.nama || "User"}
          </h2>
          <p className="text-xs md:text-sm text-slate-200 capitalize">
            {user?.role === "admin"
              ? "Administrator"
              : user?.role === "guru"
              ? "Guru"
              : user?.role === "ortu"
              ? "Orang Tua"
              : "User"}
          </p>
        </div>
      </div>
    </div>
  );
}
