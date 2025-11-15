import { useState, useMemo } from 'react';

/**
 * Custom hook untuk menangani state management dan data processing
 * pada halaman-halaman data master (DataGuru, DataSiswa, DataOrtu)
 * 
 * @param {Object} config - Konfigurasi hook
 * @param {Array} config.data - Data array yang akan diproses
 * @param {string} config.searchFields - Array field names untuk search
 * @param {string} config.filterField - Field name untuk filter utama
 * @param {string} config.secondFilterField - Field name untuk filter kedua
 * @param {number} config.defaultItemsPerPage - Default items per page
 * @param {Array} config.itemsPerPageOptions - Options untuk items per page
 * @returns {Object} State dan handlers untuk data master
 */
const useDataMaster = ({
  data = [],
  searchFields = ['name', 'email'],
  filterField = 'role',
  secondFilterField = 'status',
  defaultItemsPerPage = 10,
  itemsPerPageOptions = [5, 10, 25, 50]
} = {}) => {
  // State untuk search dan filter
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("");
  const [secondFilter, setSecondFilter] = useState("");
  
  // State untuk pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(defaultItemsPerPage);

  // Memoized filtered data berdasarkan search dan filter
  const filteredData = useMemo(() => {
    return data.filter(item => {
      // Search logic - cek semua field yang ditentukan
      const matchesSearch = !search || 
        searchFields.some(field => {
          const fieldValue = item[field];
          return fieldValue && 
            fieldValue.toString().toLowerCase().includes(search.toLowerCase());
        });
      
      // Filter logic untuk filter utama
      const matchesFilter = !filter || item[filterField] === filter;
      
      // Filter logic untuk filter kedua
      const matchesSecondFilter = !secondFilter || item[secondFilterField] === secondFilter;
      
      return matchesSearch && matchesFilter && matchesSecondFilter;
    });
  }, [data, search, filter, secondFilter, searchFields, filterField, secondFilterField]);

  // Memoized pagination data
  const paginatedData = useMemo(() => {
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentData = filteredData.slice(startIndex, endIndex);

    return {
      currentData,
      totalPages,
      startIndex,
      endIndex,
      totalItems: filteredData.length,
      showingItems: currentData.length
    };
  }, [filteredData, currentPage, itemsPerPage]);

  // Handlers untuk pagination
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset ke halaman pertama
  };

  // Handlers untuk search dan filter
  const handleSearchChange = (newSearch) => {
    setSearch(newSearch);
    setCurrentPage(1); // Reset ke halaman pertama saat search
  };

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    setCurrentPage(1); // Reset ke halaman pertama saat filter
  };

  const handleSecondFilterChange = (newSecondFilter) => {
    setSecondFilter(newSecondFilter);
    setCurrentPage(1); // Reset ke halaman pertama saat filter
  };

  // Reset semua filter dan search
  const resetFilters = () => {
    setSearch("");
    setFilter("");
    setSecondFilter("");
    setCurrentPage(1);
  };

  // Get statistics dari data
  const getStatistics = (statConfigs) => {
    return statConfigs.map(config => {
      let count = 0;
      
      if (config.field) {
        // Hitung berdasarkan field tertentu
        count = data.filter(item => {
          if (config.value) {
            return item[config.field] === config.value;
          }
          return item[config.field];
        }).length;
      } else {
        // Hitung total data
        count = data.length;
      }
      
      return {
        ...config,
        value: count.toString()
      };
    });
  };

  return {
    // State
    search,
    filter,
    secondFilter,
    currentPage,
    itemsPerPage,
    
    // Computed values
    filteredData,
    ...paginatedData,
    
    // Handlers
    setSearch: handleSearchChange,
    setFilter: handleFilterChange,
    setSecondFilter: handleSecondFilterChange,
    setCurrentPage: handlePageChange,
    setItemsPerPage: handleItemsPerPageChange,
    
    // Utility functions
    resetFilters,
    getStatistics,
    
    // Configuration
    itemsPerPageOptions
  };
};

export default useDataMaster;
