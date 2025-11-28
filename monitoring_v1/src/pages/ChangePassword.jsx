import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { assets } from '../assets/assets'
import Button from '../components/ui/Button'
import IconInputField from '../components/ui/IconInputField'
import { FaKey, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa'
import { AuthService } from '../services/Login/authService'
import toast from 'react-hot-toast'

const PasswordRequirements = ({ password }) => {
  const requirements = [
    { label: 'Minimal 8 karakter', test: (pwd) => pwd.length >= 8 },
    { label: 'Mengandung huruf (A-Z atau a-z)', test: (pwd) => /[A-Za-z]/.test(pwd) },
    { label: 'Mengandung angka', test: (pwd) => /[0-9]/.test(pwd) },
  ]

  return (
    <div className="mt-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
      <p className="text-xs font-semibold text-slate-600 mb-2">Syarat Password:</p>
      <ul className="space-y-1">
        {requirements.map((req, idx) => {
          const isValid = req.test(password)
          return (
            <li key={idx} className="flex items-center gap-2 text-xs">
              {isValid ? (
                <FaCheckCircle className="text-green-500 flex-shrink-0" />
              ) : (
                <div className="w-3 h-3 rounded-full border-2 border-slate-300 flex-shrink-0" />
              )}
              <span className={isValid ? 'text-green-700' : 'text-slate-500'}>{req.label}</span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

const ChangePasswordHeader = () => (
  <div className="text-center">
    <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
      <FaKey className="text-white text-3xl" />
    </div>
    <h1 className="text-2xl font-bold text-slate-800">Ganti Password</h1>
    <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
      <div className="flex items-start gap-2">
        <FaExclamationTriangle className="text-amber-600 mt-0.5 flex-shrink-0" />
        <p className="text-sm text-amber-800 text-left">
          Untuk keamanan akun Anda, silakan ganti password default atau yang sudah di-reset oleh
          admin.
        </p>
      </div>
    </div>
  </div>
)

const ChangePasswordFooter = () => (
  <div className="text-center space-y-2">
    <p className="text-xs text-slate-500">Password baru Anda harus memenuhi syarat keamanan</p>
    <p className="text-xs text-slate-500">
      © 2025 Sistem Monitoring Nilai Siswa - SDN 1 Langensari
    </p>
  </div>
)

export default function ChangePassword() {
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showRequirements, setShowRequirements] = useState(false)
  const navigate = useNavigate()

  const validatePassword = (password) => {
    if (password.length < 8) {
      return 'Password minimal 8 karakter'
    }
    if (!/[A-Za-z]/.test(password)) {
      return 'Password harus mengandung huruf'
    }
    if (!/[0-9]/.test(password)) {
      return 'Password harus mengandung angka'
    }
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validasi password baru
    const passwordError = validatePassword(newPassword)
    if (passwordError) {
      toast.error(passwordError)
      return
    }

    // Validasi konfirmasi password
    if (newPassword !== confirmPassword) {
      toast.error('Password baru dan konfirmasi tidak sama')
      return
    }

    setIsLoading(true)

    try {
      const response = await AuthService.changeDefaultPassword(newPassword, confirmPassword)

      if (response.status === 'success') {
        toast.success('Password berhasil diubah! Anda akan diarahkan ke dashboard.')

        // Token baru sudah disimpan di AuthService.changeDefaultPassword
        // Redirect ke dashboard sesuai role
        const userRole = AuthService.getUserRole()
        const redirectUrl = AuthService.getRedirectUrl(userRole)

        setTimeout(() => {
          navigate(redirectUrl, { replace: true })
        }, 1500)
      } else {
        toast.error(response.message || 'Gagal mengubah password')
      }
    } catch (error) {
      console.error('Change password error:', error)

      let errorMessage = 'Terjadi kesalahan saat mengubah password'

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (error.response?.status === 400) {
        errorMessage = 'Data yang dikirim tidak valid'
      } else if (error.response?.status === 401) {
        errorMessage = 'Sesi Anda telah berakhir. Silakan login kembali.'
        // Clear data dan redirect ke login setelah 2 detik
        setTimeout(() => {
          AuthService.logout()
          navigate('/login')
        }, 2000)
      } else if (error.request) {
        errorMessage = 'Tidak dapat terhubung ke server'
      }

      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div
      className="flex items-center justify-center min-h-screen p-4 bg-cover bg-center"
      style={{ backgroundImage: `url(${assets.bgschool})` }}
    >
      <div className="absolute inset-0 bg-slate-800/60 backdrop-blur-sm" />

      <div className="relative z-10 w-full max-w-md p-8 space-y-6 bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl">
        <ChangePasswordHeader />

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Password Baru */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Password Baru</label>
            <IconInputField
              icon={<FaKey className="text-slate-400" />}
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              onFocus={() => setShowRequirements(true)}
              placeholder="Masukkan password baru"
              required
            />
            {showRequirements && newPassword && <PasswordRequirements password={newPassword} />}
          </div>

          {/* Konfirmasi Password */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Konfirmasi Password Baru
            </label>
            <IconInputField
              icon={<FaKey className="text-slate-400" />}
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Ulangi password baru"
              required
            />
            {confirmPassword && newPassword !== confirmPassword && (
              <p className="mt-2 text-xs text-red-600 flex items-center gap-1">
                <FaExclamationTriangle />
                Password tidak sama
              </p>
            )}
          </div>

          <Button
            type="submit"
            fullWidth
            size="lg"
            className="!text-base !mt-6"
            disabled={isLoading}
          >
            {isLoading ? 'Memproses...' : 'Ubah Password'}
          </Button>
        </form>

        <ChangePasswordFooter />
      </div>
    </div>
  )
}
