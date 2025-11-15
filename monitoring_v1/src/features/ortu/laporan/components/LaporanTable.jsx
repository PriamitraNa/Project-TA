import ContentWrapper from '../../../../components/ui/ContentWrapper'
import { FaBook } from 'react-icons/fa'
import GradeInfo from './GradeInfo'

export default function LaporanTable({
  data,
  tahunAjaranOptions,
  selectedTahun,
  semesterOptions,
  selectedSemester,
  siswaInfo,
  isLoading,
  getPredikatBadge,
}) {
  const tahunLabel = tahunAjaranOptions.find((opt) => opt.value === selectedTahun)?.label
  const semesterLabel = semesterOptions.find((opt) => opt.value === selectedSemester)?.label

  return (
    <ContentWrapper>
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Detail Nilai Mata Pelajaran</h3>
        <p className="text-sm text-gray-600 mt-1">
          {tahunLabel || 'Loading...'} - {semesterLabel}
        </p>
        {siswaInfo && (
          <p className="text-xs text-gray-500 mt-1">
            {siswaInfo.siswa_nama} ({siswaInfo.nisn}) - Kelas {siswaInfo.kelas_nama}
          </p>
        )}
      </div>

      {isLoading ? (
        <div className="text-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4" />
          <p className="text-gray-500 font-medium">Memuat data laporan...</p>
        </div>
      ) : data.length === 0 ? (
        <div className="text-center py-16">
          <FaBook className="mx-auto text-5xl text-gray-300 mb-3" />
          <p className="text-gray-500 font-medium">Belum ada data laporan</p>
          <p className="text-gray-400 text-sm mt-1">
            Nilai belum tersedia untuk periode ini atau silakan pilih tahun ajaran dan semester lain
          </p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200 bg-gray-50">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 w-16">
                    No
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Mata Pelajaran
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                    Nilai Akhir
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                    Predikat
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.map((item, index) => {
                  // Support both API response format and mock data format
                  const mapelName = item.nama_mapel || item.mapel
                  const nilaiAkhir = item.nilai_akhir
                  const predikat = calculatePredikat(nilaiAkhir)

                  return (
                    <tr
                      key={item.nilai_id || item.id || index}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-4 text-sm text-gray-600">{index + 1}</td>
                      <td className="px-4 py-4">
                        <span className="font-medium text-gray-900">{mapelName}</span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className="text-gray-900">{nilaiAkhir}</span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex justify-center">
                          <span
                            className={`px-4 py-1.5 rounded-full text-sm font-bold ${getPredikatBadge(
                              predikat
                            )}`}
                          >
                            {predikat}
                          </span>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <GradeInfo />
        </>
      )}
    </ContentWrapper>
  )
}

// Helper function to calculate predikat based on nilai_akhir
// Matches guru's grading system: A >= 85, B >= 70, C >= 55, D < 55
function calculatePredikat(nilaiAkhir) {
  if (nilaiAkhir == null) return '-'
  if (nilaiAkhir >= 85) return 'A'
  if (nilaiAkhir >= 70) return 'B'
  if (nilaiAkhir >= 55) return 'C'
  return 'D'
}
