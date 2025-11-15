import { useState, useEffect, useCallback } from 'react'
import CustomModal from '../../../ui/CustomModal'
import Button from '../../../ui/Button'
import { FaUserPlus, FaSpinner, FaTrash, FaPlus } from 'react-icons/fa'
import toast from 'react-hot-toast'
import { AkunPenggunaService } from '../../../../services/Admin/akun-pengguna/AkunPenggunaService'
import { useAkunForm } from './hooks/useAkunForm'
import { useAkunValidation } from './hooks/useAkunValidation'
import { useAkunDropdowns } from './hooks/useAkunDropdowns'
import RoleSelector from './components/RoleSelector'
import AdminForm from './components/AdminForm'
import GuruForm from './components/GuruForm'
import OrangtuaForm from './components/OrangtuaForm'

// ============================================================================
// COMPONENT
// ============================================================================
export default function TambahAkunPenggunaModal({ isOpen, onClose, onSave }) {
  // ============================================================================
  // STATE & HOOKS
  // ============================================================================
  const [isLoading, setIsLoading] = useState(false)

  const {
    akunForms,
    validationState,
    guruList,
    ortuList,
    anakList,
    showDropdowns,
    searchQueries,
    debounceTimers,
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
  } = useAkunForm()

  const { validateAllForms, debouncedValidateUsername } = useAkunValidation(
    akunForms,
    validationState,
    setValidationState
  )

  // ============================================================================
  // DUPLICATE USERNAME CHECK
  // ============================================================================
  const checkDuplicateUsernames = useCallback(() => {
    const usernameMap = {}
    const duplicateUsernames = new Set()

    akunForms.forEach((form) => {
      const username = form.username.trim()
      if (username) {
        if (usernameMap[username]) {
          usernameMap[username].push(form.id)
          duplicateUsernames.add(username)
        } else {
          usernameMap[username] = [form.id]
        }
      }
    })

    akunForms.forEach((form) => {
      const username = form.username.trim()
      if (username && duplicateUsernames.has(username)) {
        setValidationState((prev) => ({
          ...prev,
          [`${form.id}_username`]: 'Username sudah digunakan di form lain',
        }))
      }
    })

    return Array.from(duplicateUsernames)
  }, [akunForms, setValidationState])

  const {
    handleGuruSelect,
    handleOrtuSelect,
    handleAnakSelect,
    handleToggleDropdown,
    handleSearchChange,
    getFilteredData,
  } = useAkunDropdowns(
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
  )

  // ============================================================================
  // EFFECTS
  // ============================================================================
  useEffect(() => {
    if (isOpen) {
      loadMasterData()
    }
  }, [isOpen, loadMasterData])

  useEffect(() => {
    if (akunForms.length > 1) {
      checkDuplicateUsernames()
    }
  }, [akunForms, checkDuplicateUsernames])

  // ============================================================================
  // DATA FORMATTING
  // ============================================================================
  const formatDataForAPI = () => {
    const formattedData = akunForms.map((form) => {
      let namaLengkap = ''

      if (form.role === 'admin') {
        namaLengkap = form.nama.trim()
      } else if (form.role === 'guru' && form.selectedGuru) {
        namaLengkap = form.selectedGuru.nama_lengkap
      } else if (form.role === 'orangtua' && form.selectedOrtu) {
        namaLengkap = form.selectedOrtu.nama_lengkap
      }

      const baseData = {
        nama_lengkap: namaLengkap,
        username: form.username.trim(),
        role: form.role === 'orangtua' ? 'ortu' : form.role,
      }

      if (form.role === 'guru' && form.selectedGuru) {
        baseData.guru_id = form.selectedGuru.id
      }

      if (form.role === 'orangtua' && form.selectedOrtu) {
        baseData.ortu_id = form.selectedOrtu.id
        if (form.selectedAnak) {
          baseData.anak_id = form.selectedAnak.id
        }
      }

      return baseData
    })

    return formattedData
  }

  // ============================================================================
  // HANDLERS
  // ============================================================================
  const handleSubmit = async () => {
    const validationErrors = validateAllForms()
    if (validationErrors.length > 0) {
      validationErrors.forEach((error) => toast.error(error))
      return
    }

    setIsLoading(true)
    try {
      const apiData = formatDataForAPI()

      const requestPayload = {
        users: apiData,
      }

      console.log('📤 [TambahAkunPengguna] Sending data to API:', requestPayload)

      const response = await AkunPenggunaService.createBulk(requestPayload)

      if (response.status === 'success') {
        const { summary, results } = response.data
        const successCount = summary.success
        const failedCount = summary.failed

        if (successCount > 0) {
          toast.success(`${successCount} akun berhasil dibuat`)
        }

        if (failedCount > 0) {
          const failedUsers = results.failed?.map((item) => item.data) || []
          failedUsers.forEach((user) => {
            toast.error(`Gagal membuat akun untuk ${user.nama_lengkap}: ${user.error}`)
          })
        }

        setAkunForms([
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
        setValidationState({})
        setSearchQueries({})
        setShowDropdowns({})

        onSave?.()
        onClose()
      } else {
        toast.error(response.message || 'Gagal membuat akun pengguna')
      }
    } catch (error) {
      if (error.response?.data?.message) {
        toast.error(error.response.data.message)
      } else {
        toast.error('Gagal membuat akun pengguna')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    if (!isLoading) {
      setAkunForms([
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
      setValidationState({})
      setSearchQueries({})
      setShowDropdowns({})
      onClose()
    }
  }

  // ============================================================================
  // RENDER
  // ============================================================================
  return (
    <CustomModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Tambah Multiple Akun Pengguna"
      description="Input data akun pengguna baru ke database"
      icon={<FaUserPlus className="text-emerald-600 text-xl" />}
      size="4xl"
      isLoading={isLoading}
    >
      <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-blue-800">Tambah Multiple Akun Pengguna</h3>
            <p className="text-sm text-blue-600 mt-1">
              Anda dapat menambah/hapus form akun sesuai kebutuhan (minimal 1 akun)
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600">{akunForms.length}</div>
            <div className="text-sm text-blue-500">Form Akun</div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {akunForms.map((form, index) => (
          <div key={form.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-xs font-medium">
                  {index + 1}
                </div>
                <h4 className="font-medium text-gray-800 text-sm">Form Akun {index + 1}</h4>
              </div>
              {akunForms.length > 1 && (
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleRemoveForm(form.id)}
                  className="px-2 py-1 text-xs"
                  disabled={isLoading}
                >
                  <FaTrash className="w-3 h-3" />
                </Button>
              )}
            </div>

            <div className="space-y-4">
              {/* Role Selection */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Pilih Role *</label>
                <RoleSelector form={form} onRoleChange={handleRoleChange} disabled={isLoading} />
              </div>

              {form.role && (
                <div className="space-y-3">
                  {form.role === 'admin' && (
                    <AdminForm
                      form={form}
                      validationState={validationState}
                      onFormChange={handleFormChange}
                      onValidateUsername={debouncedValidateUsername}
                      disabled={isLoading}
                    />
                  )}

                  {form.role === 'guru' && (
                    <GuruForm
                      form={form}
                      validationState={validationState}
                      showDropdowns={showDropdowns}
                      searchQueries={searchQueries}
                      onFormChange={handleFormChange}
                      onValidateUsername={debouncedValidateUsername}
                      onGuruSelect={handleGuruSelect}
                      onToggleDropdown={handleToggleDropdown}
                      onSearchChange={handleSearchChange}
                      getFilteredData={getFilteredData}
                      disabled={isLoading}
                    />
                  )}

                  {form.role === 'orangtua' && (
                    <OrangtuaForm
                      form={form}
                      validationState={validationState}
                      showDropdowns={showDropdowns}
                      searchQueries={searchQueries}
                      onFormChange={handleFormChange}
                      onValidateUsername={debouncedValidateUsername}
                      onOrtuSelect={handleOrtuSelect}
                      onAnakSelect={handleAnakSelect}
                      onToggleDropdown={handleToggleDropdown}
                      onSearchChange={handleSearchChange}
                      getFilteredData={getFilteredData}
                      disabled={isLoading}
                    />
                  )}
                </div>
              )}
            </div>

            {index === akunForms.length - 1 && (
              <div className="mt-4 flex justify-center">
                <Button
                  onClick={handleAddForm}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2 border-dashed border-gray-300 text-gray-600 hover:border-gray-400 hover:text-gray-700"
                  disabled={isLoading}
                >
                  <FaPlus className="text-sm" />
                  Tambah Akun Lain
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
        <Button onClick={handleClose} variant="outline" disabled={isLoading}>
          Batal
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={isLoading || akunForms.length === 0}
          className="flex items-center gap-2"
        >
          {isLoading ? (
            <>
              <FaSpinner className="animate-spin" />
              Menyimpan...
            </>
          ) : (
            <>
              <FaUserPlus />
              Simpan Semua ({akunForms.length})
            </>
          )}
        </Button>
      </div>
    </CustomModal>
  )
}
