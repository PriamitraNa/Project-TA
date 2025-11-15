import Button from "../../../../components/ui/Button";
import { FaEdit, FaTrash } from "react-icons/fa";

// Konfigurasi kolom untuk tabel orangtua
export const ortuColumns = [
  {
    key: "no",
    label: "No",
    sortable: false,
    className: "w-12 sm:w-16 text-center",
  },
  {
    key: "nama_lengkap",
    label: "Nama",
    sortable: true,
    className: "text-left",
  },
  {
    key: "nik",
    label: "NIK",
    sortable: true,
    className: "w-24 sm:w-32 text-center",
  },
  {
    key: "kontak",
    label: "Kontak",
    sortable: true,
    className: "w-24 sm:w-32 text-center",
  },
  {
    key: "relasi",
    label: "Relasi",
    sortable: true,
    className: "w-20 sm:w-32 text-center",
  },
  {
    key: "anak",
    label: "Anak",
    sortable: true,
    className: "w-24 sm:w-32 text-center",
  },
  {
    key: "jumlah_anak",
    label: "Jumlah Anak",
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

// Format data untuk tabel orangtua
export const createTableData = (ortuData, pagination, handlers) => {
  const { onEdit, onDelete } = handlers;

  return ortuData.map((ortu, index) => ({
    id: ortu.id,
    user_id: ortu.user_id, // Include user_id from API response
    no: (pagination.current_page - 1) * pagination.per_page + index + 1,
    nama_lengkap: ortu.nama_lengkap,
    nik: ortu.nik || "-",
    kontak: ortu.kontak || "-",
    relasi: ortu.relasi || "-",
    anak: ortu.anak ? ortu.anak.map((a) => a.nama_lengkap).join(", ") : "-",
    jumlah_anak: ortu.jumlah_anak || (ortu.anak ? ortu.anak.length : 0), // Use jumlah_anak from API or calculate
    actions: (
      <div className="flex gap-1 justify-center">
        <Button
          variant="secondary"
          size="sm"
          icon={<FaEdit />}
          ariaLabel="Edit"
          className="text-xs px-2 py-1 min-w-fit"
          onClick={() => onEdit(ortu)}
        >
          Edit
        </Button>
        <Button
          variant="danger"
          size="sm"
          icon={<FaTrash />}
          ariaLabel="Hapus"
          className="text-xs px-2 py-1 min-w-fit"
          onClick={() => onDelete(ortu)}
        >
          Hapus
        </Button>
      </div>
    ),
  }));
};
