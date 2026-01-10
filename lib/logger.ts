import { NextRequest } from "next/server"

export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
}

interface LogEntry {
  timestamp: string
  level: LogLevel
  message: string
  context?: Record<string, any>
  requestId?: string
  userId?: string
  ip?: string
}

class SecureLogger {
  private level: LogLevel
  private isProduction: boolean

  constructor() {
    this.isProduction = process.env.NODE_ENV === "production"
    this.level = this.isProduction ? LogLevel.ERROR : LogLevel.DEBUG
  }

  private redactSensitiveData(data: any): any {
    if (typeof data === "string") {
      // Redact common sensitive patterns
      return data
        .replace(/(password|secret|token|key|auth)\s*[:=]\s*['"][^'"]*['"]/gi, "$1: [REDACTED]")
        .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, "[EMAIL_REDACTED]")
        .replace(/\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g, "[CARD_REDACTED]")
    }
    
    if (typeof data === "object" && data !== null) {
      const redacted = { ...data }
      const sensitiveKeys = ["password", "secret", "token", "key", "auth", "session", "cookie"]
      
      sensitiveKeys.forEach(key => {
        if (key in redacted) {
          redacted[key] = "[REDACTED]"
        }
      })
      
      return redacted
    }
    
    return data
  }

  private formatLog(entry: LogEntry): string {
    const levelNames = ["ERROR", "WARN", "INFO", "DEBUG"]
    const timestamp = new Date().toISOString()
    const context = entry.context ? ` | ${JSON.stringify(this.redactSensitiveData(entry.context))}` : ""
    const requestInfo = entry.requestId ? ` | Request: ${entry.requestId}` : ""
    const userInfo = entry.userId ? ` | User: ${entry.userId}` : ""
    const ipInfo = entry.ip ? ` | IP: ${entry.ip}` : ""
    
    return `[${timestamp}] ${levelNames[entry.level]} | ${entry.message}${context}${requestInfo}${userInfo}${ipInfo}`
  }

  private shouldLog(level: LogLevel): boolean {
    return level <= this.level
  }

  private log(level: LogLevel, message: string, context?: Record<string, any>, request?: NextRequest) {
    if (!this.shouldLog(level)) return

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message: this.redactSensitiveData(message),
      context: context ? this.redactSensitiveData(context) : undefined,
      requestId: request?.headers.get("x-request-id") || undefined,
      userId: request?.headers.get("x-user-id") || undefined,
      ip: this.getClientIP(request),
    }

    const formattedLog = this.formatLog(entry)

    // In production, use structured logging
    if (this.isProduction) {
      // You can integrate with external logging services here
      // For now, we'll use console but with structured format
      console.log(formattedLog)
    } else {
      // In development, use colored console output
      const colors = {
        [LogLevel.ERROR]: "\x1b[31m", // Red
        [LogLevel.WARN]: "\x1b[33m",  // Yellow
        [LogLevel.INFO]: "\x1b[36m",  // Cyan
        [LogLevel.DEBUG]: "\x1b[37m", // White
      }
      const reset = "\x1b[0m"
      
      console.log(`${colors[level]}${formattedLog}${reset}`)
    }
  }

  private getClientIP(request?: NextRequest): string | undefined {
    if (!request) return undefined
    
    const forwarded = request.headers.get("x-forwarded-for")
    const realIP = request.headers.get("x-real-ip")
    const cfConnectingIP = request.headers.get("cf-connecting-ip")
    
    if (forwarded) {
      return forwarded.split(",")[0].trim()
    }
    if (realIP) {
      return realIP
    }
    if (cfConnectingIP) {
      return cfConnectingIP
    }
    
    return undefined
  }

  error(message: string, context?: Record<string, any>, request?: NextRequest) {
    this.log(LogLevel.ERROR, message, context, request)
  }

  warn(message: string, context?: Record<string, any>, request?: NextRequest) {
    this.log(LogLevel.WARN, message, context, request)
  }

  info(message: string, context?: Record<string, any>, request?: NextRequest) {
    this.log(LogLevel.INFO, message, context, request)
  }

  debug(message: string, context?: Record<string, any>, request?: NextRequest) {
    this.log(LogLevel.DEBUG, message, context, request)
  }

  // Security-specific logging
  securityEvent(event: string, details: Record<string, any>, request?: NextRequest) {
    this.error(`SECURITY EVENT: ${event}`, details, request)
  }

  authEvent(event: string, userId?: string, request?: NextRequest) {
    this.info(`AUTH EVENT: ${event}`, { userId }, request)
  }

  apiEvent(method: string, path: string, statusCode: number, duration: number, request?: NextRequest) {
    this.info(`API ${method} ${path}`, { statusCode, duration }, request)
  }
}

// Create singleton instance
export const logger = new SecureLogger()

// Export convenience functions
export const logError = (message: string, context?: Record<string, any>, request?: NextRequest) => 
  logger.error(message, context, request)

export const logWarn = (message: string, context?: Record<string, any>, request?: NextRequest) => 
  logger.warn(message, context, request)

export const logInfo = (message: string, context?: Record<string, any>, request?: NextRequest) => 
  logger.info(message, context, request)

export const logDebug = (message: string, context?: Record<string, any>, request?: NextRequest) => 
  logger.debug(message, context, request) 

export const securityEvent = (event: string, details: Record<string, any>, request?: NextRequest) => 
  logger.securityEvent(event, details, request)