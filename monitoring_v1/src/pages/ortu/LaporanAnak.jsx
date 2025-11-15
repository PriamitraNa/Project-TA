import PageHeader from '../../components/ui/PageHeader'
import { FaFileArrowDown } from 'react-icons/fa6'
import { useLaporan, FilterSection, LaporanTable } from '../../features/ortu/laporan'

export default function LaporanAnak() {
  const {
    tahunAjaranOptions,
    selectedTahun,
    semesterOptions,
    selectedSemester,
    siswaInfo,
    dataTampil,
    statistik,
    isLoadingOptions,
    isLoadingSemester,
    isLoading,
    isDownloading,
    setSelectedTahun,
    setSelectedSemester,
    getPredikatBadge,
    handleDownloadPDF,
  } = useLaporan()

  return (
    <div className="space-y-6">
      <PageHeader
        icon={<FaFileArrowDown />}
        title="Laporan Akademik Anak"
        description="Lihat hasil belajar dan unduh rapor anak Anda"
      />

      <FilterSection
        tahunAjaranOptions={tahunAjaranOptions}
        selectedTahun={selectedTahun}
        semesterOptions={semesterOptions}
        selectedSemester={selectedSemester}
        onTahunChange={setSelectedTahun}
        onSemesterChange={setSelectedSemester}
        onDownloadPDF={handleDownloadPDF}
        isLoadingOptions={isLoadingOptions}
        isLoadingSemester={isLoadingSemester}
        isDownloading={isDownloading}
        isDataEmpty={dataTampil.length === 0}
      />

      <LaporanTable
        data={dataTampil}
        tahunAjaranOptions={tahunAjaranOptions}
        selectedTahun={selectedTahun}
        semesterOptions={semesterOptions}
        selectedSemester={selectedSemester}
        siswaInfo={siswaInfo}
        isLoading={isLoading}
        getPredikatBadge={getPredikatBadge}
      />
    </div>
  )
}
