// Utility functions untuk nilai (same as guru)

// Get color class based on value
export const getColorClass = (value) => {
  if (value == null || value === '') return 'text-gray-400';
  const numValue = parseFloat(value);
  if (numValue < 70) return 'text-red-600 font-semibold';
  if (numValue < 86) return 'text-yellow-600 font-semibold';
  return 'text-green-600 font-semibold';
};

// Get grade color class
export const getGradeColor = (grade) => {
  if (grade === 'A') return 'bg-green-100 text-green-800 border-green-300';
  if (grade === 'B') return 'bg-blue-100 text-blue-800 border-blue-300';
  if (grade === 'C') return 'bg-yellow-100 text-yellow-800 border-yellow-300';
  if (grade === 'D') return 'bg-red-100 text-red-800 border-red-300';
  return 'bg-gray-100 text-gray-600 border-gray-300';
};

// Format number with 2 decimals
export const formatNumber = (value) => {
  if (value == null || value === '') return '-';
  const numValue = parseFloat(value);
  return isNaN(numValue) ? '-' : numValue.toFixed(2);
};

// Calculate rata-rata formatif (from all LM TPs)
export const calculateRataFormatif = (row) => {
  const formatifValues = [];
  ['lm1', 'lm2', 'lm3', 'lm4', 'lm5'].forEach(lm => {
    ['tp1', 'tp2', 'tp3', 'tp4'].forEach(tp => {
      const value = row[`${lm}_${tp}`];
      if (value != null && value !== '') {
        formatifValues.push(parseFloat(value));
      }
    });
  });
  if (formatifValues.length === 0) return null;
  return formatifValues.reduce((a, b) => a + b, 0) / formatifValues.length;
};

// Calculate rata-rata sumatif LM
export const calculateRataSumatifLM = (row) => {
  const sumatifValues = [];
  ['lm1', 'lm2', 'lm3', 'lm4', 'lm5'].forEach(lm => {
    const value = row[`${lm}_ulangan`];
    if (value != null && value !== '') {
      sumatifValues.push(parseFloat(value));
    }
  });
  if (sumatifValues.length === 0) return null;
  return sumatifValues.reduce((a, b) => a + b, 0) / sumatifValues.length;
};

// Calculate nilai akhir
export const calculateNilaiAkhir = (rataFormatif, rataSumatifLM, uts, uas) => {
  const hasFormatif = rataFormatif != null;
  const hasSumatif = rataSumatifLM != null;
  const hasUTS = uts != null && uts !== '';
  const hasUAS = uas != null && uas !== '';

  if (!hasFormatif && !hasSumatif && !hasUTS && !hasUAS) return null;

  const formatifVal = hasFormatif ? rataFormatif : 0;
  const sumatifVal = hasSumatif ? rataSumatifLM : 0;
  const utsVal = hasUTS ? parseFloat(uts) : 0;
  const uasVal = hasUAS ? parseFloat(uas) : 0;

  return (formatifVal * 0.4) + (sumatifVal * 0.2) + (utsVal * 0.2) + (uasVal * 0.2);
};

// Get grade from nilai akhir
export const getGrade = (nilaiAkhir) => {
  if (nilaiAkhir == null) return '-';
  if (nilaiAkhir >= 86) return 'A';
  if (nilaiAkhir >= 70) return 'B';
  if (nilaiAkhir >= 50) return 'C';
  return 'D';
};
