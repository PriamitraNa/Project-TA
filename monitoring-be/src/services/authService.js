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

  // Update last login timestamp
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
      token,
      user: responseData,
    },
  }
}

export const getProfileService = async (userId) => {
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

  return {
    status: 'success',
    message: 'Token valid',
    data: responseData,
  }
}
