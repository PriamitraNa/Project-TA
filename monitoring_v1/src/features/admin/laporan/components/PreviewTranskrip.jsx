import ContentWrapper from '../../../../components/ui/ContentWrapper'

// Fungsi untuk mendapatkan warna badge berdasarkan grade
const getGradeColor = (grade) => {
  if (!grade) return 'bg-gray-100 text-gray-800'

  const gradeValue = grade.toUpperCase()
  if (gradeValue.startsWith('A')) return 'bg-emerald-100 text-emerald-800'
  if (gradeValue.startsWith('B')) return 'bg-blue-100 text-blue-800'
  if (gradeValue.startsWith('C')) return 'bg-yellow-100 text-yellow-800'
  if (gradeValue.startsWith('D')) return 'bg-orange-100 text-orange-800'
  return 'bg-red-100 text-red-800'
}

export default function PreviewTranskrip({ transkripData }) {
  if (!transkripData) {
    return null
  }

  const { siswa, riwayat_nilai } = transkripData

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold mb-2">Transkrip Nilai Siswa</h2>
        <p className="text-blue-100">Riwayat Lengkap Nilai Akademik</p>
      </div>

      {/* Data Diri Siswa */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">Data Diri Siswa</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-600">Nama Lengkap</label>
            <p className="text-base font-semibold text-gray-900">{siswa.nama}</p>
          </div>
          <div>
            <label className="text-sm text-gray-600">NISN</label>
            <p className="text-base font-semibold text-gray-900">{siswa.nisn}</p>
          </div>
          <div>
            <label className="text-sm text-gray-600">Tempat, Tanggal Lahir</label>
            <p className="text-base font-semibold text-gray-900">
              {siswa.tempat_lahir && siswa.tanggal_lahir
                ? `${siswa.tempat_lahir}, ${new Date(siswa.tanggal_lahir).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}`
                : '-'}
            </p>
          </div>
          <div>
            <label className="text-sm text-gray-600">Kelas Saat Ini</label>
            <p className="text-base font-semibold text-gray-900">{siswa.kelas}</p>
          </div>
          {siswa.nama_ortu && (
            <div className="md:col-span-2">
              <label className="text-sm text-gray-600">Nama Orangtua/Wali</label>
              <p className="text-base font-semibold text-gray-900">{siswa.nama_ortu}</p>
            </div>
          )}
        </div>
      </div>

      {/* Riwayat Nilai per Semester */}
      {riwayat_nilai && riwayat_nilai.length > 0 ? (
        <>
          {riwayat_nilai.map((semester) => (
            <div
              key={semester.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
            >
              <div className="p-6 border-b bg-gradient-to-r from-gray-50 to-gray-100">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      {semester.tahun_ajaran} - Semester {semester.semester}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {semester.nilai.length} Mata Pelajaran
                    </p>
                  </div>
                  {semester.kelas && (
                    <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-md text-sm font-semibold">
                      {semester.kelas}
                    </div>
                  )}
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider w-16">
                        No
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Mata Pelajaran
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider w-32">
                        Nilai Akhir
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider w-24">
                        Grade
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {semester.nilai.map((nilai, idx) => (
                      <tr key={nilai.mapel_id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 text-center text-gray-600">{idx + 1}</td>
                        <td className="px-6 py-4 text-gray-900 font-medium">{nilai.nama_mapel}</td>
                        <td className="px-6 py-4 text-center">
                          <span className="text-lg font-bold text-blue-600">
                            {nilai.nilai_akhir ?? '-'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span
                            className={`inline-block px-3 py-1 rounded-md text-sm font-semibold ${getGradeColor(
                              nilai.grade
                            )}`}
                          >
                            {nilai.grade ?? '-'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Rekapitulasi Absensi per Semester */}
              {semester.absensi && (
                <div className="p-6 border-t bg-gray-50">
                  <h4 className="text-md font-semibold text-gray-900 mb-3">Rekapitulasi Absensi</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                      <p className="text-xs text-green-700 font-medium">Hadir</p>
                      <p className="text-2xl font-bold text-green-600 mt-1">
                        {semester.absensi.hadir ?? 0}
                      </p>
                      <p className="text-xs text-green-600 mt-1">hari</p>
                    </div>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-center">
                      <p className="text-xs text-yellow-700 font-medium">Sakit</p>
                      <p className="text-2xl font-bold text-yellow-600 mt-1">
                        {semester.absensi.sakit ?? 0}
                      </p>
                      <p className="text-xs text-yellow-600 mt-1">hari</p>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
                      <p className="text-xs text-blue-700 font-medium">Izin</p>
                      <p className="text-2xl font-bold text-blue-600 mt-1">
                        {semester.absensi.izin ?? 0}
                      </p>
                      <p className="text-xs text-blue-600 mt-1">hari</p>
                    </div>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
                      <p className="text-xs text-red-700 font-medium">Alpha</p>
                      <p className="text-2xl font-bold text-red-600 mt-1">
                        {semester.absensi.alpha ?? 0}
                      </p>
                      <p className="text-xs text-red-600 mt-1">hari</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </>
      ) : (
        <ContentWrapper>
          <div className="text-center py-12">
            <p className="text-gray-500">Tidak ada riwayat nilai untuk siswa ini.</p>
          </div>
        </ContentWrapper>
      )}
    </div>
  )
}
