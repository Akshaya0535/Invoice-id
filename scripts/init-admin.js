import { MongoClient } from "mongodb"
import crypto from "crypto"

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  throw new Error("Please add your MongoDB URI to .env.local")
}

function hashPassword(password) {
  return crypto.createHash("sha256").update(password).digest("hex")
}

function generateSecurePassword(length = 16) {
  const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*"
  let password = ""
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length))
  }
  return password
}

async function initializeAdmin() {
  const client = new MongoClient(MONGODB_URI)

  try {
    await client.connect()
    const db = client.db("invoice_system")

    // Check if admin user already exists
    const existingAdmin = await db.collection("users").findOne({ username: "admin" })

    if (existingAdmin) {
      console.log("Admin user already exists")
      return
    }

    // Generate a secure random password
    const securePassword = generateSecurePassword()

    // Create admin user
    const adminUser = {
      username: "admin",
      password: hashPassword(securePassword),
      role: "admin",
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: "system",
      mustChangePassword: true, // Flag to force password change on first login
    }

    await db.collection("users").insertOne(adminUser)
    console.log("Admin user created successfully!")
    console.log("=" * 50)
    console.log("IMPORTANT: Save these credentials securely!")
    console.log("Username: admin")
    console.log(`Password: ${securePassword}`)
    console.log("=" * 50)
    console.log("⚠️  You will be required to change this password on first login")
    console.log("⚠️  This password will not be shown again!")
  } catch (error) {
    console.error("Error initializing admin user:", error)
  } finally {
    await client.close()
  }
}

initializeAdmin()
