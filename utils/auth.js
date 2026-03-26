const jwt = require('jsonwebtoken')

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  )
}

const verifyToken = (token) => {
  if (!token) return null
  try {
    const clean = token.replace('Bearer ', '')
    return jwt.verify(clean, process.env.JWT_SECRET)
  } catch {
    return null
  }
}

module.exports = { generateToken, verifyToken }