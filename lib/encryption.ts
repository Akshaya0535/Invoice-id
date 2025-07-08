import crypto from "crypto"

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex')
const ALGORITHM = 'aes-256-gcm'

export class DatabaseEncryption {
  private static generateIV(): Buffer {
    return crypto.randomBytes(16)
  }

  private static deriveKey(password: string, salt: Buffer): Buffer {
    return crypto.pbkdf2Sync(password, salt, 100000, 32, 'sha256')
  }

  static encrypt(text: string): { encryptedData: string; iv: string; authTag: string } {
    const iv = this.generateIV()
    const cipher = crypto.createCipher(ALGORITHM, ENCRYPTION_KEY)
    cipher.setAAD(Buffer.from('invoice-system', 'utf8'))
    
    let encrypted = cipher.update(text, 'utf8', 'hex')
    encrypted += cipher.final('hex')
    
    return {
      encryptedData: encrypted,
      iv: iv.toString('hex'),
      authTag: cipher.getAuthTag().toString('hex')
    }
  }

  static decrypt(encryptedData: string, iv: string, authTag: string): string {
    const decipher = crypto.createDecipher(ALGORITHM, ENCRYPTION_KEY)
    decipher.setAAD(Buffer.from('invoice-system', 'utf8'))
    decipher.setAuthTag(Buffer.from(authTag, 'hex'))
    
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8')
    decrypted += decipher.final('utf8')
    
    return decrypted
  }

  // Encrypt sensitive fields in an object
  static encryptObject(obj: any, fieldsToEncrypt: string[]): any {
    const encrypted = { ...obj }
    
    fieldsToEncrypt.forEach(field => {
      if (obj[field] && typeof obj[field] === 'string') {
        const encryptedData = this.encrypt(obj[field])
        encrypted[field] = {
          encrypted: encryptedData.encryptedData,
          iv: encryptedData.iv,
          authTag: encryptedData.authTag
        }
      }
    })
    
    return encrypted
  }

  // Decrypt sensitive fields in an object
  static decryptObject(obj: any, fieldsToDecrypt: string[]): any {
    const decrypted = { ...obj }
    
    fieldsToDecrypt.forEach(field => {
      if (obj[field] && typeof obj[field] === 'object' && obj[field].encrypted) {
        try {
          decrypted[field] = this.decrypt(
            obj[field].encrypted,
            obj[field].iv,
            obj[field].authTag
          )
        } catch (error) {
          // If decryption fails, keep the encrypted data
          decrypted[field] = '[ENCRYPTED]'
        }
      }
    })
    
    return decrypted
  }

  // Hash sensitive data for search (one-way)
  static hashForSearch(text: string): string {
    return crypto.createHash('sha256').update(text.toLowerCase()).digest('hex')
  }

  // Generate a secure random string
  static generateSecureString(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex')
  }
}

// Predefined encryption schemas for different data types
export const EncryptionSchemas = {
  user: {
    fields: ['email', 'phone', 'address'],
    searchable: ['email', 'phone']
  },
  client: {
    fields: ['gstin', 'phone', 'email'],
    searchable: ['gstin', 'phone', 'email']
  },
  invoice: {
    fields: ['clientDetails', 'notes'],
    searchable: []
  }
}

// Utility functions for common encryption tasks
export const encryptUserData = (userData: any) => 
  DatabaseEncryption.encryptObject(userData, EncryptionSchemas.user.fields)

export const decryptUserData = (userData: any) => 
  DatabaseEncryption.decryptObject(userData, EncryptionSchemas.user.fields)

export const encryptClientData = (clientData: any) => 
  DatabaseEncryption.encryptObject(clientData, EncryptionSchemas.client.fields)

export const decryptClientData = (clientData: any) => 
  DatabaseEncryption.decryptObject(clientData, EncryptionSchemas.client.fields) 