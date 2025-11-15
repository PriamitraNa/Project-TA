// src/features/guru/absensi/components/SemesterBelumDimulaiCard.jsx

import ContentWrapper from '../../../../components/ui/ContentWrapper';
import { FaInfoCircle, FaCalendarAlt, FaBook } from 'react-icons/fa';

export default function SemesterBelumDimulaiCard({ 
  tahunAjaran, 
  semester, 
  tanggalMulai,
  tanggalSelesai,
  today,
  semesterStatus,
  infoMessage
}) {
  // Format date to DD/MM/YYYY for display
  const formatDisplayDate = (dateStr) => {
    if (!dateStr) return '-';
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  };

  // Determine card styling based on status
  const isNotStarted = semesterStatus === 'not_started';
  const isEnded = semesterStatus === 'ended';
  
  const cardStyles = isEnded
    ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-yellow-500'
    : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500';
  
  const iconBg = isEnded ? 'bg-yellow-500' : 'bg-blue-500';
  const iconColor = isEnded ? 'text-yellow-500' : 'text-blue-500';
  const borderColor = isEnded ? 'border-yellow-200' : 'border-blue-200';
  const noteColor = isEnded ? 'bg-yellow-100 border-yellow-300 text-yellow-800' : 'bg-blue-100 border-blue-300 text-blue-800';
  
  const title = isNotStarted 
    ? 'Semester Belum Dimulai'
    : 'Semester Telah Berakhir';
  
  const description = infoMessage || (isNotStarted
    ? 'Halaman absensi belum dapat diakses karena periode semester belum dimulai.'
    : 'Semester telah berakhir. Anda masih bisa input absensi untuk tanggal dalam periode semester.');

  return (
    <ContentWrapper>
      <div className={`${cardStyles} p-6 rounded-lg`}>
        {/* Header */}
        <div className="flex items-start gap-4 mb-6">
          <div className="flex-shrink-0">
            <div className={`w-12 h-12 ${iconBg} rounded-full flex items-center justify-center`}>
              <FaInfoCircle className="text-white text-2xl" />
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              {title}
            </h3>
            <p className="text-gray-600">
              {description}
            </p>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          {/* Semester Info */}
          <div className={`bg-white rounded-lg p-4 border ${borderColor}`}>
            <div className="flex items-center gap-3 mb-2">
              <FaBook className={`${iconColor} text-lg`} />
              <span className="text-sm font-semibold text-gray-600">Semester Aktif</span>
            </div>
            <div className="text-lg font-bold text-gray-800">
              {semester || '-'} {tahunAjaran || '-'}
            </div>
          </div>

          {/* Date Info */}
          <div className={`bg-white rounded-lg p-4 border ${borderColor}`}>
            <div className="flex items-center gap-3 mb-2">
              <FaCalendarAlt className={`${iconColor} text-lg`} />
              <span className="text-sm font-semibold text-gray-600">
                {isNotStarted ? 'Tanggal Mulai' : 'Tanggal Berakhir'}
              </span>
            </div>
            <div className="text-lg font-bold text-gray-800">
              {formatDisplayDate(isNotStarted ? tanggalMulai : tanggalSelesai)}
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className={`bg-white rounded-lg p-4 border ${borderColor}`}>
          <div className="space-y-3">
            {/* Current Date */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span className="text-sm font-medium text-gray-700">Tanggal Hari Ini</span>
              </div>
              <span className="text-sm font-bold text-gray-800">
                {formatDisplayDate(today)}
              </span>
            </div>

            {/* Start Date */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium text-gray-700">Semester Dimulai</span>
              </div>
              <span className="text-sm font-bold text-gray-800">
                {formatDisplayDate(tanggalMulai)}
              </span>
            </div>

            {/* End Date */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-sm font-medium text-gray-700">Semester Berakhir</span>
              </div>
              <span className="text-sm font-bold text-gray-800">
                {formatDisplayDate(tanggalSelesai)}
              </span>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className={`mt-6 p-4 ${noteColor} border rounded-lg`}>
          <p className="text-sm">
            <strong>Catatan:</strong> {isNotStarted 
              ? `Form input absensi dan rekap absensi akan otomatis tersedia ketika tanggal mulai semester telah tiba (${formatDisplayDate(tanggalMulai)}).`
              : `Anda masih bisa input absensi untuk tanggal dalam periode semester (${formatDisplayDate(tanggalMulai)} - ${formatDisplayDate(tanggalSelesai)}).`
            }
          </p>
        </div>
      </div>
    </ContentWrapper>
  );
}

