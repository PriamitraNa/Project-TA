import React from 'react';
import ContentWrapper from "../../components/ui/ContentWrapper";
import PageHeader from "../../components/ui/PageHeader";
import Button from "../../components/ui/Button";
import { FaGraduationCap, FaSave, FaSync } from 'react-icons/fa';
import { useNilai, FilterSection, NilaiTable } from '../../features/guru/nilai';

export default function Nilai() {
  // Menggunakan custom hook untuk semua business logic
  const {
    // Filter state
    selectedKelas,
    selectedMapel,
    kelasList,
    mapelList,
    handleKelasChange,
    handleMapelChange,

    // Data state
    nilaiData,
    isLoading,
    isSaving,
    changedCells,

    // Handlers
    handleCellChange,
    handleSaveAll,

    // Calculations
    calculateRataFormatif,
    calculateRataSumatifLM,
    calculateNilaiAkhir,
    getGrade
  } = useNilai();

  const showTable = selectedKelas && selectedMapel && !isLoading;

  return (
    <>
      <ContentWrapper>
        <div className="space-y-6">
          {/* Page Header */}
          <PageHeader
            icon={<FaGraduationCap />}
            title="Input Nilai Siswa"
            description="Kelola dan input nilai siswa"
          />
        </div>
      </ContentWrapper>

      {/* Filter Section */}
      <div className="mt-6">
        <ContentWrapper>
          <FilterSection
            selectedKelas={selectedKelas}
            selectedMapel={selectedMapel}
            kelasList={kelasList}
            mapelList={mapelList}
            onKelasChange={handleKelasChange}
            onMapelChange={handleMapelChange}
            isLoading={isLoading}
          />
        </ContentWrapper>
      </div>

      {/* Action Button & Status */}
      {showTable && (
        <div className="mt-6">
          <ContentWrapper>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              {/* Status Info */}
              <div className="flex items-center gap-3">
                {isSaving ? (
                  <>
                    <FaSync className="w-5 h-5 text-blue-600 animate-spin" />
                    <span className="text-sm font-medium text-blue-600">Menyimpan perubahan...</span>
                  </>
                ) : changedCells.size > 0 ? (
                  <>
                    <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-gray-700">
                      {changedCells.size} perubahan belum tersimpan
                    </span>
                  </>
                ) : (
                  <>
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-medium text-gray-600">
                      Semua perubahan tersimpan
                    </span>
                  </>
                )}
              </div>

              {/* Save Button */}
              <Button
                variant="primary"
                icon={<FaSave />}
                onClick={handleSaveAll}
                disabled={isSaving || isLoading || nilaiData.length === 0}
                size="sm"
              >
                {isSaving ? 'Menyimpan...' : 'Simpan Semua Nilai'}
              </Button>
            </div>
          </ContentWrapper>
        </div>
      )}

      {/* Table Section */}
      <div className="mt-6">
        <ContentWrapper>
          {isLoading ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12">
              <div className="flex flex-col items-center justify-center gap-4">
                <FaSync className="w-8 h-8 text-blue-600 animate-spin" />
                <p className="text-gray-600 font-medium">Memuat data nilai...</p>
              </div>
            </div>
          ) : (
            <NilaiTable
              nilaiData={nilaiData}
              onCellChange={handleCellChange}
              calculateRataFormatif={calculateRataFormatif}
              calculateRataSumatifLM={calculateRataSumatifLM}
              calculateNilaiAkhir={calculateNilaiAkhir}
              getGrade={getGrade}
            />
          )}
        </ContentWrapper>
      </div>

    </>
  );
}
