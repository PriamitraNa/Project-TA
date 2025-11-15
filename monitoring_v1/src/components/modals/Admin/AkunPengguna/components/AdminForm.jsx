import { FaCheck, FaTimes, FaSpinner } from 'react-icons/fa'

// ============================================================================
// COMPONENT
// ============================================================================
export default function AdminForm({
  form,
  validationState,
  onFormChange,
  onValidateUsername,
  disabled,
}) {
  // ============================================================================
  // RENDER
  // ============================================================================
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Nama Lengkap *</label>
        <input
          type="text"
          value={form.nama}
          onChange={(e) => onFormChange(form.id, 'nama', e.target.value)}
          className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
          placeholder="Nama lengkap"
          disabled={disabled}
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Username *</label>
        <div className="relative">
          <input
            type="text"
            value={form.username}
            onChange={(e) => {
              const numericValue = e.target.value.replace(/[^0-9]/g, '')
              onFormChange(form.id, 'username', numericValue)

              if (numericValue.trim()) {
                onValidateUsername({
                  formId: form.id,
                  payload: {
                    role: 'admin',
                    field: 'username',
                    value: numericValue.trim(),
                    mode: 'create',
                    exclude_user_id: null,
                  },
                })
              }
            }}
            className={`w-full px-2 py-1.5 pr-8 text-sm border rounded focus:outline-none focus:ring-1 ${
              validationState[`${form.id}_username`]
                ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                : form.username && !validationState[`${form.id}_username`]
                ? 'border-green-500 focus:ring-green-500 focus:border-green-500'
                : 'border-gray-300 focus:ring-emerald-500 focus:border-emerald-500'
            }`}
            placeholder="Minimal 8 digit angka"
            disabled={disabled}
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
