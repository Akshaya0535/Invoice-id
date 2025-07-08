# Monitoring Setup Guide

## Overview
This guide explains how to set up comprehensive monitoring for your Invoice Management System.

## 🎯 What We're Monitoring

### **1. Application Performance**
- **Response Times**: How fast your API endpoints respond
- **Error Rates**: Percentage of failed requests
- **Throughput**: Number of requests per second
- **User Experience**: Page load times and interactions

### **2. Security Events**
- **Failed Login Attempts**: Multiple failed logins from same IP
- **Suspicious Activity**: Unusual API usage patterns
- **Unauthorized Access**: Attempts to access restricted resources
- **Rate Limiting**: When users hit rate limits

### **3. System Health**
- **Server Resources**: CPU, memory, disk usage
- **Database Performance**: Query times, connection pools
- **Network**: Latency, bandwidth usage
- **Uptime**: System availability

### **4. Business Metrics**
- **User Activity**: Active users, feature usage
- **Invoice Generation**: Number of invoices created
- **Client Management**: Client creation and updates
- **Revenue Tracking**: Invoice amounts and payments

## 🚀 Setting Up Monitoring

### **Step 1: Environment Configuration**

Add these environment variables to your `.env.local`:

```bash
# Monitoring Configuration
ENABLE_MONITORING=true
MONITORING_LOG_LEVEL=info
MONITORING_RETENTION_DAYS=30

# Alert Configuration
ALERT_EMAIL=admin@yourcompany.com
ALERT_SLACK_WEBHOOK=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
ALERT_PAGERDUTY_KEY=your-pagerduty-key

# Performance Thresholds
MAX_RESPONSE_TIME_MS=2000
MAX_ERROR_RATE_PERCENT=5
MAX_FAILED_LOGINS_PER_MINUTE=10
```

### **Step 2: Access the Monitoring Dashboard**

1. **Start your application:**
   ```bash
   npm run dev
   ```

2. **Login as an admin user**

3. **Navigate to the monitoring dashboard:**
   ```
   http://localhost:3000/monitoring
   ```

### **Step 3: API Endpoints**

The monitoring system provides these API endpoints:

#### **Health Check**
```bash
GET /api/monitoring/health
```
Returns system health status, uptime, and resource usage.

#### **Metrics**
```bash
GET /api/monitoring/metrics
```
Returns detailed metrics (admin only).

## 📊 Understanding the Dashboard

### **System Health Card**
- **Status**: Healthy, Degraded, or Unhealthy
- **Uptime**: How long the system has been running
- **Memory Usage**: Current memory consumption
- **Last Updated**: When the data was last refreshed

### **API Metrics**
- **Request Counts**: Number of requests per endpoint
- **Error Rates**: Failed requests per endpoint
- **Response Times**: Average response time per endpoint
- **Security Events**: Security-related events and counts

## 🔔 Setting Up Alerts

### **Email Alerts**

Create an email alert system:

```javascript
// lib/alerts/email.ts
import nodemailer from 'nodemailer'

export class EmailAlerts {
  private transporter: nodemailer.Transporter

  constructor() {
    this.transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    })
  }

  async sendAlert(alert: any) {
    const mailOptions = {
      from: process.env.ALERT_EMAIL,
      to: process.env.ALERT_EMAIL,
      subject: `🚨 Security Alert: ${alert.type}`,
      html: this.formatAlertEmail(alert)
    }

    await this.transporter.sendMail(mailOptions)
  }

  private formatAlertEmail(alert: any) {
    return `
      <h2>Security Alert</h2>
      <p><strong>Type:</strong> ${alert.type}</p>
      <p><strong>Severity:</strong> ${alert.severity}</p>
      <p><strong>Time:</strong> ${alert.timestamp}</p>
      <pre>${JSON.stringify(alert.details, null, 2)}</pre>
    `
  }
}
```

### **Slack Alerts**

Set up Slack notifications:

```javascript
// lib/alerts/slack.ts
export class SlackAlerts {
  private webhookUrl: string

  constructor() {
    this.webhookUrl = process.env.ALERT_SLACK_WEBHOOK || ''
  }

  async sendAlert(alert: any) {
    if (!this.webhookUrl) return

    const message = {
      text: `🚨 *Security Alert: ${alert.type}*`,
      attachments: [{
        color: this.getSeverityColor(alert.severity),
        fields: [
          {
            title: 'Severity',
            value: alert.severity,
            short: true
          },
          {
            title: 'Time',
            value: new Date(alert.timestamp).toLocaleString(),
            short: true
          },
          {
            title: 'Details',
            value: JSON.stringify(alert.details, null, 2),
            short: false
          }
        ]
      }]
    }

    await fetch(this.webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message)
    })
  }

  private getSeverityColor(severity: string): string {
    switch (severity) {
      case 'CRITICAL': return '#ff0000'
      case 'HIGH': return '#ff6600'
      case 'MEDIUM': return '#ffcc00'
      default: return '#00cc00'
    }
  }
}
```

### **PagerDuty Integration**

For critical alerts:

```javascript
// lib/alerts/pagerduty.ts
export class PagerDutyAlerts {
  private apiKey: string

  constructor() {
    this.apiKey = process.env.ALERT_PAGERDUTY_KEY || ''
  }

  async sendAlert(alert: any) {
    if (!this.apiKey || alert.severity !== 'CRITICAL') return

    const payload = {
      routing_key: this.apiKey,
      event_action: 'trigger',
      payload: {
        summary: `Security Alert: ${alert.type}`,
        severity: 'critical',
        source: 'invoice-app',
        custom_details: alert.details
      }
    }

    await fetch('https://events.pagerduty.com/v2/enqueue', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
  }
}
```

