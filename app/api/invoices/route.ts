import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { getCurrentFinancialYear, generateInvoiceNumber } from "@/lib/utils"
import { ObjectId } from "mongodb"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const client = searchParams.get("client")
    const financialYear = searchParams.get("financialYear")
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")
    const sortField = searchParams.get("sortField") || "invoiceDate"
    const sortOrder = searchParams.get("sortOrder") === "asc" ? 1 : -1

    const client_db = await clientPromise
    const db = client_db.db("invoicing")

    // Build query based on filters
    const query: any = {}

    if (client) {
      // Try to match by client ID first
      try {
        query["client._id"] = new ObjectId(client)
      } catch {
        // If not a valid ObjectId, search by client name
        query["client.name"] = { $regex: client, $options: "i" }
      }
    }

    if (financialYear) {
      query.invoiceNumber = { $regex: financialYear, $options: "i" }
    }

    // Date range filter
    if (startDate || endDate) {
      query.invoiceDate = {}

      if (startDate) {
        query.invoiceDate.$gte = new Date(startDate)
      }

      if (endDate) {
        query.invoiceDate.$lte = new Date(endDate)
      }
    }

    // Execute query with sorting
    const invoices = await db
      .collection("invoices")
      .find(query)
      .sort({ [sortField]: sortOrder })
      .toArray()

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
