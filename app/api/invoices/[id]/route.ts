import { NextResponse } from "next/server"
import { ObjectId } from "mongodb"
import clientPromise from "@/lib/mongodb"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const client = await clientPromise
    const db = client.db("invoicing")

    const invoice = await db.collection("invoices").findOne({ _id: new ObjectId(params.id) })

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 })
    }

    return NextResponse.json(invoice)
  } catch (error) {
    console.error("Failed to fetch invoice:", error)
    return NextResponse.json({ error: "Failed to fetch invoice" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const client = await clientPromise
    const db = client.db("invoicing")
    const data = await request.json()

    // Check if the invoice date is valid (after the previous invoice)
    if (data.invoiceDate) {
      const previousInvoice = await db
        .collection("invoices")
        .find({
          _id: { $ne: new ObjectId(params.id) },
          invoiceDate: { $lt: new Date(data.invoiceDate) },
        })
        .sort({ invoiceDate: -1 })
        .limit(1)
        .toArray()

      if (previousInvoice.length > 0 && new Date(data.invoiceDate) <= new Date(previousInvoice[0].invoiceDate)) {
        return NextResponse.json({ error: "Invoice date must be after the previous invoice date" }, { status: 400 })
      }
    }

    // Update the invoice
    const result = await db.collection("invoices").updateOne(
      { _id: new ObjectId(params.id) },
      {
        $set: {
          ...data,
          updatedAt: new Date(),
        },
      },
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 })
    }

    return NextResponse.json({
      message: "Invoice updated successfully",
    })
  } catch (error) {
    console.error("Failed to update invoice:", error)
    return NextResponse.json({ error: "Failed to update invoice" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const client = await clientPromise
    const db = client.db("invoicing")

    const result = await db.collection("invoices").deleteOne({ _id: new ObjectId(params.id) })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 })
    }

    return NextResponse.json({
      message: "Invoice deleted successfully",
    })
  } catch (error) {
    console.error("Failed to delete invoice:", error)
    return NextResponse.json({ error: "Failed to delete invoice" }, { status: 500 })
  }
}
