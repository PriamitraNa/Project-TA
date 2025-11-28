import { useEffect, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { AuthService } from '../../services/Login/authService'

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userRole, setUserRole] = useState(null)
  const location = useLocation()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Cek apakah ada token di localStorage
        const token = AuthService.getToken()

        if (!token) {
          setIsLoading(false)
          return
        }

        // Check force password change - skip verify token untuk change password page
        const forcePasswordChange = AuthService.getForcePasswordChange()
        const isChangePasswordPage = location.pathname === '/change-password'

        if (forcePasswordChange && isChangePasswordPage) {
          // User harus ganti password, dan sedang di halaman change password
          // SKIP verify token, langsung authenticated dengan temp_token
          setIsAuthenticated(true)
          setUserRole(AuthService.getUserRole())
          setIsLoading(false)
          return
        }

        // Verify token dengan API untuk halaman lain (bukan change-password)
        const response = await AuthService.verifyToken()

        if (response.status === 'success') {
          setIsAuthenticated(true)
          setUserRole(response.data.role)
        } else {
          // Token tidak valid, clear localStorage tanpa redirect
          localStorage.removeItem('authToken')
          localStorage.removeItem('tempToken')
          localStorage.removeItem('userRole')
          localStorage.removeItem('userId')
          localStorage.removeItem('userName')
          localStorage.removeItem('userUsername')
          localStorage.removeItem('forcePasswordChange')
        }
      } catch (error) {
        // Error verify token (expired, invalid, network error)
        console.error('❌ ProtectedRoute - Auth verification failed:', error)
        // Clear localStorage tanpa redirect
        localStorage.removeItem('authToken')
        localStorage.removeItem('tempToken')
        localStorage.removeItem('userRole')
        localStorage.removeItem('userId')
        localStorage.removeItem('userName')
        localStorage.removeItem('userUsername')
        localStorage.removeItem('forcePasswordChange')
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [location.pathname])

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="loading loading-spinner loading-lg text-primary"></div>
        <span className="ml-3 text-lg">Memverifikasi akses...</span>
      </div>
    )
  }

  // Tidak authenticated - redirect ke login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Check force password change - harus ganti password dulu
  const forcePasswordChange = AuthService.getForcePasswordChange()
  const isChangePasswordPage = location.pathname === '/change-password'

  if (forcePasswordChange && !isChangePasswordPage) {
    return <Navigate to="/change-password" replace />
  }

  // Cek role jika ada requirement
  if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    // Role tidak sesuai - redirect ke unauthorized atau dashboard sesuai role
    const redirectUrl = AuthService.getRedirectUrl(userRole)
    return <Navigate to={redirectUrl} replace />
  }

  // Semua check passed - tampilkan content
  return children
}
