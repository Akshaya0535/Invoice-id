import { type NextRequest, NextResponse } from "next/server"
import { getSession, hashPassword, verifyPassword } from "@/lib/auth"
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"

// Add import for password validation
import { validatePassword } from "@/lib/password-validation"

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { currentPassword, newPassword } = await request.json()

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: "Current password and new password are required" }, { status: 400 })
    }

    // Validate password
    const passwordValidation = validatePassword(newPassword)
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        {
          error: "Password does not meet security requirements: " + passwordValidation.errors.join(", "),
        },
        { status: 400 },
      )
    }

    const client = await clientPromise
    const db = client.db("invoice_system")

    // Get current user
    const user = await db.collection("users").findOne({ _id: new ObjectId(session.id) })
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Verify current password
    if (!verifyPassword(currentPassword, user.password)) {
      return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 })
    }

    // Update password
    const hashedNewPassword = hashPassword(newPassword)
    await db.collection("users").updateOne(
      { _id: new ObjectId(session.id) },
      {
        $set: {
          password: hashedNewPassword,
          mustChangePassword: false,
          updatedAt: new Date(),
        },
      },
    )

    return NextResponse.json({ success: true, message: "Password changed successfully" })
  } catch (error) {
    console.error("Change password error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
