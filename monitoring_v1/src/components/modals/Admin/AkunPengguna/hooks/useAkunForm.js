import { useState, useRef, useCallback } from 'react'
import { AkunPenggunaService } from '../../../../../services/Admin/akun-pengguna/AkunPenggunaService'

// ============================================================================
// CUSTOM HOOK
// ============================================================================
export const useAkunForm = () => {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================
  const [akunForms, setAkunForms] = useState([
    {
      id: 1,
      role: '',
      nama: '',
      username: '',
      selectedGuru: null,
      selectedOrtu: null,
      selectedAnak: null,
    },
  ])

  const [nextId, setNextId] = useState(2)
  const [validationState, setValidationState] = useState({})
  const [guruList, setGuruList] = useState([])
  const [ortuList, setOrtuList] = useState([])
  const [anakList, setAnakList] = useState({})
  const [showDropdowns, setShowDropdowns] = useState({})
  const [searchQueries, setSearchQueries] = useState({})

  const debounceTimers = useRef({})
  const validateTimersRef = useRef({})

  // ============================================================================
  // LOAD DATA
  // ============================================================================
  const loadMasterData = useCallback(async () => {
    try {
      const guruResponse = await AkunPenggunaService.getAvailableGuru({
        search: '',
        limit: 50,
      })
      setGuruList(guruResponse.data.guru || [])

      const ortuResponse = await AkunPenggunaService.getAvailableOrtu({
        search: '',
        limit: 50,
      })
      setOrtuList(ortuResponse.data.ortu || [])
    } catch (error) {
      console.error('Error loading master data:', error)
    }
  }, [setGuruList, setOrtuList])

  // ============================================================================
  // FORM MANAGEMENT
  // ============================================================================
  const handleAddForm = useCallback(() => {
    const newForm = {
      id: nextId,
      role: '',
      nama: '',
      username: '',
      selectedGuru: null,
      selectedOrtu: null,
      selectedAnak: null,
    }

    setAkunForms((prev) => [...prev, newForm])
    setNextId((prev) => prev + 1)
  }, [nextId, setAkunForms, setNextId])

  const handleRemoveForm = useCallback(
    (formId) => {
      setAkunForms((prev) => prev.filter((form) => form.id !== formId))

      const keysToRemove = Object.keys(validationState).filter((key) =>
        key.startsWith(`${formId}_`)
      )
      setValidationState((prev) => {
        const newState = { ...prev }
        keysToRemove.forEach((key) => delete newState[key])
        return newState
      })

      setAkunForms((prev) => {
        const newForms = prev.map((form, index) => ({
          ...form,
          id: index + 1,
        }))
        return newForms
      })

      setValidationState((prev) => {
        const newState = {}
        Object.keys(prev).forEach((key) => {
          const [formIdStr, field] = key.split('_')
          const formIdNum = parseInt(formIdStr)
          if (formIdNum > formId) {
            const newFormId = formIdNum - 1
            newState[`${newFormId}_${field}`] = prev[key]
          } else if (formIdNum < formId) {
            newState[key] = prev[key]
          }
        })
        return newState
      })

      setSearchQueries((prev) => {
        const newState = {}
        Object.keys(prev).forEach((key) => {
          const [formIdStr, field] = key.split('_')
          const formIdNum = parseInt(formIdStr)
          if (formIdNum > formId) {
            const newFormId = formIdNum - 1
            newState[`${newFormId}_${field}`] = prev[key]
          } else if (formIdNum < formId) {
            newState[key] = prev[key]
          }
        })
        return newState
      })
    },
    [setAkunForms, setValidationState, setSearchQueries, validationState]
  )

  // ============================================================================
  // FIELD HANDLERS
  // ============================================================================
  const handleFormChange = useCallback(
    (formId, field, value) => {
      setAkunForms((prev) =>
        prev.map((form) => (form.id === formId ? { ...form, [field]: value } : form))
      )

      const key = `${formId}_${field}`
      setValidationState((prev) => {
        const newState = { ...prev }
        delete newState[key]
        return newState
      })

      const form = akunForms.find((f) => f.id === formId)
      const role = form?.role

      if (field === 'role' && value !== role) {
        setAkunForms((prev) =>
          prev.map((f) =>
            f.id === formId
              ? {
                  ...f,
                  role: value,
                  nama: '',
                  username: '',
                  selectedGuru: null,
                  selectedOrtu: null,
                  selectedAnak: null,
                }
              : f
          )
        )
      }
    },
    [setAkunForms, setValidationState, akunForms]
  )

  const handleRoleChange = useCallback(
    (formId, role) => {
      setAkunForms((prev) =>
        prev.map((form) =>
          form.id === formId
            ? {
                ...form,
                role,
                nama: '',
                username: '',
                selectedGuru: null,
                selectedOrtu: null,
                selectedAnak: null,
              }
            : form
        )
      )

      const keysToRemove = Object.keys(validationState).filter((key) =>
        key.startsWith(`${formId}_`)
      )
      setValidationState((prev) => {
        const newState = { ...prev }
        keysToRemove.forEach((key) => delete newState[key])
        return newState
      })
    },
    [setAkunForms, setValidationState, validationState]
  )

  // ============================================================================
  // FILTERED DATA
  // ============================================================================
  const getFilteredGuruForForm = useCallback(
    (formId) => {
      const selectedInOtherForms = akunForms
        .filter((form) => form.id !== formId && form.selectedGuru)
        .map((form) => form.selectedGuru.id)
        .filter((id) => id)

      return guruList.filter((guru) => !selectedInOtherForms.includes(guru.id))
    },
    [akunForms, guruList]
  )

  const getFilteredOrtuForForm = useCallback(
    (formId) => {
      return ortuList.filter((ortu) => {
        const hasUnselectedChildren = ortu.total_anak > ortu.akun_terbuat

        const selectedChildrenCount = akunForms.filter(
          (form) => form.id !== formId && form.selectedOrtu?.id === ortu.id && form.selectedAnak
        ).length

        const allChildrenSelected = selectedChildrenCount >= ortu.total_anak

        return hasUnselectedChildren && !allChildrenSelected
      })
    },
    [akunForms, ortuList]
  )

  const getFilteredAnakForForm = useCallback(
    (formId, ortuId) => {
      if (!ortuId) return []

      const selectedAnakIds = akunForms
        .filter(
          (form) => form.id !== formId && form.selectedOrtu?.id === ortuId && form.selectedAnak
        )
        .map((form) => form.selectedAnak.id)
        .filter((id) => id)

      const anakData = anakList[ortuId] || []

      return anakData.filter((anak) => !selectedAnakIds.includes(anak.id))
    },
    [akunForms, anakList]
  )

  // ============================================================================
  // RETURN
  // ============================================================================
  return {
    akunForms,
    nextId,
    validationState,
    guruList,
    ortuList,
    anakList,
    showDropdowns,
    searchQueries,
    debounceTimers,
    validateTimersRef,
    setAkunForms,
    setValidationState,
    setGuruList,
    setOrtuList,
    setAnakList,
    setShowDropdowns,
    setSearchQueries,
    loadMasterData,
    handleAddForm,
    handleRemoveForm,
    handleFormChange,
    handleRoleChange,
    getFilteredGuruForForm,
    getFilteredOrtuForForm,
    getFilteredAnakForForm,
  }
}
