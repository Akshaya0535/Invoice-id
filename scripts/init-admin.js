import { MongoClient } from "mongodb"
import crypto from "crypto"
import bcrypt from "bcryptjs"

// Update the generateSecurePassword function to ensure it meets our requirements
function generateSecurePassword(length = 16) {
  // Ensure we have at least one of each required character type
  const uppercaseChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
  const lowercaseChars = "abcdefghijklmnopqrstuvwxyz"
  const numberChars = "0123456789"
  const specialChars = "!@#$%^&*()_+-=[]{}|;:,.<>?"

  // Start with one character from each required set
  let password = ""
  password += uppercaseChars[crypto.randomInt(0, uppercaseChars.length)]
  password += lowercaseChars[crypto.randomInt(0, lowercaseChars.length)]
  password += numberChars[crypto.randomInt(0, numberChars.length)]
  password += specialChars[crypto.randomInt(0, specialChars.length)]

  // Fill the rest with random characters from all sets
  const allChars = uppercaseChars + lowercaseChars + numberChars + specialChars
  const remainingLength = length - 4

  for (let i = 0; i < remainingLength; i++) {
    const randomIndex = crypto.randomInt(0, allChars.length)
    password += allChars[randomIndex]
  }

  // Shuffle the password to avoid predictable pattern
  return password
    .split("")
    .sort(() => 0.5 - Math.random())
    .join("")
}

async function createAdminUser() {
  const uri = process.env.MONGODB_URI

  if (!uri) {
    console.error("❌ MONGODB_URI environment variable is not set")
    console.log("Please add MONGODB_URI to your .env.local file")
    process.exit(1)
  }

  const client = new MongoClient(uri)

  try {
    await client.connect()
    console.log("✅ Connected to MongoDB")

    const db = client.db()
    const usersCollection = db.collection("users")

    // Check if admin user already exists
    const existingAdmin = await usersCollection.findOne({ username: "admin" })
    if (existingAdmin) {
      console.log("⚠️  Admin user already exists!")
      console.log("Run 'node scripts/delete-existing-admin.js' first if you want to recreate it")
      return
    }

    // Generate secure password
    const password = generateSecurePassword(16)
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create admin user
    const adminUser = {
      username: "admin",
      password: hashedPassword,
      role: "admin",
      mustChangePassword: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    await usersCollection.insertOne(adminUser)

    console.log("\n🎉 Admin user created successfully!")
    console.log("==================================================")
    console.log("🔐 IMPORTANT: Save these credentials securely!")
    console.log(`Username: admin`)
    console.log(`Password: ${password}`)
    console.log("==================================================")
    console.log("⚠️  You will be required to change this password on first login")
    console.log("⚠️  This password will not be shown again!")
    console.log("\n💡 Next steps:")
    console.log("1. Save the password in a secure location")
    console.log("2. Start your app: npm run dev")
    console.log("3. Go to http://localhost:3000/login")
    console.log("4. Login with the credentials above")
    console.log("5. You'll be redirected to change your password\n")
  } catch (error) {
    console.error("❌ Error creating admin user:", error.message)
    process.exit(1)
  } finally {
    await client.close()
    console.log("📝 Database connection closed")
  }
}

// Load environment variables
import { config } from "dotenv"
config({ path: ".env.local" })

createAdminUser()
