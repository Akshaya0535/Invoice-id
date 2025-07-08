import { NextResponse } from "next/server"
import { getHealth } from "@/lib/monitoring"

export async function GET() {
  try {
    const health = getHealth()
    
    const statusCode = health.status === "healthy" ? 200 : 503
    
    return NextResponse.json(health, { status: statusCode })
  } catch (error) {
    return NextResponse.json(
      {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        error: "Health check failed"
      },
      { status: 503 }
    )
  }
} 