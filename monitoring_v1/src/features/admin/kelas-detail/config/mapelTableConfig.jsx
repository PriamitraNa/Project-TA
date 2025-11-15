import Button from '../../../../components/ui/Button';
import { FaEdit, FaTrash } from 'react-icons/fa';

// Konfigurasi kolom untuk tabel mata pelajaran - Persis sama dengan tabel siswa
export const mapelColumns = [
    { key: 'no', label: 'No', sortable: true, className: 'w-12 sm:w-16 text-center' },
    { key: 'nama_mapel', label: 'Nama Mapel', sortable: true, className: 'w-32 sm:w-48 text-left' },
    { key: 'guru_pengampu', label: 'Guru Pengampu', sortable: true, className: 'w-24 sm:w-32 text-center' },
    { key: 'nip_guru', label: 'NIP Guru', sortable: true, className: 'w-20 sm:w-32 text-center' },
    { key: 'actions', label: 'Aksi', sortable: false, className: 'w-20 sm:w-24 text-center' }
];

// Format data untuk tabel mata pelajaran
export const createMapelTableData = (mapelData, mapelPagination, onEditMapel, onDeleteMapel) => {
    return mapelData.map((mapel, index) => ({
        id: mapel.id,
        no: (mapelPagination?.current_page - 1) * mapelPagination?.per_page + index + 1,
        nama_mapel: mapel.nama_mapel,
        guru_pengampu: mapel.guru_pengampu,
        nip_guru: mapel.nip_guru,
        actions: (
            <div className="flex gap-1 justify-center">
                <Button
                    variant="secondary"
                    size="sm"
                    icon={<FaEdit />}
                    ariaLabel="Edit"
                    className="text-xs px-2 py-1 min-w-fit"
                    onClick={() => onEditMapel(mapel)}
                >
                    Edit
                </Button>
                <Button
                    variant="danger"
                    size="sm"
                    icon={<FaTrash />}
                    ariaLabel="Hapus"
                    className="text-xs px-2 py-1 min-w-fit"
                    onClick={() => onDeleteMapel(mapel)}
                >
                    Hapus
                </Button>
            </div>
        )
    }));
};
