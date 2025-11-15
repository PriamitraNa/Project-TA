import {
  useDashboard,
  StatisticsCards,
  PeringkatSiswaChart,
  NilaiSiswaChart,
  KehadiranChart,
  CatatanTerbaruTable
} from '../../features/guru/dashboard';

export default function DashboardGuru() {
  const {
    // Statistik Siswa (API #1)
    statistikSiswa,
    isLoadingStatistik,

    // Peringkat Siswa (API #2)
    peringkatSiswaData,
    isLoadingPeringkat,
    hasAccessPeringkat,
    currentPage,
    setCurrentPage,
    totalPages,

    // Mata Pelajaran (API #3)
    mapelOptions,
    isLoadingMapel,
    selectedMapel,
    handleMapelChange,

    // Nilai Siswa per Mapel (API #4)
    nilaiSiswaData,
    isLoadingNilai,
    currentPageNilai,
    setCurrentPageNilai,
    totalPagesNilai,

    // Kelas for Kehadiran
    kelasOptions,
    isLoadingKelas,
    selectedKelas,
    handleKelasChange,
    isWaliKelas,
    showKelasDropdown,

    // Kehadiran Hari Ini (API #5)
    kehadiranData,
    isLoadingKehadiran,
    tanggalKehadiran,

    // Catatan Terbaru (API #6)
    catatanTampil,
    isLoadingCatatan,
  } = useDashboard();

  return (
    <div className="space-y-8">
      {/* Statistics Cards */}
      <StatisticsCards 
        data={statistikSiswa}
        isLoading={isLoadingStatistik}
      />

      {/* Charts - Peringkat & Nilai Siswa */}
      <div className={`grid grid-cols-1 ${hasAccessPeringkat ? 'lg:grid-cols-2' : ''} gap-8`}>
        {/* Chart Peringkat Siswa - Only for Wali Kelas */}
        {hasAccessPeringkat && (
          <PeringkatSiswaChart
            data={peringkatSiswaData}
            isLoading={isLoadingPeringkat}
            currentPage={currentPage}
            totalPages={totalPages}
            onPrevious={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            onNext={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
          />
        )}

        {/* Chart Nilai Siswa per Mapel */}
        <NilaiSiswaChart
          mapelOptions={mapelOptions}
          isLoadingMapel={isLoadingMapel}
          selectedMapel={selectedMapel}
          onMapelChange={handleMapelChange}
                  data={nilaiSiswaData}
          isLoadingNilai={isLoadingNilai}
          currentPage={currentPageNilai}
          totalPages={totalPagesNilai}
          onPrevious={() => setCurrentPageNilai(prev => Math.max(prev - 1, 1))}
          onNext={() => setCurrentPageNilai(prev => Math.min(prev + 1, totalPagesNilai))}
        />
      </div>

      {/* Kehadiran & Catatan */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pie Chart - Kehadiran */}
        <KehadiranChart 
                    data={kehadiranData}
          isLoading={isLoadingKehadiran}
          tanggal={tanggalKehadiran}
          kelasOptions={kelasOptions}
          isLoadingKelas={isLoadingKelas}
          selectedKelas={selectedKelas}
          onKelasChange={handleKelasChange}
          showKelasDropdown={showKelasDropdown}
                  />

        {/* Data Table - Catatan */}
        <CatatanTerbaruTable 
                  data={catatanTampil}
          isLoading={isLoadingCatatan}
                />
      </div>
    </div>
  );
}
