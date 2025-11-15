import { FaSearch, FaCheck, FaTimes, FaSpinner } from 'react-icons/fa';

export default function OrangtuaForm({ 
    form, 
    validationState, 
    showDropdowns,
    searchQueries,
    onFormChange, 
    onValidateUsername,
    onOrtuSelect,
    onAnakSelect,
    onToggleDropdown,
    onSearchChange,
    getFilteredData,
    disabled 
}) {
    return (
        <div className="space-y-3">
            {/* Pilih Orangtua Field */}
            <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                    Pilih Orangtua *
                </label>
                <div className="relative">
                    <input
                        type="text"
                        value={form.selectedOrtu ? form.selectedOrtu.nama_lengkap : (searchQueries[`${form.id}_ortu`] || '')}
                        onChange={(e) => {
                            onSearchChange(form.id, 'ortu', e.target.value);
                            if (form.selectedOrtu) {
                                onFormChange(form.id, 'selectedOrtu', null);
                                onFormChange(form.id, 'selectedAnak', null);
                                onFormChange(form.id, 'username', '');
                            }
                        }}
                        onFocus={() => onToggleDropdown(form.id, 'ortu')}
                        className="w-full px-2 py-1.5 pr-8 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                        placeholder={form.selectedOrtu ? "Orangtua terpilih" : "Cari orangtua..."}
                        disabled={disabled}
                    />
                    <FaSearch className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs" />
                    
                    {showDropdowns[`${form.id}_ortu`] && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                            {getFilteredData(form.id, 'ortu').length > 0 ? (
                                getFilteredData(form.id, 'ortu').map((ortu) => (
                                    <div
                                        key={ortu.id}
                                        onClick={() => onOrtuSelect(form.id, ortu)}
                                        className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                                    >
                                        <div className="font-medium text-gray-900 text-sm">
                                            {ortu.nama_lengkap}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            NIK: {ortu.nik} • {ortu.relasi}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-3 text-center text-sm text-gray-500">
                                    {searchQueries[`${form.id}_ortu`] ? "Orangtua tidak ditemukan" : "Tidak ada data orangtua"}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Pilih Anak Field */}
            {form.selectedOrtu && (
                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                        Pilih Anak *
                    </label>
                    <div className="relative">
                        <input
                            type="text"
                            value={form.selectedAnak ? form.selectedAnak.nama_lengkap : (searchQueries[`${form.id}_anak`] || '')}
                            onChange={(e) => {
                                onSearchChange(form.id, 'anak', e.target.value);
                                if (form.selectedAnak) {
                                    onFormChange(form.id, 'selectedAnak', null);
                                    onFormChange(form.id, 'username', '');
                                }
                            }}
                            onFocus={() => onToggleDropdown(form.id, 'anak')}
                            className="w-full px-2 py-1.5 pr-8 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                            placeholder={form.selectedAnak ? "Anak terpilih" : "Cari anak..."}
                            disabled={disabled}
                        />
                        <FaSearch className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs" />
                        
                        {showDropdowns[`${form.id}_anak`] && (
                            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                                {getFilteredData(form.id, 'anak').length > 0 ? (
                                    getFilteredData(form.id, 'anak').map((anak) => (
                                        <div
                                            key={anak.id}
                                            onClick={() => onAnakSelect(form.id, anak)}
                                            className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                                        >
                                            <div className="font-medium text-gray-900 text-sm">
                                                {anak.nama_lengkap}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                NISN: {anak.nisn} • {anak.nama_kelas} • {anak.jenis_kelamin}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-3 text-center text-sm text-gray-500">
                                        {searchQueries[`${form.id}_anak`] ? "Anak tidak ditemukan" : "Tidak ada data anak"}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Username Field */}
            <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                    Username *
                </label>
                <div className="relative">
                    <input
                        type="text"
                        value={form.username}
                        onChange={(e) => onFormChange(form.id, 'username', e.target.value)}
                        className="w-full px-2 py-1.5 pr-8 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 bg-gray-100 cursor-not-allowed"
                        placeholder="Auto dari NISN anak"
                        disabled={true}
                    />
                    {form.username && (
                        <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                            {validationState[`${form.id}_username_loading`] ? (
                                <FaSpinner className="animate-spin text-blue-500 text-xs" />
                            ) : validationState[`${form.id}_username`] ? (
                                <FaTimes className="text-red-500 text-xs" />
                            ) : (
                                <FaCheck className="text-green-500 text-xs" />
                            )}
                        </div>
                    )}
                </div>
                {validationState[`${form.id}_username`] && (
                    <p className="text-xs text-red-500 mt-1">
                        {validationState[`${form.id}_username`]}
                    </p>
                )}
            </div>
        </div>
    );
}
