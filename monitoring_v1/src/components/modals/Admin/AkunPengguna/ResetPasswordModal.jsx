import { useState } from 'react'
import CustomModal from '../../../ui/CustomModal'
import Button from '../../../ui/Button'
import { FaKey, FaCopy, FaCheck } from 'react-icons/fa'
import { AkunPenggunaService } from '../../../../services/Admin/akun-pengguna/AkunPenggunaService'
import toast from 'react-hot-toast'

// ============================================================================
// COMPONENT
// ============================================================================
export default function ResetPasswordModal({ isOpen, onClose, userData, onSuccess }) {
  // ============================================================================
  // STATE
  // ============================================================================
  const [isLoading, setIsLoading] = useState(false)
  const [newPassword, setNewPassword] = useState(null)
  const [isCopied, setIsCopied] = useState(false)

  // ============================================================================
  // HANDLERS
  // ============================================================================
  const handleReset = async () => {
    if (!userData?.id) return

    setIsLoading(true)
    try {
      const response = await AkunPenggunaService.resetPassword(userData.id)

      if (response.status === 'success') {
        setNewPassword(response.data.new_password)
        toast.success(`Password berhasil direset untuk ${response.data.user.nama_lengkap}`)
        onSuccess?.()
      } else {
        toast.error(response.message || 'Gagal mereset password')
      }
    } catch (error) {
      console.error('Error resetting password:', error)
      if (error.response?.data?.message) {
        toast.error(error.response.data.message)
      } else {
        toast.error('Gagal mereset password')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopyPassword = () => {
    if (newPassword) {
      navigator.clipboard.writeText(newPassword)
      setIsCopied(true)
      toast.success('Password berhasil disalin ke clipboard')

      setTimeout(() => {
        setIsCopied(false)
      }, 2000)
    }
  }

  const handleClose = () => {
    setNewPassword(null)
    setIsCopied(false)
    onClose()
  }

  // ============================================================================
  // RENDER
  // ============================================================================
  return (
    <CustomModal
      isOpen={isOpen}
      onClose={handleClose}
      title={`Reset Password - ${userData?.nama_lengkap || ''}`}
      size="md"
    >
      <div className="space-y-6">
        {!newPassword ? (
          <>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Nama:</span>
                  <span className="font-medium text-gray-900">{userData?.nama_lengkap}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Username:</span>
                  <span className="font-medium text-gray-900">{userData?.username}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Role:</span>
                  <span
                    className={`px-2 py-1 rounded-md text-xs font-medium ${
                      userData?.role === 'admin'
                        ? 'bg-purple-100 text-purple-800'
                        : userData?.role === 'guru'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-orange-100 text-orange-800'
                    }`}
                  >
                    {userData?.role === 'admin'
                      ? 'Admin'
                      : userData?.role === 'guru'
                      ? 'Guru'
                      : 'Orangtua'}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex gap-3">
                <div className="flex-shrink-0">
                  <FaKey className="text-yellow-600 text-lg" />
                </div>
                <div className="text-sm text-yellow-800">
                  <p className="font-medium mb-1">
                    Password akan direset ke tanggal hari ini (WIB)
                  </p>
                  <p>
                    Format: YYYYMMDD (contoh:{' '}
                    {new Date().toISOString().split('T')[0].replace(/-/g, '')})
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button onClick={handleClose} variant="outline" disabled={isLoading}>
                Batal
              </Button>
              <Button onClick={handleReset} variant="warning" icon={<FaKey />} disabled={isLoading}>
                {isLoading ? 'Memproses...' : 'Reset Password'}
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <FaCheck className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Password Berhasil Direset!</h3>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Password Baru:</label>
              <div className="flex gap-2">
                <div className="flex-1 bg-white border border-gray-300 rounded-lg px-4 py-3">
                  <code className="text-2xl font-bold text-gray-900 tracking-wider">
                    {newPassword}
                  </code>
                </div>
                <Button
                  onClick={handleCopyPassword}
                  variant={isCopied ? 'success' : 'primary'}
                  icon={isCopied ? <FaCheck /> : <FaCopy />}
                  className="px-4"
                  title="Copy password"
                >
                  {isCopied ? 'Tersalin' : 'Copy'}
                </Button>
              </div>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex gap-3">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-600" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="text-sm text-red-800">
                  <p className="font-medium mb-1">Penting!</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Pastikan Anda menyimpan password ini</li>
                    <li>Berikan password ini kepada {userData?.nama_lengkap}</li>
                    <li>User dapat langsung login dengan password baru</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={handleClose} variant="primary">
                Tutup
              </Button>
            </div>
          </>
        )}
      </div>
    </CustomModal>
  )
}
