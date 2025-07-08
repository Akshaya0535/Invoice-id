import { NextRequest, NextResponse } from "next/server"
import { logger, logError, logInfo, securityEvent } from "./logger"

// Metrics storage (in production, use Redis or a proper metrics database)
const metrics = {
  requests: new Map<string, number>(),
  errors: new Map<string, number>(),
  responseTimes: new Map<string, number[]>(),
  securityEvents: new Map<string, number>(),
  lastReset: Date.now()
}

// Alert thresholds
const ALERT_THRESHOLDS = {
  errorRate: 0.05, // 5% error rate
  responseTime: 2000, // 2 seconds
  failedLogins: 10, // 10 failed logins per minute
  suspiciousActivity: 5 // 5 suspicious events per minute
}

export class Monitoring {
  // Track API request
  static trackRequest(method: string, path: string, statusCode: number, duration: number, request?: NextRequest) {
    const key = `${method} ${path}`
    
    // Increment request count
    metrics.requests.set(key, (metrics.requests.get(key) || 0) + 1)
    
    // Track response times
    if (!metrics.responseTimes.has(key)) {
      metrics.responseTimes.set(key, [])
    }
    metrics.responseTimes.get(key)!.push(duration)
    
    // Track errors
    if (statusCode >= 400) {
      metrics.errors.set(key, (metrics.errors.get(key) || 0) + 1)
    }
    
    // Log the request
    logger.apiEvent(method, path, statusCode, duration, request)
    
    // Check for alerts
    this.checkAlerts(key, statusCode, duration)
  }
  
  // Track security events
  static trackSecurityEvent(event: string, details: Record<string, any>, request?: NextRequest) {
    const key = `security_${event}`
    metrics.securityEvents.set(key, (metrics.securityEvents.get(key) || 0) + 1)
    
    // Log security event
    securityEvent(event, details, request)
    
    // Check security alerts
    this.checkSecurityAlerts(event, details)
  }
  
  // Track user activity
  static trackUserActivity(userId: string, action: string, details?: Record<string, any>) {
    logInfo("User activity", {
      userId,
      action,
      details,
      timestamp: new Date().toISOString()
    })
  }
  
  // Track database operations
  static trackDatabaseOperation(operation: string, collection: string, duration: number, success: boolean) {
    logInfo("Database operation", {
      operation,
      collection,
      duration,
      success,
      timestamp: new Date().toISOString()
    })
    
    if (!success) {
      logError("Database operation failed", {
        operation,
        collection,
        duration
      })
    }
  }
  
  // Check for performance alerts
  private static checkAlerts(endpoint: string, statusCode: number, duration: number) {
    const errorRate = this.calculateErrorRate(endpoint)
    const avgResponseTime = this.calculateAverageResponseTime(endpoint)
    
    // Alert on high error rate
    if (errorRate > ALERT_THRESHOLDS.errorRate) {
      this.sendAlert("HIGH_ERROR_RATE", {
        endpoint,
        errorRate: `${(errorRate * 100).toFixed(2)}%`,
        threshold: `${(ALERT_THRESHOLDS.errorRate * 100).toFixed(2)}%`
      })
    }
    
    // Alert on slow response times
    if (avgResponseTime > ALERT_THRESHOLDS.responseTime) {
      this.sendAlert("SLOW_RESPONSE_TIME", {
        endpoint,
        avgResponseTime: `${avgResponseTime.toFixed(2)}ms`,
        threshold: `${ALERT_THRESHOLDS.responseTime}ms`
      })
    }
  }
  
  // Check for security alerts
  private static checkSecurityAlerts(event: string, details: Record<string, any>) {
    const eventCount = metrics.securityEvents.get(`security_${event}`) || 0
    
    // Alert on failed login attempts
    if (event === "FAILED_LOGIN" && eventCount > ALERT_THRESHOLDS.failedLogins) {
      this.sendAlert("MULTIPLE_FAILED_LOGINS", {
        event,
        count: eventCount,
        threshold: ALERT_THRESHOLDS.failedLogins,
        details
      })
    }
    
    // Alert on suspicious activity
    if (event === "SUSPICIOUS_ACTIVITY" && eventCount > ALERT_THRESHOLDS.suspiciousActivity) {
      this.sendAlert("SUSPICIOUS_ACTIVITY_DETECTED", {
        event,
        count: eventCount,
        threshold: ALERT_THRESHOLDS.suspiciousActivity,
        details
      })
    }
  }
  
