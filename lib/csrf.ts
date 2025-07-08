import crypto from "crypto"
import { cookies } from "next/headers"
import { NextRequest, NextResponse } from "next/server"

const CSRF_SECRET = process.env.CSRF_SECRET || crypto.randomBytes(32).toString('hex')
const CSRF_TOKEN_NAME = 'csrf-token'
const CSRF_HEADER_NAME = 'x-csrf-token'

export class CSRFProtection {
  private static generateToken(): string {
    return crypto.randomBytes(32).toString('hex')
  }

  private static hashToken(token: string): string {
    return crypto.createHmac('sha256', CSRF_SECRET).update(token).digest('hex')
  }

  static async generateCSRFToken(): Promise<string> {
    const token = this.generateToken()
    const hashedToken = this.hashToken(token)
    
    const cookieStore = await cookies()
    cookieStore.set(CSRF_TOKEN_NAME, hashedToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24, // 24 hours
      path: "/",
    })
    
    return token
  }

  static async validateCSRFToken(request: NextRequest): Promise<boolean> {
    try {
      const cookieStore = await cookies()
      const storedToken = cookieStore.get(CSRF_TOKEN_NAME)
      
      if (!storedToken) {
        return false
      }

      const headerToken = request.headers.get(CSRF_HEADER_NAME)
      if (!headerToken) {
        return false
      }

      const expectedHash = this.hashToken(headerToken)
      return crypto.timingSafeEqual(
        Buffer.from(storedToken.value, 'hex'),
        Buffer.from(expectedHash, 'hex')
      )
    } catch {
      return false
    }
  }

  static async refreshCSRFToken(): Promise<string> {
    const cookieStore = await cookies()
    cookieStore.delete(CSRF_TOKEN_NAME)
    return this.generateCSRFToken()
  }

  static getCSRFHeaderName(): string {
    return CSRF_HEADER_NAME
  }
}

// Middleware to add CSRF protection to API routes
export function withCSRFProtection(
  handler: (request: NextRequest) => Promise<NextResponse>
) {
  return async (request: NextRequest) => {
    // Skip CSRF for GET requests and public endpoints
    if (request.method === 'GET') {
      return handler(request)
    }

    // Skip CSRF for login endpoint (handled separately)
    if (request.nextUrl.pathname === '/api/auth/login') {
      return handler(request)
    }

    const isValidCSRF = await CSRFProtection.validateCSRFToken(request)
    if (!isValidCSRF) {
      return NextResponse.json(
        { error: "CSRF token validation failed" },
        { status: 403 }
      )
    }

    return handler(request)
  }
}

// Utility to get CSRF token for frontend
export async function getCSRFToken(): Promise<string> {
  return CSRFProtection.generateCSRFToken()
} 