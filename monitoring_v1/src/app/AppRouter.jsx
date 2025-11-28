import { Routes, Route, Navigate } from 'react-router-dom'
import MainLayout from '../layouts/MainLayout'
import LoginPage from '../pages/Login'
import ChangePassword from '../pages/ChangePassword'
import ProtectedRoute from '../components/ui/ProtectedRoute'

// Import halaman Admin
import DashboardAdmin from '../pages/admin/DashboardAdmin'
import AkunPengguna from '../pages/admin/AkunPengguna'
import DataGuru from '../pages/admin/DataGuru'
import DataSiswa from '../pages/admin/DataSiswa'
import DataOrtu from '../pages/admin/DataOrtu'
import KelolaGuruKelas from '../pages/admin/KelolaGuruKelas'
import KelolaKelasDetail from '../pages/admin/KelolaKelasDetail'
import TahunAjaran from '../pages/admin/TahunAjaran'
import LaporanNilai from '../pages/admin/LaporanNilai'

// Import halaman Guru
import DashboardGuru from '../pages/guru/DashboardGuru'
import Absensi from '../pages/guru/Absensi'
import Nilai from '../pages/guru/Nilai'
import Catatan from '../pages/guru/Catatan'
import Chat from '../pages/guru/Chat'
import LaporanGuru from '../pages/guru/LaporanGuru'

// Import halaman Orangtua
import DashboardOrtu from '../pages/ortu/DashboardOrtu'
import NilaiAnak from '../pages/ortu/NilaiAnak'
import AbsensiAnak from '../pages/ortu/AbsensiAnak'
import CatatanAnak from '../pages/ortu/CatatanAnak'
import ChatGuru from '../pages/ortu/ChatGuru'
import LaporanAnak from '../pages/ortu/LaporanAnak'

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      {/* Change Password - Protected route untuk user yang harus ganti password */}
      <Route
        path="/change-password"
        element={
          <ProtectedRoute>
            <ChangePassword />
          </ProtectedRoute>
        }
      />

      {/* Rute Admin - hanya bisa diakses oleh role 'admin' */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/admin/dashboard" />} />
        <Route path="dashboard" element={<DashboardAdmin />} />
        <Route path="akun-pengguna" element={<AkunPengguna />} />
        <Route path="data/guru" element={<DataGuru />} />
        <Route path="data/siswa" element={<DataSiswa />} />
        <Route path="data/ortu" element={<DataOrtu />} />
        <Route path="kelola-guru-kelas" element={<KelolaGuruKelas />} />
        <Route path="kelola-guru-kelas/:kelasId" element={<KelolaKelasDetail />} />
        <Route path="tahun-ajaran" element={<TahunAjaran />} />
        <Route path="laporan-nilai" element={<LaporanNilai />} />
      </Route>

      {/* Rute Guru - hanya bisa diakses oleh role 'guru' */}
      <Route
        path="/guru"
        element={
          <ProtectedRoute allowedRoles={['guru']}>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/guru/dashboard" />} />
        <Route path="dashboard" element={<DashboardGuru />} />
        <Route path="absensi" element={<Absensi />} />
        <Route path="nilai" element={<Nilai />} />
        <Route path="catatan" element={<Catatan />} />
        <Route path="chat" element={<Chat />} />
        <Route path="laporan" element={<LaporanGuru />} />
      </Route>

      {/* Rute Ortu - hanya bisa diakses oleh role 'ortu' */}
      <Route
        path="/ortu"
        element={
          <ProtectedRoute allowedRoles={['ortu']}>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/ortu/dashboard" />} />
        <Route path="dashboard" element={<DashboardOrtu />} />
        <Route path="nilai" element={<NilaiAnak />} />
        <Route path="absensi" element={<AbsensiAnak />} />
        <Route path="catatan-anak" element={<CatatanAnak />} />
        <Route path="chat" element={<ChatGuru />} />
        <Route path="laporan" element={<LaporanAnak />} />
      </Route>

      {/* Root redirect - redirect ke login jika belum login */}
      <Route path="/" element={<Navigate to="/login" />} />

      {/* Fallback - redirect ke login */}
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  )
}
