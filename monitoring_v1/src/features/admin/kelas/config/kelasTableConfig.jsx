import Button from '../../../../components/ui/Button';
import { FaCog, FaEdit, FaTrash } from 'react-icons/fa';

// Konfigurasi kolom untuk tabel kelas
export const kelasColumns = [
    { key: 'no', label: 'No', sortable: true, className: 'w-16 text-center' },
    { key: 'nama_kelas', label: 'Nama Kelas', sortable: true, className: 'w-32 text-center' },
    { key: 'wali_kelas', label: 'Wali Kelas', sortable: true, className: 'w-48 text-left' },
    { key: 'jumlah_siswa', label: 'Jumlah Siswa', sortable: true, className: 'w-28 text-center' },
    { key: 'jumlah_mapel', label: 'Jumlah Mapel', sortable: true, className: 'w-28 text-center' },
    { key: 'actions', label: 'Aksi', sortable: false, className: 'w-40 text-center' }
];

// Format data untuk tabel kelas
export const createTableData = (kelasData, pagination, handlers) => {
    const { handleKelolaKelas, handleOpenEditKelasModal, handleDelete } = handlers;
    
    return kelasData.map((kelas, index) => ({
        id: kelas.id,
        no: (pagination.current_page - 1) * pagination.per_page + index + 1,
        nama_kelas: kelas.nama_kelas,
        wali_kelas: kelas.wali_kelas_nama || '-',
        jumlah_siswa: kelas.jumlah_siswa,
        jumlah_mapel: kelas.jumlah_mapel,
        actions: (
            <div className="flex gap-1 justify-center">
                <Button
                    variant="primary"
                    size="sm"
                    icon={<FaCog />}
                    ariaLabel="Kelola"
                    className="text-xs px-2 py-1 min-w-fit"
                    onClick={() => handleKelolaKelas(kelas)}
                >
                    Kelola
                </Button>
                <Button
                    variant="secondary"
                    size="sm"
                    icon={<FaEdit />}
                    ariaLabel="Edit"
                    className="text-xs px-2 py-1 min-w-fit"
                    onClick={() => handleOpenEditKelasModal(kelas)}
                >
                    Edit
                </Button>
                <Button
                    variant="danger"
                    size="sm"
                    icon={<FaTrash />}
                    ariaLabel="Hapus"
                    className="text-xs px-2 py-1 min-w-fit"
                    onClick={() => handleDelete(kelas)}
                >
                    Hapus
                </Button>
            </div>
        )
    }));
};
