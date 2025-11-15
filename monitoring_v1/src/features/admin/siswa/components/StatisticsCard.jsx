import { FaUsers, FaMale, FaFemale } from 'react-icons/fa';

const StatisticsCard = ({ statistics, isLoading }) => {
    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-white rounded-lg border border-slate-200 p-4 animate-pulse">
                        <div className="flex items-center">
                            <div className="p-2 bg-slate-100 rounded-lg mr-3">
                                <div className="w-6 h-6 bg-slate-200 rounded"></div>
                            </div>
                            <div className="flex-1">
                                <div className="h-4 bg-slate-200 rounded w-20 mb-2"></div>
                                <div className="h-6 bg-slate-200 rounded w-12"></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* Total Siswa */}
            <div className="bg-white rounded-lg border border-slate-200 p-4">
                <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-lg mr-3">
                        <FaUsers className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                        <p className="text-sm text-slate-600">Total Siswa</p>
                        <p className="text-2xl font-bold text-slate-800">{statistics.total_siswa}</p>
                    </div>
                </div>
            </div>

            {/* Jumlah Laki-laki */}
            <div className="bg-white rounded-lg border border-slate-200 p-4">
                <div className="flex items-center">
                    <div className="p-2 bg-green-100 rounded-lg mr-3">
                        <FaMale className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                        <p className="text-sm text-slate-600">Laki-laki</p>
                        <p className="text-2xl font-bold text-slate-800">{statistics.jumlah_laki_laki}</p>
                    </div>
                </div>
            </div>

            {/* Jumlah Perempuan */}
            <div className="bg-white rounded-lg border border-slate-200 p-4">
                <div className="flex items-center">
                    <div className="p-2 bg-pink-100 rounded-lg mr-3">
                        <FaFemale className="w-6 h-6 text-pink-600" />
                    </div>
                    <div>
                        <p className="text-sm text-slate-600">Perempuan</p>
                        <p className="text-2xl font-bold text-slate-800">{statistics.jumlah_perempuan}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StatisticsCard;
