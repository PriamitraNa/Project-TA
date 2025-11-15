import { FaUsers, FaChalkboardTeacher } from 'react-icons/fa';

const TabNavigation = ({ activeTab, onTabChange }) => {
    return (
        <div className="flex bg-slate-100 p-1 rounded-lg mb-6">
            <button 
                onClick={() => onTabChange('siswa')} 
                className={`flex-1 flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 font-semibold text-xs sm:text-sm rounded-md transition-all ${
                    activeTab === 'siswa' 
                        ? 'bg-white shadow text-emerald-600' 
                        : 'text-slate-500 hover:bg-slate-200'
                }`}
            >
                <FaUsers className="w-3 h-3 sm:w-4 sm:h-4" /> 
                <span className="hidden xs:inline">Siswa</span>
                <span className="xs:hidden">Siswa</span>
            </button>
            <button 
                onClick={() => onTabChange('mapel')} 
                className={`flex-1 flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 font-semibold text-xs sm:text-sm rounded-md transition-all ${
                    activeTab === 'mapel' 
                        ? 'bg-white shadow text-emerald-600' 
                        : 'text-slate-500 hover:bg-slate-200'
                }`}
            >
                <FaChalkboardTeacher className="w-3 h-3 sm:w-4 sm:h-4" /> 
                <span className="hidden sm:inline">Mata Pelajaran</span>
                <span className="sm:hidden">Mapel</span>
            </button>
        </div>
    );
};

export default TabNavigation;
