import Button from '../../../../components/ui/Button';
import DataTable from '../../../../components/ui/DataTable';
import Pagination from '../../../../components/ui/Pagination';
import { siswaColumns, createSiswaTableData } from '../config/siswaTableConfig';
import { FaPlus, FaGraduationCap } from 'react-icons/fa';

const SiswaSection = ({
    siswaData,
    siswaPagination,
    isLoadingSiswa,
    currentPage,
    itemsPerPage,
    onPageChange,
    onItemsPerPageChange,
    onTambahSiswa,
    onNaikKelas,
    onDeleteSiswa
}) => {
    const tableData = createSiswaTableData(siswaData, onDeleteSiswa);

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                <h3 className="text-base sm:text-lg font-semibold text-slate-800">Siswa</h3>
                <div className="flex flex-col sm:flex-row gap-2">
                    <Button
                        variant="secondary"
                        size="sm"
                        icon={<FaPlus />}
                        onClick={onTambahSiswa}
                        className="w-full sm:w-auto"
                    >
                        <span className="hidden sm:inline">Tambah Siswa</span>
                        <span className="sm:hidden">Tambah</span>
                    </Button>
                    <Button
                        variant="primary"
                        size="sm"
                        icon={<FaGraduationCap />}
                        onClick={onNaikKelas}
                        className="w-full sm:w-auto"
                    >
                        <span className="hidden sm:inline">Naikkan Kelas</span>
                        <span className="sm:hidden">Naik Kelas</span>
                    </Button>
                </div>
            </div>
            
            <div className="overflow-x-auto">
                <DataTable
                    columns={siswaColumns}
                    data={tableData}
                    isLoading={isLoadingSiswa}
                    emptyMessage="Belum ada siswa di kelas ini"
                    className="min-w-full"
                />
            </div>
            
            {/* Pagination Controls - Enhanced Responsive */}
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
                {/* Per halaman - Kiri */}
                <div className="flex items-center gap-2">
                    <span className="text-xs sm:text-sm text-slate-600 whitespace-nowrap">Per halaman:</span>
                    <select
                        value={itemsPerPage}
                        onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
                        disabled={isLoadingSiswa}
                        className="px-2 sm:px-3 py-1.5 sm:py-2 border border-slate-300 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white min-w-0"
                    >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                    </select>
                </div>

                {/* Pagination - Kanan */}
                {siswaPagination && siswaPagination.totalPages > 1 && (
                    <div className="flex justify-center sm:justify-end">
                        <Pagination
                            currentPage={siswaPagination.page}
                            totalPages={siswaPagination.totalPages}
                            onPageChange={onPageChange}
                            className="scale-75 sm:scale-90 lg:scale-100"
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default SiswaSection;
