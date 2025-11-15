/**
 * StatusButtons Component
 * Radio button group untuk status kehadiran (H/S/I/A)
 */
export default function StatusButtons({ selectedStatus, onChange }) {
  const statuses = [
    { value: 'H', label: 'H', color: 'green' },
    { value: 'S', label: 'S', color: 'yellow' },
    { value: 'I', label: 'I', color: 'blue' },
    { value: 'A', label: 'A', color: 'red' }
  ];

  const getButtonClass = (status, isSelected) => {
    const baseClass = 'w-10 h-10 rounded-full font-semibold text-sm transition-all';
    
    if (isSelected) {
      const selectedColors = {
        green: 'bg-green-500 text-white ring-2 ring-green-300',
        yellow: 'bg-yellow-500 text-white ring-2 ring-yellow-300',
        blue: 'bg-blue-500 text-white ring-2 ring-blue-300',
        red: 'bg-red-500 text-white ring-2 ring-red-300'
      };
      return `${baseClass} ${selectedColors[status.color]}`;
    }
    
    return `${baseClass} bg-gray-200 text-gray-600 hover:bg-gray-300`;
  };

  return (
    <div className="flex gap-2">
      {statuses.map(status => (
        <button
          key={status.value}
          onClick={() => onChange(status.value)}
          className={getButtonClass(status, selectedStatus === status.value)}
        >
          {status.label}
        </button>
      ))}
    </div>
  );
}

