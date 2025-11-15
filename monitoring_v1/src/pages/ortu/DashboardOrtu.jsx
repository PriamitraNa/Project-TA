import {
  useDashboard,
  ProfileAnakCard,
  AbsensiCard,
  NilaiRataCard,
  CatatanTerbaruTable,
  NilaiChart,
} from "../../features/ortu/dashboard";

export default function DashboardOrtu() {
  const {
    // Data Anak
    dataAnak,
    isLoadingProfile,

    // Absensi Hari Ini
    absensiData,
    isLoadingAbsensi,

    // Catatan Terbaru
    catatanTerbaru,
    isLoadingCatatan,

    // Nilai per Mapel
    nilaiPerMapel,
    isLoadingNilai,
  } = useDashboard();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Kolom Kiri: Profil & Ringkasan */}
        <div className="lg:col-span-1 space-y-6">
          <ProfileAnakCard anak={dataAnak} isLoading={isLoadingProfile} />
          <AbsensiCard
            status={absensiData.status}
            tanggal={absensiData.tanggal}
            isLoading={isLoadingAbsensi}
          />
          <NilaiRataCard
            nilai={dataAnak.nilaiRataRata}
            semester={dataAnak.semester}
            tahunAjaran={dataAnak.tahunAjaran}
            isLoading={isLoadingProfile}
          />
        </div>

        {/* Kolom Kanan: Catatan & Chart Nilai */}
        <div className="lg:col-span-2 space-y-6">
          <CatatanTerbaruTable
            data={catatanTerbaru}
            isLoading={isLoadingCatatan}
          />

          <NilaiChart data={nilaiPerMapel} isLoading={isLoadingNilai} />
        </div>
      </div>
    </div>
  );
}