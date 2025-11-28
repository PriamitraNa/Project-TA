# Force Password Change - Backend Requirements

## Overview

Sistem force password change untuk memaksa user mengganti password dalam 2 skenario:

1. User baru yang dibuat admin (password default)
2. Password di-reset oleh admin

## Database Schema Update

Tambahkan field baru di tabel `users`:

```sql
ALTER TABLE users ADD COLUMN force_password_change BOOLEAN DEFAULT FALSE;
```

## API Changes Required

### 1. Login API Response (`POST /auth/login`)

**Response harus include field `force_password_change`:**

**Success - Force Password Change:**

```json
{
  "status": "success",
  "message": "Anda harus mengubah password default",
  "data": {
    "force_password_change": true, // ← FIELD BARU (di level data)
    "temp_token": "eyJhbGciOiJIUzI1NiIs...", // ← TEMP TOKEN (bukan token biasa)
    "user": {
      "id": 74,
      "username": "guru01",
      "nama": "Budi Santoso",
      "role": "guru"
    }
  }
}
```

**Success - Normal Login:**

```json
{
  "status": "success",
  "message": "Login berhasil",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...", // ← JWT TOKEN
    "user": {
      "id": 1,
      "username": "admin01",
      "nama": "Admin Sekolah",
      "role": "admin"
    }
  }
}
```

**PENTING:**

- `force_password_change` ada di level `data` (bukan `data.user`)
- Force password: kirim `temp_token` (bukan `token`)
- Normal login: kirim `token` (bukan `temp_token`)

### 2. New API Endpoint - Change Default Password

**Endpoint:** `POST /api/auth/change-default-password`

**Headers:**

```
Authorization: Bearer {temp_token}
Content-Type: application/json
```

**Request Body:**

```json
{
  "new_password": "Password123",
  "confirm_password": "Password123"
}
```

**Response (Success):**

```json
{
  "status": "success",
  "message": "Password berhasil diubah",
  "data": {
    "token": "new_jwt_token_here", // ← JWT Token baru (bukan temp_token)
    "user": {
      "id": 1,
      "username": "guru01",
      "nama": "Budi Santoso",
      "role": "guru",
      "force_password_change": false // ← Harus FALSE setelah berhasil
    }
  }
}
```

**Response (Error - Password Not Match):**

```json
{
  "status": "error",
  "message": "Password dan konfirmasi tidak sama"
}
```

**Response (Error - Weak Password):**

```json
{
  "status": "error",
  "message": "Password harus minimal 8 karakter, mengandung huruf dan angka"
}
```

**Response (Error - Invalid/Expired Token):**

```json
{
  "status": "error",
  "message": "Token tidak valid atau sudah kadaluarsa"
}
```

**Backend Logic:**

1. Verify temp_token dari Authorization header
2. Validate new_password == confirm_password
3. Validate password strength (min 8 char, huruf, angka)
4. Hash new password
5. Update password di database
6. **Set `force_password_change = FALSE`** ← PENTING
7. **Generate JWT token BARU** (bukan temp_token lagi)
8. Return success response dengan token baru dan user data

### 3. Create User / Reset Password Logic

**Saat admin membuat user baru atau reset password:**

```sql
-- Set force_password_change = TRUE
UPDATE users
SET
  password = 'hashed_default_password',
  force_password_change = TRUE
WHERE id = ?;
```

## Flow Diagram

```
Login dengan password default/reset
  ↓
Backend return temp_token + force_password_change = true
  ↓
Frontend save temp_token ke localStorage.tempToken (BUKAN authToken!)
  ↓
Frontend save user data + force_password_change = true
  ↓
Frontend redirect ke /change-password (TANPA verify token)
  ↓
User di halaman /change-password (skip verify token)
  ↓
User input password baru + konfirmasi
  ↓
Validasi di frontend (min 8, huruf, angka, match)
  ↓
POST /api/auth/change-default-password (dengan temp_token dari localStorage.tempToken)
  ↓
Backend validasi & set force_password_change = FALSE
  ↓
Backend return JWT token BARU + user data
  ↓
Frontend save JWT token ke localStorage.authToken (replace temp_token)
  ↓
Frontend clear localStorage.tempToken
  ↓
Redirect ke dashboard sesuai role
  ↓
User bisa akses semua halaman normal (dengan JWT token dari localStorage.authToken)
```

## localStorage Management

