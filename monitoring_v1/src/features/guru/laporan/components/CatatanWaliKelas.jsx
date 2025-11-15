import ContentWrapper from '../../../../components/ui/ContentWrapper';
import { FaCommentDots } from 'react-icons/fa';

export default function CatatanWaliKelas({ value, onChange, siswaName }) {
  return (
    <ContentWrapper>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-100 rounded-lg">
            <FaCommentDots className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Catatan Wali Kelas</h3>
            <p className="text-sm text-gray-600">
              Berikan kesimpulan umum perkembangan <span className="font-semibold">{siswaName}</span> selama satu semester
            </p>
          </div>
        </div>

        {/* Textarea */}
        <div>
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Tuliskan catatan kesimpulan perkembangan siswa secara keseluruhan (akademik, karakter, sikap, dan prestasi lainnya)..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors resize-none"
            rows="6"
          />
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-gray-500">
              <span className="text-red-500">*</span> Catatan wajib diisi sebelum download PDF
            </p>
            <p className="text-xs text-gray-500">
              {value.length} karakter
            </p>
          </div>
        </div>
      </div>
    </ContentWrapper>
  );
}

