import axios from 'axios'
import { API_URL } from '../api'

const STORAGE_KEYS = {
  TOKEN: 'authToken',
  TEMP_TOKEN: 'tempToken',
  ROLE: 'userRole',
  ID: 'userId',
  NAME: 'userName',
  USERNAME: 'userUsername',
  FORCE_PASSWORD_CHANGE: 'forcePasswordChange',
}

const ROLE_ROUTES = {
  admin: '/admin/dashboard',
  guru: '/guru/dashboard',
  ortu: '/ortu/dashboard',
}

const saveUserData = (token, user, isTempToken = false) => {
  // Validasi token
  if (!token) {
    console.error('❌ Token is undefined or null')
    throw new Error('Token tidak valid')
  }

  // Simpan token ke key yang sesuai
  if (isTempToken) {
    localStorage.setItem(STORAGE_KEYS.TEMP_TOKEN, token)
  } else {
    localStorage.setItem(STORAGE_KEYS.TOKEN, token)
    // Clear temp token jika ada
    localStorage.removeItem(STORAGE_KEYS.TEMP_TOKEN)
  }

  localStorage.setItem(STORAGE_KEYS.ROLE, user.role)
  localStorage.setItem(STORAGE_KEYS.ID, user.id)
  localStorage.setItem(STORAGE_KEYS.NAME, user.nama)
  localStorage.setItem(STORAGE_KEYS.USERNAME, user.username)
  // Save force_password_change flag (default false jika tidak ada di response)
  localStorage.setItem(STORAGE_KEYS.FORCE_PASSWORD_CHANGE, user.force_password_change || false)
}

const clearUserData = () => {
  Object.values(STORAGE_KEYS).forEach((key) => localStorage.removeItem(key))
}

export const AuthService = {
  login: async (username, password) => {
    const res = await axios.post(`${API_URL}/auth/login`, {
      username,
      password,
    })

    if (res.data.status === 'success') {
      const { data } = res.data

      // Check apakah user harus ganti password
      // CEK di level data.force_password_change (bukan data.user.force_password_change)
      if (data.force_password_change === true) {
        // Simpan temp_token (bukan token biasa)
        const tempToken = data.temp_token || data.token

        if (!tempToken) {
          console.error('❌ No temp_token or token in response for force password change')
          throw new Error('Token tidak ditemukan dalam response')
        }

        // Set force_password_change flag di user object untuk konsistensi
        const userWithFlag = {
          ...data.user,
          force_password_change: true,
        }

        saveUserData(tempToken, userWithFlag, true) // isTempToken = true
      } else {
        // Normal login - simpan JWT token
        if (!data.token) {
          console.error('❌ No token in response for normal login')
          throw new Error('Token tidak ditemukan dalam response')
        }

        saveUserData(data.token, data.user, false) // isTempToken = false
      }
    }

    return res.data
  },

  verifyToken: async () => {
    // Cek temp_token dulu, kalau tidak ada baru cek token normal
    const token =
      localStorage.getItem(STORAGE_KEYS.TEMP_TOKEN) || localStorage.getItem(STORAGE_KEYS.TOKEN)

    if (!token) {
      throw new Error('Token tidak ditemukan')
    }

    const res = await axios.get(`${API_URL}/auth/me`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })

    return res.data
  },

  logout: () => {
    clearUserData()
  },

  getToken: () =>
    localStorage.getItem(STORAGE_KEYS.TEMP_TOKEN) || localStorage.getItem(STORAGE_KEYS.TOKEN),
  getUserRole: () => localStorage.getItem(STORAGE_KEYS.ROLE),
  getUserId: () => localStorage.getItem(STORAGE_KEYS.ID),
  getUserName: () => localStorage.getItem(STORAGE_KEYS.NAME),
  getUserUsername: () => localStorage.getItem(STORAGE_KEYS.USERNAME),

  // Force Password Change helpers
  getForcePasswordChange: () => {
    const value = localStorage.getItem(STORAGE_KEYS.FORCE_PASSWORD_CHANGE)
    return value === 'true' || value === true
  },

  setForcePasswordChange: (value) => {
    localStorage.setItem(STORAGE_KEYS.FORCE_PASSWORD_CHANGE, value)
  },

  clearForcePasswordChange: () => {
    localStorage.setItem(STORAGE_KEYS.FORCE_PASSWORD_CHANGE, false)
  },

  isAuthenticated: () => !!AuthService.getToken(),

  hasRole: (requiredRole) => AuthService.getUserRole() === requiredRole,

  getRedirectUrl: (role) => ROLE_ROUTES[role] || '/login',

  // Change Default Password API (untuk user baru/reset password)
  changeDefaultPassword: async (newPassword, confirmPassword) => {
    // Ambil temp_token (bukan token normal)
    const tempToken = localStorage.getItem(STORAGE_KEYS.TEMP_TOKEN)

    if (!tempToken) {
      throw new Error('Temp token tidak ditemukan')
    }

    const res = await axios.post(
      `${API_URL}/auth/change-default-password`,
      {
        new_password: newPassword,
        confirm_password: confirmPassword,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tempToken}`,
        },
      }
    )

    // Setelah berhasil ganti password, simpan JWT token baru dan user data
    if (res.data.status === 'success') {
      const { token, user } = res.data.data

      // Simpan JWT token baru (bukan temp_token lagi) dan hapus temp_token
      saveUserData(token, user, false) // isTempToken = false

      // Clear force password flag
      AuthService.clearForcePasswordChange()
    }

    return res.data
  },
}
