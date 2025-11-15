import ContentWrapper from '../../components/ui/ContentWrapper';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import { FaFileDownload, FaUserGraduate } from 'react-icons/fa';
import { FaRegFilePdf } from 'react-icons/fa6';
import { 
  useLaporanPerkembangan, 
  FilterPerkembangan, 
  PreviewLaporanPerkembangan, 
  CatatanWaliKelas,
  NotWaliKelasCard
} from '../../features/guru/laporan';

export default function LaporanGuru() {
  const {
    // Filter states
    selectedKelas,
    selectedSiswa,
    setSelectedSiswa,
    
    // Options
    kelasOptions,
    siswaOptions,
    
    // Data
    laporanData,
    periodeInfo,
    catatanWaliKelas,
    setCatatanWaliKelas,
    
    // Loading states
    isLoading,
    isLoadingKelas,
    isLoadingSiswa,
    
    // Error states
    isNotWaliKelas,
    errorMessage,
    
    // Actions
    canGenerateReport,
    handleDownloadPDF,
  } = useLaporanPerkembangan();

  return (
    <div className="space-y-6">
      <PageHeader
        icon={<FaFileDownload />}
        title="Laporan Perkembangan Siswa"
        description="Generate laporan lengkap perkembangan siswa untuk keperluan rapor dan dokumentasi"
      />

      {/* Loading State - Initial Load */}
      {isLoadingKelas && (
        <ContentWrapper>
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Memuat data kelas...</p>
          </div>
        </ContentWrapper>
      )}

      {/* Error State - Not Wali Kelas */}
      {!isLoadingKelas && isNotWaliKelas && (
        <NotWaliKelasCard message={errorMessage} />
      )}

      {/* Filter Section */}
      {!isLoadingKelas && !isNotWaliKelas && (
        <FilterPerkembangan
          selectedKelas={selectedKelas}
          selectedSiswa={selectedSiswa}
          onSiswaChange={(e) => setSelectedSiswa(e.target.value)}
          kelasOptions={kelasOptions}
          siswaOptions={siswaOptions}
          periodeInfo={periodeInfo}
          isLoadingSiswa={isLoadingSiswa}
        />
      )}

      {/* Loading State - Data Siswa */}
      {!isNotWaliKelas && isLoading && (
        <ContentWrapper>
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Memuat data laporan...</p>
          </div>
        </ContentWrapper>
      )}

      {/* Preview Laporan */}
      {!isNotWaliKelas && canGenerateReport && !isLoading && (
        <>
          <PreviewLaporanPerkembangan 
            laporanData={laporanData} 
            periodeInfo={periodeInfo}
          />
          
          {/* Catatan Wali Kelas */}
          <CatatanWaliKelas
            value={catatanWaliKelas}
            onChange={setCatatanWaliKelas}
            siswaName={laporanData?.siswa?.nama || ''}
          />

          {/* Action Button */}
          <ContentWrapper>
            <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Download Laporan</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Pastikan catatan wali kelas sudah diisi sebelum download PDF
                </p>
              </div>
              <Button 
                variant="danger" 
                icon={<FaRegFilePdf />}
                onClick={handleDownloadPDF}
                disabled={!catatanWaliKelas.trim()}
              >
                Download PDF
              </Button>
            </div>
          </ContentWrapper>
        </>
      )}

      {/* Empty State */}
      {!isNotWaliKelas && !selectedSiswa && !isLoading && (
        <ContentWrapper>
          <div className="text-center py-12">
            <FaUserGraduate className="text-6xl text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Pilih Siswa
            </h3>
            <p className="text-gray-600">
              Silakan pilih siswa terlebih dahulu untuk melihat laporan perkembangan
            </p>
          </div>
        </ContentWrapper>
      )}
    </div>
  );
}