### Login Flow

**Scenario 1: Normal Login (force_password_change = false)**

```javascript
localStorage.setItem('authToken', data.token) // JWT token
localStorage.setItem('userRole', data.user.role)
localStorage.setItem('userId', data.user.id)
localStorage.setItem('userName', data.user.nama)
localStorage.setItem('userUsername', data.user.username)
localStorage.setItem('forcePasswordChange', 'false')
```

**Scenario 2: Force Password Change (force_password_change = true)**

```javascript
localStorage.setItem('tempToken', data.temp_token) // ← TEMP TOKEN (bukan authToken!)
localStorage.setItem('userRole', data.user.role)
localStorage.setItem('userId', data.user.id)
localStorage.setItem('userName', data.user.nama)
localStorage.setItem('userUsername', data.user.username)
localStorage.setItem('forcePasswordChange', 'true') // ← PENTING
```

### After Change Password Success

```javascript
// Remove temp token
localStorage.removeItem('tempToken')

// Save JWT token baru
localStorage.setItem('authToken', data.token) // JWT token baru
localStorage.setItem('forcePasswordChange', 'false') // Clear flag
// User data tetap sama
```

### Token Priority in authService.getToken()

```javascript
// Check temp_token dulu, baru authToken
const token = localStorage.getItem('tempToken') || localStorage.getItem('authToken')
```

**Why?**

- Saat force password change → ada `tempToken`, tidak ada `authToken`
- Setelah change password → ada `authToken`, tidak ada `tempToken`
- Fallback: cek `tempToken` dulu untuk handle force password case

## Security Considerations

1. **Password validation di backend:**
   - Minimal 8 karakter
   - Harus ada huruf besar
   - Harus ada huruf kecil
   - Harus ada angka
2. **Additional checks:**

   - New password ≠ current password
   - Rate limiting untuk prevent brute force
   - Password history (optional: jangan sama dengan 3 password terakhir)

3. **Token handling:**
   - Setelah change password, bisa pertimbangkan invalidate token lama
   - Force re-login untuk security

## Testing Scenarios

### Test Case 1: User Baru

1. Admin create user baru dengan password default
2. Backend set `force_password_change = true`
3. User login → Backend return temp_token + force_password_change = true
4. Frontend redirect ke `/change-password`
5. User tidak bisa akses halaman lain (ProtectedRoute guard)
6. User input password baru yang valid → submit
7. Backend validasi, set `force_password_change = false`, return JWT token baru
8. Frontend simpan JWT token baru, redirect ke dashboard
9. User bisa akses semua halaman normal

### Test Case 2: Reset Password

1. Admin reset password user
2. Backend set `force_password_change = true`
3. User login dengan password reset → Backend return temp_token
4. Same flow dengan Test Case 1

### Test Case 3: Password Validation (Frontend)

1. User coba password < 8 char → error toast, tidak kirim request
2. User coba password tanpa huruf → error toast
3. User coba password tanpa angka → error toast
4. User coba password ≠ confirm → error toast
5. User input password valid → request dikirim ke backend

### Test Case 4: Backend Validation

1. Request dengan password tidak match → 400 error
2. Request dengan weak password → 400 error
3. Request dengan expired/invalid temp_token → 401 error
4. Request valid → 200 success + JWT token baru

### Test Case 5: Token Management

1. Login → dapat temp_token (force_password_change = true)
2. Change password → temp_token di-replace dengan JWT token baru
3. JWT token baru bisa dipakai untuk akses halaman lain
4. Coba akses halaman dengan temp_token lama → error (optional)

## Frontend Implementation (Already Done)

✅ **ChangePassword Page** (`src/pages/ChangePassword.jsx`)

- Form dengan 2 fields: new_password & confirm_password
- Real-time password requirements indicator
- Form validation (min 8 char, huruf, angka, match)
- Error handling dengan toast notification
- Success handling (auto save token baru & redirect ke dashboard)

✅ **Login Flow** (`src/pages/Login.jsx`)

- Check `force_password_change` dari login response
- Redirect ke `/change-password` jika true
- Save temp_token ke localStorage

✅ **Router Guard** (`src/components/ui/ProtectedRoute.jsx`)

- Check `force_password_change` flag di localStorage
- **SKIP verify token** untuk halaman `/change-password` (langsung allow dengan temp_token)
- Verify token untuk halaman lain (dashboard, dll)
- Redirect ke `/change-password` jika force_password_change = true
- User tidak bisa akses halaman lain sampai ganti password

