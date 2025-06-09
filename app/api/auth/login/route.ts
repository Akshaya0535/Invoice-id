import { type NextRequest, NextResponse } from "next/server"
import { getUserFromDb, verifyPassword, createSession } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json({ error: "Username and password are required" }, { status: 400 })
    }

    const user = await getUserFromDb(username)

    if (!user || !verifyPassword(password, user.password)) {
      return NextResponse.json({ error: "Invalid username or password" }, { status: 401 })
    }

    await createSession({
      id: user.id!,
      username: user.username,
      role: user.role,
    })

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
      },
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
