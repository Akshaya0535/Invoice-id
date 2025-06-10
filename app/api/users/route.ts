import { type NextRequest, NextResponse } from "next/server"
import { getSession, createUser } from "@/lib/auth"
import clientPromise from "@/lib/mongodb"
// Add import for password validation
import { validatePassword } from "@/lib/password-validation"

export async function GET() {
  try {
    const session = await getSession()

    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const client = await clientPromise
    const db = client.db("invoice_system")
    const users = await db
      .collection("users")
      .find({}, { projection: { password: 0 } })
      .toArray()

    return NextResponse.json(
      users.map((user) => ({
        id: user._id.toString(),
        username: user.username,
        role: user.role,
        createdAt: user.createdAt,
        createdBy: user.createdBy,
      })),
    )
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Update the POST method
export async function POST(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { username, password, role } = await request.json()

    if (!username || !password || !role) {
      return NextResponse.json({ error: "Username, password, and role are required" }, { status: 400 })
    }

    if (!["admin", "read-only", "read-write"].includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 })
    }

    // Validate password
    const passwordValidation = validatePassword(password)
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        {
          error: "Password does not meet security requirements: " + passwordValidation.errors.join(", "),
        },
        { status: 400 },
      )
    }

    // Check if user already exists
    const client = await clientPromise
    const db = client.db("invoice_system")
    const existingUser = await db.collection("users").findOne({ username })

    if (existingUser) {
      return NextResponse.json({ error: "Username already exists" }, { status: 400 })
    }

    const userId = await createUser({
      username,
      password,
      role,
      createdBy: session.id,
    })

    return NextResponse.json({
      success: true,
      userId,
    })
  } catch (error) {
    console.error("Error creating user:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
