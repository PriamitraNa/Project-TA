import Button from '../../../../components/ui/Button';
import SearchBar from '../../../../components/ui/SearchBar';
import { FaSearch, FaFilter, FaTimes } from 'react-icons/fa';

const FilterSection = ({
    searchQuery,
    jenisKelaminFilter,
    onSearch,
    onJenisKelaminFilter,
    onClearFilter,
    isLoading
}) => {
    return (
        <div className="bg-white rounded-lg border border-slate-200 p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                {/* Search Input */}
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                        Cari Siswa
                    </label>
                    <SearchBar
                        value={searchQuery}
                        onChange={onSearch}
                        placeholder="Cari berdasarkan nama, NISN, atau NIK..."
                        disabled={isLoading}
                        className="w-full"
                    />
                </div>

                {/* Filter Jenis Kelamin */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                        Jenis Kelamin
                    </label>
                    <select
                        value={jenisKelaminFilter}
                        onChange={(e) => onJenisKelaminFilter(e.target.value)}
                        disabled={isLoading}
                        className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white text-sm disabled:bg-slate-50"
                    >
                        <option value="">Semua</option>
                        <option value="Laki-laki">Laki-laki</option>
                        <option value="Perempuan">Perempuan</option>
                    </select>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                    <Button
                        variant="secondary"
                        size="sm"
                        icon={<FaTimes />}
                        onClick={onClearFilter}
                        disabled={isLoading}
                        className="flex-1"
                    >
                        Clear
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default FilterSection;
