import { FaUsers, FaCheck, FaChartBar } from 'react-icons/fa';

/**
 * SummaryCards Component
 * Display summary statistics for absensi
 */
export default function SummaryCards({ type, data }) {
  if (type === 'input') {
    return (
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 flex items-center gap-3">
          <div className="p-2 bg-gray-100 rounded-lg">
            <FaUsers className="text-gray-600 text-base" />
          </div>
          <div>
            <div className="text-xs text-gray-600">Total</div>
            <div className="text-xl font-bold text-gray-900">{data.total}</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 flex items-center gap-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <FaCheck className="text-green-600 text-base" />
          </div>
          <div>
            <div className="text-xs text-gray-600">Hadir</div>
            <div className="text-xl font-bold text-green-600">{data.hadir}</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 flex items-center gap-3">
          <div className="p-2 bg-yellow-100 rounded-lg">
            <div className="text-yellow-600 text-base font-bold">S</div>
          </div>
          <div>
            <div className="text-xs text-gray-600">Sakit</div>
            <div className="text-xl font-bold text-yellow-600">{data.sakit}</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <div className="text-blue-600 text-base font-bold">I</div>
          </div>
          <div>
            <div className="text-xs text-gray-600">Izin</div>
            <div className="text-xl font-bold text-blue-600">{data.izin}</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 flex items-center gap-3">
          <div className="p-2 bg-red-100 rounded-lg">
            <div className="text-red-600 text-base font-bold">A</div>
          </div>
          <div>
            <div className="text-xs text-gray-600">Alpha</div>
            <div className="text-xl font-bold text-red-600">{data.alpha}</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 flex items-center gap-3">
          <div className="p-2 bg-gray-100 rounded-lg">
            <div className="text-gray-600 text-base font-bold">?</div>
          </div>
          <div>
            <div className="text-xs text-gray-600">Belum dipilih</div>
            <div className="text-xl font-bold text-gray-600">{data.belum}</div>
          </div>
        </div>
      </div>
    );
  }

  // Rekap type
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 flex items-center gap-3">
        <div className="p-2 bg-blue-100 rounded-lg">
          <FaChartBar className="text-blue-600 text-base" />
        </div>
        <div>
          <div className="text-xs text-gray-600">Pertemuan</div>
          <div className="text-xl font-bold text-gray-900">{data.totalPertemuan || 0}</div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 flex items-center gap-3">
        <div className="p-2 bg-green-100 rounded-lg">
          <FaCheck className="text-green-600 text-base" />
        </div>
        <div>
          <div className="text-xs text-gray-600">Total Hadir</div>
          <div className="text-xl font-bold text-green-600">{data.totalHadir || 0}</div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 flex items-center gap-3">
        <div className="p-2 bg-yellow-100 rounded-lg">
          <div className="text-yellow-600 text-base font-bold">S</div>
        </div>
        <div>
          <div className="text-xs text-gray-600">Total Sakit</div>
          <div className="text-xl font-bold text-yellow-600">{data.totalSakit || 0}</div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 flex items-center gap-3">
        <div className="p-2 bg-blue-100 rounded-lg">
          <div className="text-blue-600 text-base font-bold">I</div>
        </div>
        <div>
          <div className="text-xs text-gray-600">Total Izin</div>
          <div className="text-xl font-bold text-blue-600">{data.totalIzin || 0}</div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 flex items-center gap-3">
        <div className="p-2 bg-red-100 rounded-lg">
          <div className="text-red-600 text-base font-bold">A</div>
        </div>
        <div>
          <div className="text-xs text-gray-600">Total Alpha</div>
          <div className="text-xl font-bold text-red-600">{data.totalAlpha || 0}</div>
        </div>
      </div>
    </div>
  );
}

