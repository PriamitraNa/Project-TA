import { FaUser, FaIdCard, FaUsers } from 'react-icons/fa'

// ============================================================================
// COMPONENT
// ============================================================================
export default function RoleSelector({ form, onRoleChange, disabled }) {
  // ============================================================================
  // RENDER
  // ============================================================================
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
      <button
        type="button"
        onClick={() => onRoleChange(form.id, 'admin')}
        className={`p-2 border-2 rounded-lg text-left transition-all ${
          form.role === 'admin'
            ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        disabled={disabled}
      >
        <div className="flex items-center gap-2">
          <FaUser className="text-sm" />
          <div>
            <div className="font-medium text-xs">Admin</div>
            <div className="text-xs text-gray-500">Akses penuh</div>
          </div>
        </div>
      </button>

      <button
        type="button"
        onClick={() => onRoleChange(form.id, 'guru')}
        className={`p-2 border-2 rounded-lg text-left transition-all ${
          form.role === 'guru'
            ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        disabled={disabled}
      >
        <div className="flex items-center gap-2">
          <FaIdCard className="text-sm" />
          <div>
            <div className="font-medium text-xs">Guru</div>
            <div className="text-xs text-gray-500">Mengajar</div>
          </div>
        </div>
      </button>

      <button
        type="button"
        onClick={() => onRoleChange(form.id, 'orangtua')}
        className={`p-2 border-2 rounded-lg text-left transition-all ${
          form.role === 'orangtua'
            ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        disabled={disabled}
      >
        <div className="flex items-center gap-2">
          <FaUsers className="text-sm" />
          <div>
            <div className="font-medium text-xs">Orangtua</div>
            <div className="text-xs text-gray-500">Wali murid</div>
          </div>
        </div>
      </button>
    </div>
  )
}
