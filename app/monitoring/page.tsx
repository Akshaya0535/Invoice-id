"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Activity, AlertTriangle, CheckCircle, Clock, Users, Database } from "lucide-react"

interface HealthData {
  status: string
  timestamp: string
  uptime: number
  memory: {
    rss: number
    heapTotal: number
    heapUsed: number
    external: number
  }
  cpu: {
    user: number
    system: number
  }
}

interface MetricsData {
  requests: Record<string, number>
  errors: Record<string, number>
  responseTimes: Record<string, number>
  securityEvents: Record<string, number>
  uptime: number
}

export default function MonitoringPage() {
  const [health, setHealth] = useState<HealthData | null>(null)
  const [metrics, setMetrics] = useState<MetricsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Fetch health data
      const healthResponse = await fetch("/api/monitoring/health")
      const healthData = await healthResponse.json()
      
      // Fetch metrics data
      const metricsResponse = await fetch("/api/monitoring/metrics")
      const metricsData = await metricsResponse.json()
      
      setHealth(healthData)
      setMetrics(metricsData.metrics)
      setError("")
    } catch (err) {
      setError("Failed to fetch monitoring data")
      console.error("Monitoring error:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    
    // Refresh data every 30 seconds
    const interval = setInterval(fetchData, 30000)
    
    return () => clearInterval(interval)
  }, [])

  const formatUptime = (ms: number) => {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)
    
    if (days > 0) return `${days}d ${hours % 24}h ${minutes % 60}m`
    if (hours > 0) return `${hours}h ${minutes % 60}m`
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`
    return `${seconds}s`
  }

  const formatMemory = (bytes: number) => {
    const mb = bytes / (1024 * 1024)
    return `${mb.toFixed(2)} MB`
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "bg-green-100 text-green-800"
      case "degraded":
        return "bg-yellow-100 text-yellow-800"
      case "unhealthy":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "healthy":
        return <CheckCircle className="h-4 w-4" />
      case "degraded":
        return <AlertTriangle className="h-4 w-4" />
      case "unhealthy":
        return <AlertTriangle className="h-4 w-4" />
      default:
        return <Activity className="h-4 w-4" />
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Activity className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Loading monitoring data...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={fetchData}>Retry</Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">System Monitoring</h1>
        <Button onClick={fetchData} variant="outline">
          Refresh
        </Button>
      </div>

      {/* Health Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            System Health
          </CardTitle>
          <CardDescription>
            Current system status and performance metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          {health && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex items-center gap-3">
                {getStatusIcon(health.status)}
                <div>
                  <p className="text-sm font-medium">Status</p>
                  <Badge className={getStatusColor(health.status)}>
                    {health.status.toUpperCase()}
                  </Badge>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4" />
                <div>
                  <p className="text-sm font-medium">Uptime</p>
                  <p className="text-lg font-semibold">{formatUptime(health.uptime)}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Database className="h-4 w-4" />
                <div>
                  <p className="text-sm font-medium">Memory Usage</p>
                  <p className="text-lg font-semibold">{formatMemory(health.memory.heapUsed)}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Users className="h-4 w-4" />
                <div>
                  <p className="text-sm font-medium">Last Updated</p>
                  <p className="text-sm">{new Date(health.timestamp).toLocaleTimeString()}</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* API Metrics */}
      {metrics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>API Requests</CardTitle>
              <CardDescription>Request counts by endpoint</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(metrics.requests).map(([endpoint, count]) => (
                  <div key={endpoint} className="flex justify-between items-center">
                    <span className="text-sm font-mono">{endpoint}</span>
                    <Badge variant="secondary">{count}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Error Rates</CardTitle>
              <CardDescription>Error counts by endpoint</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(metrics.errors).map(([endpoint, count]) => (
                  <div key={endpoint} className="flex justify-between items-center">
                    <span className="text-sm font-mono">{endpoint}</span>
                    <Badge variant="destructive">{count}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Response Times</CardTitle>
              <CardDescription>Average response times by endpoint</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(metrics.responseTimes).map(([endpoint, avgTime]) => (
                  <div key={endpoint} className="flex justify-between items-center">
                    <span className="text-sm font-mono">{endpoint}</span>
                    <Badge variant={avgTime > 1000 ? "destructive" : "secondary"}>
                      {avgTime.toFixed(0)}ms
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Security Events</CardTitle>
              <CardDescription>Security-related events</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(metrics.securityEvents).map(([event, count]) => (
                  <div key={event} className="flex justify-between items-center">
                    <span className="text-sm">{event.replace("security_", "")}</span>
                    <Badge variant="outline">{count}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
} 