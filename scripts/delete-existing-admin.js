import { MongoClient } from "mongodb"
import { config } from "dotenv"

// Load environment variables
config({ path: ".env.local" })

async function deleteExistingAdmin() {
  const uri = process.env.MONGODB_URI

  if (!uri) {
    console.error("❌ MONGODB_URI environment variable is not set")
    process.exit(1)
  }

  const client = new MongoClient(uri)

  try {
    await client.connect()
    console.log("✅ Connected to MongoDB")

    const db = client.db()
    const usersCollection = db.collection("users")

    // Delete existing admin user
    const result = await usersCollection.deleteOne({ username: "admin" })

    if (result.deletedCount > 0) {
      console.log("🗑️  Existing admin user deleted successfully")
    } else {
      console.log("ℹ️  No existing admin user found")
    }
  } catch (error) {
    console.error("❌ Error deleting admin user:", error.message)
  } finally {
    await client.close()
    console.log("📝 Database connection closed")
  }
}

deleteExistingAdmin()
