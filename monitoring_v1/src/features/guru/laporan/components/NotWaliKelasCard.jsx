import ContentWrapper from '../../../../components/ui/ContentWrapper';
import { FaExclamationTriangle, FaUserTie } from 'react-icons/fa';

export default function NotWaliKelasCard({ message }) {
  return (
    <ContentWrapper>
      <div className="text-center py-16">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-yellow-100 rounded-full mb-6">
          <FaExclamationTriangle className="text-5xl text-yellow-600" />
        </div>
        
        <h3 className="text-2xl font-bold text-gray-900 mb-3">
          Akses Terbatas
        </h3>
        
        <p className="text-lg text-gray-700 mb-2">
          {message || 'Anda tidak memiliki akses sebagai wali kelas'}
        </p>
        
        <p className="text-sm text-gray-600 mb-8 max-w-md mx-auto">
          Fitur <span className="font-semibold">Laporan Perkembangan Siswa</span> hanya 
          tersedia untuk guru yang ditugaskan sebagai <span className="font-semibold">Wali Kelas</span>.
        </p>

        <div className="inline-flex items-center gap-3 px-6 py-3 bg-blue-50 border border-blue-200 rounded-lg">
          <FaUserTie className="text-2xl text-blue-600" />
          <div className="text-left">
            <p className="text-sm font-semibold text-blue-900">
              Hubungi Administrator
            </p>
            <p className="text-xs text-blue-700">
              Jika Anda merasa ini adalah kesalahan
            </p>
          </div>
        </div>
      </div>
    </ContentWrapper>
  );
}

