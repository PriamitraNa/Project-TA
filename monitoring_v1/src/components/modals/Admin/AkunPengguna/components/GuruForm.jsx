import { FaSearch, FaCheck, FaTimes, FaSpinner } from 'react-icons/fa'

export default function GuruForm({
  form,
  validationState,
  showDropdowns,
  searchQueries,
  onFormChange,
  onValidateUsername,
  onGuruSelect,
  onToggleDropdown,
  onSearchChange,
  getFilteredData,
  disabled,
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {/* Pilih Guru Field */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Pilih Guru *</label>
        <div className="relative">
          <input
            type="text"
            value={
              form.selectedGuru
                ? form.selectedGuru.nama_lengkap
                : searchQueries[`${form.id}_guru`] || ''
            }
            onChange={(e) => {
              onSearchChange(form.id, 'guru', e.target.value)
              if (form.selectedGuru) {
                onFormChange(form.id, 'selectedGuru', null)
                onFormChange(form.id, 'nama', '')
                onFormChange(form.id, 'username', '')
              }
            }}
            onFocus={() => onToggleDropdown(form.id, 'guru')}
            className="w-full px-2 py-1.5 pr-8 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
            placeholder={form.selectedGuru ? 'Guru terpilih' : 'Cari guru...'}
            disabled={disabled}
          />
          <FaSearch className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs" />

          {showDropdowns[`${form.id}_guru`] && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
              {getFilteredData(form.id, 'guru').length > 0 ? (
                getFilteredData(form.id, 'guru').map((guru) => (
                  <div
                    key={guru.id}
                    onClick={() => onGuruSelect(form.id, guru)}
                    className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                  >
                    <div className="font-medium text-gray-900 text-sm">{guru.nama_lengkap}</div>
                    <div className="text-xs text-gray-500">NIP: {guru.nip}</div>
                  </div>
                ))
              ) : (
                <div className="p-3 text-center text-sm text-gray-500">
                  {searchQueries[`${form.id}_guru`]
                    ? 'Guru tidak ditemukan'
                    : 'Tidak ada data guru'}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Username Field */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Username *</label>
        <div className="relative">
          <input
            type="text"
            value={form.username}
            onChange={(e) => onFormChange(form.id, 'username', e.target.value)}
            className="w-full px-2 py-1.5 pr-8 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 bg-gray-100 cursor-not-allowed"
            placeholder="Auto dari NIP"
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
          <p className="text-xs text-red-500 mt-1">{validationState[`${form.id}_username`]}</p>
        )}
      </div>
    </div>
  )
}
