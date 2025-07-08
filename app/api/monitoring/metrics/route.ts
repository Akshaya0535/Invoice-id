import { NextResponse } from "next/server"
import { getMetrics } from "@/lib/monitoring"
import { getSession } from "@/lib/auth"

export async function GET() {
  try {
    // Only allow admin users to access metrics
    const session = await getSession()
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const metrics = getMetrics()
    
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      metrics
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to retrieve metrics",
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
} 