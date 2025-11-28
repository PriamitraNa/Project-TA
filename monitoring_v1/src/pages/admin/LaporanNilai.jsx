import ContentWrapper from '../../components/ui/ContentWrapper'
import PageHeader from '../../components/ui/PageHeader'
import Button from '../../components/ui/Button'
import { FaUserGraduate } from 'react-icons/fa'
import { FaRegFilePdf, FaFileArrowDown } from 'react-icons/fa6'
import { useTranskripNilai, FilterSiswa, PreviewTranskrip } from '../../features/admin/laporan'

export default function LaporanNilai() {
  const {
    // Cascade State
    tahunAjaranList,
    kelasList,
    siswaList,

    // Selected Values
    selectedTahunAjaran,
    selectedKelas,
    selectedSiswa,
    downloadMode,

    // Handlers
    handleTahunAjaranChange,
    handleKelasChange,
    handleSiswaChange,
    handleModeChange,

    // Loading States
    isLoadingTahunAjaran,
    isLoadingKelas,
    isLoadingSiswa,
    isLoadingTranskrip,
    isDownloading,

    // Data
    transkripData,

    // Actions
    handleDownloadPDF,
    canDownloadPDF,
  } = useTranskripNilai()

  return (
    <div className="space-y-6">
      <PageHeader
        icon={<FaFileArrowDown />}
        title="Laporan Nilai Siswa"
        description="Nilai lengkap siswa untuk keperluan dokumentasi dan arsip"
      />

      {/* Filter Section */}
      <FilterSiswa
        tahunAjaranList={tahunAjaranList}
        kelasList={kelasList}
        siswaList={siswaList}
        selectedTahunAjaran={selectedTahunAjaran}
        selectedKelas={selectedKelas}
        selectedSiswa={selectedSiswa}
        downloadMode={downloadMode}
        onTahunAjaranChange={handleTahunAjaranChange}
        onKelasChange={handleKelasChange}
        onSiswaChange={handleSiswaChange}
        onModeChange={handleModeChange}
        isLoadingTahunAjaran={isLoadingTahunAjaran}
        isLoadingKelas={isLoadingKelas}
        isLoadingSiswa={isLoadingSiswa}
      />

      {/* Action Button - Download PDF */}
      {canDownloadPDF && (
        <ContentWrapper>
          <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Generate Transkrip</h3>
              <p className="text-sm text-gray-600 mt-1">
                {downloadMode === 'individual'
                  ? 'Download transkrip nilai siswa dalam format PDF'
                  : `Download transkrip ${siswaList.length} siswa sekaligus`}
              </p>
            </div>
            <Button
              variant="danger"
              icon={<FaRegFilePdf />}
              onClick={handleDownloadPDF}
              disabled={isDownloading}
            >
              {isDownloading ? 'Mengunduh...' : 'Generate Transkrip PDF'}
            </Button>
          </div>
        </ContentWrapper>
      )}

      {/* Loading State - Data Transkrip */}
      {isLoadingTranskrip && (
        <ContentWrapper>
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Memuat transkrip nilai...</p>
          </div>
        </ContentWrapper>
      )}

      {/* Preview Transkrip (Individual Mode Only) */}
      {!isLoadingTranskrip && downloadMode === 'individual' && transkripData && (
        <PreviewTranskrip transkripData={transkripData} />
      )}

      {/* Empty State */}
      {!selectedTahunAjaran && !isLoadingTahunAjaran && (
        <ContentWrapper>
          <div className="text-center py-12">
            <FaUserGraduate className="text-6xl text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Pilih Tahun Ajaran</h3>
            <p className="text-gray-600">
              Silakan pilih tahun ajaran terlebih dahulu untuk melanjutkan
            </p>
          </div>
        </ContentWrapper>
      )}
    </div>
  )
}
