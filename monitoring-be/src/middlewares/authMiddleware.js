import jwt from 'jsonwebtoken'

/**
 * Auth Middleware - Accept both normal token and temp token
 * Digunakan untuk sebagian besar endpoint protected
 */
export const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      status: 'error',
      message: 'Token tidak ditemukan',
      data: null,
    })
  }

  const token = authHeader.split(' ')[1]

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded // simpan data user ke request

    // Flag untuk tahu apakah ini temp token atau bukan
    req.isTempToken = decoded.temp === true

    next()
  } catch (error) {
    // Handle token expired
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        status: 'error',
        message: 'Token sudah kadaluarsa, silakan login kembali',
        data: null,
      })
    }

    return res.status(401).json({
      status: 'error',
      message: 'Token tidak valid',
      data: null,
    })
  }
}

/**
 * Temp Auth Middleware
 * Khusus untuk validasi temp_token (30 menit expiry)
 * Digunakan untuk endpoint change-default-password
 */
export const tempAuthMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      status: 'error',
      message: 'Token tidak ditemukan',
      data: null,
    })
  }

  const token = authHeader.split(' ')[1]

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // Validasi bahwa ini adalah temp token
    if (!decoded.temp) {
      return res.status(401).json({
        status: 'error',
        message: 'Token tidak valid untuk operasi ini',
        data: null,
      })
    }

    req.user = decoded // simpan data user ke request
    next()
  } catch (error) {
    // Handle token expired
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        status: 'error',
        message: 'Token sudah kadaluarsa, silakan login kembali',
        data: null,
      })
    }

    return res.status(401).json({
      status: 'error',
      message: 'Token tidak valid',
      data: null,
    })
  }
}
