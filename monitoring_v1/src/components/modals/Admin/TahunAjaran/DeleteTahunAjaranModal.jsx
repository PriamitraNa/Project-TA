import { useState } from 'react';
import { FaTrash, FaTimes, FaExclamationTriangle } from 'react-icons/fa';
import Button from '../../../ui/Button';
import { TahunAjaranService } from '../../../../services/Admin/tahunajaran/TahunAjaranService';
import toast from 'react-hot-toast';

export default function DeleteTahunAjaranModal({ isOpen, onClose, tahunAjaran, onSuccess }) {
  const [isLoading, setIsLoading] = useState(false);

  // Handle delete confirmation
  const handleDelete = async () => {
    setIsLoading(true);
    
    try {
      const response = await TahunAjaranService.delete(tahunAjaran.id);
      
      if (response.status === 'success') {
        toast.success(response.message || 'Tahun ajaran berhasil dihapus');
        onClose();
        onSuccess?.(); // Reload data di parent component
      }
    } catch (error) {
      console.error('Error deleting tahun ajaran:', error);
      
      if (error.response?.data?.message) {
        const errorMessage = error.response.data.message;
        
        if (errorMessage.includes('sedang aktif')) {
          toast.error('⚠️ ' + errorMessage);
        } else if (errorMessage.includes('sudah digunakan untuk kelas')) {
          toast.error('🏫 ' + errorMessage);
        } else if (errorMessage.includes('sudah digunakan untuk data nilai')) {
          toast.error('📊 ' + errorMessage);
        } else {
          toast.error(errorMessage);
        }
      } else {
        toast.error('Gagal menghapus tahun ajaran');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !tahunAjaran) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <FaExclamationTriangle className="text-red-600 text-lg" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">
              Konfirmasi Hapus
            </h2>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FaTimes className="text-gray-400" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="px-6 pb-6">
          <div className="text-center mb-6">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <FaTrash className="text-red-600 text-2xl" />
            </div>
            
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Hapus Tahun Ajaran?
            </h3>
            
            <p className="text-gray-600 mb-4">
              Anda yakin ingin menghapus tahun ajaran berikut?
            </p>

            {/* Tahun Ajaran Info */}
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="text-center">
                <h4 className="font-bold text-lg text-gray-900">
                  {tahunAjaran.tahun}
                </h4>
                <p className="text-gray-600">
                  Semester {tahunAjaran.semester}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {tahunAjaran.tanggal_mulai} - {tahunAjaran.tanggal_selesai}
                </p>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold mt-2 ${
                  tahunAjaran.status === 'aktif' 
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                    : 'bg-slate-100 text-slate-600 border border-slate-200'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${
                    tahunAjaran.status === 'aktif' ? 'bg-emerald-500' : 'bg-slate-400'
                  }`}></span>
                  {tahunAjaran.status === 'aktif' ? 'Aktif' : 'Tidak Aktif'}
                </span>
              </div>
            </div>

            {/* Warning Messages */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <div className="flex items-start gap-2">
                <FaExclamationTriangle className="text-red-500 text-sm mt-0.5 flex-shrink-0" />
                <div className="text-left">
                  <p className="text-sm font-medium text-red-800 mb-1">
                    Peringatan:
                  </p>
                  <ul className="text-xs text-red-700 space-y-1">
                    <li>• Data tidak dapat dikembalikan setelah dihapus</li>
                    <li>• Tahun ajaran aktif tidak dapat dihapus</li>
                    <li>• Tahun ajaran yang sudah digunakan tidak dapat dihapus</li>
                  </ul>
                </div>
              </div>
            </div>

            <p className="text-sm text-gray-500">
              Tindakan ini tidak dapat dibatalkan!
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1"
            >
              Batal
            </Button>
            <Button
              type="button"
              variant="danger"
              onClick={handleDelete}
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Menghapus...
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <FaTrash />
                  Hapus
                </div>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
