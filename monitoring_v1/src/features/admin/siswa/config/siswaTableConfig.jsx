import Button from "../../../../components/ui/Button";
import { FaEdit, FaTrash } from "react-icons/fa";

// Konfigurasi kolom untuk tabel siswa
export const siswaColumns = [
  {
    key: "no",
    label: "No",
    sortable: true,
    className: "w-12 sm:w-16 text-center",
  },
  {
    key: "nama_lengkap",
    label: "Nama Lengkap",
    sortable: true,
    className: "text-left",
  },
  {
    key: "nisn",
    label: "NISN",
    sortable: true,
    className: "w-24 sm:w-32 text-center",
  },
  {
    key: "nik",
    label: "NIK",
    sortable: true,
    className: "w-24 sm:w-32 text-center",
  },
  {
    key: "jenis_kelamin",
    label: "Jenis Kelamin",
    sortable: true,
    className: "w-20 sm:w-32 text-center",
  },
  {
    key: "tanggal_lahir",
    label: "Tanggal Lahir",
    sortable: true,
    className: "w-24 sm:w-32 text-center",
  },
  {
    key: "tempat_lahir",
    label: "Tempat Lahir",
    sortable: true,
    className: "w-24 sm:w-32 text-center",
  },
  {
    key: "actions",
    label: "Aksi",
    sortable: false,
    className: "w-24 sm:w-32 text-center",
  },
];

// Format data untuk tabel siswa
export const createTableData = (siswaData, pagination, handlers) => {
  const { onEdit, onDelete } = handlers;

  return siswaData.map((siswa, index) => ({
    id: siswa.id,
    no: (pagination.current_page - 1) * pagination.per_page + index + 1,
    nama_lengkap: siswa.nama_lengkap,
    nisn: siswa.nisn,
    nik: siswa.nik || "-",
    jenis_kelamin: siswa.jenis_kelamin || "-",
    tanggal_lahir: siswa.tanggal_lahir
      ? new Date(siswa.tanggal_lahir).toLocaleDateString("id-ID")
      : "-",
    tempat_lahir: siswa.tempat_lahir || "-",
    actions: (
      <div className="flex gap-1 justify-center">
        <Button
          variant="secondary"
          size="sm"
          icon={<FaEdit />}
          ariaLabel="Edit"
          className="text-xs px-2 py-1 min-w-fit"
          onClick={() => onEdit(siswa)}
        >
          Edit
        </Button>
        <Button
          variant="danger"
          size="sm"
          icon={<FaTrash />}
          ariaLabel="Hapus"
          className="text-xs px-2 py-1 min-w-fit"
          onClick={() => onDelete(siswa)}
        >
          Hapus
        </Button>
      </div>
    ),
  }));
};
