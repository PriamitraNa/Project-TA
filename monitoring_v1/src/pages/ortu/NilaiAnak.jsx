import ContentWrapper from "../../components/ui/ContentWrapper";
import PageHeader from "../../components/ui/PageHeader";
import { FaBook } from "react-icons/fa6";
import {
  useNilai,
  FilterSection,
  NilaiTable,
} from "../../features/ortu/nilai";

export default function NilaiAnak() {
  const {
    selectedTahun,
    setSelectedTahun,
    selectedSemester,
    setSelectedSemester,
    tahunAjaranOptions,
    semesterOptions,
    nilaiData,
    isLoadingTahun,
    isLoadingSemester,
    isLoadingNilai,
  } = useNilai();

  return (
    <div className="space-y-6">
      <PageHeader
        icon={<FaBook />}
        title="Rincian Nilai Anak"
        description="Lihat detail dan riwayat nilai akademik anak Anda."
      />

      <ContentWrapper>
        <FilterSection
          tahunAjaranOptions={tahunAjaranOptions}
          selectedTahun={selectedTahun}
          onTahunChange={(e) => setSelectedTahun(e.target.value)}
          semesterOptions={semesterOptions}
          selectedSemester={selectedSemester}
          onSemesterChange={(e) => setSelectedSemester(e.target.value)}
          isLoadingTahun={isLoadingTahun}
          isLoadingSemester={isLoadingSemester}
        />
        <NilaiTable 
          data={nilaiData} 
          isLoading={isLoadingNilai}
        />
      </ContentWrapper>
    </div>
  );
}
