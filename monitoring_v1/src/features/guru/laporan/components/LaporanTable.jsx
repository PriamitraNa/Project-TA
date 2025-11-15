import { getGradeColor } from '../config';

export default function LaporanTable({
  laporanData,
  kelasOptions,
  mapelOptions,
  selectedKelas,
  selectedMapel,
}) {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <h3 className="text-lg font-bold text-gray-900">
          Pratinjau Laporan Nilai Siswa
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          Kelas {kelasOptions.find(k => k.value === selectedKelas)?.label} • 
          Mata Pelajaran {mapelOptions.find(m => m.value === selectedMapel)?.label}
        </p>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-6 py-4 text-center text-sm font-semibold tracking-wide text-gray-700">No</th>
                <th className="px-6 py-4 text-left text-sm font-semibold tracking-wide text-gray-700">Nama Siswa</th>
                <th className="px-6 py-4 text-center text-sm font-semibold tracking-wide text-gray-700">NISN</th>
                <th className="px-6 py-4 text-center text-sm font-semibold tracking-wide text-gray-700">Formatif</th>
                <th className="px-6 py-4 text-center text-sm font-semibold tracking-wide text-gray-700">Sumatif Lingkup Materi</th>
                <th className="px-6 py-4 text-center text-sm font-semibold tracking-wide text-gray-700">UTS</th>
                <th className="px-6 py-4 text-center text-sm font-semibold tracking-wide text-gray-700">UAS</th>
                <th className="px-6 py-4 text-center text-sm font-semibold tracking-wide text-gray-700">Nilai Akhir</th>
                <th className="px-6 py-4 text-center text-sm font-semibold tracking-wide text-gray-700">Grade</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {laporanData.map((row, index) => (
                <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-center text-gray-600">{index + 1}</td>
                  <td className="px-6 py-4 text-gray-900">{row.nama}</td>
                  <td className="px-6 py-4 text-center text-gray-700 font-mono text-base">{row.nisn}</td>
                  <td className="px-6 py-4 text-center text-gray-800 text-base">
                    {row.rata_formatif ?? 0}
                  </td>
                  <td className="px-6 py-4 text-center text-gray-800 text-base">
                    {row.rata_sumatif_lm ?? 0}
                  </td>
                  <td className="px-6 py-4 text-center text-gray-800 text-base">
                    {row.uts ?? 0}
                  </td>
                  <td className="px-6 py-4 text-center text-gray-800 text-base">
                    {row.uas ?? 0}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-slate-900 text-lg">
                      {row.nilai_akhir ?? 0}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-block px-3 py-1 rounded-md text-sm font-semibold ${getGradeColor(row.grade)}`}>
                      {row.grade}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

