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

      {/* Invoice Template - Responsive */}
      <div
        className="w-full max-w-4xl mx-auto bg-white shadow-lg print:max-w-none print:mx-0 print:shadow-none"
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
            
            /* Position the invoice to fill the page */
            #invoice-content {
              position: absolute;
              left: 0;
              top: 0;
              width: 100% !important;
              max-width: none !important;
              margin: 0 !important;
              padding: 0 !important;
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
            }
            
            /* Optimize cell padding */
            .invoice-table td {
              padding: 2px !important;
              line-height: 1.2 !important;
              vertical-align: middle !important;
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
          
          /* Mobile responsive styles */
          @media (max-width: 768px) {
            .invoice-table {
              font-size: 8px;
            }
            
            .company-name {
              font-size: 12px;
            }
            
            .tax-invoice-header {
              font-size: 13px;
            }
            
            .invoice-table td {
              padding: 1px;
              word-break: break-word;
            }
            
            .client-row {
              height: auto;
              min-height: 40px;
            }
            
            .qr-code-area {
              width: 50px;
              height: 50px;
              font-size: 6px;
            }
            
            .signature-area {
              width: 70px;
              height: 25px;
            }
          }
          
          @media (max-width: 480px) {
            .invoice-table {
              font-size: 7px;
            }
            
            .company-name {
              font-size: 11px;
            }
            
            .tax-invoice-header {
              font-size: 12px;
            }
            
            .invoice-table td {
              padding: 0.5px;
            }
            
            .client-row {
              min-height: 35px;
            }
            
            .qr-code-area {
              width: 40px;
              height: 40px;
              font-size: 5px;
            }
            
            .signature-area {
              width: 60px;
              height: 20px;
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
            overflow-wrap: break-word;
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

        {/* Responsive wrapper for horizontal scroll on very small screens */}
        <div className="overflow-x-auto">
          <table className="invoice-table min-w-full">
            <colgroup>
              {Array.from({ length: 16 }, (_, i) => (
                <col key={i} className="w-[6.25%]" />
              ))}
            </colgroup>

            <tbody>
              {/* Header */}
              <tr>
                <td className="border-2 text-right font-bold text-xs sm:text-sm" colSpan={16}>
                  Original for Buyer
                </td>
              </tr>

              {/* Company Name */}
              <tr>
                <td className="border-2 company-name text-center font-bold text-sm sm:text-base" colSpan={16}>
                  TRIOS ENGINEERING SOLUTIONS
                </td>
              </tr>

              {/* Company Address */}
              <tr>
                <td className="border-2 text-center font-bold text-xs sm:text-sm" colSpan={16}>
                  SAHIBABAD-201011, UTTAR PRADESH
                </td>
              </tr>

              <tr>
                <td className="border-2 text-center font-bold text-xs sm:text-sm" colSpan={16}>
                  PH. NO. +91-9711207844
                </td>
              </tr>

              <tr>
                <td className="border-2 text-center font-bold text-xs sm:text-sm" colSpan={16}>
                  Email: info@triosengineeringsolutions.com
                </td>
              </tr>

              <tr>
                <td className="border-2 text-center font-bold text-xs sm:text-sm" colSpan={16}>
                  GSTIN: 09ACUPA7462Q1ZO
                </td>
              </tr>

              {/* Tax Invoice Header */}
              <tr className="header-row">
                <td
                  className="border-2 header-blue tax-invoice-header text-center font-bold text-base sm:text-lg"
                  colSpan={16}
                  style={{
                    backgroundColor: "#B4C6E7",
                  }}
                >
                  Tax Invoice
                </td>
              </tr>

              {/* Invoice Details */}
              <tr>
                <td className="border-2 font-bold text-xs" colSpan={7}>
                  Invoice No: {invoice.invoiceNumber}
                </td>
                <td className="border-2 font-bold text-xs" colSpan={9}>
                  Vehicle Number: {invoice.vehicleNumber || ""}
                </td>
              </tr>

              <tr>
                <td className="border-2 font-bold text-xs" colSpan={7}>
                  Invoice date: {new Date(invoice.invoiceDate || invoice.date).toLocaleDateString("en-IN")}
                </td>
                <td className="border-2 font-bold text-xs" colSpan={9}>
                  Supplier's PO No: {invoice.poNumber || ""}
                </td>
              </tr>

              <tr>
                <td className="border-2 font-bold text-xs" colSpan={6}>
                  Reverse Charge (Y/N): N
                </td>
                <td className="border-2 font-bold text-xs"></td>
                <td className="border-2 font-bold text-xs" colSpan={9}>
                  PO Date: {invoice.poDate ? new Date(invoice.poDate).toLocaleDateString("en-IN") : ""}
                </td>
              </tr>

              <tr>
                <td className="border-2 font-bold text-xs" colSpan={5}>
                  State: UTTAR PRADESH
                </td>
                <td className="border-2 font-bold text-xs">Code</td>
                <td className="border-2 text-center font-bold text-xs">9</td>
                <td className="border-2 font-bold text-xs" colSpan={9}>
                  Transport Mode: {invoice.transportMode || ""}
                </td>
              </tr>

              {/* Bill to Party Section */}
              <tr>
                <td
                  className="border-2 header-blue text-center font-bold text-xs"
                  colSpan={7}
                  style={{
                    backgroundColor: "#B4C6E7",
                  }}
                >
                  Bill to Party
                </td>
                <td
                  className="border-2 header-blue text-center font-bold text-xs"
                  colSpan={9}
                  style={{
                    backgroundColor: "#B4C6E7",
                  }}
                >
                  Ship to Party
                </td>
              </tr>

              {/* Client Details */}
              <tr className="client-row">
                <td className="border-2 align-top p-1 text-xs" colSpan={7}>
                  <div className="font-bold">{client.name}</div>
                  <div className="break-words">{client.address}</div>
                  <div>
                    {client.city}, {client.state} - {client.pincode}
                  </div>
                  {client.phone && <div>Ph: {client.phone}</div>}
                  {client.email && <div className="break-all">Email: {client.email}</div>}
                </td>
                <td className="border-2 align-top p-1 text-xs" colSpan={9}>
                  <div className="font-bold">{client.name}</div>
                  <div className="break-words">{client.address}</div>
                  <div>
                    {client.city}, {client.state} - {client.pincode}
                  </div>
                </td>
              </tr>

              <tr>
                <td className="border-2 font-bold text-xs" colSpan={5}>
                  State: {client.state}
                </td>
                <td className="border-2 font-bold text-xs">Code</td>
                <td className="border-2 text-center text-xs">{client.stateCode || ""}</td>
                <td className="border-2 font-bold text-xs" colSpan={6}>
                  State: {client.state}
                </td>
                <td className="border-2 text-center font-bold text-xs" colSpan={2}>
                  Code
                </td>
                <td className="border-2 text-xs">{client.stateCode || ""}</td>
              </tr>

              <tr>
                <td className="border-2 font-bold text-xs" colSpan={7}>
                  GSTIN: {client.gstin || ""}
                </td>
                <td className="border-2 font-bold text-xs" colSpan={9}>
                  GSTIN: {client.gstin || ""}
                </td>
              </tr>

              {/* Table Headers */}
              <tr>
                <td
                  className="border-2 header-blue text-center font-bold text-xs"
                  style={{
                    backgroundColor: "#B4C6E7",
                  }}
                >
                  S. No.
                </td>
                <td
                  className="border-2 header-blue text-center font-bold text-xs"
                  style={{
                    backgroundColor: "#B4C6E7",
                  }}
                >
                  Product Description
                </td>
                <td
                  className="border-2 header-blue text-center font-bold text-xs"
                  style={{
                    backgroundColor: "#B4C6E7",
                  }}
                >
                  HSN / SAC code
                </td>
                <td
                  className="border-2 header-blue text-center font-bold text-xs"
                  style={{
                    backgroundColor: "#B4C6E7",
                  }}
                >
                  Qty
                </td>
                <td
                  className="border-2 header-blue text-center font-bold text-xs"
                  style={{
                    backgroundColor: "#B4C6E7",
                  }}
                >
                  Rate
                </td>
                <td
                  className="border-2 header-blue text-center font-bold text-xs"
                  style={{
                    backgroundColor: "#B4C6E7",
                  }}
                >
                  Amount
                </td>
                <td
                  className="border-2 header-blue text-center font-bold text-xs"
                  style={{
                    backgroundColor: "#B4C6E7",
                  }}
                >
                  Disc.
                </td>
                <td
                  className="border-2 header-blue text-center font-bold text-xs"
                  style={{
                    backgroundColor: "#B4C6E7",
                  }}
                >
                  Taxable Value
                </td>
                <td
                  className="border-2 header-blue text-center font-bold text-xs"
                  colSpan={3}
                  style={{
                    backgroundColor: "#B4C6E7",
                  }}
                >
                  CGST
                </td>
                <td
                  className="border-2 header-blue text-center font-bold text-xs"
                  colSpan={2}
                  style={{
                    backgroundColor: "#B4C6E7",
                  }}
                >
                  SGST
                </td>
                <td
                  className="border-2 header-blue text-center font-bold text-xs"
                  colSpan={2}
                  style={{
                    backgroundColor: "#B4C6E7",
                  }}
                >
                  IGST
                </td>
                <td
                  className="border-2 header-blue text-center font-bold text-xs"
                  style={{
                    backgroundColor: "#B4C6E7",
                  }}
                >
                  Total
                </td>
              </tr>

              <tr>
                <td className="border-2 header-blue text-xs" style={{ backgroundColor: "#B4C6E7" }}></td>
                <td className="border-2 header-blue text-xs" style={{ backgroundColor: "#B4C6E7" }}></td>
                <td className="border-2 header-blue text-xs" style={{ backgroundColor: "#B4C6E7" }}></td>
                <td className="border-2 header-blue text-xs" style={{ backgroundColor: "#B4C6E7" }}></td>
                <td className="border-2 header-blue text-xs" style={{ backgroundColor: "#B4C6E7" }}></td>
                <td className="border-2 header-blue text-xs" style={{ backgroundColor: "#B4C6E7" }}></td>
                <td className="border-2 header-blue text-xs" style={{ backgroundColor: "#B4C6E7" }}></td>
                <td className="border-2 header-blue text-xs" style={{ backgroundColor: "#B4C6E7" }}></td>
                <td
                  className="border-2 header-blue text-center font-bold text-xs"
                  style={{
                    backgroundColor: "#B4C6E7",
                  }}
                >
                  Rate
                </td>
                <td
                  className="border-2 header-blue text-center font-bold text-xs"
                  colSpan={2}
                  style={{
                    backgroundColor: "#B4C6E7",
                  }}
                >
                  Amount
                </td>
                <td
                  className="border-2 header-blue text-center font-bold text-xs"
                  style={{
                    backgroundColor: "#B4C6E7",
                  }}
                >
                  Rate
                </td>
                <td
                  className="border-2 header-blue text-center font-bold text-xs"
                  style={{
                    backgroundColor: "#B4C6E7",
                  }}
                >
                  Amount
                </td>
                <td
                  className="border-2 header-blue text-center font-bold text-xs"
                  style={{
                    backgroundColor: "#B4C6E7",
                  }}
                >
                  Rate
                </td>
                <td
                  className="border-2 header-blue text-center font-bold text-xs"
                  style={{
                    backgroundColor: "#B4C6E7",
                  }}
                >
                  Amount
                </td>
                <td className="border-2 header-blue text-xs" style={{ backgroundColor: "#B4C6E7" }}></td>
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
                    <td className="border-2 text-center text-xs">{index + 1}</td>
                    <td className="border-2 text-xs break-words">{item.description}</td>
                    <td className="border-2 text-center text-xs">{item.hsnCode}</td>
                    <td className="border-2 text-center text-xs">{item.quantity}</td>
                    <td className="border-2 text-right text-xs">{formatCurrency(item.rate)}</td>
                    <td className="border-2 text-right text-xs">{formatCurrency(itemAmount)}</td>
                    <td className="border-2 text-center text-xs">0</td>
                    <td className="border-2 text-right text-xs">{formatCurrency(itemAmount)}</td>
                    <td className="border-2 text-center text-xs">{item.cgst}%</td>
                    <td className="border-2 text-right text-xs" colSpan={2}>
                      {formatCurrency(cgstAmount)}
                    </td>
                    <td className="border-2 text-center text-xs">{item.sgst}%</td>
                    <td className="border-2 text-right text-xs">{formatCurrency(sgstAmount)}</td>
                    <td className="border-2 text-center text-xs">{item.igst}%</td>
                    <td className="border-2 text-right text-xs">{formatCurrency(igstAmount)}</td>
                    <td className="border-2 text-right text-xs">{formatCurrency(itemTotal)}</td>
                  </tr>
                )
              })}

              {/* Dynamic Empty rows */}
              {Array.from({ length: emptyRowsNeeded }, (_, i) => (
                <tr key={`empty-${i}`} className="empty-row">
                  {Array.from({ length: 16 }, (_, j) => (
                    <td key={j} className="border-2 text-xs">
                      &nbsp;
                    </td>
                  ))}
                </tr>
              ))}

              {/* Total Row */}
              <tr>
                <td
                  className="border-2 header-blue text-center font-bold text-xs"
                  colSpan={3}
                  style={{
                    backgroundColor: "#B4C6E7",
                  }}
                >
                  Total
                </td>
                <td className="border-2 text-center text-xs">{items.reduce((sum, item) => sum + item.quantity, 0)}</td>
                <td className="border-2 text-xs"></td>
                <td className="border-2 text-right font-bold text-xs">{formatCurrency(subtotal)}</td>
                <td className="border-2 text-right text-xs">0</td>
                <td className="border-2 text-right font-bold text-xs">{formatCurrency(subtotal)}</td>
                <td className="border-2 text-xs"></td>
                <td className="border-2 text-right font-bold text-xs" colSpan={2}>
                  {formatCurrency(totalCGST)}
                </td>
                <td className="border-2 text-xs"></td>
                <td className="border-2 text-right font-bold text-xs">{formatCurrency(totalSGST)}</td>
                <td className="border-2 text-xs"></td>
                <td className="border-2 text-right font-bold text-xs">{formatCurrency(totalIGST)}</td>
                <td className="border-2 text-right font-bold text-xs">{formatCurrency(grandTotal)}</td>
              </tr>

              {/* Amount in Words */}
              <tr>
                <td
                  className="border-2 header-blue text-center font-bold text-xs"
                  colSpan={8}
                  style={{
                    backgroundColor: "#B4C6E7",
                  }}
                >
                  Total Invoice amount in words
                </td>
                <td className="border-2 font-bold text-xs" colSpan={5}>
                  Total Amount before Tax
                </td>
                <td className="border-2 text-right font-bold text-xs" colSpan={3}>
                  {formatCurrency(subtotal)}
                </td>
              </tr>

              <tr>
                <td className="border-2 text-center font-bold align-middle p-1 text-xs" colSpan={8} rowSpan={5}>
                  <div className="break-words">INR {numberToWords(Math.floor(grandTotal))}</div>
                </td>
                <td className="border-2 font-bold text-xs" colSpan={5}>
                  Add: CGST
                </td>
                <td className="border-2 text-right font-bold text-xs" colSpan={3}>
                  {formatCurrency(totalCGST)}
                </td>
              </tr>

              <tr>
                <td className="border-2 font-bold text-xs" colSpan={5}>
                  Add: SGST
                </td>
                <td className="border-2 text-right font-bold text-xs" colSpan={3}>
                  {formatCurrency(totalSGST)}
                </td>
              </tr>

              <tr>
                <td className="border-2 font-bold text-xs" colSpan={5}>
                  Add: IGST
                </td>
                <td className="border-2 text-right font-bold text-xs" colSpan={3}>
                  {formatCurrency(totalIGST)}
                </td>
              </tr>

              <tr>
                <td className="border-2 font-bold text-xs" colSpan={5}>
                  Total Tax Amount
                </td>
                <td className="border-2 text-right font-bold text-xs" colSpan={3}>
                  {formatCurrency(totalTax)}
                </td>
              </tr>

              <tr>
                <td className="border-2 font-bold text-xs" colSpan={5}>
                  Total Amount after Tax:
                </td>
                <td className="border-2 text-right font-bold text-xs" colSpan={3}>
                  {formatCurrency(grandTotal)}
                </td>
              </tr>

              {/* Footer Section - Compact */}
              <tr className="footer-row">
                <td
                  className="border-2 header-blue text-center font-bold text-xs"
                  colSpan={5}
                  style={{
                    backgroundColor: "#B4C6E7",
                  }}
                >
                  Bank Details
                </td>
                <td className="border-2 text-center align-middle text-xs" colSpan={3} rowSpan={6}>
                  {/* QR Code placeholder */}
                  <div
                    className="qr-code-area border border-gray-300 mx-auto flex items-center justify-center text-xs"
                    style={{
                      width: "70px",
                      height: "70px",
                    }}
                  >
                    QR Code
                  </div>
                </td>
                <td
                  className="border-2 header-blue text-center font-bold text-xs"
                  colSpan={5}
                  style={{
                    backgroundColor: "#B4C6E7",
                  }}
                >
                  GST on Reverse Charge
                </td>
                <td className="border-2 text-right font-bold text-xs" colSpan={3}>
                  0
                </td>
              </tr>

              <tr>
                <td className="border-2 font-bold text-xs" colSpan={5}>
                  Bank of Baroda
                </td>
                <td className="border-2 text-center text-xs" colSpan={8} style={{ fontSize: "8px" }}>
                  Certified that the particulars given above are true and correct
                </td>
              </tr>

              <tr>
                <td className="border-2 font-bold text-xs" colSpan={5}>
                  Surya Nagar Branch, Ghaziabad, UP
                </td>
                <td className="border-2 text-xs" colSpan={8}></td>
              </tr>

              <tr>
                <td className="border-2 font-bold text-xs" colSpan={5}>
                  Bank A/C: 21270200008579
                </td>
                <td className="border-2 text-center align-bottom font-bold text-xs" colSpan={8} rowSpan={3}>
                  <div className="mb-1">
                    <div
                      className="signature-area border border-gray-300 mx-auto mb-1"
                      style={{
                        width: "90px",
                        height: "35px",
                      }}
                    ></div>
                    <div className="text-xs">TRIOS ENGINEERING SOLUTIONS</div>
                  </div>
                </td>
              </tr>

              <tr>
                <td className="border-2 font-bold text-xs" colSpan={5}>
                  Bank IFSC: BARB0TRDSUR
                </td>
              </tr>

              <tr>
                <td className="border-2 text-xs" colSpan={5}>
                  <div className="break-words">
                    Interest @ 18% after due date. All disputes are subject to UP Jurisdiction.
                  </div>
                </td>
              </tr>

              <tr>
                <td className="border-2 text-xs" colSpan={5}></td>
                <td className="border-2 text-center font-bold text-xs" colSpan={3}>
                  Common Seal
                </td>
                <td className="border-2 text-center font-bold text-xs" colSpan={8}>
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