  // Send alerts (in production, integrate with PagerDuty, Slack, etc.)
  private static sendAlert(type: string, details: Record<string, any>) {
    const alert = {
      type,
      details,
      timestamp: new Date().toISOString(),
      severity: this.getAlertSeverity(type)
    }
    
    // Log the alert
    logError(`ALERT: ${type}`, details)
    
    // In production, send to external services
    // this.sendToSlack(alert)
    // this.sendToPagerDuty(alert)
    // this.sendEmail(alert)
    
    console.log("🚨 ALERT:", alert)
  }
  
  // Get alert severity
  private static getAlertSeverity(type: string): string {
    const criticalAlerts = ["MULTIPLE_FAILED_LOGINS", "SUSPICIOUS_ACTIVITY_DETECTED"]
    const highAlerts = ["HIGH_ERROR_RATE", "SLOW_RESPONSE_TIME"]
    
    if (criticalAlerts.includes(type)) return "CRITICAL"
    if (highAlerts.includes(type)) return "HIGH"
    return "MEDIUM"
  }
  
  // Calculate error rate for an endpoint
  private static calculateErrorRate(endpoint: string): number {
    const totalRequests = metrics.requests.get(endpoint) || 0
    const totalErrors = metrics.errors.get(endpoint) || 0
    
    return totalRequests > 0 ? totalErrors / totalRequests : 0
  }
  
  // Calculate average response time for an endpoint
  private static calculateAverageResponseTime(endpoint: string): number {
    const responseTimes = metrics.responseTimes.get(endpoint) || []
    
    if (responseTimes.length === 0) return 0
    
    const sum = responseTimes.reduce((acc, time) => acc + time, 0)
    return sum / responseTimes.length
  }
  
  // Get current metrics
  static getMetrics() {
    return {
      requests: Object.fromEntries(metrics.requests),
      errors: Object.fromEntries(metrics.errors),
      responseTimes: Object.fromEntries(
        Array.from(metrics.responseTimes.entries()).map(([key, times]) => [
          key,
          times.length > 0 ? times.reduce((acc, time) => acc + time, 0) / times.length : 0
        ])
      ),
      securityEvents: Object.fromEntries(metrics.securityEvents),
      uptime: Date.now() - metrics.lastReset
    }
  }
  
  // Reset metrics (call periodically)
  static resetMetrics() {
    metrics.requests.clear()
    metrics.errors.clear()
    metrics.responseTimes.clear()
    metrics.securityEvents.clear()
    metrics.lastReset = Date.now()
  }
  
  // Health check
  static healthCheck() {
    const health = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: Date.now() - metrics.lastReset,
      memory: process.memoryUsage(),
      cpu: process.cpuUsage()
    }
    
    // Check for critical issues
    const criticalIssues = Array.from(metrics.securityEvents.entries())
      .filter(([key, count]) => key.includes("FAILED_LOGIN") && count > ALERT_THRESHOLDS.failedLogins)
    
    if (criticalIssues.length > 0) {
      health.status = "degraded"
    }
    
    return health
  }
}

// Middleware to automatically track requests
export function withMonitoring(
  handler: (request: NextRequest) => Promise<NextResponse>
) {
  return async (request: NextRequest) => {
    const startTime = Date.now()
    
    try {
      const response = await handler(request)
      const duration = Date.now() - startTime
      
      Monitoring.trackRequest(
        request.method,
        request.nextUrl.pathname,
        response.status,
        duration,
        request
      )
      
      return response
    } catch (error) {
      const duration = Date.now() - startTime
      
      Monitoring.trackRequest(
        request.method,
        request.nextUrl.pathname,
        500,
        duration,
        request
      )
      
      throw error
    }
  }
}

// Utility functions for easy monitoring
export const trackRequest = (method: string, path: string, statusCode: number, duration: number, request?: NextRequest) =>
  Monitoring.trackRequest(method, path, statusCode, duration, request)

export const trackSecurityEvent = (event: string, details: Record<string, any>, request?: NextRequest) =>
  Monitoring.trackSecurityEvent(event, details, request)

export const trackUserActivity = (userId: string, action: string, details?: Record<string, any>) =>
  Monitoring.trackUserActivity(userId, action, details)

export const trackDatabaseOperation = (operation: string, collection: string, duration: number, success: boolean) =>
  Monitoring.trackDatabaseOperation(operation, collection, duration, success)

export const getMetrics = () => Monitoring.getMetrics()
export const getHealth = () => Monitoring.healthCheck() 