import ContentWrapper from '../../../../components/ui/ContentWrapper';
import DataTable from '../../../../components/ui/DataTable';
import Button from '../../../../components/ui/Button';
import { FaClipboardList, FaCheck, FaUsers } from 'react-icons/fa';
import SummaryCards from './SummaryCards';
import StatusButtons from './StatusButtons';
import toast from 'react-hot-toast';

/**
 * InputAbsensiSection Component
 * Section for inputting daily attendance
 */
export default function InputAbsensiSection({
  kelasList,
  selectedKelas,
  selectedDate,
  setSelectedDate,
  siswaData,
  summary,
  isLoading,
  isSaving,
  handleStatusChange,
  handleMarkAllPresent,
  handleSaveAbsensi,
  minDate,
  maxDate
}) {
  // Columns for input table
  const inputColumns = [
    { key: 'no', label: 'No', width: '60px' },
    { key: 'nisn', label: 'NISN', width: '120px' },
    { key: 'nama_lengkap', label: 'Nama Siswa' },
    { key: 'status', label: 'Status Kehadiran', width: '220px' },
  ];

  // Table data for input
  const inputTableData = siswaData.map((siswa, index) => ({
    ...siswa,
    no: index + 1,
    status: (
      <StatusButtons
        selectedStatus={siswa.status}
        onChange={(status) => handleStatusChange(siswa.id, status)}
      />
    )
  }));

  return (
    <>
      {/* Summary Cards */}
      <ContentWrapper>
        <SummaryCards type="input" data={summary} />
      </ContentWrapper>

      {/* Input Form */}
      <ContentWrapper>
        <div className="space-y-4">
          {/* Filter & Actions */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="space-y-2 md:space-y-0 md:flex md:items-center md:gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Kelas:
                </label>
                <div className="text-sm font-semibold text-gray-900">
                  {Array.isArray(kelasList) ? kelasList.find(k => k.kelas_id === selectedKelas)?.label || 'Loading...' : 'Loading...'}
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Pilih Tanggal:
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => {
                    const newDate = e.target.value;
                    console.log('📅 Date onChange:', newDate, 'Min:', minDate, 'Max:', maxDate);
                    
                    // Immediate validation on change
                    if (minDate && newDate < minDate) {
                      console.log('⚠️ Date below minimum on change, blocking');
                      // Don't show toast - user will see it's blocked by datepicker
                      return; // Don't update state
                    }
                    if (maxDate && newDate > maxDate) {
                      console.log('⚠️ Date above maximum on change, blocking');
                      // Don't show toast - user will see it's blocked by datepicker
                      return; // Don't update state
                    }
                    
                    setSelectedDate(newDate);
                  }}
                  onBlur={(e) => {
                    // Extra validation on blur (in case user manually typed)
                    const currentDate = e.target.value;
                    if (minDate && currentDate < minDate) {
                      console.log('⚠️ Date below minimum on blur, correcting to:', minDate);
                      // Silent correction - don't show toast
                      setSelectedDate(minDate);
                    } else if (maxDate && currentDate > maxDate) {
                      console.log('⚠️ Date above maximum on blur, correcting to:', maxDate);
                      // Silent correction - don't show toast
                      setSelectedDate(maxDate);
                    }
                  }}
                  min={minDate || undefined}
                  max={maxDate || undefined}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                icon={<FaUsers />}
                onClick={handleMarkAllPresent}
              >
                Tandai Semua Hadir
              </Button>
              <Button
                variant="primary"
                size="sm"
                icon={<FaCheck />}
                onClick={handleSaveAbsensi}
                loading={isSaving}
                disabled={isSaving || isLoading}
              >
                Simpan Absensi
              </Button>
            </div>
          </div>

          {/* Table */}
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <FaClipboardList className="text-emerald-600 text-lg" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900">
                  Daftar Siswa {Array.isArray(kelasList) ? kelasList.find(k => k.kelas_id === selectedKelas)?.nama_kelas || '' : ''}
                </h3>
                <p className="text-sm text-gray-600">
                  Tanggal: {new Date(selectedDate).toLocaleDateString('id-ID', { 
                    day: 'numeric', 
                    month: 'long', 
                    year: 'numeric' 
                  })}
                </p>
              </div>
            </div>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-gray-500">Memuat data siswa...</div>
              </div>
            ) : (
              <DataTable
                columns={inputColumns}
                data={inputTableData}
              />
            )}
          </div>
        </div>
      </ContentWrapper>
    </>
  );
}