✅ **AuthService** (`src/services/Login/authService.js`)

- `changeDefaultPassword(newPassword, confirmPassword)` method
- API call ke `POST /api/auth/change-default-password`
- Auto save JWT token baru setelah success
- Auto clear `force_password_change` flag
- localStorage management (temp_token → JWT token)

✅ **Routing** (`src/app/AppRouter.jsx`)

- Route `/change-password` dengan ProtectedRoute wrapper
- Memastikan hanya authenticated user yang bisa akses

✅ **Error Handling:**

- 400 Bad Request → "Data yang dikirim tidak valid"
- 401 Unauthorized → "Sesi Anda telah berakhir" + auto logout
- Network error → "Tidak dapat terhubung ke server"
- Custom error message dari backend response

## Debugging Guide

### Common Issues & Solutions

#### Issue 1: "Bearer undefined" di Backend

**Symptom:**

```
🔑 [authMiddleware] Token received: undefined...
```

**Root Cause:**

- Token tidak tersimpan di localStorage
- FE mengambil token dari key yang salah

**Solution:**

```javascript
// ✅ CHECK: Login response
console.log('Login response:', response.data)
// Pastikan ada data.temp_token atau data.token

// ✅ CHECK: localStorage after login
console.log('tempToken:', localStorage.getItem('tempToken'))
console.log('authToken:', localStorage.getItem('authToken'))
```

#### Issue 2: Token Tidak Tersimpan

**Symptom:**

- Login berhasil tapi token tidak ada di localStorage
- Redirect ke login terus-menerus

**Solution:**

```javascript
// Check apakah saveUserData() dipanggil dengan benar
// authService.js - login()
if (data.user.force_password_change === true) {
  const tempToken = data.temp_token || data.token // ← CHECK INI
  console.log('Saving temp token:', tempToken.substring(0, 20) + '...')
  saveUserData(tempToken, data.user, true)
}
```

#### Issue 3: Verify Token Failed untuk Change Password Page

**Symptom:**

- Error "Token tidak valid" di halaman /change-password
- Backend log: temp_token tidak dikenali oleh /auth/me

**Solution:**

- Pastikan ProtectedRoute SKIP verify untuk /change-password
- temp_token HANYA untuk change-default-password endpoint

```javascript
// ProtectedRoute.jsx
if (forcePasswordChange && isChangePasswordPage) {
  console.log('✅ Skip verify - change password page')
  setIsAuthenticated(true)
  return // ← PENTING: SKIP verify token
}
```

### Console Logs untuk Debug

**Expected Flow - Force Password Change:**

```
Login:
🔑 Force password change detected - temp token saved
✅ Temp token saved: eyJhbGciOiJIUzI1NiIs...

ProtectedRoute:
🔑 Token found: eyJhbGciOiJIUzI1NiIs...
📍 Current path: /change-password
🔒 Force password change: true
✅ Change password page - skip token verification

Change Password Submit:
🔑 Sending change password request with temp token: eyJhbGciOiJIUzI1NiIs...
✅ Password changed successfully, saving new JWT token
✅ JWT token saved: eyJhbGciOiJIUzI1NiIs...
```

**Expected Flow - Normal Login:**

```
Login:
🔑 Normal login - JWT token saved
✅ JWT token saved: eyJhbGciOiJIUzI1NiIs...

ProtectedRoute:
🔑 Token found: eyJhbGciOiJIUzI1NiIs...
📍 Current path: /admin/dashboard
🔒 Force password change: false
🔍 Verifying token with API...
✅ Token verified: { id: 1, role: 'admin', ... }
```

### localStorage Keys Reference

| Key                   | Description                               | When Set                                          |
| --------------------- | ----------------------------------------- | ------------------------------------------------- |
| `tempToken`           | Temporary token for force password change | Login dengan force_password_change = true         |
| `authToken`           | JWT token for normal access               | Normal login ATAU setelah change password success |
| `forcePasswordChange` | Flag untuk force password                 | Login response                                    |
| `userRole`            | User role (admin/guru/ortu)               | Always after login                                |
| `userId`              | User ID                                   | Always after login                                |
| `userName`            | User full name                            | Always after login                                |
| `userUsername`        | Username                                  | Always after login                                |
