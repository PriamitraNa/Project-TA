/**
 * Mock Data untuk Development
 * Gunakan ini jika backend belum siap
 */

export const mockAbsensiData = [
  // Oktober 2025
  { tanggal: '2025-10-01', status: 'hadir', keterangan: null },
  { tanggal: '2025-10-02', status: 'hadir', keterangan: null },
  { tanggal: '2025-10-03', status: 'sakit', keterangan: 'Demam tinggi' },
  { tanggal: '2025-10-04', status: 'hadir', keterangan: null },
  { tanggal: '2025-10-06', status: 'hadir', keterangan: null },
  { tanggal: '2025-10-07', status: 'izin', keterangan: 'Acara keluarga' },
  { tanggal: '2025-10-08', status: 'hadir', keterangan: null },
  { tanggal: '2025-10-09', status: 'hadir', keterangan: null },
  { tanggal: '2025-10-10', status: 'hadir', keterangan: null },
  { tanggal: '2025-10-13', status: 'hadir', keterangan: null },
  { tanggal: '2025-10-14', status: 'hadir', keterangan: null },
  { tanggal: '2025-10-15', status: 'alpha', keterangan: null },
  { tanggal: '2025-10-16', status: 'hadir', keterangan: null },
  { tanggal: '2025-10-17', status: 'hadir', keterangan: null },
  { tanggal: '2025-10-20', status: 'hadir', keterangan: null },
  { tanggal: '2025-10-21', status: 'hadir', keterangan: null },
  { tanggal: '2025-10-22', status: 'hadir', keterangan: null },
  { tanggal: '2025-10-23', status: 'hadir', keterangan: null },
  { tanggal: '2025-10-24', status: 'sakit', keterangan: 'Flu' },
  { tanggal: '2025-10-27', status: 'hadir', keterangan: null },
  { tanggal: '2025-10-28', status: 'hadir', keterangan: null },
  { tanggal: '2025-10-29', status: 'hadir', keterangan: null },
  { tanggal: '2025-10-30', status: 'hadir', keterangan: null },
  { tanggal: '2025-10-31', status: 'hadir', keterangan: null },
]

export const mockSummary = {
  total_hadir: 19,
  total_sakit: 2,
  total_izin: 1,
  total_alpha: 1,
  total_hari: 23,
  persentase_hadir: 82.61,
}

/**
 * Mock function untuk AbsensiAnakService
 * Replace dengan actual service calls
 */
export const mockAbsensiService = {
  getAbsensi: async (startDate, endDate) => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    return {
      status: 'success',
      data: {
        absensi: mockAbsensiData.filter((item) => {
          const date = new Date(item.tanggal)
          const start = new Date(startDate)
          const end = new Date(endDate)
          return date >= start && date <= end
        }),
        summary: mockSummary,
      },
    }
  },

  getAbsensiBulan: async (bulan, tahun) => {
    await new Promise((resolve) => setTimeout(resolve, 300))
    return {
      status: 'success',
      data: {
        summary: mockSummary,
      },
    }
  },

  getAbsensiHariIni: async () => {
    await new Promise((resolve) => setTimeout(resolve, 200))
    return {
      status: 'success',
      data: {
        tanggal: '2025-10-31',
        status: 'hadir',
        keterangan: null,
      },
    }
  },
}
