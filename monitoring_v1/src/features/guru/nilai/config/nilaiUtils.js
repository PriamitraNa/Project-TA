// Utility functions untuk nilai

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

