import { AkunPenggunaService } from '../../../../../services/Admin/akun-pengguna/AkunPenggunaService'

// ============================================================================
// CUSTOM HOOK
// ============================================================================
export const useAkunDropdowns = (
  akunForms,
  setAkunForms,
  guruList,
  ortuList,
  anakList,
  showDropdowns,
  searchQueries,
  setGuruList,
  setOrtuList,
  setAnakList,
  setShowDropdowns,
  setSearchQueries,
  debounceTimers,
  getFilteredGuruForForm,
  getFilteredOrtuForForm,
  getFilteredAnakForForm
) => {
  // ============================================================================
  // SELECTION HANDLERS
  // ============================================================================
  const handleGuruSelect = (formId, guru) => {
    setAkunForms((prev) =>
      prev.map((form) =>
        form.id === formId
          ? {
              ...form,
              selectedGuru: guru,
              nama: guru.nama_lengkap,
              username: guru.nip,
            }
          : form
      )
    )

    setShowDropdowns((prev) => ({
      ...prev,
      [`${formId}_guru`]: false,
    }))

    setSearchQueries((prev) => ({
      ...prev,
      [`${formId}_guru`]: '',
    }))
  }

  const handleOrtuSelect = (formId, ortu) => {
    setAkunForms((prev) =>
      prev.map((form) =>
        form.id === formId
          ? {
              ...form,
              selectedOrtu: ortu,
              selectedAnak: null,
              username: '',
            }
          : form
      )
    )

    setShowDropdowns((prev) => ({
      ...prev,
      [`${formId}_ortu`]: false,
    }))

    setSearchQueries((prev) => ({
      ...prev,
      [`${formId}_ortu`]: '',
    }))

    loadAnakByOrtu(ortu.id)
  }

  const handleAnakSelect = (formId, anak) => {
    setAkunForms((prev) =>
      prev.map((form) =>
        form.id === formId
          ? {
              ...form,
              selectedAnak: anak,
              username: anak.nisn,
            }
          : form
      )
    )

    setShowDropdowns((prev) => ({
      ...prev,
      [`${formId}_anak`]: false,
    }))

    setSearchQueries((prev) => ({
      ...prev,
      [`${formId}_anak`]: '',
    }))
  }

  // ============================================================================
  // DROPDOWN HANDLERS
  // ============================================================================
  const handleToggleDropdown = (formId, type) => {
    const key = `${formId}_${type}`
    setShowDropdowns((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  const handleSearchChange = (formId, type, value) => {
    const key = `${formId}_${type}`
    setSearchQueries((prev) => ({
      ...prev,
      [key]: value,
    }))

    if (type === 'guru') {
      debouncedSearchGuru(formId, value)
    } else if (type === 'ortu') {
      debouncedSearchOrtu(formId, value)
    }
  }

  // ============================================================================
  // SEARCH FUNCTIONS
  // ============================================================================
  const searchGuru = async (formId, searchQuery) => {
    try {
      const response = await AkunPenggunaService.getAvailableGuru({
        search: searchQuery,
        limit: 50,
      })

      if (response.data?.guru) {
        const selectedGuruIds = akunForms
          .filter((form) => form.id !== formId && form.selectedGuru)
          .map((form) => form.selectedGuru.id)

        const filteredGuru = response.data.guru.filter((guru) => !selectedGuruIds.includes(guru.id))

        setGuruList(filteredGuru)
      }
    } catch (error) {
      console.error('Error searching guru:', error)
    }
  }

  const debouncedSearchGuru = (formId, searchQuery) => {
    const key = `${formId}_guru`

    if (debounceTimers.current[key]) {
      clearTimeout(debounceTimers.current[key])
    }

    debounceTimers.current[key] = setTimeout(() => {
      searchGuru(formId, searchQuery)
    }, 300)
  }

  const searchOrtu = async (formId, searchQuery) => {
    try {
      const response = await AkunPenggunaService.getAvailableOrtu({
        search: searchQuery,
        limit: 50,
      })

      if (response.data?.ortu) {
        const selectedOrtuIds = akunForms
          .filter((form) => form.id !== formId && form.selectedOrtu)
          .map((form) => form.selectedOrtu.id)

        const filteredOrtu = response.data.ortu.filter((ortu) => !selectedOrtuIds.includes(ortu.id))

        setOrtuList(filteredOrtu)
      }
    } catch (error) {
      console.error('Error searching ortu:', error)
    }
  }

  const debouncedSearchOrtu = (formId, searchQuery) => {
    const key = `${formId}_ortu`

    if (debounceTimers.current[key]) {
      clearTimeout(debounceTimers.current[key])
    }

    debounceTimers.current[key] = setTimeout(() => {
      searchOrtu(formId, searchQuery)
    }, 300)
  }

  const loadAnakByOrtu = async (ortuId) => {
    try {
      const response = await AkunPenggunaService.getChildrenByParent(ortuId, {
        search: '',
        limit: 50,
      })

      if (response.data?.anak) {
        setAnakList((prev) => ({
          ...prev,
          [ortuId]: response.data.anak,
        }))
      }
    } catch (error) {
      console.error('Error loading anak:', error)
    }
  }

  // ============================================================================
  // FILTERED DATA
  // ============================================================================
  const getFilteredData = (formId, type) => {
    const searchKey = `${formId}_${type}`
    const searchQuery = searchQueries[searchKey] || ''

    if (type === 'guru') {
      const filteredGuruList = getFilteredGuruForForm(formId)
      return filteredGuruList.filter((guru) =>
        guru.nama_lengkap.toLowerCase().includes(searchQuery.toLowerCase())
      )
    } else if (type === 'ortu') {
      const filteredOrtuList = getFilteredOrtuForForm(formId)
      return filteredOrtuList.filter((ortu) =>
        ortu.nama_lengkap.toLowerCase().includes(searchQuery.toLowerCase())
      )
    } else if (type === 'anak') {
      const form = akunForms.find((f) => f.id === formId)
      if (form?.selectedOrtu) {
        const filteredAnakList = getFilteredAnakForForm(formId, form.selectedOrtu.id)
        return filteredAnakList.filter((anak) =>
          anak.nama_lengkap.toLowerCase().includes(searchQuery.toLowerCase())
        )
      }
      return []
    }

    return []
  }

  // ============================================================================
  // RETURN
  // ============================================================================
  return {
    handleGuruSelect,
    handleOrtuSelect,
    handleAnakSelect,
    handleToggleDropdown,
    handleSearchChange,
    getFilteredData,
    loadAnakByOrtu,
  }
}
