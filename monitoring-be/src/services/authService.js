import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { findUserWithRoleData, findUserByIdWithRoleData } from '../models/userModel.js'
import { updateLastLogin } from '../models/userModel.js'

export const loginService = async (username, password) => {
  // Validasi username harus numerik
  if (!/^\d+$/.test(username)) {
    throw new Error('Username harus berupa angka')
  }

  // Validasi password minimal 8 karakter
  if (password.length < 8) {
    throw new Error('Password minimal 8 karakter')
  }

  const user = await findUserWithRoleData(username)

  if (!user) {
    throw new Error('Username tidak valid')
  }

  // Cek status user aktif
  if (user.status !== 'aktif') {
    throw new Error('Akun Anda tidak aktif, hubungi administrator')
  }

  const isMatch = await bcrypt.compare(password, user.password)
  if (!isMatch) {
    throw new Error('Password salah')
  }

  // Cek apakah user harus ganti password
  if (user.must_change_password === 1) {
    // Generate temp token (30 menit expiry)
    const tempPayload = {
      id: user.id,
      role: user.role,
      temp: true, // Flag untuk temp token
    }
    const tempToken = jwt.sign(tempPayload, process.env.JWT_SECRET, { expiresIn: '30m' })

    return {
      status: 'success',
      message: 'Anda harus mengubah password default',
      data: {
        force_password_change: true,
        temp_token: tempToken,
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
          nama:
            user.role === 'admin'
              ? user.nama_lengkap
              : user.role === 'guru'
              ? user.guru_nama
              : user.ortu_nama,
        },
      },
    }
  }

  // Update last login timestamp (hanya untuk login normal)
  await updateLastLogin(user.id)

  // Prepare JWT payload
  const payload = {
    id: user.id,
    role: user.role,
  }

  // Add role-specific IDs to payload
  if (user.role === 'guru' && user.guru_id) {
    payload.guru_id = user.guru_id
  }
  if (user.role === 'ortu') {
    if (user.orangtua_id) {
      payload.orangtua_id = user.orangtua_id
    }
    if (user.siswa_id) {
      payload.siswa_id = user.siswa_id
    }
    if (user.siswa_nisn) {
      payload.siswa_nisn = user.siswa_nisn // NISN untuk filtering laporan
    }
  }

  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' })

  // Siapkan data response sesuai role
  let responseData = {
    id: user.id,
    username: user.username,
    role: user.role,
    nama: '',
  }

  // Set nama sesuai role
  switch (user.role) {
    case 'admin':
      responseData.nama = user.nama_lengkap
      break
    case 'guru':
      responseData.nama = user.guru_nama
      break
    case 'ortu':
      responseData.nama = user.ortu_nama
      responseData.nama_anak = user.siswa_nama
      break
  }

  return {
    status: 'success',
    message: 'Login berhasil',
    data: {
      force_password_change: false,
      token,
      user: responseData,
    },
  }
}

/**
 * Helper: Validate password policy
 * Min 8 karakter + ada huruf DAN angka
 */
const validatePasswordPolicy = (password) => {
  // Min 8 karakter
  if (password.length < 8) {
    return { valid: false, message: 'Password minimal 8 karakter' }
  }

  // Harus ada huruf
  if (!/[A-Za-z]/.test(password)) {
    return { valid: false, message: 'Password harus mengandung huruf' }
  }

  // Harus ada angka
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'Password harus mengandung angka' }
  }

  return { valid: true }
}

/**
 * Change Default Password Service
 * Untuk user yang pertama kali login atau setelah password di-reset admin
 */
export const changeDefaultPasswordService = async (userId, newPassword, confirmPassword) => {
  // Validasi password confirmation
  if (newPassword !== confirmPassword) {
    throw new Error('Konfirmasi password tidak cocok')
  }

  // Validasi password policy
  const validation = validatePasswordPolicy(newPassword)
  if (!validation.valid) {
    throw new Error(validation.message)
  }

  // Get user data
  const user = await findUserByIdWithRoleData(userId)
  if (!user) {
    throw new Error('User tidak ditemukan')
  }

  // Cek apakah password baru sama dengan password lama (opsional)
  const isSameAsOld = await bcrypt.compare(newPassword, user.password)
  if (isSameAsOld) {
    throw new Error('Password baru tidak boleh sama dengan password lama')
  }

  // Hash password baru
  const hashedPassword = await bcrypt.hash(newPassword, 10)

  // Update password dan clear flag must_change_password
  const db = await import('../config/db.js')
  await new Promise((resolve, reject) => {
    const query = `
      UPDATE users 
      SET password = ?, must_change_password = 0 
      WHERE id = ?
    `
    db.default.query(query, [hashedPassword, userId], (err, result) => {
      if (err) return reject(err)
      resolve(result)
    })
  })

  // Update last login
  await updateLastLogin(userId)

  // Generate JWT token normal (bukan temp token)
  const payload = {
    id: user.id,
    role: user.role,
  }

  // Add role-specific IDs to payload
  if (user.role === 'guru' && user.guru_id) {
    payload.guru_id = user.guru_id
  }

  if (user.role === 'ortu') {
    if (user.orangtua_id) {
      payload.orangtua_id = user.orangtua_id
    }
    if (user.siswa_id) {
      payload.siswa_id = user.siswa_id
    }
    if (user.siswa_nisn) {
      payload.siswa_nisn = user.siswa_nisn
    }

    // IMPORTANT: Jika siswa_id tidak ada dari query, ambil dari username (NISN)
    // Karena untuk ortu, username = NISN siswa
    if (!payload.siswa_id && user.username) {
      // Get siswa_id from username (NISN)
      const { findUserWithRoleData } = await import('../models/userModel.js')
      const fullUserData = await findUserWithRoleData(user.username)

      if (fullUserData && fullUserData.siswa_id) {
        payload.siswa_id = fullUserData.siswa_id
        payload.siswa_nisn = fullUserData.siswa_nisn || user.username
      }
    }
  }

  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' })

  // Prepare response data
  let responseData = {
    id: user.id,
    username: user.username,
    role: user.role,
    nama: '',
  }

  // Set nama sesuai role
  switch (user.role) {
    case 'admin':
      responseData.nama = user.nama_lengkap
      break
    case 'guru':
      responseData.nama = user.guru_nama
      break
    case 'ortu':
      responseData.nama = user.ortu_nama
      responseData.nama_anak = user.siswa_nama
      break
  }

  return {
    status: 'success',
    message: 'Password berhasil diubah',
    data: {
      token,
      user: responseData,
    },
  }
}

export const getProfileService = async (userId, isTempToken = false) => {
  const user = await findUserByIdWithRoleData(userId)

  if (!user) {
    throw new Error('User tidak ditemukan')
  }

  // Cek status user aktif
  if (user.status !== 'aktif') {
    throw new Error('Akun Anda tidak aktif, hubungi administrator')
  }

  // Siapkan data response sesuai role
  let responseData = {
    id: user.id,
    username: user.username,
    role: user.role,
    nama: '',
  }

  // Set nama sesuai role
  switch (user.role) {
    case 'admin':
      responseData.nama = user.nama_lengkap
      break
    case 'guru':
      responseData.nama = user.guru_nama
      break
    case 'ortu':
      responseData.nama = user.ortu_nama
      responseData.nama_anak = user.siswa_nama
      break
  }

  // Jika menggunakan temp token, include info force_password_change
  const response = {
    status: 'success',
    message: 'Token valid',
    data: responseData,
  }

  // Tambahkan flag force_password_change jika pakai temp token
  if (isTempToken) {
    response.data.force_password_change = true
  }

  return response
}
