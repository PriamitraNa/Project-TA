import Button from '../../../../components/ui/Button';
import PageHeader from '../../../../components/ui/PageHeader';
import { FaArrowLeft, FaBook } from 'react-icons/fa';

const KelasInfoHeader = ({ 
    kelasInfo, 
    isLoadingKelasInfo, 
    onBack 
}) => {
    // Dummy data untuk kelas info (fallback jika API belum loaded)
    const fallbackKelasInfo = {
        id: 'loading',
        nama_kelas: 'Loading...',
        wali_kelas: 'Loading...',
        tahun_ajaran: 'Loading...',
        semester: 'Loading...',
        jumlah_siswa: 0
    };

    return (
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
            <Button
                variant="secondary"
                size="sm"
                icon={<FaArrowLeft />}
                onClick={onBack}
                className="w-full sm:w-auto"
            >
                Kembali
            </Button>
            <div className="flex-1 w-full">
                <PageHeader
                    icon={<FaBook />}
                    title={`Kelola ${kelasInfo?.nama_kelas || fallbackKelasInfo.nama_kelas} – Semester ${kelasInfo?.semester || fallbackKelasInfo.semester} ${kelasInfo?.tahun || fallbackKelasInfo.tahun_ajaran}`}
                    description={`Wali Kelas: ${kelasInfo?.wali_kelas_nama || fallbackKelasInfo.wali_kelas} • Jumlah Siswa: ${kelasInfo?.jumlah_siswa || fallbackKelasInfo.jumlah_siswa}${isLoadingKelasInfo ? ' • Loading...' : ''}`}
                    className="text-sm sm:text-base"
                />
            </div>
        </div>
    );
};

export default KelasInfoHeader;
