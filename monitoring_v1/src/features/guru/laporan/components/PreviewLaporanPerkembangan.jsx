import { getGradeColor } from '../config';

export default function PreviewLaporanPerkembangan({ laporanData, periodeInfo }) {
  if (!laporanData) return null;

  const { siswa, nilai_akademik, absensi, catatan_perkembangan } = laporanData;

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold mb-2">Laporan Perkembangan Siswa</h2>
        <p className="text-blue-100">
          {periodeInfo?.tahun_ajaran} • Semester {periodeInfo?.semester}
        </p>
      </div>

      {/* 1. Data Diri Siswa */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">
          Data Diri Siswa
        </h3>
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
            <label className="text-sm text-gray-600">Kelas</label>
            <p className="text-base font-semibold text-gray-900">{siswa.kelas}</p>
          </div>
          <div>
            <label className="text-sm text-gray-600">Nama Orangtua/Wali</label>
            <p className="text-base font-semibold text-gray-900">{siswa.nama_ortu}</p>
          </div>
        </div>
      </div>

      {/* 2. Tabel Nilai Akademik */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b">
          <h3 className="text-lg font-bold text-gray-900">Nilai Akademik</h3>
          <p className="text-sm text-gray-600 mt-1">
            Rekapitulasi nilai akhir dari semua mata pelajaran
          </p>
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
              {nilai_akademik && nilai_akademik.length > 0 ? (
                nilai_akademik.map((nilai, index) => (
                  <tr key={nilai.mapel_id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-center text-gray-600">{index + 1}</td>
                    <td className="px-6 py-4 text-gray-900 font-medium">{nilai.nama_mapel}</td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-lg font-bold text-blue-600">
                        {nilai.nilai_akhir ?? '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-block px-3 py-1 rounded-md text-sm font-semibold ${getGradeColor(nilai.grade)}`}>
                        {nilai.grade ?? '-'}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                    Belum ada data nilai
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. Rekapitulasi Absensi */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">
          Rekapitulasi Absensi
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
            <p className="text-sm text-green-700 font-medium">Hadir</p>
            <p className="text-3xl font-bold text-green-600 mt-2">
              {absensi?.hadir ?? 0}
            </p>
            <p className="text-xs text-green-600 mt-1">hari</p>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
            <p className="text-sm text-yellow-700 font-medium">Sakit</p>
            <p className="text-3xl font-bold text-yellow-600 mt-2">
              {absensi?.sakit ?? 0}
            </p>
            <p className="text-xs text-yellow-600 mt-1">hari</p>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
            <p className="text-sm text-blue-700 font-medium">Izin</p>
            <p className="text-3xl font-bold text-blue-600 mt-2">
              {absensi?.izin ?? 0}
            </p>
            <p className="text-xs text-blue-600 mt-1">hari</p>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
            <p className="text-sm text-red-700 font-medium">Alpha</p>
            <p className="text-3xl font-bold text-red-600 mt-2">
              {absensi?.alpha ?? 0}
            </p>
            <p className="text-xs text-red-600 mt-1">hari</p>
          </div>
        </div>
      </div>

      {/* 4. Catatan Perkembangan Karakter/Sikap */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">
          Catatan Perkembangan Karakter & Sikap
        </h3>
        {catatan_perkembangan && catatan_perkembangan.length > 0 ? (
          <div className="space-y-3">
            {catatan_perkembangan.map((catatan, index) => (
              <div 
                key={index} 
                className="bg-gray-50 border border-gray-200 rounded-lg p-4"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-sm">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-sm font-semibold text-gray-900">
                        {catatan.guru_nama}
                      </span>
                      <span className="text-xs text-gray-500">•</span>
                      <span className="text-xs text-gray-500">
                        {catatan.jenis}
                      </span>
                      <span className="text-xs text-gray-500">•</span>
                      <span className="text-xs text-gray-500">
                        {catatan.mapel_nama}
                      </span>
                      <span className="text-xs text-gray-500">•</span>
                      <span className="text-xs text-gray-500">
                        {catatan.tanggal}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {catatan.isi_catatan}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 py-8">
            Belum ada catatan perkembangan
          </p>
        )}
      </div>
    </div>
  );
}

