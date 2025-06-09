import { MongoClient } from "mongodb"

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  throw new Error("Please add your MongoDB URI to .env.local")
}

async function deleteExistingAdmin() {
  const client = new MongoClient(MONGODB_URI)

  try {
    await client.connect()
    const db = client.db("invoice_system")

    // Delete existing admin user
    const result = await db.collection("users").deleteOne({ username: "admin" })

    if (result.deletedCount > 0) {
      console.log("✅ Existing admin user deleted successfully")
    } else {
      console.log("ℹ️  No existing admin user found")
    }
  } catch (error) {
    console.error("Error deleting admin user:", error)
  } finally {
    await client.close()
  }
}

deleteExistingAdmin()
