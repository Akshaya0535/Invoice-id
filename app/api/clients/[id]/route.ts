import { NextResponse } from "next/server"
import { ObjectId } from "mongodb"
import clientPromise from "@/lib/mongodb"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const client = await clientPromise
    const db = client.db("invoicing")

    const clientData = await db.collection("clients").findOne({ _id: new ObjectId(params.id) })

    if (!clientData) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 })
    }

    return NextResponse.json(clientData)
  } catch (error) {
    console.error("Failed to fetch client:", error)
    return NextResponse.json({ error: "Failed to fetch client" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const client = await clientPromise
    const db = client.db("invoicing")
    const data = await request.json()

    const result = await db.collection("clients").updateOne({ _id: new ObjectId(params.id) }, { $set: data })

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 })
    }

    return NextResponse.json({
      message: "Client updated successfully",
    })
  } catch (error) {
    console.error("Failed to update client:", error)
    return NextResponse.json({ error: "Failed to update client" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const client = await clientPromise
    const db = client.db("invoicing")

    const result = await db.collection("clients").deleteOne({ _id: new ObjectId(params.id) })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 })
    }

    return NextResponse.json({
      message: "Client deleted successfully",
    })
  } catch (error) {
    console.error("Failed to delete client:", error)
    return NextResponse.json({ error: "Failed to delete client" }, { status: 500 })
  }
}
