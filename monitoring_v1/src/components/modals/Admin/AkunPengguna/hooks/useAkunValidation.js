import { useRef } from 'react'
import { AkunPenggunaService } from '../../../../../services/Admin/akun-pengguna/AkunPenggunaService'

// ============================================================================
// CUSTOM HOOK
// ============================================================================
export const useAkunValidation = (akunForms, validationState, setValidationState) => {
  const validateTimersRef = useRef({})

  // ============================================================================
  // DEBOUNCED USERNAME VALIDATION
  // ============================================================================
  const debouncedValidateUsername = ({ formId, payload }) => {
    const key = `${formId}_validate_username`

    if (validateTimersRef.current[key]) {
      clearTimeout(validateTimersRef.current[key])
    }

    setValidationState((prev) => ({
      ...prev,
      [`${formId}_username_loading`]: true,
      [`${formId}_username`]: null,
    }))

    validateTimersRef.current[key] = setTimeout(async () => {
      try {
        const res = await AkunPenggunaService.validateField(payload)
        const isValid = res?.data?.valid === true

        setValidationState((prev) => {
          const newState = { ...prev }
          delete newState[`${formId}_username_loading`]

          if (isValid) {
            delete newState[`${formId}_username`]
          } else {
            newState[`${formId}_username`] = res.message || 'Username tidak valid'
          }

          return newState
        })
      } catch (error) {
        setValidationState((prev) => {
          const newState = { ...prev }
          delete newState[`${formId}_username_loading`]
          newState[`${formId}_username`] = 'Error validasi username'
          return newState
        })
      }
    }, 500)
  }

  // ============================================================================
  // FORM VALIDATION
  // ============================================================================
  const validateForm = (form) => {
    const errors = []

    if (!form.role) {
      errors.push('Role harus dipilih')
    }

    if (!form.username.trim()) {
      errors.push('Username harus diisi')
    } else if (form.role === 'admin' && form.username.length < 8) {
      errors.push('Username admin minimal 8 digit angka')
    }

    if (form.role === 'admin' && !form.nama.trim()) {
      errors.push('Nama lengkap harus diisi')
    }

    if (form.role === 'guru' && !form.selectedGuru) {
      errors.push('Guru harus dipilih')
    }

    if (form.role === 'orangtua') {
      if (!form.selectedOrtu) {
        errors.push('Orangtua harus dipilih')
      }
      if (!form.selectedAnak) {
        errors.push('Anak harus dipilih')
      }
    }

    return errors
  }

  const checkDuplicateUsernames = () => {
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
  }

  const validateAllForms = () => {
    const allErrors = []

    const duplicateUsernames = checkDuplicateUsernames()

    if (duplicateUsernames.length > 0) {
      allErrors.push('Username tidak boleh sama')
    }

    akunForms.forEach((form, index) => {
      const formErrors = validateForm(form)
      if (formErrors.length > 0) {
        allErrors.push(`Form ${index + 1}: ${formErrors.join(', ')}`)
      }
    })

    return allErrors
  }

  // ============================================================================
  // RETURN
  // ============================================================================
  return {
    validateForm,
    validateAllForms,
    debouncedValidateUsername,
    checkDuplicateUsernames,
  }
}
