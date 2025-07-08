#!/usr/bin/env node

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const SECURITY_CHECKS = {
  // Check for hardcoded secrets
  hardcodedSecrets: {
    patterns: [
      /password\s*[:=]\s*['"][^'"]+['"]/gi,
      /secret\s*[:=]\s*['"][^'"]+['"]/gi,
      /key\s*[:=]\s*['"][^'"]+['"]/gi,
      /token\s*[:=]\s*['"][^'"]+['"]/gi,
      /api_key\s*[:=]\s*['"][^'"]+['"]/gi,
    ],
    severity: 'HIGH'
  },
  
  // Check for SQL injection patterns
  sqlInjection: {
    patterns: [
      /\$\{.*\}/g,
      /\+.*\+/g,
      /eval\s*\(/gi,
      /Function\s*\(/gi,
    ],
    severity: 'CRITICAL'
  },
  
  // Check for XSS patterns
  xss: {
    patterns: [
      /innerHTML\s*=/gi,
      /outerHTML\s*=/gi,
      /document\.write\s*\(/gi,
      /eval\s*\(/gi,
    ],
    severity: 'HIGH'
  },
  
  // Check for weak crypto
  weakCrypto: {
    patterns: [
      /crypto\.createHash\s*\(\s*['"]md5['"]/gi,
      /crypto\.createHash\s*\(\s*['"]sha1['"]/gi,
      /crypto\.createHash\s*\(\s*['"]sha256['"]/gi,
    ],
    severity: 'CRITICAL'
  },
  
  // Check for console.log in production
  consoleLog: {
    patterns: [
      /console\.log\s*\(/gi,
      /console\.error\s*\(/gi,
      /console\.warn\s*\(/gi,
    ],
    severity: 'MEDIUM'
  }
}

function scanFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8')
  const issues = []
  
  Object.entries(SECURITY_CHECKS).forEach(([checkName, check]) => {
    check.patterns.forEach(pattern => {
      const matches = content.match(pattern)
      if (matches) {
        issues.push({
          file: filePath,
          check: checkName,
          severity: check.severity,
          matches: matches.length,
          pattern: pattern.toString()
        })
      }
    })
  })
  
  return issues
}

function scanDirectory(dirPath, extensions = ['.js', '.ts', '.tsx', '.jsx']) {
  const issues = []
  
  function walkDir(currentPath) {
    const items = fs.readdirSync(currentPath)
    
    items.forEach(item => {
      const fullPath = path.join(currentPath, item)
      const stat = fs.statSync(fullPath)
      
      if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
        walkDir(fullPath)
      } else if (stat.isFile() && extensions.some(ext => item.endsWith(ext))) {
        const fileIssues = scanFile(fullPath)
        issues.push(...fileIssues)
      }
    })
  }
  
  walkDir(dirPath)
  return issues
}

function generateReport(issues) {
  const report = {
    summary: {
      total: issues.length,
      critical: issues.filter(i => i.severity === 'CRITICAL').length,
      high: issues.filter(i => i.severity === 'HIGH').length,
      medium: issues.filter(i => i.severity === 'MEDIUM').length,
      low: issues.filter(i => i.severity === 'LOW').length,
    },
    issues: issues
  }
  
  console.log('🔒 Security Audit Report')
  console.log('========================')
  console.log(`Total Issues: ${report.summary.total}`)
  console.log(`Critical: ${report.summary.critical}`)
  console.log(`High: ${report.summary.high}`)
  console.log(`Medium: ${report.summary.medium}`)
  console.log(`Low: ${report.summary.low}`)
  console.log('')
  
  if (issues.length > 0) {
    console.log('Issues Found:')
    console.log('=============')
    
    issues.forEach(issue => {
      console.log(`[${issue.severity}] ${issue.file}`)
      console.log(`  Check: ${issue.check}`)
      console.log(`  Matches: ${issue.matches}`)
      console.log('')
    })
  } else {
    console.log('✅ No security issues found!')
  }
  
  return report
}

// Run the audit
const projectRoot = path.join(__dirname, '..')
const issues = scanDirectory(projectRoot)
const report = generateReport(issues)

// Exit with error code if critical issues found
if (report.summary.critical > 0) {
  process.exit(1) }