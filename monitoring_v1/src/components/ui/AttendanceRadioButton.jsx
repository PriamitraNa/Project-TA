export default function AttendanceRadioButton({ studentId, status, currentStatus, setStatus }) {
    const isSelected = currentStatus === status;
    
    // Base styles
    let styles = 'border-2';
  
    // Define styles for each status
    const statusStyles = {
      Hadir: { selected: 'bg-emerald-500 border-emerald-500 text-white', unselected: 'bg-emerald-50 border-emerald-300 text-emerald-700' },
      Sakit: { selected: 'bg-yellow-500 border-yellow-500 text-white', unselected: 'bg-yellow-50 border-yellow-300 text-yellow-700' },
      Izin: { selected: 'bg-blue-500 border-blue-500 text-white', unselected: 'bg-blue-50 border-blue-300 text-blue-700' },
      Alpha: { selected: 'bg-red-500 border-red-500 text-white', unselected: 'bg-red-50 border-red-300 text-red-700' },
    };
  
    styles += isSelected ? ` ${statusStyles[status].selected}` : ` ${statusStyles[status].unselected}`;
  
    return (
      <button
        onClick={() => setStatus(studentId, status)}
        className={`w-8 h-8 flex items-center justify-center text-sm font-bold rounded-full transition-all duration-200 hover:opacity-80 ${styles}`}
      >
        {status.charAt(0)}
      </button>
    );
  };