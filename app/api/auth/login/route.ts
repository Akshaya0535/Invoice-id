import { type NextRequest, NextResponse } from "next/server"
import { getUserFromDb, verifyPassword, createSession } from "@/lib/auth"
import { loginSchema } from "@/lib/validation"
import { rateLimitLogin } from "@/lib/rate-limiter"
import { logError, logInfo, logger } from "@/lib/logger"

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    // Rate limiting
    const rateLimitResponse = rateLimitLogin(request)
    if (rateLimitResponse) {
      logger.securityEvent("Rate limit exceeded", { endpoint: "/api/auth/login" }, request)
      return rateLimitResponse
    }

    const body = await request.json()

    // Input validation
    const validationResult = loginSchema.safeParse(body)
    if (!validationResult.success) {
      logger.securityEvent("Invalid login input", { 
        errors: validationResult.error.errors,
        endpoint: "/api/auth/login"
      }, request)
      return NextResponse.json(
        { error: "Invalid input", details: validationResult.error.errors },
        { status: 400 }
      )
    }

    const { username, password } = validationResult.data

    const user = await getUserFromDb(username)

    if (!user || !(await verifyPassword(password, user.password))) {
      // Use consistent timing to prevent timing attacks
      await new Promise(resolve => setTimeout(resolve, 100))
      logger.securityEvent("Failed login attempt", { 
        username,
        endpoint: "/api/auth/login"
      }, request)
      return NextResponse.json({ error: "Invalid username or password" }, { status: 401 })
    }

    await createSession({
      id: user.id!,
      username: user.username,
      role: user.role,
      mustChangePassword: user.mustChangePassword || false,
    })

    logInfo("User logged in successfully", { 
      userId: user.id,
      username: user.username,
      role: user.role
    }, request)

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        mustChangePassword: user.mustChangePassword || false,
      },
    })
  } catch (error) {
    logError("Login error", { 
      error: error instanceof Error ? error.message : "Unknown error",
      endpoint: "/api/auth/login"
    }, request)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  } finally {
    const duration = Date.now() - startTime
    logInfo("Login request completed", { duration }, request)
  }
}
