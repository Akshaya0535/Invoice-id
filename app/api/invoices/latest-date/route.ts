import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db("invoicing")

    const latestInvoice = await db.collection("invoices").find({}).sort({ invoiceDate: -1 }).limit(1).toArray()

    if (latestInvoice.length === 0) {
      return NextResponse.json({ latestDate: null })
    }

    return NextResponse.json({
      latestDate: latestInvoice[0].invoiceDate,
    })
  } catch (error) {
    console.error("Failed to fetch latest invoice date:", error)
    return NextResponse.json({ error: "Failed to fetch latest invoice date" }, { status: 500 })
  }
}