## 📈 Advanced Monitoring

### **Database Monitoring**

Monitor database performance:

```javascript
// lib/monitoring/database.ts
import { trackDatabaseOperation } from '@/lib/monitoring'

export async function withDatabaseMonitoring<T>(
  operation: string,
  collection: string,
  fn: () => Promise<T>
): Promise<T> {
  const startTime = Date.now()
  
  try {
    const result = await fn()
    const duration = Date.now() - startTime
    
    trackDatabaseOperation(operation, collection, duration, true)
    return result
  } catch (error) {
    const duration = Date.now() - startTime
    trackDatabaseOperation(operation, collection, duration, false)
    throw error
  }
}
```

### **User Activity Tracking**

Track user behavior:

```javascript
// lib/monitoring/user-activity.ts
import { trackUserActivity } from '@/lib/monitoring'

export function trackPageView(userId: string, page: string) {
  trackUserActivity(userId, 'page_view', { page })
}

export function trackFeatureUsage(userId: string, feature: string, details?: any) {
  trackUserActivity(userId, 'feature_usage', { feature, ...details })
}

export function trackInvoiceCreation(userId: string, invoiceId: string, amount: number) {
  trackUserActivity(userId, 'invoice_created', { invoiceId, amount })
}
```

## 🔧 Custom Alerts

### **Creating Custom Alert Rules**

```javascript
// lib/monitoring/custom-alerts.ts
import { Monitoring } from '@/lib/monitoring'

export class CustomAlerts {
  // Alert on high invoice creation rate
  static checkInvoiceCreationRate(userId: string) {
    const userActivity = Monitoring.getUserActivity(userId, 'invoice_created')
    const recentActivity = userActivity.filter(
      activity => Date.now() - activity.timestamp < 60000 // Last minute
    )
    
    if (recentActivity.length > 5) {
      Monitoring.trackSecurityEvent('SUSPICIOUS_INVOICE_CREATION', {
        userId,
        count: recentActivity.length,
        timeWindow: '1 minute'
      })
    }
  }
  
  // Alert on unusual login patterns
  static checkLoginPatterns(userId: string, ip: string) {
    const logins = Monitoring.getUserActivity(userId, 'login')
    const recentLogins = logins.filter(
      login => Date.now() - login.timestamp < 300000 // Last 5 minutes
    )
    
    const uniqueIPs = new Set(recentLogins.map(login => login.ip))
    
    if (uniqueIPs.size > 3) {
      Monitoring.trackSecurityEvent('MULTIPLE_IP_LOGINS', {
        userId,
        ipCount: uniqueIPs.size,
        ips: Array.from(uniqueIPs)
      })
    }
  }
}
```

## 📊 Metrics Retention

### **Data Storage**

For production, consider these storage options:

1. **Redis**: For real-time metrics and caching
2. **PostgreSQL**: For historical data and analytics
3. **InfluxDB**: For time-series data
4. **Elasticsearch**: For log analysis and search

### **Data Cleanup**

Set up automatic data cleanup:

```javascript
// scripts/cleanup-metrics.js
import { Monitoring } from '@/lib/monitoring'

// Run daily to clean up old metrics
export async function cleanupOldMetrics() {
  const retentionDays = parseInt(process.env.MONITORING_RETENTION_DAYS || '30')
  const cutoffDate = Date.now() - (retentionDays * 24 * 60 * 60 * 1000)
  
  // Clean up old metrics
  await Monitoring.cleanupMetricsBefore(cutoffDate)
  
  console.log(`Cleaned up metrics older than ${retentionDays} days`)
}
```

## 🚨 Incident Response Integration

### **Automatic Incident Creation**

```javascript
// lib/monitoring/incident-response.ts
import { Monitoring } from '@/lib/monitoring'

export class IncidentResponse {
  static async handleCriticalAlert(alert: any) {
    // Create incident record
    const incident = {
      id: generateIncidentId(),
      type: alert.type,
      severity: alert.severity,
      timestamp: alert.timestamp,
      details: alert.details,
      status: 'open'
    }
    
    // Store incident
    await storeIncident(incident)
    
    // Notify response team
    await notifyResponseTeam(incident)
    
    // Start automated response
    await this.startAutomatedResponse(incident)
  }
  
  private static async startAutomatedResponse(incident: any) {
    switch (incident.type) {
      case 'MULTIPLE_FAILED_LOGINS':
        await this.blockSuspiciousIPs(incident.details)
        break
      case 'HIGH_ERROR_RATE':
        await this.scaleUpResources()
        break
      case 'SUSPICIOUS_ACTIVITY':
        await this.enableEnhancedLogging()
        break
    }
  }
}
```

## 📋 Monitoring Checklist

### **Setup Complete**
- [ ] Environment variables configured
- [ ] Monitoring dashboard accessible
- [ ] Health check endpoint working
- [ ] Metrics endpoint working
- [ ] Alerts configured

### **Testing**
- [ ] Generate test alerts
- [ ] Verify email notifications
- [ ] Test Slack integration
- [ ] Validate PagerDuty alerts
- [ ] Check dashboard updates

### **Production Ready**
- [ ] Monitoring running 24/7
- [ ] Alerts sent to correct team
- [ ] Response procedures documented
- [ ] Metrics retention configured
- [ ] Performance impact minimal

## 🎯 Next Steps

1. **Configure your environment variables**
2. **Set up alert notifications**
3. **Test the monitoring system**
4. **Train your team on the dashboard**
5. **Set up automated responses**
6. **Monitor and optimize**

Your monitoring system is now ready to help you maintain a secure, performant, and reliable invoice application! 