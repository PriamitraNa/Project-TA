import ContentWrapper from '../../components/ui/ContentWrapper'
import PageHeader from '../../components/ui/PageHeader'
import { FaClipboardUser } from 'react-icons/fa6'
import {
  useAbsensiAnak,
  SummaryCards,
  FilterSection,
  AbsensiTable,
} from '../../features/ortu/absensi'

export default function AbsensiAnak() {
  const {
    // State
    absensiData,
    summary,
    isLoading,
    tahunAjaranList,
    semesterList,
    bulanList, // Tambah bulanList
    selectedTahunAjaran,
    selectedSemester,
    selectedBulan,

    // Handlers
    handleTahunAjaranChange,
    handleSemesterChange,
    handleBulanChange,
  } = useAbsensiAnak()

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        icon={<FaClipboardUser />}
        title="Riwayat Kehadiran Anak"
        description="Pantau kehadiran anak secara real-time per bulan dan per semester"
      />

      {/* Filter Area */}
      <ContentWrapper>
        <FilterSection
          isLoading={isLoading}
          tahunAjaranList={tahunAjaranList}
          semesterList={semesterList}
          bulanList={bulanList}
          selectedTahunAjaran={selectedTahunAjaran}
          selectedSemester={selectedSemester}
          selectedBulan={selectedBulan}
          onTahunAjaranChange={handleTahunAjaranChange}
          onSemesterChange={handleSemesterChange}
          onBulanChange={handleBulanChange}
        />
      </ContentWrapper>

      {/* Ringkasan Kehadiran */}
      <ContentWrapper>
        <SummaryCards data={summary} isLoading={isLoading} />
      </ContentWrapper>

      {/* Tabel Detail Kehadiran */}
      <ContentWrapper>
        <AbsensiTable data={absensiData} isLoading={isLoading} />
      </ContentWrapper>

      {/* Info Box */}
      {!selectedTahunAjaran ||
        (!selectedSemester && (
          <ContentWrapper>
            <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded">
              <p className="text-sm text-amber-700">
                <strong>ℹ️ Informasi:</strong> Silakan pilih <strong>Tahun Ajaran</strong> dan{' '}
                <strong>Semester</strong> terlebih dahulu untuk melihat data kehadiran anak Anda.
              </p>
            </div>
          </ContentWrapper>
        ))}
    </div>
  )
}
