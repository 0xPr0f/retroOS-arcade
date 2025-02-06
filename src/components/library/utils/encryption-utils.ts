import CryptoJS from 'crypto-js'

/**
 * Configuration interface for encryption settings
 */
interface EncryptionConfig {
  KEY_SIZE: number
  IV_SIZE: number
  SALT_SIZE: number
  ITERATIONS: number
  VERSION: string
}

/**
 * Interface for encryption options
 */
interface EncryptionOptions {
  additionalContext?: string
  [key: string]: any
}

/**
 * Interface for decryption options
 */
interface DecryptionOptions {
  maxAge?: number
  [key: string]: any
}

/**
 * Interface for encrypted data metadata
 */
interface EncryptionMetadata {
  timestamp: number
  version: string
}

/**
 * Interface for decrypted data structure
 */
interface DecryptedData {
  data: string
  metadata: EncryptionMetadata
}

/**
 * Configuration for encryption settings
 */
const CONFIG: EncryptionConfig = {
  KEY_SIZE: 64, // 256 bits
  IV_SIZE: 16, // 128 bits
  SALT_SIZE: 16,
  ITERATIONS: 10000,
  VERSION: '1', // For future versioning of encryption methods
}

/**
 * Custom error class for encryption-related errors
 */
class EncryptionError extends Error {
  public code: string

  constructor(message: string, code: string) {
    super(message)
    this.name = 'EncryptionError'
    this.code = code
  }
}

/**
 * Interface for key derivation result
 */
interface KeyDerivationResult {
  derivedKey: CryptoJS.lib.WordArray
  salt: CryptoJS.lib.WordArray
}

/**
 * Validates and retrieves the encryption key from environment
 * @returns Validated encryption key
 * @throws {EncryptionError}
 */
function getEncryptionKey(): string {
  const key = process.env.ENCRYPTION_KEY

  if (!key) {
    throw new EncryptionError('ENCRYPTION_KEY must be set', 'KEY_MISSING')
  }

  if (key.length !== CONFIG.KEY_SIZE) {
    throw new EncryptionError(
      `ENCRYPTION_KEY must be ${CONFIG.KEY_SIZE} bytes long`,
      'INVALID_KEY_LENGTH'
    )
  }

  return key
}

/**
 * Generates a key derivation using PBKDF2
 * @param key - Base encryption key
 * @param salt - Salt for key derivation
 * @returns Derived key and salt
 */
function deriveKey(
  key: string,
  salt: CryptoJS.lib.WordArray | null = null
): KeyDerivationResult {
  const keySalt = salt || CryptoJS.lib.WordArray.random(CONFIG.SALT_SIZE)
  const derivedKey = CryptoJS.PBKDF2(key, keySalt, {
    keySize: CONFIG.KEY_SIZE / 4, // keySize is in words (4 bytes each)
    iterations: CONFIG.ITERATIONS,
  })

  return { derivedKey, salt: keySalt }
}

/**
 * Encrypts data with additional security features and metadata
 * @param text - Text to encrypt
 * @param options - Optional encryption settings
 * @returns Encrypted data with metadata
 * @throws {EncryptionError}
 */
export function encrypt(text: string, options: EncryptionOptions = {}): string {
  try {
    if (!text) {
      throw new EncryptionError('Text to encrypt must be provided', 'NO_TEXT')
    }

    // Get base key and derive a new key with salt
    const baseKey = getEncryptionKey()
    const iv = CryptoJS.lib.WordArray.random(CONFIG.IV_SIZE)
    const { derivedKey, salt } = deriveKey(baseKey)

    // Add timestamp and version for metadata
    const metadata: EncryptionMetadata = {
      timestamp: Date.now(),
      version: CONFIG.VERSION,
    }

    // Combine text with metadata
    const dataToEncrypt = JSON.stringify({
      data: text,
      metadata,
    })

    // Perform encryption
    const encrypted = CryptoJS.AES.encrypt(dataToEncrypt, derivedKey, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    })

    // Combine all components with version identifier
    const components = [
      CONFIG.VERSION,
      CryptoJS.enc.Hex.stringify(salt),
      CryptoJS.enc.Hex.stringify(iv),
      encrypted.ciphertext.toString(),
    ]

    return components.join(':')
  } catch (error) {
    if (error instanceof EncryptionError) {
      throw error
    }
    throw new EncryptionError(
      `Encryption failed: ${(error as Error).message}`,
      'ENCRYPTION_FAILED'
    )
  }
}

