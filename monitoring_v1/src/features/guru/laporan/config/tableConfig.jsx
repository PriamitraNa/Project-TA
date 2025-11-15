/**
 * Table Configuration for Laporan Nilai
 */

export const getGradeColor = (grade) => {
  switch (grade) {
    case 'A':
      return 'bg-green-100 text-green-800 border-green-300';
    case 'B':
      return 'bg-blue-100 text-blue-800 border-blue-300';
    case 'C':
      return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    case 'D':
      return 'bg-red-100 text-red-800 border-red-300';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-300';
  }
};

export const columns = [
  {
    key: 'no',
    label: 'No',
    align: 'center',
    width: 'w-16'
  },
  {
    key: 'nama',
    label: 'Nama Siswa',
    align: 'left',
    width: 'w-48'
  },
  {
    key: 'nisn',
    label: 'NISN',
    align: 'center',
    width: 'w-32'
  },
  {
    key: 'rata_formatif',
    label: 'Formatif',
    align: 'center',
    width: 'w-24'
  },
  {
    key: 'rata_sumatif_lm',
    label: 'Sumatif Lingkup Materi',
    align: 'center',
    width: 'w-40'
  },
  {
    key: 'uts',
    label: 'UTS',
    align: 'center',
    width: 'w-24'
  },
  {
    key: 'uas',
    label: 'UAS',
    align: 'center',
    width: 'w-24'
  },
  {
    key: 'nilai_akhir',
    label: 'Nilai Akhir',
    align: 'center',
    width: 'w-28'
  },
  {
    key: 'grade',
    label: 'Grade',
    align: 'center',
    width: 'w-24'
  }
];

