import Button from "../../../../components/ui/Button";
import { FaEdit, FaTrash } from "react-icons/fa";

// Konfigurasi kolom untuk tabel guru
export const guruColumns = [
  {
    key: "no",
    label: "No",
    sortable: false,
    className: "w-12 text-center",
  },
  {
    key: "nama_lengkap",
    label: "Nama Lengkap",
    sortable: true,
    className: "w-32 text-left",
  },
  {
    key: "nip",
    label: "NIP",
    sortable: true,
    className: "w-24 text-left",
  },
  {
    key: "status",
    label: "Status",
    sortable: true,
    className: "w-20 text-center",
  },
  {
    key: "actions",
    label: "Aksi",
    sortable: false,
    className: "w-24 text-center",
  },
];

// Format data untuk tabel guru
export const createTableData = (guruData, pagination, handlers) => {
  const { onEdit, onDelete } = handlers;

  return guruData.map((guru, index) => ({
    id: guru.id,
    no: (pagination.current_page - 1) * pagination.per_page + index + 1,
    nama_lengkap: guru.nama_lengkap,
    nip: guru.nip,
    status: guru.status ? guru.status.charAt(0).toUpperCase() + guru.status.slice(1).toLowerCase() : "Aktif",
    actions: (
      <div className="flex gap-1 justify-center">
        <Button
          variant="secondary"
          size="sm"
          icon={<FaEdit />}
          ariaLabel="Edit"
          className="text-xs px-2 py-1 min-w-fit"
          onClick={() => onEdit(guru)}
        >
          Edit
        </Button>
        <Button
          variant="danger"
          size="sm"
          icon={<FaTrash />}
          ariaLabel="Hapus"
          className="text-xs px-2 py-1 min-w-fit"
          onClick={() => onDelete(guru)}
        >
          Hapus
        </Button>
      </div>
    ),
  }));
};
