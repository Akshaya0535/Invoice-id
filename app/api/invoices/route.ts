import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { getCurrentFinancialYear, generateInvoiceNumber } from "@/lib/utils"

export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db("invoicing")

    const invoices = await db.collection("invoices").find({}).sort({ invoiceDate: -1 }).toArray()

    return NextResponse.json(invoices)
  } catch (error) {
    console.error("Failed to fetch invoices:", error)
    return NextResponse.json({ error: "Failed to fetch invoices" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const client = await clientPromise
    const db = client.db("invoicing")
    const data = await request.json()

    // Get current financial year
    const financialYear = getCurrentFinancialYear()

    // Find the last invoice number for the current financial year
    const lastInvoice = await db
      .collection("invoices")
      .find({ invoiceNumber: { $regex: financialYear } })
      .sort({ invoiceNumber: -1 })
      .limit(1)
      .toArray()

    const lastInvoiceNumber = lastInvoice.length > 0 ? lastInvoice[0].invoiceNumber : null

    // Generate new invoice number
    const invoiceNumber = generateInvoiceNumber(lastInvoiceNumber, financialYear)

    // Add invoice number and timestamps to the data
    const invoiceData = {
      ...data,
      invoiceNumber,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await db.collection("invoices").insertOne(invoiceData)

    return NextResponse.json(
      {
        message: "Invoice created successfully",
        id: result.insertedId,
        invoiceNumber,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Failed to create invoice:", error)
    return NextResponse.json({ error: "Failed to create invoice" }, { status: 500 })
  }
}
