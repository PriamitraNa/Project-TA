import Button from "../../../../components/ui/Button";
import { FaTrash, FaKey } from "react-icons/fa";

// Konfigurasi kolom untuk tabel akun pengguna
export const akunPenggunaColumns = [
  {
    key: "no",
    label: "No",
    sortable: false,
    className: "w-12 text-center",
  },
  {
    key: "nama",
    label: "Nama",
    sortable: true,
    className: "w-32 text-left",
  },
  {
    key: "username",
    label: "Username",
    sortable: true,
    className: "w-32 text-left",
  },
  {
    key: "role",
    label: "Role",
    sortable: true,
    className: "w-24 text-center",
  },
  {
    key: "lastLogin",
    label: "Login Terakhir",
    sortable: true,
    className: "w-32 text-center",
  },
  {
    key: "actions",
    label: "Aksi",
    sortable: false,
    className: "w-32 text-center",
  },
];

// Format data untuk tabel akun pengguna
export const createTableData = (akunData, pagination, handlers) => {
  const { onDelete, onReset } = handlers;

  return akunData.map((akun, index) => ({
    id: akun.id,
    no: (pagination.current_page - 1) * pagination.per_page + index + 1,
    nama: akun.nama_lengkap,
    username: akun.username,
    role: (
      <span className={`px-2 py-1 rounded-md text-xs font-medium ${
        akun.role === 'admin' 
          ? 'bg-purple-100 text-purple-800'
          : akun.role === 'guru'
          ? 'bg-blue-100 text-blue-800'
          : 'bg-orange-100 text-orange-800'
      }`}>
        {akun.role === 'admin' ? 'Admin' : akun.role === 'guru' ? 'Guru' : 'Orangtua'}
      </span>
    ),
    lastLogin: akun.last_login || '-',
    actions: (
      <div className="flex gap-1 justify-center">
        <Button
          variant="warning"
          size="sm"
          icon={<FaKey />}
          ariaLabel="Reset Password"
          onClick={() => onReset(akun)}
          className="px-2 py-1 text-xs"
        >
          Reset
        </Button>
        <Button
          variant="danger"
          size="sm"
          icon={<FaTrash />}
          ariaLabel="Hapus Akun"
          onClick={() => onDelete(akun)}
          className="px-2 py-1 text-xs"
        >
          Hapus
        </Button>
      </div>
    ),
  }));
};
