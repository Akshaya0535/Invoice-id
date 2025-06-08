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
  // Maximize space usage with more items per page
  const maxItemsPerPage = 12 // Increased from 8 to fill more space
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

      {/* Invoice Template - EXACT replica */}
      <div
        className="w-full max-w-4xl mx-auto bg-white print:max-w-none print:mx-0 print:shadow-none"
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
    
    /* Position the invoice at the top of the page */
    #invoice-content {
      position: absolute;
      left: 0;
      top: 0;
      width: 100% !important;
      max-width: none !important;
      margin: 0 !important;
      padding: 0 !important;
      height: 100vh !important;
    }
    
    /* Remove any margins and padding from body */
    body {
      margin: 0 !important;
      padding: 0 !important;
    }
    
    /* Ensure table takes full width and height */
    .invoice-table {
      width: 100% !important;
      height: 100% !important;
      font-size: 8px !important;
      page-break-inside: avoid;
      table-layout: fixed;
    }
    
    /* Optimize cell padding for maximum space usage */
    .invoice-table td {
      padding: 1px !important;
      line-height: 1.1 !important;
      vertical-align: middle !important;
    }
    
    /* Specific height adjustments for maximum space usage */
    .client-row {
      height: 50px !important;
    }
    
    .header-row {
      height: 20px !important;
    }
    
    .empty-row {
      height: 15px !important;
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
    }
    
    /* Ensure borders are visible */
    .invoice-table td {
      border: 1px solid #000 !important;
    }
    
    .border-2 {
      border-width: 2px !important;
      border-color: #000 !important;
    }
    
    /* Minimal page margins - fill entire A4 */
    @page {
      margin: 0.1in !important;
      size: A4;
    }
    
    /* Hide print button and other UI elements */
    .print\\:hidden {
      display: none !important;
    }
    
    /* Maximize font sizes for headers while keeping readable */
    .company-name {
      font-size: 12px !important;
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
  
  .invoice-table {
    border-collapse: collapse;
    width: 100%;
    font-family: "Liberation Sans", Arial, sans-serif;
    font-size: 10px;
    table-layout: fixed;
  }
  .invoice-table td {
    border: 1px solid #000;
    padding: 2px;
    vertical-align: middle;
    word-wrap: break-word;
  }
  .header-blue {
    background-color: #B4C6E7;
    -webkit-print-color-adjust: exact;
    color-adjust: exact;
    print-color-adjust: exact;
  }
  .border-2 {
    border-width: 2px !important;
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
              <td className="border-2" colSpan={16} style={{ textAlign: "right", fontWeight: "bold" }}>
                Original for Buyer
              </td>
            </tr>

            {/* Company Name */}
            <tr>
              <td className="border-2 company-name" colSpan={16} style={{ textAlign: "center", fontWeight: "bold" }}>
                TRIOS ENGINEERING SOLUTIONS
              </td>
            </tr>

            {/* Company Address */}
            <tr>
              <td className="border-2" colSpan={16} style={{ textAlign: "center", fontWeight: "bold" }}>
                SAHIBABAD-201011, UTTAR PRADESH
              </td>
            </tr>

            <tr>
              <td className="border-2" colSpan={16} style={{ textAlign: "center", fontWeight: "bold" }}>
                PH. NO. +91-9711207844
              </td>
            </tr>

            <tr>
              <td className="border-2" colSpan={16} style={{ textAlign: "center", fontWeight: "bold" }}>
                Email: info@triosengineeringsolutions.com
              </td>
            </tr>

            <tr>
              <td className="border-2" colSpan={16} style={{ textAlign: "center", fontWeight: "bold" }}>
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
                }}
              >
                Tax Invoice
              </td>
            </tr>

            {/* Invoice Details */}
            <tr>
              <td className="border-2" colSpan={7} style={{ fontWeight: "bold" }}>
                Invoice No: {invoice.invoiceNumber}
              </td>
              <td className="border-2" colSpan={9} style={{ fontWeight: "bold" }}>
                Vehicle Number: {invoice.vehicleNumber || ""}
              </td>
            </tr>

            <tr>
              <td className="border-2" colSpan={7} style={{ fontWeight: "bold" }}>
                Invoice date: {new Date(invoice.invoiceDate || invoice.date).toLocaleDateString("en-IN")}
              </td>
              <td className="border-2" colSpan={9} style={{ fontWeight: "bold" }}>
                Supplier's PO No: {invoice.poNumber || ""}
              </td>
            </tr>

            <tr>
              <td className="border-2" colSpan={6} style={{ fontWeight: "bold" }}>
                Reverse Charge (Y/N): N
              </td>
              <td className="border-2" style={{ fontWeight: "bold" }}></td>
              <td className="border-2" colSpan={9} style={{ fontWeight: "bold" }}>
                PO Date: {invoice.poDate ? new Date(invoice.poDate).toLocaleDateString("en-IN") : ""}
              </td>
            </tr>

            <tr>
              <td className="border-2" colSpan={5} style={{ fontWeight: "bold" }}>
                State: UTTAR PRADESH
              </td>
              <td className="border-2" style={{ fontWeight: "bold" }}>
                Code
              </td>
              <td className="border-2" style={{ textAlign: "center", fontWeight: "bold" }}>
                9
              </td>
              <td className="border-2" colSpan={9} style={{ fontWeight: "bold" }}>
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
                }}
              >
                Ship to Party
              </td>
            </tr>

            {/* Client Details */}
            <tr className="client-row">
              <td className="border-2" colSpan={7} style={{ verticalAlign: "top", padding: "6px" }}>
                <div style={{ fontWeight: "bold" }}>{client.name}</div>
                <div>{client.address}</div>
                <div>
                  {client.city}, {client.state} - {client.pincode}
                </div>
                {client.phone && <div>Ph: {client.phone}</div>}
                {client.email && <div>Email: {client.email}</div>}
              </td>
              <td className="border-2" colSpan={9} style={{ verticalAlign: "top", padding: "6px" }}>
                <div style={{ fontWeight: "bold" }}>{client.name}</div>
                <div>{client.address}</div>
                <div>
                  {client.city}, {client.state} - {client.pincode}
                </div>
              </td>
            </tr>

            <tr>
              <td className="border-2" colSpan={5} style={{ fontWeight: "bold" }}>
                State: {client.state}
              </td>
              <td className="border-2" style={{ fontWeight: "bold" }}>
                Code
              </td>
              <td className="border-2" style={{ textAlign: "center" }}>
                {client.stateCode || ""}
              </td>
              <td className="border-2" colSpan={6} style={{ fontWeight: "bold" }}>
                State: {client.state}
              </td>
              <td className="border-2" colSpan={2} style={{ textAlign: "center", fontWeight: "bold" }}>
                Code
              </td>
              <td className="border-2">{client.stateCode || ""}</td>
            </tr>

            <tr>
              <td className="border-2" colSpan={7} style={{ fontWeight: "bold" }}>
                GSTIN: {client.gstin || ""}
              </td>
              <td className="border-2" colSpan={9} style={{ fontWeight: "bold" }}>
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
                  <td className="border-2" style={{ textAlign: "center" }}>
                    {index + 1}
                  </td>
                  <td className="border-2">{item.description}</td>
                  <td className="border-2" style={{ textAlign: "center" }}>
                    {item.hsnCode}
                  </td>
                  <td className="border-2" style={{ textAlign: "center" }}>
                    {item.quantity}
                  </td>
                  <td className="border-2" style={{ textAlign: "right" }}>
                    {formatCurrency(item.rate)}
                  </td>
                  <td className="border-2" style={{ textAlign: "right" }}>
                    {formatCurrency(itemAmount)}
                  </td>
                  <td className="border-2" style={{ textAlign: "center" }}>
                    0
                  </td>
                  <td className="border-2" style={{ textAlign: "right" }}>
                    {formatCurrency(itemAmount)}
                  </td>
                  <td className="border-2" style={{ textAlign: "center" }}>
                    {item.cgst}%
                  </td>
                  <td className="border-2" colSpan={2} style={{ textAlign: "right" }}>
                    {formatCurrency(cgstAmount)}
                  </td>
                  <td className="border-2" style={{ textAlign: "center" }}>
                    {item.sgst}%
                  </td>
                  <td className="border-2" style={{ textAlign: "right" }}>
                    {formatCurrency(sgstAmount)}
                  </td>
                  <td className="border-2" style={{ textAlign: "center" }}>
                    {item.igst}%
                  </td>
                  <td className="border-2" style={{ textAlign: "right" }}>
                    {formatCurrency(igstAmount)}
                  </td>
                  <td className="border-2" style={{ textAlign: "right" }}>
                    {formatCurrency(itemTotal)}
                  </td>
                </tr>
              )
            })}

            {/* Dynamic Empty rows - only add what's needed */}
            {Array.from({ length: emptyRowsNeeded }, (_, i) => (
              <tr key={`empty-${i}`} className="empty-row">
                {Array.from({ length: 16 }, (_, j) => (
                  <td key={j} className="border-2">
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
                }}
              >
                Total
              </td>
              <td className="border-2" style={{ textAlign: "center" }}>
                {items.reduce((sum, item) => sum + item.quantity, 0)}
              </td>
              <td className="border-2"></td>
              <td className="border-2" style={{ textAlign: "right", fontWeight: "bold" }}>
                {formatCurrency(subtotal)}
              </td>
              <td className="border-2" style={{ textAlign: "right" }}>
                0
              </td>
              <td className="border-2" style={{ textAlign: "right", fontWeight: "bold" }}>
                {formatCurrency(subtotal)}
              </td>
              <td className="border-2" style={{ textAlign: "right", fontWeight: "bold" }}>
                {formatCurrency(subtotal)}
              </td>
              <td className="border-2"></td>
              <td className="border-2" colSpan={2} style={{ textAlign: "right", fontWeight: "bold" }}>
                {formatCurrency(totalCGST)}
              </td>
              <td className="border-2"></td>
              <td className="border-2" style={{ textAlign: "right", fontWeight: "bold" }}>
                {formatCurrency(totalSGST)}
              </td>
              <td className="border-2"></td>
              <td className="border-2" style={{ textAlign: "right", fontWeight: "bold" }}>
                {formatCurrency(totalIGST)}
              </td>
              <td className="border-2" style={{ textAlign: "right", fontWeight: "bold" }}>
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
                }}
              >
                Total Invoice amount in words
              </td>
              <td className="border-2" colSpan={5} style={{ fontWeight: "bold" }}>
                Total Amount before Tax
              </td>
              <td className="border-2" colSpan={3} style={{ textAlign: "right", fontWeight: "bold" }}>
                {formatCurrency(subtotal)}
              </td>
            </tr>

            <tr>
              <td
                className="border-2"
                colSpan={8}
                rowSpan={5}
                style={{ textAlign: "center", fontWeight: "bold", verticalAlign: "middle", padding: "6px" }}
              >
                INR {numberToWords(Math.floor(grandTotal))}
              </td>
              <td className="border-2" colSpan={5} style={{ fontWeight: "bold" }}>
                Add: CGST
              </td>
              <td className="border-2" colSpan={3} style={{ textAlign: "right", fontWeight: "bold" }}>
                {formatCurrency(totalCGST)}
              </td>
            </tr>

            <tr>
              <td className="border-2" colSpan={5} style={{ fontWeight: "bold" }}>
                Add: SGST
              </td>
              <td className="border-2" colSpan={3} style={{ textAlign: "right", fontWeight: "bold" }}>
                {formatCurrency(totalSGST)}
              </td>
            </tr>

            <tr>
              <td className="border-2" colSpan={5} style={{ fontWeight: "bold" }}>
                Add: IGST
              </td>
              <td className="border-2" colSpan={3} style={{ textAlign: "right", fontWeight: "bold" }}>
                {formatCurrency(totalIGST)}
              </td>
            </tr>

            <tr>
              <td className="border-2" colSpan={5} style={{ fontWeight: "bold" }}>
                Total Tax Amount
              </td>
              <td className="border-2" colSpan={3} style={{ textAlign: "right", fontWeight: "bold" }}>
                {formatCurrency(totalTax)}
              </td>
            </tr>

            <tr>
              <td className="border-2" colSpan={5} style={{ fontWeight: "bold" }}>
                Total Amount after Tax:
              </td>
              <td className="border-2" colSpan={3} style={{ textAlign: "right", fontWeight: "bold" }}>
                {formatCurrency(grandTotal)}
              </td>
            </tr>

            {/* Footer Section - Compact */}
            <tr className="footer-row">
              <td
                className="border-2 header-blue"
                colSpan={5}
                style={{
                  textAlign: "center",
                  fontWeight: "bold",
                  backgroundColor: "#B4C6E7",
                }}
              >
                Bank Details
              </td>
              <td className="border-2" colSpan={3} rowSpan={6} style={{ textAlign: "center", verticalAlign: "middle" }}>
                {/* QR Code placeholder - smaller */}
                <div
                  className="qr-code-area"
                  style={{
                    border: "1px solid #ccc",
                    margin: "0 auto",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "8px",
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
                }}
              >
                GST on Reverse Charge
              </td>
              <td className="border-2" colSpan={3} style={{ textAlign: "right", fontWeight: "bold" }}>
                0
              </td>
            </tr>

            <tr>
              <td className="border-2" colSpan={5} style={{ fontWeight: "bold" }}>
                Bank of Baroda
              </td>
              <td className="border-2" colSpan={8} style={{ textAlign: "center", fontSize: "9px" }}>
                Certified that the particulars given above are true and correct
              </td>
            </tr>

            <tr>
              <td className="border-2" colSpan={5} style={{ fontWeight: "bold" }}>
                Surya Nagar Branch, Ghaziabad, UP
              </td>
              <td className="border-2" colSpan={8}></td>
            </tr>

            <tr>
              <td className="border-2" colSpan={5} style={{ fontWeight: "bold" }}>
                Bank A/C: 21270200008579
              </td>
              <td
                className="border-2"
                colSpan={8}
                rowSpan={3}
                style={{ textAlign: "center", verticalAlign: "bottom", fontWeight: "bold" }}
              >
                <div style={{ marginBottom: "5px" }}>
                  <div className="signature-area" style={{ border: "1px solid #ccc", margin: "0 auto 3px" }}></div>
                  TRIOS ENGINEERING SOLUTIONS
                </div>
              </td>
            </tr>

            <tr>
              <td className="border-2" colSpan={5} style={{ fontWeight: "bold" }}>
                Bank IFSC: BARB0TRDSUR
              </td>
            </tr>

            <tr>
              <td className="border-2" colSpan={5}>
                Interest @ 18% after due date. All disputes are subject to UP Jurisdiction.
              </td>
            </tr>

            <tr>
              <td className="border-2" colSpan={5}></td>
              <td className="border-2" colSpan={3} style={{ textAlign: "center", fontWeight: "bold" }}>
                Common Seal
              </td>
              <td className="border-2" colSpan={8} style={{ textAlign: "center", fontWeight: "bold" }}>
                Authorised signatory
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
