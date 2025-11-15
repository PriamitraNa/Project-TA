import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

export default function Pagination({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  className = "" 
}) {
  if (totalPages <= 1) return null;

  // Logika getVisiblePages Anda sudah bagus, tidak perlu diubah.
  const getVisiblePages = () => {
    const pages = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      let startPage = Math.max(1, currentPage - 2);
      let endPage = Math.min(totalPages, currentPage + 2);
      
      if (currentPage <= 3) {
        startPage = 1;
        endPage = maxVisible;
      } else if (currentPage >= totalPages - 2) {
        startPage = totalPages - maxVisible + 1;
        endPage = totalPages;
      }
      
      for (let i = startPage; i <= endPage; i++) pages.push(i);
    }
    return pages;
  };

  const visiblePages = getVisiblePages();
  const showFirstEllipsis = visiblePages[0] > 1;
  const showLastEllipsis = visiblePages[visiblePages.length - 1] < totalPages;

  // Komponen tombol untuk konsistensi
  const PageButton = ({ onClick, disabled, children, active = false, ariaLabel }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        flex items-center justify-center w-9 h-9 rounded-lg transition-colors duration-200
        font-medium text-sm
        ${active
          ? "bg-emerald-600 text-white shadow-md cursor-default"
          : "bg-white text-slate-700 border border-slate-300 hover:bg-emerald-50"
        }
        ${disabled ? "opacity-50 cursor-not-allowed" : ""}
      `}
      aria-label={ariaLabel}
      aria-current={active ? "page" : undefined}
    >
      {children}
    </button>
  );

  return (
    <div className={`flex items-center justify-center sm:justify-end gap-2 ${className}`}>
      {/* Tombol Previous */}
      <PageButton
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        ariaLabel="Previous page"
      >
        <FaChevronLeft className="w-4 h-4" />
      </PageButton>

      {/* BARU: Tampilan Mobile (Hanya Indikator Halaman) */}
      <div className="flex sm:hidden items-center justify-center px-4 h-9 bg-white text-slate-700 border border-slate-300 rounded-lg text-sm font-medium">
        {currentPage} / {totalPages}
      </div>

      {/* BARU: Tampilan Desktop (Logika Lengkap) */}
      <div className="hidden sm:flex items-center gap-2">
        {showFirstEllipsis && (
          <>
            <PageButton onClick={() => onPageChange(1)}>1</PageButton>
            {visiblePages[0] > 2 && (
              <span className="w-9 h-9 flex items-center justify-center text-slate-500">...</span>
            )}
          </>
        )}

        {visiblePages.map((page) => (
          <PageButton
            key={page}
            onClick={() => onPageChange(page)}
            active={currentPage === page}
            ariaLabel={`Page ${page}`}
          >
            {page}
          </PageButton>
        ))}

        {showLastEllipsis && (
          <>
            {visiblePages[visiblePages.length - 1] < totalPages - 1 && (
              <span className="w-9 h-9 flex items-center justify-center text-slate-500">...</span>
            )}
            <PageButton onClick={() => onPageChange(totalPages)}>{totalPages}</PageButton>
          </>
        )}
      </div>

      {/* Tombol Next */}
      <PageButton
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        ariaLabel="Next page"
      >
        <FaChevronRight className="w-4 h-4" />
      </PageButton>
    </div>
  );
}