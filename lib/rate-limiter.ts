import { NextRequest, NextResponse } from "next/server"
import { createRateLimiter } from "./validation"

// Create rate limiters for different endpoints
const loginRateLimiter = createRateLimiter(5, 15 * 60 * 1000) // 5 attempts per 15 minutes
const apiRateLimiter = createRateLimiter(100, 60 * 1000) // 100 requests per minute
const authRateLimiter = createRateLimiter(10, 60 * 1000) // 10 requests per minute

export function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for")
  const realIP = request.headers.get("x-real-ip")
  const cfConnectingIP = request.headers.get("cf-connecting-ip")
  
  if (forwarded) {
    return forwarded.split(",")[0].trim()
  }
  if (realIP) {
    return realIP
  }
  if (cfConnectingIP) {
    return cfConnectingIP
  }
  
  return "unknown"
}

export function rateLimitLogin(request: NextRequest): NextResponse | null {
  const clientIP = getClientIP(request)
  
  if (loginRateLimiter(clientIP)) {
    return NextResponse.json(
      { error: "Too many login attempts. Please try again later." },
      { status: 429 }
    )
  }
  
  return null
}

export function rateLimitAPI(request: NextRequest): NextResponse | null {
  const clientIP = getClientIP(request)
  
  if (apiRateLimiter(clientIP)) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 }
    )
  }
  
  return null
}

export function rateLimitAuth(request: NextRequest): NextResponse | null {
  const clientIP = getClientIP(request)
  
  if (authRateLimiter(clientIP)) {
    return NextResponse.json(
      { error: "Too many authentication requests. Please try again later." },
      { status: 429 }
    )
  }
  
  return null
}

// Middleware wrapper for rate limiting
export function withRateLimit(
  handler: (request: NextRequest) => Promise<NextResponse>,
  rateLimiter: (request: NextRequest) => NextResponse | null
) {
  return async (request: NextRequest) => {
    const rateLimitResponse = rateLimiter(request)
    if (rateLimitResponse) {
      return rateLimitResponse
    }
    
    return handler(request)
  }
} 