import { useState, useEffect } from 'react';
import ContentWrapper from '../../components/ui/ContentWrapper';
import PageHeader from '../../components/ui/PageHeader';
import { FaClipboardList } from 'react-icons/fa';
import { 
  useAbsensi, 
  useRekapAbsensi, 
  useKelasSaya,
  useDateRange,
  InputAbsensiSection,
  RekapAbsensiSection,
  SemesterBelumDimulaiCard
} from '../../features/guru/absensi';

export default function Absensi() {
  // Load kelas data from API
  const { kelasList, isLoading: isLoadingKelas, isWaliKelas, defaultKelasId } = useKelasSaya();

  // Load date range for tahun ajaran aktif
  const { dateRange, isLoading: isLoadingDateRange } = useDateRange();

  // State
  const [activeTab, setActiveTab] = useState('input'); // 'input' atau 'rekap'
  const [selectedKelas, setSelectedKelas] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Calculate max date: use the smaller value between today and tanggal_berakhir
  const maxDate = (() => {
    if (!dateRange.today || !dateRange.tanggal_berakhir) {
      return dateRange.today || dateRange.tanggal_berakhir;
    }
    // Use the smaller date between today and tanggal_berakhir
    return dateRange.today < dateRange.tanggal_berakhir 
      ? dateRange.today 
      : dateRange.tanggal_berakhir;
  })();

  // Initialize dates from date range when loaded
  useEffect(() => {
    if (dateRange.tanggal_mulai && dateRange.tanggal_berakhir) {
      const initialEndDate = maxDate || dateRange.tanggal_berakhir;
      console.log('🔧 Initializing dates:', {
        startDate: dateRange.tanggal_mulai,
        endDate: initialEndDate,
        maxDate
      });
      setStartDate(dateRange.tanggal_mulai);
      setEndDate(initialEndDate);
    }
  }, [dateRange.tanggal_mulai, dateRange.tanggal_berakhir, maxDate]);

  // Wrapper function to validate and set selectedDate within valid range
  const handleSetSelectedDate = (newDate) => {
    if (!dateRange.tanggal_mulai || !maxDate) {
      // If dateRange not loaded yet, just set the date
      setSelectedDate(newDate);
      return;
    }
    
    // Validate and clamp date to valid range
    let validDate = newDate;
    let wasAdjusted = false;
    
    if (newDate < dateRange.tanggal_mulai) {
      console.log('⚠️ Date below minimum:', newDate, '< minDate:', dateRange.tanggal_mulai);
      validDate = dateRange.tanggal_mulai;
      wasAdjusted = true;
      // Silent correction - info card already shows semester range
    } else if (newDate > maxDate) {
      console.log('⚠️ Date above maximum:', newDate, '> maxDate:', maxDate);
      validDate = maxDate;
      wasAdjusted = true;
      // Silent correction - info card already shows semester range
    }
    
    console.log('✅ Setting valid date:', validDate, wasAdjusted ? '(adjusted)' : '');
    setSelectedDate(validDate);
  };

  // Update selectedDate when dateRange loads to ensure it's within valid range
  useEffect(() => {
    if (dateRange.tanggal_mulai && maxDate) {
      // If selectedDate is outside range, adjust it to maxDate (most recent valid date)
      if (!selectedDate || selectedDate < dateRange.tanggal_mulai || selectedDate > maxDate) {
        handleSetSelectedDate(maxDate);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateRange.tanggal_mulai, dateRange.tanggal_berakhir, maxDate]);

  // Set default kelas when loaded
  useEffect(() => {
    if (defaultKelasId && !selectedKelas) {
      setSelectedKelas(defaultKelasId);
    }
  }, [defaultKelasId, selectedKelas]);

  // Set default tab based on role
  useEffect(() => {
    if (isWaliKelas !== null) {
      // Guru Mapel → default ke 'rekap' (karena tidak punya tab 'input')
      // Wali Kelas → default ke 'input'
      setActiveTab(isWaliKelas ? 'input' : 'rekap');
    }
  }, [isWaliKelas]);

  // Hooks untuk Rekap Absensi
  const {
    rekapData,
    isLoading: isLoadingRekap,
    periode,
    rekapSummary,
    updatePeriode,
    loadRekapData
  } = useRekapAbsensi(selectedKelas);

  // Hooks untuk Input Absensi (dengan callback untuk reload rekap setelah save)
  const {
    siswaData,
    selectedDate,
    setSelectedDate,
    isLoading: isLoadingAbsensi,
    isSaving,
    summary,
    handleStatusChange,
    handleMarkAllPresent,
    handleSaveAbsensi
  } = useAbsensi(selectedKelas, () => {
    // Reload rekap setelah save absensi
    loadRekapData(periode.start_date, periode.end_date);
  });

  // Initialize rekap periode after dates are set from semester range
  useEffect(() => {
    if (startDate && endDate && selectedKelas) {
      console.log('🔧 Initializing rekap periode:', { startDate, endDate, selectedKelas });
      updatePeriode(startDate, endDate);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, endDate, selectedKelas]);

  // Handler untuk tombol "Tampilkan"
  const handleLoadRekap = () => {
    updatePeriode(startDate, endDate);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        icon={<FaClipboardList />}
        title="Absensi Siswa"
        description={isWaliKelas 
          ? "Catat kehadiran siswa harian dan lihat rekap absensi"
          : "Lihat rekap absensi siswa (view only)"}
      />

      {/* Loading State */}
      {isLoadingKelas && (
        <ContentWrapper>
          <div className="flex items-center justify-center py-12">
            <div className="text-gray-500">Memuat data kelas...</div>
          </div>
        </ContentWrapper>
      )}

      {/* Info Card: Semester Not Started (BLOCK access) */}
      {!isLoadingKelas && !isLoadingDateRange && dateRange.semester_status === 'not_started' && (
        <SemesterBelumDimulaiCard
          tahunAjaran={dateRange.tahun_ajaran}
          semester={dateRange.semester}
          tanggalMulai={dateRange.tanggal_mulai}
          tanggalSelesai={dateRange.tanggal_berakhir}
          today={dateRange.today}
          semesterStatus={dateRange.semester_status}
          infoMessage={dateRange.info_message}
        />
      )}

      {/* Info Banner: Semester Ended (ALLOW backdate input) */}
      {!isLoadingKelas && !isLoadingDateRange && dateRange.semester_status === 'ended' && (
        <ContentWrapper>
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-yellow-500 p-4 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-yellow-800">
                  Semester {dateRange.semester} {dateRange.tahun_ajaran} telah berakhir.
                </p>
              </div>
            </div>
          </div>
        </ContentWrapper>
      )}

      {/* Warning for Guru Mapel */}
      {!isLoadingKelas && !isWaliKelas && kelasList.length > 0 && (dateRange.semester_status === 'active' || dateRange.semester_status === 'ended') && (
      <ContentWrapper>
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  <strong>Perhatian:</strong> Anda adalah Guru Mapel. Hanya Wali Kelas yang dapat menginput absensi. Anda hanya dapat melihat rekap absensi.
                </p>
              </div>
            </div>
          </div>
        </ContentWrapper>
      )}

      {/* Tabs */}
      {!isLoadingKelas && kelasList.length > 0 && (dateRange.semester_status === 'active' || dateRange.semester_status === 'ended') && (
        <div className="border-b border-gray-200">
          <div className="flex gap-4 px-4">
            {isWaliKelas && (
          <button 
                onClick={() => setActiveTab('input')}
                className={`px-4 py-3 font-semibold text-sm border-b-2 transition-colors ${
                  activeTab === 'input'
                    ? 'border-emerald-500 text-emerald-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                ✏️ Input Absensi
          </button>
            )}
          <button 
              onClick={() => setActiveTab('rekap')}
              className={`px-4 py-3 font-semibold text-sm border-b-2 transition-colors ${
                activeTab === 'rekap'
                  ? 'border-emerald-500 text-emerald-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              📊 Rekap Absensi
          </button>
        </div>
        </div>
      )}

      {/* Tab Content: Input Absensi */}
      {activeTab === 'input' && isWaliKelas && !isLoadingKelas && !isLoadingDateRange && (dateRange.semester_status === 'active' || dateRange.semester_status === 'ended') && dateRange.tanggal_mulai && maxDate && (
        <InputAbsensiSection
          kelasList={kelasList}
          selectedKelas={selectedKelas}
          selectedDate={selectedDate}
          setSelectedDate={handleSetSelectedDate}
          siswaData={siswaData}
          summary={summary}
          isLoading={isLoadingAbsensi}
          isSaving={isSaving}
            handleStatusChange={handleStatusChange}
          handleMarkAllPresent={handleMarkAllPresent}
          handleSaveAbsensi={handleSaveAbsensi}
          minDate={dateRange.tanggal_mulai}
          maxDate={maxDate}
        />
      )}

      {/* Tab Content: Rekap Absensi */}
      {activeTab === 'rekap' && !isLoadingKelas && !isLoadingDateRange && (dateRange.semester_status === 'active' || dateRange.semester_status === 'ended') && dateRange.tanggal_mulai && maxDate && (
        <RekapAbsensiSection
          kelasList={kelasList}
          selectedKelas={selectedKelas}
          setSelectedKelas={setSelectedKelas}
          isWaliKelas={isWaliKelas}
          startDate={startDate}
          setStartDate={setStartDate}
          endDate={endDate}
          setEndDate={setEndDate}
          minDate={dateRange.tanggal_mulai}
          maxDate={maxDate}
          rekapData={rekapData}
          rekapSummary={rekapSummary}
          periode={periode}
          isLoading={isLoadingRekap}
          handleLoadRekap={handleLoadRekap}
        />
      )}
    </div>
  );
}
