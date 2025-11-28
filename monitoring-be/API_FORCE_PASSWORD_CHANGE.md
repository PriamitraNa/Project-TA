# API Documentation: Force Password Change

## Overview

Implementasi force password change untuk user yang baru dibuat atau password yang di-reset oleh admin.

---

## Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│  1. ADMIN CREATE USER atau RESET PASSWORD                      │
│     ↓                                                           │
│     Database: must_change_password = 1                          │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  2. USER LOGIN                                                  │
│     POST /api/auth/login                                        │
│     Body: { username, password }                                │
│     ↓                                                           │
│     Backend cek: must_change_password == 1?                     │
│     ├─ YES → Return temp_token (30 menit)                       │
│     └─ NO  → Return JWT token normal                            │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  3. FRONTEND HANDLING                                           │
│     if (force_password_change === true) {                       │
│       redirect('/change-password')                              │
│       localStorage.setItem('temp_token', temp_token)            │
│     } else {                                                    │
│       redirect('/dashboard')                                    │
│     }                                                           │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  4. USER CHANGE PASSWORD                                        │
│     POST /api/auth/change-default-password                      │
│     Header: Authorization: Bearer {temp_token}                  │
│     Body: { new_password, confirm_password }                    │
│     ↓                                                           │
│     Backend: Update password, set must_change_password = 0      │
│     Return: JWT token baru                                      │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  5. FRONTEND POST-CHANGE                                        │
│     localStorage.removeItem('temp_token')                       │
│     localStorage.setItem('token', new_jwt_token)                │
│     redirect ke dashboard sesuai role                           │
└─────────────────────────────────────────────────────────────────┘
```

---

## API Endpoints

### 1. Login (Updated)

**Endpoint:** `POST /api/auth/login`

**Request Body:**

```json
{
  "username": "1980010112340001",
  "password": "20251123"
}
```

**Response (Force Change Password):**

```json
{
  "status": "success",
  "message": "Anda harus mengubah password default",
  "data": {
    "force_password_change": true,
    "temp_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 64,
      "username": "1980010112340001",
      "role": "guru",
      "nama": "Budi Santoso"
    }
  }
}
```

**Response (Normal Login):**

```json
{
  "status": "success",
  "message": "Login berhasil",
  "data": {
    "force_password_change": false,
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 64,
      "username": "1980010112340001",
      "role": "guru",
      "nama": "Budi Santoso"
    }
  }
}
```

**Error Responses:**

- `400` - Username/password salah, format tidak valid, akun tidak aktif
- `401` - Unauthorized (jika ada masalah lain)

---

### 2. Change Default Password (NEW)

**Endpoint:** `POST /api/auth/change-default-password`

**Headers:**

```
Authorization: Bearer {temp_token}
Content-Type: application/json
```

**Request Body:**

```json
{
  "new_password": "BudiGuru2025",
  "confirm_password": "BudiGuru2025"
}
```

**Success Response (200):**

```json
{
  "status": "success",
  "message": "Password berhasil diubah",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 64,
      "username": "1980010112340001",
      "role": "guru",
      "nama": "Budi Santoso"
    }
  }
}
```

**Error Responses:**

**400 Bad Request - Validation Error:**

```json
{
  "status": "error",
  "message": "Password minimal 8 karakter",
  "data": null
}
```

**400 Bad Request - Password Tidak Cocok:**

```json
{
  "status": "error",
  "message": "Konfirmasi password tidak cocok",
  "data": null
}
```

**400 Bad Request - Password Sama dengan Lama:**

```json
{
  "status": "error",
  "message": "Password baru tidak boleh sama dengan password lama",
  "data": null
}
```

**401 Unauthorized - Token Expired:**

```json
{
  "status": "error",
  "message": "Token sudah kadaluarsa, silakan login kembali",
  "data": null
}
```

**401 Unauthorized - Invalid Token:**

```json
{
  "status": "error",
  "message": "Token tidak valid",
  "data": null
}
```

---

## Password Policy

**Rules:**

- ✅ Minimal 8 karakter
- ✅ Harus mengandung huruf (A-Z atau a-z)
- ✅ Harus mengandung angka (0-9)

**Valid Examples:**

- `password123` ✅
- `BudiGuru2025` ✅
- `siswa123abc` ✅

**Invalid Examples:**

- `pass123` ❌ (< 8 karakter)
- `12345678` ❌ (tidak ada huruf)
- `password` ❌ (tidak ada angka)

**Regex:** `/^(?=.*[A-Za-z])(?=.*\d).{8,}$/`

---

## Token Information

### Temp Token

- **Expiry:** 30 menit
- **Usage:** Hanya untuk endpoint `/api/auth/change-default-password`
- **Payload:**
  ```json
  {
    "id": 64,
    "role": "guru",
    "temp": true
  }
  ```

### Normal JWT Token

- **Expiry:** 1 jam
- **Usage:** Semua endpoint protected
- **Payload:**
  ```json
  {
    "id": 64,
    "role": "guru",
    "guru_id": 10
  }
  ```

---

## Database Schema

**Table:** `users`

**New Column:**

```sql
must_change_password TINYINT(1) NOT NULL DEFAULT 0
COMMENT '0 = Normal login, 1 = Harus ganti password'
```

**Values:**

- `0` - User bisa login normal
- `1` - User harus ganti password dulu

---

## Frontend Integration Guide

### 1. Login Handler

```javascript
// authService.js
export const login = async (username, password) => {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  })

  const data = await response.json()

  if (data.status === 'success') {
    if (data.data.force_password_change) {
      // Save temp token
      localStorage.setItem('temp_token', data.data.temp_token)
      localStorage.setItem('force_password_change', 'true')
      localStorage.setItem('user', JSON.stringify(data.data.user))

      return { redirectTo: '/change-password' }
    } else {
      // Normal login
      localStorage.setItem('token', data.data.token)
      localStorage.setItem('user', JSON.stringify(data.data.user))

      return { redirectTo: getDashboardRoute(data.data.user.role) }
    }
  }

  throw new Error(data.message)
}
```

### 2. Change Password Handler

```javascript
// authService.js
export const changeDefaultPassword = async (newPassword, confirmPassword) => {
  const tempToken = localStorage.getItem('temp_token')

  const response = await fetch('/api/auth/change-default-password', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${tempToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      new_password: newPassword,
      confirm_password: confirmPassword,
    }),
  })

  const data = await response.json()

  if (response.status === 401) {
    // Token expired, redirect to login
    localStorage.clear()
    window.location.href = '/login'
    throw new Error('Session expired')
  }

  if (data.status === 'success') {
    // Clear temp data
    localStorage.removeItem('temp_token')
    localStorage.removeItem('force_password_change')

    // Save new token
    localStorage.setItem('token', data.data.token)
    localStorage.setItem('user', JSON.stringify(data.data.user))

    return { success: true, user: data.data.user }
  }

  throw new Error(data.message)
}
```

### 3. Router Guard

```javascript
// router/index.js
router.beforeEach((to, from, next) => {
  const forcePasswordChange = localStorage.getItem('force_password_change')

  // Jika harus ganti password, redirect ke /change-password
  if (forcePasswordChange === 'true') {
    if (to.path !== '/change-password' && to.path !== '/login') {
      return next('/change-password')
    }
  }

  // Jika sudah login normal, tidak boleh akses /change-password
  const token = localStorage.getItem('token')
  if (to.path === '/change-password' && token && !forcePasswordChange) {
    return next('/dashboard')
  }

  next()
})
```

### 4. Password Validation (Client-Side)

```javascript
// utils/validation.js
export const validatePassword = (password) => {
  const errors = []

  if (password.length < 8) {
    errors.push('Password minimal 8 karakter')
  }

  if (!/[A-Za-z]/.test(password)) {
    errors.push('Password harus mengandung huruf')
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Password harus mengandung angka')
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}
```

---

## Testing Scenarios

### Test Case 1: New User First Login

1. Admin create user baru
2. User login dengan password default
3. Response: `force_password_change: true` + `temp_token`
4. Frontend redirect ke `/change-password`
5. User input password baru yang valid
6. Submit → Success → Auto-login → Dashboard

### Test Case 2: Admin Reset Password

1. Admin reset password user
2. User login dengan password default baru
3. Response: `force_password_change: true` + `temp_token`
4. User ganti password
5. Success → Auto-login

### Test Case 3: Token Expired

1. User dapat temp_token
2. Tunggu > 30 menit
3. Submit change password
4. Response: 401 - Token expired
5. Frontend auto logout → redirect login

### Test Case 4: Validation Error

1. User input password < 8 karakter
2. Response: 400 - Password minimal 8 karakter
3. User input password tanpa angka
4. Response: 400 - Password harus mengandung angka

### Test Case 5: Password Sama dengan Lama

1. User input new_password = password lama
2. Response: 400 - Password tidak boleh sama dengan lama
3. User input password berbeda
4. Success

---

## Security Considerations

1. ✅ **Temp token expiry 30 menit** - Mencegah token disalahgunakan
2. ✅ **Password tidak boleh sama dengan lama** - Forced change yang meaningful
3. ✅ **Password policy enforcement** - Minimal security standard
4. ✅ **Auto-clear flag setelah ganti** - User tidak perlu ganti lagi setelah berhasil
5. ✅ **Separate middleware** - Temp token hanya untuk endpoint khusus
6. ✅ **Database flag** - Persistent state di database

---

## Admin Workflow

### Create New User

```javascript
POST /api/admin/users
{
  "role": "guru",
  "guru_id": 10
}

// Backend auto-set:
// - password = "20251123" (tanggal hari ini)
// - must_change_password = 1

// Response include password default
{
  "status": "success",
  "data": {
    "user": { ... },
    "password": "20251123"  // Admin bisa kasih tau user
  }
}
```

### Reset Password

```javascript
POST /api/admin/users/:id/reset-password

// Backend auto-set:
// - password = "20251123" (tanggal hari ini)
// - must_change_password = 1

// Response include password baru
{
  "status": "success",
  "message": "Password berhasil direset",
  "data": {
    "password": "20251123"  // Admin bisa kasih tau user
  }
}
```

---

## Migration SQL

Run this SQL before deploying:

```sql
-- Add must_change_password column
ALTER TABLE `users`
ADD COLUMN `must_change_password` TINYINT(1) NOT NULL DEFAULT 0
COMMENT '0 = Normal login, 1 = Harus ganti password'
AFTER `password`;

-- Set existing users to normal (optional)
UPDATE `users` SET `must_change_password` = 0;
```

---

## Rollback (If Needed)

```sql
-- Remove column
ALTER TABLE `users` DROP COLUMN `must_change_password`;
```

---

## Support & Notes

- **Feature owner:** Backend Team
- **Last updated:** 2025-11-23
- **Version:** 1.0.0
- **Status:** ✅ Production Ready

**Questions?** Contact backend team.
