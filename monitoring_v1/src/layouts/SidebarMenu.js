// layouts/SidebarMenu.js
import {
  FaUser,
  FaUsers,
  FaUserTie,
  FaBook,
  FaClipboardList,
  FaCalendarAlt,
  FaFileDownload,
  FaCommentDots,
  FaComments,
  FaCogs,
} from 'react-icons/fa'
import { MdManageAccounts } from 'react-icons/md'

export const sidebarMenu = {
  admin: [
    { title: 'Dashboard', icon: FaUser, to: '/admin/dashboard' },
    { title: 'Akun Pengguna', icon: MdManageAccounts, to: '/admin/akun-pengguna' },
    {
      title: 'Data Master',
      icon: FaCogs,
      subMenu: [
        { title: 'Data Guru', to: '/admin/data/guru' },
        { title: 'Data Siswa', to: '/admin/data/siswa' },
        { title: 'Data Orangtua', to: '/admin/data/ortu' },
      ],
    },
    { title: 'Kelola Guru & Kelas', icon: FaUserTie, to: '/admin/kelola-guru-kelas' },
    { title: 'Tahun Ajaran', icon: FaCalendarAlt, to: '/admin/tahun-ajaran' },
    {
      title: 'Laporan Nilai',
      icon: FaFileDownload,
      to: '/admin/laporan-nilai',
    },
  ],
  guru: [
    { title: 'Dashboard', icon: FaUser, to: '/guru/dashboard' },
    { title: 'Absensi', icon: FaClipboardList, to: '/guru/absensi' },
    { title: 'Nilai', icon: FaBook, to: '/guru/nilai' },
    { title: 'Catatan', icon: FaCommentDots, to: '/guru/catatan' },
    { title: 'Chat', icon: FaComments, to: '/guru/chat' },
    { title: 'Laporan Nilai', icon: FaFileDownload, to: '/guru/laporan' },
  ],
  ortu: [
    { title: 'Dashboard', icon: FaUser, to: '/ortu/dashboard' },
    { title: 'Nilai Anak', icon: FaBook, to: '/ortu/nilai' },
    { title: 'Absensi Anak', icon: FaClipboardList, to: '/ortu/absensi' },
    { title: 'Catatan Anak', icon: FaCommentDots, to: '/ortu/catatan-anak' },
    { title: 'Chat', icon: FaComments, to: '/ortu/chat' },
    { title: 'Laporan Anak', icon: FaFileDownload, to: '/ortu/laporan' },
  ],
}
