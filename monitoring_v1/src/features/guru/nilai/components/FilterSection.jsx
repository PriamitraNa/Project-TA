import React from 'react';
import { FaFilter, FaBook, FaChalkboardTeacher } from 'react-icons/fa';

export default function FilterSection({
  selectedKelas,
  selectedMapel,
  kelasList,
  mapelList,
  onKelasChange,
  onMapelChange,
  isLoading
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-blue-100 rounded-lg">
          <FaFilter className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Filter Data Nilai</h3>
          <p className="text-sm text-gray-600">Pilih kelas dan mata pelajaran untuk melihat data nilai siswa</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Kelas Dropdown */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <FaChalkboardTeacher className="inline mr-2 text-gray-500" />
            Kelas <span className="text-red-500">*</span>
          </label>
          <select
            value={selectedKelas}
            onChange={(e) => onKelasChange(e.target.value)}
            disabled={isLoading}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
          >
            <option value="">-- Pilih Kelas --</option>
            {kelasList.map((kelas) => (
              <option key={kelas.kelas_id} value={kelas.kelas_id}>
                {kelas.nama_kelas}
              </option>
            ))}
          </select>
        </div>

        {/* Mata Pelajaran Dropdown */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <FaBook className="inline mr-2 text-gray-500" />
            Mata Pelajaran <span className="text-red-500">*</span>
          </label>
          <select
            value={selectedMapel}
            onChange={(e) => onMapelChange(e.target.value)}
            disabled={isLoading || !selectedKelas}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
          >
            <option value="">-- Pilih Mata Pelajaran --</option>
            {mapelList.map((mapel) => (
              <option key={mapel.mapel_id} value={mapel.mapel_id}>
                {mapel.nama_mapel}
              </option>
            ))}
          </select>
          {!selectedKelas && (
            <p className="mt-1 text-xs text-gray-500">Pilih kelas terlebih dahulu</p>
          )}
        </div>
      </div>
    </div>
  );
}

