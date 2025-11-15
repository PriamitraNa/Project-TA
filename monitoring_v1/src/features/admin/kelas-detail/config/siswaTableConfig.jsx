import Button from '../../../../components/ui/Button';
import { FaTrash } from 'react-icons/fa';

// Konfigurasi kolom untuk tabel siswa - Responsive
export const siswaColumns = [
    { key: 'no', label: 'No', sortable: true, className: 'w-12 sm:w-16 text-center' },
    { key: 'nama_siswa', label: 'Nama Siswa', sortable: true, className: 'w-32 sm:w-48 text-left' },
    { key: 'nisn', label: 'NISN', sortable: true, className: 'w-24 sm:w-32 text-center' },
    { key: 'jenis_kelamin', label: 'Jenis Kelamin', sortable: true, className: 'w-20 sm:w-32 text-center' },
    { key: 'actions', label: 'Aksi', sortable: false, className: 'w-20 sm:w-24 text-center' }
];

// Format data untuk tabel siswa (menggunakan data dari API)
export const createSiswaTableData = (siswaData, onDeleteSiswa) => {
    return siswaData.map((siswa) => ({
        id: siswa.id,
        no: siswa.no_urut,
        nama_siswa: siswa.nama_lengkap,
        nisn: siswa.nisn,
        jenis_kelamin: siswa.jenis_kelamin,
        actions: (
            <div className="flex gap-1 justify-center">
                <Button
                    variant="danger"
                    size="sm"
                    icon={<FaTrash />}
                    ariaLabel="Hapus"
                    className="text-xs px-2 py-1 min-w-fit"
                    onClick={() => onDeleteSiswa(siswa)}
                >
                    Hapus
                </Button>
            </div>
        )
    }));
};
