import { useState, useMemo, useCallback, useEffect } from 'react'
import { CatatanAnakService } from '../../../../services/Ortu/catatan/CatatanAnakService'
import toast from 'react-hot-toast'

/**
 * Custom hook untuk mengelola data catatan anak
 * Handle: fetching, filtering, pagination
 */
export function useCatatanAnak() {
  // State untuk filter
  const [search, setSearch] = useState('')
  const [kategoriFilter, setKategoriFilter] = useState('')
  const [jenisFilter, setJenisFilter] = useState('')

  // State untuk pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  // State untuk modal
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [selectedCatatan, setSelectedCatatan] = useState(null)

  // State untuk statistics
  const [statistics, setStatistics] = useState({
    total: 0,
    positif: 0,
    negatif: 0,
    netral: 0,
  })
  const [isLoadingStats, setIsLoadingStats] = useState(false)

  // State untuk list catatan
  const [catatanData, setCatatanData] = useState([])
  const [pagination, setPagination] = useState({
    current_page: 1,
    per_page: 10,
    total_data: 0,
    total_pages: 0,
    has_next: false,
    has_prev: false,
  })
  const [isLoadingList, setIsLoadingList] = useState(false)

  // Load statistics from API
  const loadStatistics = useCallback(async () => {
    try {
      setIsLoadingStats(true)
      const response = await CatatanAnakService.getStatistik()
      if (response.status === 'success') {
        setStatistics(response.data)
      }
    } catch (error) {
      console.error('Error loading statistics:', error)
      if (error.response?.status === 401) {
        toast.error('Siswa ID tidak ditemukan dalam token')
      } else {
        toast.error('Gagal mengambil statistik catatan')
      }
      // Set default values on error
      setStatistics({
        total: 0,
        positif: 0,
        negatif: 0,
        netral: 0,
      })
    } finally {
      setIsLoadingStats(false)
    }
  }, [])

  // Load list catatan from API
  const loadCatatanList = useCallback(async () => {
    try {
      setIsLoadingList(true)
      const response = await CatatanAnakService.getList({
        page: currentPage,
        per_page: itemsPerPage,
        search: search,
        kategori: kategoriFilter,
        jenis: jenisFilter,
        sort_by: 'tanggal',
        sort_order: 'desc',
      })

      if (response.status === 'success') {
        setCatatanData(response.data.catatan)
        setPagination(response.data.pagination)
      }
    } catch (error) {
      console.error('Error loading catatan list:', error)
      if (error.response?.status === 401) {
        toast.error('Siswa ID tidak ditemukan dalam token')
      } else if (error.response?.status === 400) {
        toast.error(error.response.data.message || 'Parameter tidak valid')
      } else {
        toast.error('Gagal mengambil data catatan')
      }
      // Set default values on error
      setCatatanData([])
      setPagination({
        current_page: 1,
        per_page: 10,
        total_data: 0,
        total_pages: 0,
        has_next: false,
        has_prev: false,
      })
    } finally {
      setIsLoadingList(false)
    }
  }, [currentPage, itemsPerPage, search, kategoriFilter, jenisFilter])

  // Load statistics saat mount
  useEffect(() => {
    loadStatistics()
  }, [loadStatistics])

  // Load catatan list saat dependencies berubah
  useEffect(() => {
    loadCatatanList()
  }, [loadCatatanList])

  // Filter data berdasarkan search dan filter - TIDAK DIGUNAKAN LAGI (API handles filtering)
  // const filteredData = useMemo(() => {
  //   return catatanData.filter((item) => {
  //     const matchSearch =
  //       item.guru_nama.toLowerCase().includes(search.toLowerCase()) ||
  //       item.isi_preview.toLowerCase().includes(search.toLowerCase())
  //     const matchKategori = !kategoriFilter || item.kategori === kategoriFilter
  //     const matchJenis = !jenisFilter || item.jenis === jenisFilter

  //     return matchSearch && matchKategori && matchJenis
  //   })
  // }, [catatanData, search, kategoriFilter, jenisFilter])

  // Pagination calculations - TIDAK DIGUNAKAN LAGI (API handles pagination)
  // const totalPages = Math.ceil(filteredData.length / itemsPerPage)
  // const startIndex = (currentPage - 1) * itemsPerPage
  // const endIndex = startIndex + itemsPerPage
  // const currentData = filteredData.slice(startIndex, endIndex)

  // Handlers
  const handleSearchChange = (value) => {
    setSearch(value)
    setCurrentPage(1) // Reset to first page
  }

  const handleKategoriFilterChange = (value) => {
    setKategoriFilter(value)
    setCurrentPage(1)
  }

  const handleJenisFilterChange = (value) => {
    setJenisFilter(value)
    setCurrentPage(1)
  }

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage)
    setCurrentPage(1) // Reset to first page
  }

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage)
  }

  const handleOpenDetail = (catatan) => {
    setSelectedCatatan(catatan)
    setIsDetailModalOpen(true)
  }

  const handleCloseDetail = () => {
    setIsDetailModalOpen(false)
    setSelectedCatatan(null)
  }

  const handleRefresh = () => {
    // Refresh statistics and catatan list
    loadStatistics()
    loadCatatanList()
  }

  return {
    // State
    search,
    kategoriFilter,
    jenisFilter,
    currentPage,
    itemsPerPage,
    isDetailModalOpen,
    selectedCatatan,
    catatanData,
    pagination,
    statistics,
    isLoadingStats,
    isLoadingList,

    // Handlers
    handleSearchChange,
    handleKategoriFilterChange,
    handleJenisFilterChange,
    handleItemsPerPageChange,
    handlePageChange,
    handleOpenDetail,
    handleCloseDetail,
    handleRefresh,
  }
}
