"use client"

import { Button } from "@/components/ui/button"
import { Printer } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import type { Invoice, InvoiceItem, Client } from "@/types"

interface InvoiceTemplateProps {
  invoice: Invoice
  client: Client
  items: InvoiceItem[]
}

export function InvoiceTemplate({ invoice, client, items }: InvoiceTemplateProps) {
  const handlePrint = () => {
    window.print()
  }

  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.rate, 0)
  const totalCGST = items.reduce((sum, item) => sum + (item.quantity * item.rate * item.cgst) / 100, 0)
  const totalSGST = items.reduce((sum, item) => sum + (item.quantity * item.rate * item.sgst) / 100, 0)
  const totalIGST = items.reduce((sum, item) => sum + (item.quantity * item.rate * item.igst) / 100, 0)
  const totalTax = totalCGST + totalSGST + totalIGST
  const grandTotal = subtotal + totalTax

  // Calculate dynamic empty rows based on items count
  const maxItemsPerPage = 10
  const emptyRowsNeeded = Math.max(0, maxItemsPerPage - items.length)

  // Convert number to words (simplified version)
  const numberToWords = (num: number): string => {
    const ones = ["", "ONE", "TWO", "THREE", "FOUR", "FIVE", "SIX", "SEVEN", "EIGHT", "NINE"]
    const tens = ["", "", "TWENTY", "THIRTY", "FORTY", "FIFTY", "SIXTY", "SEVENTY", "EIGHTY", "NINETY"]
    const teens = [
      "TEN",
      "ELEVEN",
      "TWELVE",
      "THIRTEEN",
      "FOURTEEN",
      "FIFTEEN",
      "SIXTEEN",
      "SEVENTEEN",
      "EIGHTEEN",
      "NINETEEN",
    ]

    if (num === 0) return "ZERO"

    let result = ""
    const crores = Math.floor(num / 10000000)
    const lakhs = Math.floor((num % 10000000) / 100000)
    const thousands = Math.floor((num % 100000) / 1000)
    const hundreds = Math.floor((num % 1000) / 100)
    const remainder = num % 100

    if (crores > 0) result += `${ones[crores]} CRORE `
    if (lakhs > 0) {
      if (lakhs < 20 && lakhs > 9) {
        result += `${teens[lakhs - 10]} LAKH `
      } else {
        result += `${tens[Math.floor(lakhs / 10)]} ${ones[lakhs % 10]} LAKH `.replace(/\s+/g, " ")
      }
    }
    if (thousands > 0) {
      if (thousands < 20 && thousands > 9) {
        result += `${teens[thousands - 10]} THOUSAND `
      } else {
        result += `${tens[Math.floor(thousands / 10)]} ${ones[thousands % 10]} THOUSAND `.replace(/\s+/g, " ")
      }
    }
    if (hundreds > 0) result += `${ones[hundreds]} HUNDRED `
    if (remainder > 0) {
      if (remainder < 10) result += ones[remainder]
      else if (remainder < 20) result += teens[remainder - 10]
      else result += `${tens[Math.floor(remainder / 10)]} ${ones[remainder % 10]}`.replace(/\s+/g, " ")
    }

    return result.trim() + " ONLY"
  }

  return (
    <div className="w-full">
      {/* Print Button - Hidden during print */}
      <div className="mb-4 print:hidden">
        <Button onClick={handlePrint} className="flex items-center gap-2">
          <Printer className="h-4 w-4" />
          Print Invoice
        </Button>
      </div>

      {/* Light Mode Wrapper - Forces light theme for invoice */}
      <div className="light">
        {/* Invoice Template Container - Always light mode */}
        <div
          className="w-full max-w-4xl mx-auto bg-white text-black print:max-w-none print:mx-0 print:shadow-none"
          id="invoice-content"
        >
          <style jsx global>{`
    @media print {
      /* Force color printing */
      * {
        -webkit-print-color-adjust: exact !important;
        color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      
      /* Hide everything except the invoice */
      body * {
        visibility: hidden;
      }
      
      /* Show only the invoice content */
      #invoice-content,
      #invoice-content * {
        visibility: visible;
      }
      
      /* Position the invoice to fill the page without scaling */
      #invoice-content {
        position: absolute;
        left: 0;
        top: 0;
        width: 100% !important;
        max-width: none !important;
        margin: 0 !important;
        padding: 0 !important;
        background: white !important;
        color: black !important;
      }
      
      /* Remove any margins and padding from body */
      body {
        margin: 0 !important;
        padding: 0 !important;
      }
      
      /* Ensure table takes full width */
      .invoice-table {
        width: 100% !important;
        font-size: 9px !important;
        page-break-inside: avoid;
        table-layout: fixed;
        margin: 0 !important;
        border-collapse: collapse !important;
        background: white !important;
        color: black !important;
      }
      
      /* Optimize cell padding */
      .invoice-table td {
        padding: 2px !important;
        line-height: 1.2 !important;
        vertical-align: middle !important;
        background: white !important;
        color: black !important;
      }
      
      /* Specific height adjustments */
      .client-row {
        height: 50px !important;
      }
      
      .header-row {
        height: 22px !important;
      }
      
      .empty-row {
        height: 14px !important;
      }
      
      .footer-row {
        height: 18px !important;
      }
      
      /* Ensure header colors are preserved */
      .header-blue {
        background-color: #B4C6E7 !important;
        -webkit-print-color-adjust: exact !important;
        color-adjust: exact !important;
        print-color-adjust: exact !important;
        color: black !important;
      }
      
      /* Ensure borders are visible */
      .invoice-table td {
        border: 1px solid #000 !important;
      }
      
      .border-2 {
        border-width: 2px !important;
        border-color: #000 !important;
      }
      
      /* Minimal page margins */
      @page {
        margin: 0.2in !important;
        size: A4;
      }
      
      /* Hide print button and other UI elements */
      .print\\:hidden {
        display: none !important;
      }
      
      /* Font sizes for headers */
      .company-name {
        font-size: 13px !important;
        font-weight: bold !important;
      }
      
      .tax-invoice-header {
        font-size: 14px !important;
        font-weight: bold !important;
      }
      
      /* Optimize QR code and signature areas */
      .qr-code-area {
        width: 70px !important;
        height: 70px !important;
      }
      
      .signature-area {
        width: 90px !important;
        height: 35px !important;
      }
    }
    
    /* Light mode styles for invoice - always applied */
    .light .invoice-table {
      border-collapse: collapse;
      width: 100%;
      font-family: "Liberation Sans", Arial, sans-serif;
      font-size: 10px;
      table-layout: fixed;
      background: white;
      color: black;
    }
    
    .light .invoice-table td {
      border: 1px solid #000;
      padding: 2px;
      vertical-align: middle;
      word-wrap: break-word;
      background: white;
      color: black;
    }
    
    .light .header-blue {
      background-color: #B4C6E7 !important;
      -webkit-print-color-adjust: exact;
      color-adjust: exact;
      print-color-adjust: exact;
      color: black !important;
    }
    
    .light .border-2 {
      border-width: 2px !important;
      border-color: #000 !important;
    }
  `}</style>

          <table className="invoice-table">
            <colgroup>
              {Array.from({ length: 16 }, (_, i) => (
                <col key={i} width="6.25%" />
              ))}
            </colgroup>

            <tbody>
              {/* Header */}
              <tr>
                <td
                  className="border-2"
                  colSpan={16}
                  style={{ textAlign: "right", fontWeight: "bold", color: "black" }}
                >
                  Original for Buyer
                </td>
              </tr>

              {/* Company Name */}
              <tr>
                <td
                  className="border-2 company-name"
                  colSpan={16}
                  style={{ textAlign: "center", fontWeight: "bold", color: "black" }}
                >
                  TRIOS ENGINEERING SOLUTIONS
                </td>
              </tr>

              {/* Company Address */}
              <tr>
                <td
                  className="border-2"
                  colSpan={16}
                  style={{ textAlign: "center", fontWeight: "bold", color: "black" }}
                >
                  SAHIBABAD-201011, UTTAR PRADESH
                </td>
              </tr>

              <tr>
                <td
                  className="border-2"
                  colSpan={16}
                  style={{ textAlign: "center", fontWeight: "bold", color: "black" }}
                >
                  PH. NO. +91-9711207844
                </td>
              </tr>

              <tr>
                <td
                  className="border-2"
                  colSpan={16}
                  style={{ textAlign: "center", fontWeight: "bold", color: "black" }}
                >
                  Email: info@triosengineeringsolutions.com
                </td>
              </tr>

              <tr>
                <td
                  className="border-2"
                  colSpan={16}
                  style={{ textAlign: "center", fontWeight: "bold", color: "black" }}
                >
                  GSTIN: 09ACUPA7462Q1ZO
                </td>
              </tr>

              {/* Tax Invoice Header */}
              <tr className="header-row">
                <td
                  className="border-2 header-blue tax-invoice-header"
                  colSpan={16}
                  style={{
                    textAlign: "center",
                    fontWeight: "bold",
                    backgroundColor: "#B4C6E7",
                    color: "black",
                  }}
                >
                  Tax Invoice
                </td>
              </tr>

              {/* Invoice Details */}
              <tr>
                <td className="border-2" colSpan={7} style={{ fontWeight: "bold", color: "black" }}>
                  Invoice No: {invoice.invoiceNumber}
                </td>
                <td className="border-2" colSpan={9} style={{ fontWeight: "bold", color: "black" }}>
                  Vehicle Number: {invoice.vehicleNumber || ""}
                </td>
              </tr>

              <tr>
                <td className="border-2" colSpan={7} style={{ fontWeight: "bold", color: "black" }}>
                  Invoice date: {new Date(invoice.invoiceDate || invoice.date).toLocaleDateString("en-IN")}
                </td>
                <td className="border-2" colSpan={9} style={{ fontWeight: "bold", color: "black" }}>
                  Supplier's PO No: {invoice.poNumber || ""}
                </td>
              </tr>

              <tr>
                <td className="border-2" colSpan={6} style={{ fontWeight: "bold", color: "black" }}>
                  Reverse Charge (Y/N): N
                </td>
                <td className="border-2" style={{ fontWeight: "bold", color: "black" }}></td>
                <td className="border-2" colSpan={9} style={{ fontWeight: "bold", color: "black" }}>
                  PO Date: {invoice.poDate ? new Date(invoice.poDate).toLocaleDateString("en-IN") : ""}
                </td>
              </tr>

              <tr>
                <td className="border-2" colSpan={5} style={{ fontWeight: "bold", color: "black" }}>
                  State: UTTAR PRADESH
                </td>
                <td className="border-2" style={{ fontWeight: "bold", color: "black" }}>
                  Code
                </td>
                <td className="border-2" style={{ textAlign: "center", fontWeight: "bold", color: "black" }}>
                  9
                </td>
                <td className="border-2" colSpan={9} style={{ fontWeight: "bold", color: "black" }}>
                  Transport Mode: {invoice.transportMode || ""}
                </td>
              </tr>

              {/* Bill to Party Section */}
              <tr>
                <td
                  className="border-2 header-blue"
                  colSpan={7}
                  style={{
                    textAlign: "center",
                    fontWeight: "bold",
                    backgroundColor: "#B4C6E7",
                    color: "black",
                  }}
                >
                  Bill to Party
                </td>
                <td
                  className="border-2 header-blue"
                  colSpan={9}
                  style={{
                    textAlign: "center",
                    fontWeight: "bold",
                    backgroundColor: "#B4C6E7",
                    color: "black",
                  }}
                >
                  Ship to Party
                </td>
              </tr>

              {/* Client Details */}
              <tr className="client-row">
                <td className="border-2" colSpan={7} style={{ verticalAlign: "top", padding: "4px", color: "black" }}>
                  <div style={{ fontWeight: "bold" }}>{client.name}</div>
                  <div>{client.address}</div>
                  <div>
                    {client.city}, {client.state} - {client.pincode}
                  </div>
                  {client.phone && <div>Ph: {client.phone}</div>}
                  {client.email && <div>Email: {client.email}</div>}
                </td>
                <td className="border-2" colSpan={9} style={{ verticalAlign: "top", padding: "4px", color: "black" }}>
                  <div style={{ fontWeight: "bold" }}>{client.name}</div>
                  <div>{client.address}</div>
                  <div>
                    {client.city}, {client.state} - {client.pincode}
                  </div>
                </td>
              </tr>

              <tr>
                <td className="border-2" colSpan={5} style={{ fontWeight: "bold", color: "black" }}>
                  State: {client.state}
                </td>
                <td className="border-2" style={{ fontWeight: "bold", color: "black" }}>
                  Code
                </td>
                <td className="border-2" style={{ textAlign: "center", color: "black" }}>
                  {client.stateCode || ""}
                </td>
                <td className="border-2" colSpan={6} style={{ fontWeight: "bold", color: "black" }}>
                  State: {client.state}
                </td>
                <td
                  className="border-2"
                  colSpan={2}
                  style={{ textAlign: "center", fontWeight: "bold", color: "black" }}
                >
                  Code
                </td>
                <td className="border-2" style={{ color: "black" }}>
                  {client.stateCode || ""}
                </td>
              </tr>

              <tr>
                <td className="border-2" colSpan={7} style={{ fontWeight: "bold", color: "black" }}>
                  GSTIN: {client.gstin || ""}
                </td>
                <td className="border-2" colSpan={9} style={{ fontWeight: "bold", color: "black" }}>
                  GSTIN: {client.gstin || ""}
                </td>
              </tr>

              {/* Table Headers */}
              <tr>
                <td
                  className="border-2 header-blue"
                  style={{
                    textAlign: "center",
                    fontWeight: "bold",
                    backgroundColor: "#B4C6E7",
                    color: "black",
                  }}
                >
                  S. No.
                </td>
                <td
                  className="border-2 header-blue"
                  style={{
                    textAlign: "center",
                    fontWeight: "bold",
                    backgroundColor: "#B4C6E7",
                    color: "black",
                  }}
                >
                  Product Description
                </td>
                <td
                  className="border-2 header-blue"
                  style={{
                    textAlign: "center",
                    fontWeight: "bold",
                    backgroundColor: "#B4C6E7",
                    color: "black",
                  }}
                >
                  HSN / SAC code
                </td>
                <td
                  className="border-2 header-blue"
                  style={{
                    textAlign: "center",
                    fontWeight: "bold",
                    backgroundColor: "#B4C6E7",
                    color: "black",
                  }}
                >
                  Qty
                </td>
                <td
                  className="border-2 header-blue"
                  style={{
                    textAlign: "center",
                    fontWeight: "bold",
                    backgroundColor: "#B4C6E7",
                    color: "black",
                  }}
                >
                  Rate
                </td>
                <td
                  className="border-2 header-blue"
                  style={{
                    textAlign: "center",
                    fontWeight: "bold",
                    backgroundColor: "#B4C6E7",
                    color: "black",
                  }}
                >
                  Amount
                </td>
                <td
                  className="border-2 header-blue"
                  style={{
                    textAlign: "center",
                    fontWeight: "bold",
                    backgroundColor: "#B4C6E7",
                    color: "black",
                  }}
                >
                  Disc.
                </td>
                <td
                  className="border-2 header-blue"
                  style={{
                    textAlign: "center",
                    fontWeight: "bold",
                    backgroundColor: "#B4C6E7",
                    color: "black",
                  }}
                >
                  Taxable Value
                </td>
                <td
                  className="border-2 header-blue"
                  colSpan={3}
                  style={{
                    textAlign: "center",
                    fontWeight: "bold",
                    backgroundColor: "#B4C6E7",
                    color: "black",
                  }}
                >
                  CGST
                </td>
                <td
                  className="border-2 header-blue"
                  colSpan={2}
                  style={{
                    textAlign: "center",
                    fontWeight: "bold",
                    backgroundColor: "#B4C6E7",
                    color: "black",
                  }}
                >
                  SGST
                </td>
                <td
                  className="border-2 header-blue"
                  colSpan={2}
                  style={{
                    textAlign: "center",
                    fontWeight: "bold",
                    backgroundColor: "#B4C6E7",
                    color: "black",
                  }}
                >
                  IGST
                </td>
                <td
                  className="border-2 header-blue"
                  style={{
                    textAlign: "center",
                    fontWeight: "bold",
                    backgroundColor: "#B4C6E7",
                    color: "black",
                  }}
                >
                  Total
                </td>
              </tr>

              <tr>
                <td className="border-2 header-blue" style={{ backgroundColor: "#B4C6E7" }}></td>
                <td className="border-2 header-blue" style={{ backgroundColor: "#B4C6E7" }}></td>
                <td className="border-2 header-blue" style={{ backgroundColor: "#B4C6E7" }}></td>
                <td className="border-2 header-blue" style={{ backgroundColor: "#B4C6E7" }}></td>
                <td className="border-2 header-blue" style={{ backgroundColor: "#B4C6E7" }}></td>
                <td className="border-2 header-blue" style={{ backgroundColor: "#B4C6E7" }}></td>
                <td className="border-2 header-blue" style={{ backgroundColor: "#B4C6E7" }}></td>
                <td className="border-2 header-blue" style={{ backgroundColor: "#B4C6E7" }}></td>
                <td
                  className="border-2 header-blue"
                  style={{
                    textAlign: "center",
                    fontWeight: "bold",
                    backgroundColor: "#B4C6E7",
                    color: "black",
                  }}
                >
                  Rate
                </td>
                <td
                  className="border-2 header-blue"
                  colSpan={2}
                  style={{
                    textAlign: "center",
                    fontWeight: "bold",
                    backgroundColor: "#B4C6E7",
                    color: "black",
                  }}
                >
                  Amount
                </td>
                <td
                  className="border-2 header-blue"
                  style={{
                    textAlign: "center",
                    fontWeight: "bold",
                    backgroundColor: "#B4C6E7",
                    color: "black",
                  }}
                >
                  Rate
                </td>
                <td
                  className="border-2 header-blue"
                  style={{
                    textAlign: "center",
                    fontWeight: "bold",
                    backgroundColor: "#B4C6E7",
                    color: "black",
                  }}
                >
                  Amount
                </td>
                <td
                  className="border-2 header-blue"
                  style={{
                    textAlign: "center",
                    fontWeight: "bold",
                    backgroundColor: "#B4C6E7",
                    color: "black",
                  }}
                >
                  Rate
                </td>
                <td
                  className="border-2 header-blue"
                  style={{
                    textAlign: "center",
                    fontWeight: "bold",
                    backgroundColor: "#B4C6E7",
                    color: "black",
                  }}
                >
                  Amount
                </td>
                <td className="border-2 header-blue" style={{ backgroundColor: "#B4C6E7" }}></td>
              </tr>

              {/* Invoice Items */}
              {items.map((item, index) => {
                const itemAmount = item.quantity * item.rate
                const cgstAmount = (itemAmount * item.cgst) / 100
                const sgstAmount = (itemAmount * item.sgst) / 100
                const igstAmount = (itemAmount * item.igst) / 100
                const itemTotal = itemAmount + cgstAmount + sgstAmount + igstAmount

                return (
                  <tr key={index}>
                    <td className="border-2" style={{ textAlign: "center", color: "black" }}>
                      {index + 1}
                    </td>
                    <td className="border-2" style={{ color: "black" }}>
                      {item.description}
                    </td>
                    <td className="border-2" style={{ textAlign: "center", color: "black" }}>
                      {item.hsnCode}
                    </td>
                    <td className="border-2" style={{ textAlign: "center", color: "black" }}>
                      {item.quantity}
                    </td>
                    <td className="border-2" style={{ textAlign: "right", color: "black" }}>
                      {formatCurrency(item.rate)}
                    </td>
                    <td className="border-2" style={{ textAlign: "right", color: "black" }}>
                      {formatCurrency(itemAmount)}
                    </td>
                    <td className="border-2" style={{ textAlign: "center", color: "black" }}>
                      0
                    </td>
                    <td className="border-2" style={{ textAlign: "right", color: "black" }}>
                      {formatCurrency(itemAmount)}
                    </td>
                    <td className="border-2" style={{ textAlign: "center", color: "black" }}>
                      {item.cgst}%
                    </td>
                    <td className="border-2" colSpan={2} style={{ textAlign: "right", color: "black" }}>
                      {formatCurrency(cgstAmount)}
                    </td>
                    <td className="border-2" style={{ textAlign: "center", color: "black" }}>
                      {item.sgst}%
                    </td>
                    <td className="border-2" style={{ textAlign: "right", color: "black" }}>
                      {formatCurrency(sgstAmount)}
                    </td>
                    <td className="border-2" style={{ textAlign: "center", color: "black" }}>
                      {item.igst}%
                    </td>
                    <td className="border-2" style={{ textAlign: "right", color: "black" }}>
                      {formatCurrency(igstAmount)}
                    </td>
                    <td className="border-2" style={{ textAlign: "right", color: "black" }}>
                      {formatCurrency(itemTotal)}
                    </td>
                  </tr>
                )
              })}

              {/* Dynamic Empty rows */}
              {Array.from({ length: emptyRowsNeeded }, (_, i) => (
                <tr key={`empty-${i}`} className="empty-row">
                  {Array.from({ length: 16 }, (_, j) => (
                    <td key={j} className="border-2" style={{ color: "black" }}>
                      &nbsp;
                    </td>
                  ))}
                </tr>
              ))}

              {/* Total Row */}
              <tr>
                <td
                  className="border-2 header-blue"
                  colSpan={3}
                  style={{
                    textAlign: "center",
                    fontWeight: "bold",
                    backgroundColor: "#B4C6E7",
                    color: "black",
                  }}
                >
                  Total
                </td>
                <td className="border-2" style={{ textAlign: "center", color: "black" }}>
                  {items.reduce((sum, item) => sum + item.quantity, 0)}
                </td>
                <td className="border-2" style={{ color: "black" }}></td>
                <td className="border-2" style={{ textAlign: "right", fontWeight: "bold", color: "black" }}>
                  {formatCurrency(subtotal)}
                </td>
                <td className="border-2" style={{ textAlign: "right", color: "black" }}>
                  0
                </td>
                <td className="border-2" style={{ textAlign: "right", fontWeight: "bold", color: "black" }}>
                  {formatCurrency(subtotal)}
                </td>
                <td className="border-2" style={{ color: "black" }}></td>
                <td className="border-2" colSpan={2} style={{ textAlign: "right", fontWeight: "bold", color: "black" }}>
                  {formatCurrency(totalCGST)}
                </td>
                <td className="border-2" style={{ color: "black" }}></td>
                <td className="border-2" style={{ textAlign: "right", fontWeight: "bold", color: "black" }}>
                  {formatCurrency(totalSGST)}
                </td>
                <td className="border-2" style={{ color: "black" }}></td>
                <td className="border-2" style={{ textAlign: "right", fontWeight: "bold", color: "black" }}>
                  {formatCurrency(totalIGST)}
                </td>
                <td className="border-2" style={{ textAlign: "right", fontWeight: "bold", color: "black" }}>
                  {formatCurrency(grandTotal)}
                </td>
              </tr>

              {/* Amount in Words */}
              <tr>
                <td
                  className="border-2 header-blue"
                  colSpan={8}
                  style={{
                    textAlign: "center",
                    fontWeight: "bold",
                    backgroundColor: "#B4C6E7",
                    color: "black",
                  }}
                >
                  Total Invoice amount in words
                </td>
                <td className="border-2" colSpan={5} style={{ fontWeight: "bold", color: "black" }}>
                  Total Amount before Tax
                </td>
                <td className="border-2" colSpan={3} style={{ textAlign: "right", fontWeight: "bold", color: "black" }}>
                  {formatCurrency(subtotal)}
                </td>
              </tr>

              <tr>
                <td
                  className="border-2"
                  colSpan={8}
                  rowSpan={5}
                  style={{
                    textAlign: "center",
                    fontWeight: "bold",
                    verticalAlign: "middle",
                    padding: "4px",
                    color: "black",
                  }}
                >
                  INR {numberToWords(Math.floor(grandTotal))}
                </td>
                <td className="border-2" colSpan={5} style={{ fontWeight: "bold", color: "black" }}>
                  Add: CGST
                </td>
                <td className="border-2" colSpan={3} style={{ textAlign: "right", fontWeight: "bold", color: "black" }}>
                  {formatCurrency(totalCGST)}
                </td>
              </tr>

              <tr>
                <td className="border-2" colSpan={5} style={{ fontWeight: "bold", color: "black" }}>
                  Add: SGST
                </td>
                <td className="border-2" colSpan={3} style={{ textAlign: "right", fontWeight: "bold", color: "black" }}>
                  {formatCurrency(totalSGST)}
                </td>
              </tr>

              <tr>
                <td className="border-2" colSpan={5} style={{ fontWeight: "bold", color: "black" }}>
                  Add: IGST
                </td>
                <td className="border-2" colSpan={3} style={{ textAlign: "right", fontWeight: "bold", color: "black" }}>
                  {formatCurrency(totalIGST)}
                </td>
              </tr>

              <tr>
                <td className="border-2" colSpan={5} style={{ fontWeight: "bold", color: "black" }}>
                  Total Tax Amount
                </td>
                <td className="border-2" colSpan={3} style={{ textAlign: "right", fontWeight: "bold", color: "black" }}>
                  {formatCurrency(totalTax)}
                </td>
              </tr>

              <tr>
                <td className="border-2" colSpan={5} style={{ fontWeight: "bold", color: "black" }}>
                  Total Amount after Tax:
                </td>
                <td className="border-2" colSpan={3} style={{ textAlign: "right", fontWeight: "bold", color: "black" }}>
                  {formatCurrency(grandTotal)}
                </td>
              </tr>

              {/* Footer Section */}
              <tr className="footer-row">
                <td
                  className="border-2 header-blue"
                  colSpan={5}
                  style={{
                    textAlign: "center",
                    fontWeight: "bold",
                    backgroundColor: "#B4C6E7",
                    color: "black",
                  }}
                >
                  Bank Details
                </td>
                <td
                  className="border-2"
                  colSpan={3}
                  rowSpan={6}
                  style={{ textAlign: "center", verticalAlign: "middle", color: "black" }}
                >
                  <div
                    className="qr-code-area"
                    style={{
                      border: "1px solid #ccc",
                      margin: "0 auto",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "8px",
                      color: "black",
                    }}
                  >
                    QR Code
                  </div>
                </td>
                <td
                  className="border-2 header-blue"
                  colSpan={5}
                  style={{
                    textAlign: "center",
                    fontWeight: "bold",
                    backgroundColor: "#B4C6E7",
                    color: "black",
                  }}
                >
                  GST on Reverse Charge
                </td>
                <td className="border-2" colSpan={3} style={{ textAlign: "right", fontWeight: "bold", color: "black" }}>
                  0
                </td>
              </tr>

              <tr>
                <td className="border-2" colSpan={5} style={{ fontWeight: "bold", color: "black" }}>
                  Bank of Baroda
                </td>
                <td className="border-2" colSpan={8} style={{ textAlign: "center", fontSize: "9px", color: "black" }}>
                  Certified that the particulars given above are true and correct
                </td>
              </tr>

              <tr>
                <td className="border-2" colSpan={5} style={{ fontWeight: "bold", color: "black" }}>
                  Surya Nagar Branch, Ghaziabad, UP
                </td>
                <td className="border-2" colSpan={8} style={{ color: "black" }}></td>
              </tr>

              <tr>
                <td className="border-2" colSpan={5} style={{ fontWeight: "bold", color: "black" }}>
                  Bank A/C: 21270200008579
                </td>
                <td
                  className="border-2"
                  colSpan={8}
                  rowSpan={3}
                  style={{ textAlign: "center", verticalAlign: "bottom", fontWeight: "bold", color: "black" }}
                >
                  <div style={{ marginBottom: "5px" }}>
                    <div className="signature-area" style={{ border: "1px solid #ccc", margin: "0 auto 3px" }}></div>
                    TRIOS ENGINEERING SOLUTIONS
                  </div>
                </td>
              </tr>

              <tr>
                <td className="border-2" colSpan={5} style={{ fontWeight: "bold", color: "black" }}>
                  Bank IFSC: BARB0TRDSUR
                </td>
              </tr>

              <tr>
                <td className="border-2" colSpan={5} style={{ color: "black" }}>
                  Interest @ 18% after due date. All disputes are subject to UP Jurisdiction.
                </td>
              </tr>

              <tr>
                <td className="border-2" colSpan={5} style={{ color: "black" }}></td>
                <td
                  className="border-2"
                  colSpan={3}
                  style={{ textAlign: "center", fontWeight: "bold", color: "black" }}
                >
                  Common Seal
                </td>
                <td
                  className="border-2"
                  colSpan={8}
                  style={{ textAlign: "center", fontWeight: "bold", color: "black" }}
                >
                  Authorised signatory
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
