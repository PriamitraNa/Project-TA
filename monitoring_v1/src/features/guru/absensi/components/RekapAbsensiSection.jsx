import ContentWrapper from '../../../../components/ui/ContentWrapper';
import DataTable from '../../../../components/ui/DataTable';
import Button from '../../../../components/ui/Button';
import { FaChartBar } from 'react-icons/fa';
import SummaryCards from './SummaryCards';

/**
 * RekapAbsensiSection Component
 * Section for viewing attendance summary/recap
 */
export default function RekapAbsensiSection({
  kelasList,
  selectedKelas,
  setSelectedKelas,
  isWaliKelas,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  minDate,
  maxDate,
  rekapData,
  rekapSummary,
  periode,
  isLoading,
  handleLoadRekap
}) {
  // Columns for rekap table
  const rekapColumns = [
    { key: 'no', label: 'No', width: '60px' },
    { key: 'nisn', label: 'NISN', width: '120px' },
    { key: 'nama_lengkap', label: 'Nama Siswa' },
    { key: 'hadir', label: 'H', width: '60px' },
    { key: 'sakit', label: 'S', width: '60px' },
    { key: 'izin', label: 'I', width: '60px' },
    { key: 'alpha', label: 'A', width: '60px' },
    { key: 'persentase', label: '% Hadir', width: '100px' },
  ];

  // Table data for rekap
  const rekapTableData = rekapData.map((siswa, index) => ({
    ...siswa,
    no: index + 1,
    persentase: (
      <span className={`font-semibold ${
        parseFloat(siswa.persentase_hadir) >= 90 ? 'text-green-600' :
        parseFloat(siswa.persentase_hadir) >= 75 ? 'text-yellow-600' : 'text-red-600'
      }`}>
        {siswa.persentase_hadir}%
      </span>
    )
  }));

  return (
    <>
      {/* Summary Cards */}
      <ContentWrapper>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-gray-500">Memuat statistik...</div>
          </div>
        ) : (
          <SummaryCards type="rekap" data={rekapSummary} />
        )}
      </ContentWrapper>

      {/* Rekap Table */}
      <ContentWrapper>
        <div className="space-y-4">
          {/* Filter */}
          <div className="flex flex-col md:flex-row md:items-end gap-4 p-4 bg-gray-50 rounded-lg">
            {!isWaliKelas && kelasList.length > 1 && (
              <div className="flex-1">
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Pilih Kelas:
                </label>
                <select
                  value={selectedKelas || ''}
                  onChange={(e) => setSelectedKelas(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {kelasList.map(kelas => (
                    <option key={kelas.kelas_id} value={kelas.kelas_id}>
                      {kelas.label}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div className="flex-1">
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Tanggal Mulai:
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  const newDate = e.target.value;
                  console.log('📅 Start Date onChange:', newDate, 'Min:', minDate, 'Max:', maxDate);
                  
                  // Validate and set
                  if (minDate && newDate < minDate) {
                    console.log('⚠️ Start date below minimum, blocking');
                    return;
                  }
                  if (maxDate && newDate > maxDate) {
                    console.log('⚠️ Start date above maximum, blocking');
                    return;
                  }
                  if (endDate && newDate > endDate) {
                    console.log('⚠️ Start date after end date, blocking');
                    return;
                  }
                  setStartDate(newDate);
                }}
                onBlur={(e) => {
                  // Extra validation on blur
                  const currentDate = e.target.value;
                  if (minDate && currentDate < minDate) {
                    console.log('⚠️ Start date below minimum on blur, correcting to:', minDate);
                    setStartDate(minDate);
                  } else if (maxDate && currentDate > maxDate) {
                    console.log('⚠️ Start date above maximum on blur, correcting to:', maxDate);
                    setStartDate(maxDate);
                  } else if (endDate && currentDate > endDate) {
                    console.log('⚠️ Start date after end date on blur, correcting to:', endDate);
                    setStartDate(endDate);
                  }
                }}
                min={minDate || undefined}
                max={endDate || maxDate || undefined}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Tanggal Akhir:
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  const newDate = e.target.value;
                  console.log('📅 End Date onChange:', newDate, 'Min:', minDate, 'Max:', maxDate);
                  
                  // Validate and set
                  if (minDate && newDate < minDate) {
                    console.log('⚠️ End date below minimum, blocking');
                    return;
                  }
                  if (maxDate && newDate > maxDate) {
                    console.log('⚠️ End date above maximum, blocking');
                    return;
                  }
                  if (startDate && newDate < startDate) {
                    console.log('⚠️ End date before start date, blocking');
                    return;
                  }
                  setEndDate(newDate);
                }}
                onBlur={(e) => {
                  // Extra validation on blur
                  const currentDate = e.target.value;
                  if (minDate && currentDate < minDate) {
                    console.log('⚠️ End date below minimum on blur, correcting to:', minDate);
                    setEndDate(minDate);
                  } else if (maxDate && currentDate > maxDate) {
                    console.log('⚠️ End date above maximum on blur, correcting to:', maxDate);
                    setEndDate(maxDate);
                  } else if (startDate && currentDate < startDate) {
                    console.log('⚠️ End date before start date on blur, correcting to:', startDate);
                    setEndDate(startDate);
                  }
                }}
                min={startDate || minDate || undefined}
                max={maxDate || undefined}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <Button
                variant="primary"
                size="sm"
                icon={<FaChartBar />}
                onClick={handleLoadRekap}
                disabled={isLoading}
              >
                Tampilkan
              </Button>
            </div>
          </div>

          {/* Table */}
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FaChartBar className="text-blue-600 text-lg" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900">
                  Rekap Absensi {Array.isArray(kelasList) ? kelasList.find(k => k.kelas_id === selectedKelas)?.nama_kelas || '' : ''}
                </h3>
                <p className="text-sm text-gray-600">
                  Periode: {new Date(periode.start_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long' })} - {new Date(periode.end_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })} ({rekapSummary.totalPertemuan} pertemuan)
                </p>
              </div>
            </div>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-gray-500">Memuat rekap absensi...</div>
              </div>
            ) : (
              <DataTable
                columns={rekapColumns}
                data={rekapTableData}
              />
            )}
          </div>
        </div>
      </ContentWrapper>
    </>
  );
}

