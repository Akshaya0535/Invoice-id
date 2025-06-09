import crypto from "crypto"
import { cookies } from "next/headers"
import type { User } from "@/types"
import clientPromise from "./mongodb"

export function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex")
}

export function verifyPassword(password: string, hashedPassword: string): boolean {
  const hash = hashPassword(password)
  return hash === hashedPassword
}

export async function createSession(user: { id: string; username: string; role: string }) {
  const sessionData = JSON.stringify(user)
  const cookieStore = await cookies()

  cookieStore.set("session", sessionData, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  })
}

export async function getSession() {
  try {
    const cookieStore = await cookies()
    const session = cookieStore.get("session")

    if (!session) return null

    return JSON.parse(session.value)
  } catch {
    return null
  }
}

export async function destroySession() {
  const cookieStore = await cookies()
  cookieStore.delete("session")
}

export async function getUserFromDb(username: string): Promise<User | null> {
  try {
    const client = await clientPromise
    const db = client.db("invoice_system")
    const user = await db.collection("users").findOne({ username })

    if (!user) return null

    return {
      id: user._id.toString(),
      username: user.username,
      password: user.password,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      createdBy: user.createdBy,
    }
  } catch (error) {
    console.error("Error fetching user:", error)
    return null
  }
}

export async function createUser(userData: Omit<User, "id" | "createdAt" | "updatedAt">) {
  try {
    const client = await clientPromise
    const db = client.db("invoice_system")

    const hashedPassword = hashPassword(userData.password)

    const result = await db.collection("users").insertOne({
      username: userData.username,
      password: hashedPassword,
      role: userData.role,
      createdBy: userData.createdBy,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    return result.insertedId.toString()
  } catch (error) {
    console.error("Error creating user:", error)
    throw error
  }
}
