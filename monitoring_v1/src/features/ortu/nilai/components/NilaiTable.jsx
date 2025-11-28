import { FaBook, FaSpinner } from 'react-icons/fa6'
import {
  getColorClass,
  getGradeColor,
  formatNumber,
  calculateRataFormatif,
  calculateRataSumatifLM,
  calculateNilaiAkhir,
  getGrade,
} from '../config/nilaiConfig'

export default function NilaiTable({ data, isLoading }) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-white rounded-lg border border-slate-200">
        <FaSpinner className="w-8 h-8 text-emerald-500 animate-spin mb-3" />
        <p className="text-slate-500 text-sm">Memuat data nilai...</p>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-white rounded-lg border border-slate-200">
        <FaBook className="w-12 h-12 text-slate-300 mb-3" />
        <p className="text-slate-500 font-medium">Belum Ada Data Nilai</p>
        <p className="text-slate-400 text-sm mt-1">
          Pilih tahun ajaran dan semester untuk melihat nilai
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 -mx-4 md:mx-0">
      <div className="inline-block min-w-full align-middle">
        <table
          className="min-w-full divide-y divide-gray-200"
          style={{ borderCollapse: 'separate', borderSpacing: 0 }}
        >
          {/* Table Header - 3 levels */}
          <thead>
            {/* Level 1: Main Groups */}
            <tr className="bg-gradient-to-r from-slate-600 to-slate-700 text-white">
              <th
                rowSpan="3"
                className="hidden md:table-cell sticky left-0 z-20 bg-gradient-to-r from-slate-50 to-slate-100 px-2 md:px-3 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider border-r-2 border-gray-300"
                style={{ minWidth: '40px', width: '40px' }}
              >
                No
              </th>
              <th
                rowSpan="3"
                className="sticky z-20 bg-gradient-to-r from-slate-50 to-slate-100 px-2 md:px-3 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-r-2 border-gray-300 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]"
                style={{ left: '0', minWidth: '140px', maxWidth: '200px' }}
              >
                Mata Pelajaran
              </th>
              <th
                colSpan="5"
                className="px-4 py-3 text-center text-xs font-bold uppercase border-r-2 border-white"
              >
                Formatif
              </th>
              <th
                colSpan="5"
                className="px-4 py-3 text-center text-xs font-bold uppercase border-r-2 border-white"
              >
                Sumatif Lingkup Materi
              </th>
              <th
                rowSpan="3"
                className="px-3 py-3 text-center text-xs font-bold uppercase border-r border-white"
                style={{ minWidth: '70px' }}
              >
                UTS
              </th>
              <th
                rowSpan="3"
                className="px-3 py-3 text-center text-xs font-bold uppercase border-r border-white"
                style={{ minWidth: '70px' }}
              >
                UAS
              </th>
              <th
                rowSpan="3"
                className="px-3 py-3 text-center text-xs font-bold uppercase border-r border-white"
                style={{ minWidth: '90px' }}
              >
                Nilai Akhir
              </th>
              <th
                rowSpan="3"
                className="px-3 py-3 text-center text-xs font-bold uppercase"
                style={{ minWidth: '70px' }}
              >
                Grade
              </th>
            </tr>

            {/* Level 2: LM Groups */}
            <tr className="bg-gradient-to-r from-slate-500 to-slate-600 text-white">
              {/* Formatif LM Groups */}
              {['LM 1', 'LM 2', 'LM 3', 'LM 4', 'LM 5'].map((lm) => (
                <th
                  key={`formatif-${lm}`}
                  className="px-2 py-2 text-center text-xs font-semibold border-r border-white"
                  style={{ minWidth: '160px' }}
                >
                  {lm}
                </th>
              ))}
              {/* Sumatif LM Groups - rowSpan 2 karena tidak ada level 3 */}
              {['LM 1', 'LM 2', 'LM 3', 'LM 4', 'LM 5'].map((lm, index) => (
                <th
                  key={`sumatif-${lm}`}
                  rowSpan="2"
                  className={`px-2 py-2 text-center text-xs font-semibold ${
                    index === 4 ? 'border-r-2' : 'border-r'
                  } border-white`}
                  style={{ minWidth: '70px' }}
                >
                  {lm}
                </th>
              ))}
            </tr>

            {/* Level 3: TP Headers only for Formatif */}
            <tr className="bg-gradient-to-r from-slate-400 to-slate-500 text-white">
              {/* Formatif TPs */}
              {[...Array(5)].map((_, lmIndex) => (
                <th
                  key={`formatif-lm${lmIndex}`}
                  className="py-2 text-center text-xs font-medium border-r border-white"
                  style={{ minWidth: '220px' }}
                >
                  <div className="flex justify-center">
                    {['TP1', 'TP2', 'TP3', 'TP4'].map((tp) => (
                      <div key={tp} className="w-[55px] text-center">
                        {tp}
                      </div>
                    ))}
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          {/* Table Body */}
          <tbody>
            {data.map((row, rowIndex) => {
              const rataFormatif = calculateRataFormatif(row)
              const rataSumatifLM = calculateRataSumatifLM(row)
              const nilaiAkhir = calculateNilaiAkhir(rataFormatif, rataSumatifLM, row.uts, row.uas)
              const grade = getGrade(nilaiAkhir)

              return (
                <tr key={row.id} className="group hover:bg-gray-50 border-b border-gray-100">
                  {/* No - Hidden on mobile */}
                  <td
                    className="hidden md:table-cell sticky left-0 z-10 bg-white group-hover:bg-gray-50 px-2 md:px-3 py-2 md:py-3 text-center text-xs md:text-sm text-gray-600 font-medium border-r-2 border-gray-300 transition-colors"
                    style={{ minWidth: '40px', width: '40px' }}
                  >
                    {rowIndex + 1}
                  </td>

                  {/* Mata Pelajaran - Sticky */}
                  <td
                    className="sticky z-10 bg-white group-hover:bg-gray-50 px-2 md:px-3 py-2 text-xs font-medium text-gray-900 border-r-2 border-gray-300 transition-colors shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]"
                    style={{ left: '0', minWidth: '140px', maxWidth: '200px' }}
                  >
                    <div
                      className="whitespace-normal break-words leading-snug"
                      title={row.nama_mapel}
                    >
                      {row.nama_mapel}
                    </div>
                  </td>

                  {/* Formatif - LM TPs (READ-ONLY) */}
                  {['lm1', 'lm2', 'lm3', 'lm4', 'lm5'].map((lm) => (
                    <td
                      key={`${lm}-tps`}
                      className="border-r border-gray-200"
                      style={{ minWidth: '220px' }}
                    >
                      <div className="flex">
                        {['tp1', 'tp2', 'tp3', 'tp4'].map((tp) => {
                          const value = row[`${lm}_${tp}`]
                          return (
                            <div
                              key={`${lm}_${tp}`}
                              className={`w-[55px] px-2 py-2 text-center text-xs md:text-sm ${getColorClass(
                                value
                              )}`}
                            >
                              {formatNumber(value)}
                            </div>
                          )
                        })}
                      </div>
                    </td>
                  ))}

                  {/* Sumatif LM - Ulangan (READ-ONLY) */}
                  {['lm1', 'lm2', 'lm3', 'lm4', 'lm5'].map((lm, index) => {
                    const value = row[`${lm}_ulangan`]
                    return (
                      <td
                        key={`${lm}-ulangan`}
                        className={`px-2 py-2 text-center text-xs md:text-sm ${getColorClass(
                          value
                        )} ${index === 4 ? 'border-r-2' : 'border-r'} border-gray-200`}
                        style={{ minWidth: '70px' }}
                      >
                        {formatNumber(value)}
                      </td>
                    )
                  })}

                  {/* UTS (READ-ONLY) */}
                  <td
                    className={`px-2 py-2 text-center text-xs md:text-sm ${getColorClass(
                      row.uts
                    )} border-r border-gray-200`}
                    style={{ minWidth: '70px' }}
                  >
                    {formatNumber(row.uts)}
                  </td>

                  {/* UAS (READ-ONLY) */}
                  <td
                    className={`px-2 py-2 text-center text-xs md:text-sm ${getColorClass(
                      row.uas
                    )} border-r border-gray-200`}
                    style={{ minWidth: '70px' }}
                  >
                    {formatNumber(row.uas)}
                  </td>

                  {/* Nilai Akhir */}
                  <td
                    className="px-2 py-3 text-center border-r border-gray-200"
                    style={{ minWidth: '90px' }}
                  >
                    <span
                      className={`font-semibold text-xs md:text-sm ${getColorClass(nilaiAkhir)}`}
                    >
                      {formatNumber(nilaiAkhir)}
                    </span>
                  </td>

                  {/* Grade */}
                  <td className="px-2 py-3 text-center" style={{ minWidth: '70px' }}>
                    <span
                      className={`inline-flex items-center justify-center px-2 py-1 rounded-full text-xs font-bold border ${getGradeColor(
                        grade
                      )}`}
                    >
                      {grade}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
