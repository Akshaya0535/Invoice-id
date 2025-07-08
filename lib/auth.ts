import crypto from "crypto"
import bcrypt from "bcryptjs"
import { cookies } from "next/headers"
import type { User } from "@/types"
import clientPromise from "./mongodb"

// Add JWT for secure session management
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || crypto.randomBytes(64).toString('hex')
const SESSION_SECRET = process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex')

export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12
  return await bcrypt.hash(password, saltRounds)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword)
}

export async function createSession(user: { id: string; username: string; role: string }) {
  const sessionId = crypto.randomBytes(32).toString('hex')
  const sessionData = {
    id: user.id,
    username: user.username,
    role: user.role,
    sessionId,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 7), // 7 days
  }
  
  const token = jwt.sign(sessionData, JWT_SECRET, { expiresIn: '7d' })
  const cookieStore = await cookies()

  cookieStore.set("session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  })
}

export async function getSession() {
  try {
    const cookieStore = await cookies()
    const session = cookieStore.get("session")

    if (!session) return null

    const decoded = jwt.verify(session.value, JWT_SECRET) as any
    
    // Check if session is expired
    if (decoded.exp && decoded.exp < Math.floor(Date.now() / 1000)) {
      await destroySession()
      return null
    }

    return decoded
  } catch {
    await destroySession()
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

    const hashedPassword = await hashPassword(userData.password)

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
