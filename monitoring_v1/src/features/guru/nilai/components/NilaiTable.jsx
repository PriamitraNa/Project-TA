import React from 'react';
import EditableCell from '../../../../components/ui/EditableCell';
import { getColorClass, getGradeColor, formatNumber } from '../config';

export default function NilaiTable({
  nilaiData,
  onCellChange,
  calculateRataFormatif,
  calculateRataSumatifLM,
  calculateNilaiAkhir,
  getGrade
}) {
  if (nilaiData.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
        <p className="text-gray-500 text-lg">Pilih kelas dan mata pelajaran untuk menampilkan data nilai</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Table Container dengan horizontal scroll */}
      <div className="overflow-x-auto">
        <table 
          className="w-full text-sm"
          style={{ borderCollapse: 'separate', borderSpacing: 0 }}
        >
          {/* Table Header - 3 levels */}
          <thead>
            {/* Level 1: Main Groups */}
            <tr className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
              <th
                rowSpan="3"
                className="sticky left-0 z-20 bg-gradient-to-r from-blue-50 to-indigo-50 px-2 md:px-3 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider border-r-2 border-gray-300"
                style={{ minWidth: '40px', width: '40px' }}
              >
                <span className="hidden md:inline">No</span>
                <span className="md:hidden">#</span>
              </th>
              <th
                rowSpan="3"
                className="sticky z-20 bg-gradient-to-r from-blue-50 to-indigo-50 px-2 md:px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-r-2 border-gray-300"
                style={{ left: '40px', minWidth: '120px', width: '120px' }}
              >
                <span className="hidden md:inline">Nama Siswa</span>
                <span className="md:hidden">Nama</span>
              </th>
              <th colSpan="5" className="px-4 py-3 text-center text-xs font-bold uppercase border-r-2 border-white">
                Formatif
              </th>
              <th colSpan="5" className="px-4 py-3 text-center text-xs font-bold uppercase border-r-2 border-white">
                Sumatif Lingkup Materi
              </th>
              <th rowSpan="3" className="px-3 py-3 text-center text-xs font-bold uppercase border-r border-white" style={{ minWidth: '70px' }}>
                UTS
              </th>
              <th rowSpan="3" className="px-3 py-3 text-center text-xs font-bold uppercase border-r border-white" style={{ minWidth: '70px' }}>
                UAS
              </th>
              <th rowSpan="3" className="px-3 py-3 text-center text-xs font-bold uppercase border-r border-white" style={{ minWidth: '90px' }}>
                Nilai Akhir
              </th>
              <th rowSpan="3" className="px-3 py-3 text-center text-xs font-bold uppercase" style={{ minWidth: '70px' }}>
                Grade
              </th>
            </tr>

            {/* Level 2: LM Groups */}
            <tr className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
              {/* Formatif LM Groups */}
              {['LM 1', 'LM 2', 'LM 3', 'LM 4', 'LM 5'].map((lm) => (
                <th key={`formatif-${lm}`} className="px-2 py-2 text-center text-xs font-semibold border-r border-white" style={{ minWidth: '160px' }}>
                  {lm}
                </th>
              ))}
              {/* Sumatif LM Groups - rowSpan 2 karena tidak ada level 3 */}
              {['LM 1', 'LM 2', 'LM 3', 'LM 4', 'LM 5'].map((lm, index) => (
                <th 
                  key={`sumatif-${lm}`} 
                  rowSpan="2"
                  className={`px-2 py-2 text-center text-xs font-semibold ${index === 4 ? 'border-r-2' : 'border-r'} border-white`}
                  style={{ minWidth: '70px' }}
                >
                  {lm}
                </th>
              ))}
            </tr>

            {/* Level 3: TP Headers only */}
            <tr className="bg-gradient-to-r from-blue-400 to-indigo-400 text-white">
              {/* Formatif TPs */}
              {[...Array(5)].map((_, lmIndex) => (
                <th key={`formatif-lm${lmIndex}`} className="py-2 text-center text-xs font-medium border-r border-white" style={{ minWidth: '220px' }}>
                  <div className="flex justify-center">
                    {['TP1', 'TP2', 'TP3', 'TP4'].map(tp => (
                      <div key={tp} className="w-[55px] text-center">{tp}</div>
                    ))}
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          {/* Table Body */}
          <tbody>
            {nilaiData.map((row, rowIndex) => {
              const rataFormatif = calculateRataFormatif(row);
              const rataSumatifLM = calculateRataSumatifLM(row);
              // Use nilai_akhir from API (auto-calculated by database trigger)
              // Fallback to calculateNilaiAkhir if API doesn't provide it
              const nilaiAkhir = row.nilai_akhir != null 
                ? parseFloat(row.nilai_akhir) 
                : calculateNilaiAkhir(rataFormatif, rataSumatifLM, row.uts, row.uas);
              const grade = getGrade(nilaiAkhir);

              return (
                <tr key={row.id} className="group hover:bg-gray-50 border-b border-gray-100">
                  {/* No - Sticky */}
                  <td 
                    className="sticky left-0 z-10 bg-white group-hover:bg-gray-50 px-2 md:px-3 py-2 md:py-3 text-center text-xs md:text-sm text-gray-600 font-medium border-r-2 border-gray-300 transition-colors"
                    style={{ minWidth: '40px', width: '40px' }}
                  >
                    {rowIndex + 1}
                  </td>

                  {/* Nama Siswa - Sticky */}
                  <td 
                    className="sticky z-10 bg-white group-hover:bg-gray-50 px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm font-medium text-gray-900 border-r-2 border-gray-300 transition-colors"
                    style={{ left: '40px', minWidth: '120px', width: '120px' }}
                  >
                    <div className="truncate" title={row.nama_siswa}>
                      {row.nama_siswa}
                    </div>
                  </td>

                  {/* Formatif - LM1 TPs */}
                  {['lm1', 'lm2', 'lm3', 'lm4', 'lm5'].map((lm) => (
                    <td key={`${lm}-tps`} className="border-r border-gray-200" style={{ minWidth: '220px' }}>
                      <div className="flex">
                        {['tp1', 'tp2', 'tp3', 'tp4'].map((tp) => (
                          <div key={`${lm}_${tp}`} style={{ width: '55px' }}>
                            <EditableCell
                              value={row[`${lm}_${tp}`]}
                              onChange={(value) => onCellChange(row.siswa_id, `${lm}_${tp}`, value)}
                              className={getColorClass(row[`${lm}_${tp}`])}
                            />
                          </div>
                        ))}
                      </div>
                    </td>
                  ))}

                  {/* Sumatif LM - Ulangan */}
                  {['lm1', 'lm2', 'lm3', 'lm4', 'lm5'].map((lm, index) => (
                    <td 
                      key={`${lm}-ulangan`} 
                      className={`${index === 4 ? 'border-r-2' : 'border-r'} border-gray-200`}
                      style={{ minWidth: '70px' }}
                    >
                      <EditableCell
                        value={row[`${lm}_ulangan`]}
                        onChange={(value) => onCellChange(row.siswa_id, `${lm}_ulangan`, value)}
                        className={getColorClass(row[`${lm}_ulangan`])}
                      />
                    </td>
                  ))}

                  {/* UTS */}
                  <td className="border-r border-gray-200" style={{ minWidth: '70px' }}>
                    <EditableCell
                      value={row.uts}
                      onChange={(value) => onCellChange(row.siswa_id, 'uts', value)}
                      className={getColorClass(row.uts)}
                    />
                  </td>

                  {/* UAS */}
                  <td className="border-r border-gray-200" style={{ minWidth: '70px' }}>
                    <EditableCell
                      value={row.uas}
                      onChange={(value) => onCellChange(row.siswa_id, 'uas', value)}
                      className={getColorClass(row.uas)}
                    />
                  </td>

                  {/* Nilai Akhir */}
                  <td className="px-2 py-3 text-center border-r border-gray-200" style={{ minWidth: '90px' }}>
                    <span className={`font-semibold text-xs md:text-sm ${getColorClass(nilaiAkhir)}`}>
                      {formatNumber(nilaiAkhir)}
                    </span>
                  </td>

                  {/* Grade */}
                  <td className="px-2 py-3 text-center" style={{ minWidth: '70px' }}>
                    <span className={`inline-flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-lg font-bold text-base md:text-lg border-2 ${getGradeColor(grade)}`}>
                      {grade}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

    </div>
  );
}

