import { MongoClient } from "mongodb"
import crypto from "crypto"

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  throw new Error("Please add your MongoDB URI to .env.local")
}

function hashPassword(password) {
  return crypto.createHash("sha256").update(password).digest("hex")
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

    // Create admin user
    const adminUser = {
      username: "admin",
      password: hashPassword("admin123"), // Change this password!
      role: "admin",
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: "system",
    }

    await db.collection("users").insertOne(adminUser)
    console.log("Admin user created successfully!")
    console.log("Username: admin")
    console.log("Password: admin123")
    console.log("Please change the password after first login!")
  } catch (error) {
    console.error("Error initializing admin user:", error)
  } finally {
    await client.close()
  }
}

initializeAdmin()