/**
 * Decrypts data and validates its integrity
 * @param encryptedText - Encrypted text with metadata
 * @param options - Optional decryption settings
 * @returns Decrypted data with metadata
 * @throws {EncryptionError}
 */
export function decrypt(
  encryptedText: string,
  options: DecryptionOptions = {}
): DecryptedData {
  try {
    if (!encryptedText) {
      throw new EncryptionError(
        'Encrypted text must be provided',
        'NO_ENCRYPTED_TEXT'
      )
    }

    // Split components
    const [version, saltHex, ivHex, encryptedDataHex] = encryptedText.split(':')

    // Validate version
    if (version !== CONFIG.VERSION) {
      throw new EncryptionError(
        'Unsupported encryption version',
        'VERSION_MISMATCH'
      )
    }

    // Parse components
    const salt = CryptoJS.enc.Hex.parse(saltHex)
    const iv = CryptoJS.enc.Hex.parse(ivHex)
    const encryptedData = CryptoJS.enc.Hex.parse(encryptedDataHex)

    // Derive key using same process
    const baseKey = getEncryptionKey()
    const { derivedKey } = deriveKey(baseKey, salt)

    // Create cipher params
    const cipherParams = CryptoJS.lib.CipherParams.create({
      ciphertext: encryptedData,
    })

    // Decrypt
    const decrypted = CryptoJS.AES.decrypt(cipherParams, derivedKey, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    })

    const decryptedText = decrypted.toString(CryptoJS.enc.Utf8)

    if (!decryptedText) {
      throw new EncryptionError(
        'Decryption failed - invalid key or corrupted data',
        'DECRYPTION_FAILED'
      )
    }

    // Parse and validate the decrypted data
    const parsedData = JSON.parse(decryptedText) as DecryptedData

    // Validate timestamp if max age specified
    if (options.maxAge) {
      const age = Date.now() - parsedData.metadata.timestamp
      if (age > options.maxAge) {
        throw new EncryptionError('Encrypted data has expired', 'DATA_EXPIRED')
      }
    }

    return parsedData
  } catch (error) {
    if (error instanceof EncryptionError) {
      throw error
    }
    throw new EncryptionError(
      `Decryption failed: ${(error as Error).message}`,
      'DECRYPTION_FAILED'
    )
  }
}

/**
 * Utility function to rotate encryption keys
 * @param encryptedText - Text encrypted with old key
 * @param oldKey - Previous encryption key
 * @param newKey - New encryption key
 * @returns Data re-encrypted with new key
 */
export function rotateKey(
  encryptedText: string,
  oldKey: string,
  newKey: string
): string {
  // Temporarily override environment key with old key
  const originalKey = process.env.ENCRYPTION_KEY
  process.env.ENCRYPTION_KEY = oldKey

  try {
    // Decrypt with old key
    const decrypted = decrypt(encryptedText)

    // Switch to new key and re-encrypt
    process.env.ENCRYPTION_KEY = newKey
    return encrypt(decrypted.data)
  } finally {
    // Restore original key
    process.env.ENCRYPTION_KEY = originalKey
  }
}

// Example usage:
/*
try {
  // Encrypt
  const encrypted = encrypt("sensitive data", { 
    additionalContext: "user-123" 
  });

  // Decrypt with 1 hour max age
  const decrypted = decrypt(encrypted, { 
    maxAge: 60 * 60 * 1000 
  });

  console.log(decrypted.data); // Original text
  console.log(decrypted.metadata); // Encryption metadata
} catch (error) {
  if (error instanceof EncryptionError) {
    console.error(`${error.name}: ${error.message} (${error.code})`);
  }
}
*/
