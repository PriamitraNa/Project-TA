const ItemsPerPageSelector = ({ 
    itemsPerPage, 
    onItemsPerPageChange, 
    isLoading = false 
}) => {
    return (
        <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm text-slate-600 whitespace-nowrap">Per halaman:</span>
            <select
                value={itemsPerPage}
                onChange={(e) => onItemsPerPageChange(e.target.value)}
                disabled={isLoading}
                className="px-2 sm:px-3 py-1.5 sm:py-2 border border-slate-300 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white min-w-0"
            >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
            </select>
        </div>
    );
};

export default ItemsPerPageSelector;
