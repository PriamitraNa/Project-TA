import { FaSearch, FaTimes, FaPlus } from "react-icons/fa";
import { useState, useEffect } from "react";
import useDebounce from "../../hooks/useDebounce"; // Impor hook debounce
import FilterDropdown from "./FilterDropdown"; // Impor komponen filter baru

export default function SearchBar({
  search = "",
  setSearch,
  filter = "",
  setFilter,
  filters = [],
  secondFilter = "",
  setSecondFilter,
  secondFilters = [],
  placeholder = "Cari nama atau NIP/NISN.",
  filterPlaceholder = "Semua Role",
  secondFilterPlaceholder = "Semua Status",
  showFilter = true,
  showSecondFilter = false,
  hideSearch = false,
  className = "",
  onSearch,
  onAddClick,
  showAddButton = false,
  addButtonText = "Tambah Akun",
  onSecondButtonClick,
  showSecondButton = false,
  secondButtonText = "Button 2",
  secondButtonIcon,
  secondButtonVariant = "ghost",
}) {
  const [searchTerm, setSearchTerm] = useState(search);
  const debouncedSearchTerm = useDebounce(searchTerm, 500); // Debounce 500ms

  useEffect(() => {
    if (setSearch) {
      setSearch(debouncedSearchTerm);
    }
    if (onSearch) {
      onSearch(debouncedSearchTerm);
    }
  }, [debouncedSearchTerm, setSearch, onSearch]);

  return (
    <div className={`p-4 bg-white rounded-lg shadow-sm border border-slate-200 ${className}`}>
      <div className="flex flex-col lg:flex-row gap-3 items-center">
        {/* Search Input */}
        {!hideSearch && (
          <div className="relative w-full sm:w-80 lg:w-96">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="h-4 w-4 text-slate-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={placeholder}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all bg-white text-sm"
            />
          </div>
        )}

        {/* Filter Dropdowns */}
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          {showFilter && filters.length > 0 && (
            <FilterDropdown
              value={filter}
              onChange={(e) => setFilter && setFilter(e.target.value)}
              options={filters}
              placeholder={filterPlaceholder}
              className="w-full sm:w-40 lg:w-35"
              showDefaultOption={false}
            />
          )}

          {showSecondFilter && secondFilters.length > 0 && (
            <FilterDropdown
              value={secondFilter}
              onChange={(e) =>
                setSecondFilter && setSecondFilter(e.target.value)
              }
              options={secondFilters}
              placeholder={secondFilterPlaceholder}
              className="w-full sm:w-40 lg:w-35"
              showDefaultOption={false}
            />
          )}
        </div>

        {/* Spacer untuk mendorong tombol ke kanan */}
        <div className="flex-1"></div>

        {/* Second Button */}
        {showSecondButton && (
          <button
            onClick={onSecondButtonClick}
            className={`px-4 py-2.5 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium whitespace-nowrap ${
              secondButtonVariant === 'primary' 
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            {secondButtonIcon && <span className="h-4 w-4">{secondButtonIcon}</span>}
            {secondButtonText}
          </button>
        )}

        {/* Add Button */}
        {showAddButton && (
          <button
            onClick={onAddClick}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors flex items-center gap-2 text-sm font-medium whitespace-nowrap"
          >
            <FaPlus className="h-4 w-4" />
            {addButtonText}
          </button>
        )}
      </div>
    </div>
  );
}
