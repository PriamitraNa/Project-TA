import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaChevronRight } from "react-icons/fa6";
import { sidebarMenu } from "../../layouts/SidebarMenu";
import { TahunAjaranService } from "../../services/Admin/tahunajaran/TahunAjaranService";

export default function Sidebar({ role = "admin" }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [subMenus, setSubMenus] = useState({});
  const menus = sidebarMenu[role] || [];
  const [tahunAktif, setTahunAktif] = useState(null);
  const [loadingTahun, setLoadingTahun] = useState(false);
  const loadTahunAktif = async () => {
    setLoadingTahun(true);
    try {
      const response = await TahunAjaranService.getAktif();
      setTahunAktif(response.data);
    } catch (error) {
      console.error('Error loading tahun aktif:', error);
    } finally {
      setLoadingTahun(false);
    }
  };
  useEffect(() => {
    loadTahunAktif();
  }, []); 
  const logout = () => {
    navigate('/login');
  };

  const toggleSubMenu = (menu) => {
    setSubMenus((prev) => ({
      ...prev,
      [menu]: !prev[menu],
    }));
  };

  return (
    <div className="w-72 h-full min-h-screen text-white shadow-2xl relative overflow-hidden flex flex-col">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-800 via-slate-700 to-slate-800"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900/30 via-transparent to-slate-800/20"></div>
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
            backgroundSize: "20px 20px",
          }}
        ></div>
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col">
        {/* Sidebar Header */}
        <div className="p-6 pb-4 border-b border-white/10">
          <div className="flex items-center gap-3 mb-4">
            <div>
              <h2 className="text-lg font-bold text-white">
                {loadingTahun ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span className="text-xs text-white/60">Loading...</span>
                  </div>
                ) : (
                  <span>
                    Tahun Ajaran {tahunAktif?.tahun} Semester {tahunAktif?.semester}
                  </span>
                )}
              </h2>
            </div>
          </div>
          <div className="w-full h-0.5 bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-400 rounded-full"></div>
        </div>

        {/* Navigation Menu */}
        <div className="flex-1 px-4 py-4 overflow-y-auto">
          <ul className="space-y-1">
            {menus.map((menu, index) => {
              const Icon = menu.icon;
              const isActive = location.pathname === menu.to;
              const hasActiveSub = menu.subMenu?.some(
                (sub) => location.pathname === sub.to
              );

              return (
                <li key={index} className="flex flex-col">
                  {menu.subMenu ? (
                    // 🔹 Menu dengan SubMenu
                    <div
                      className={`group flex items-center justify-between rounded-lg py-3 px-3 cursor-pointer transition-all duration-200 ${
                        isActive || hasActiveSub
                          ? "bg-gradient-to-r from-emerald-500/20 to-teal-500/20 shadow-lg backdrop-blur-sm border border-emerald-400/30"
                          : "hover:bg-white/5 hover:shadow-sm"
                      }`}
                      onClick={() => toggleSubMenu(menu.title)}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded-md transition-all duration-200 ${
                            isActive || hasActiveSub
                              ? "bg-emerald-500/30 text-emerald-200 shadow-md"
                              : "bg-white/10 text-white/70 group-hover:bg-white/20 group-hover:text-white"
                          }`}
                        >
                          <Icon className="text-lg" />
                        </div>
                        <span
                          className={`font-medium transition-all duration-200 ${
                            isActive || hasActiveSub
                              ? "text-white"
                              : "text-white/80 group-hover:text-white"
                          }`}
                        >
                          {menu.title}
                        </span>
                      </div>

                      <FaChevronRight
                        className={`text-xs text-white/60 transition-transform ${
                          subMenus[menu.title] ? "rotate-90" : "rotate-0"
                        }`}
                      />
                    </div>
                  ) : (
                    // 🔹 Menu langsung (tanpa SubMenu)
                    <Link
                      to={menu.to}
                      className={`group flex items-center gap-3 rounded-lg py-3 px-3 transition-all duration-200 ${
                        isActive
                          ? "bg-gradient-to-r from-emerald-500/20 to-teal-500/20 shadow-lg border border-emerald-400/30"
                          : "hover:bg-white/5 hover:shadow-sm"
                      }`}
                    >
                      <div
                        className={`p-2 rounded-md transition-all duration-200 ${
                          isActive
                            ? "bg-emerald-500/30 text-emerald-200 shadow-md"
                            : "bg-white/10 text-white/70 group-hover:bg-white/20 group-hover:text-white"
                        }`}
                      >
                        <Icon className="text-lg" />
                      </div>
                      <span
                        className={`font-medium transition-all duration-200 ${
                          isActive
                            ? "text-white"
                            : "text-white/80 group-hover:text-white"
                        }`}
                      >
                        {menu.title}
                      </span>
                    </Link>
                  )}

                  {/* SubMenu Items */}
                  {menu.subMenu && subMenus[menu.title] && (
                    <div className="mt-1 ml-6 space-y-1 animate-fadeIn">
                      {menu.subMenu.map((sub, i) => (
                        <Link
                          key={i}
                          to={sub.to}
                          className={`flex items-center gap-3 py-2 px-3 text-sm rounded-md transition-all duration-200 ${
                            location.pathname === sub.to
                              ? "bg-emerald-500/20 text-emerald-100 shadow-sm border border-emerald-400/20"
                              : "text-white/70 hover:bg-white/5 hover:text-white"
                          }`}
                        >
                          <div
                            className={`w-1.5 h-1.5 rounded-full transition-all duration-200 ${
                              location.pathname === sub.to
                                ? "bg-emerald-400"
                                : "bg-white/40"
                            }`}
                          ></div>
                          <span className="font-medium">{sub.title}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-white/10">
          {/* Logout Button */}
          <button 
            onClick={logout}
            className="w-full bg-red-500/20 hover:bg-red-500/30 text-red-200 hover:text-red-100 py-3 px-4 rounded-lg transition-all duration-200 border border-red-400/30 hover:border-red-400/50 flex items-center justify-center gap-2 font-medium mb-3"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            Logout
          </button>

          <div className="bg-white/5 backdrop-blur-sm rounded-lg p-3 border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <p className="text-xs text-white/80 font-medium">
                SDN 1 Langensari
              </p>
            </div>
            <p className="text-xs text-white/50 text-center">
              © 2025 Sistem Monitoring Nilai Siswa
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
