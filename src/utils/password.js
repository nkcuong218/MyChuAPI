import crypto from 'crypto'

/**
 * Hash a plain text password using PBKDF2 (SHA-512)
 * Format stored: salt:hash
 */
export const hashPassword = (password) => {
  if (!password) return ''
  const salt = crypto.randomBytes(16).toString('hex')
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex')
  return `${salt}:${hash}`
}

/**
 * Verify a plain text password against stored password
 * Supports both PBKDF2 hash (salt:hash) and legacy plaintext (for existing seed data)
 */
export const verifyPassword = (plainPassword, storedPassword) => {
  if (!plainPassword || !storedPassword) return false

  // If password is stored in salt:hash format
  if (storedPassword.includes(':')) {
    const [salt, originalHash] = storedPassword.split(':')
    const hash = crypto.pbkdf2Sync(plainPassword, salt, 1000, 64, 'sha512').toString('hex')
    return hash === originalHash
  }

  // Backward compatibility for legacy plaintext passwords (e.g. initial demo/seed data)
  return plainPassword === storedPassword
}

