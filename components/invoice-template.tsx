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

  // Convert number to words (simplified version)
  const numberToWords = (num: number): string => {
    // This is a simplified version - you might want to use a proper library
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
    if (lakhs > 0)
      result += `${lakhs < 20 && lakhs > 9 ? teens[lakhs - 10] : tens[Math.floor(lakhs / 10)] + " " + ones[lakhs % 10]} LAKH `
    if (thousands > 0)
      result += `${thousands < 20 && thousands > 9 ? teens[thousands - 10] : tens[Math.floor(thousands / 10)] + " " + ones[thousands % 10]} THOUSAND `
    if (hundreds > 0) result += `${ones[hundreds]} HUNDRED `
    if (remainder > 0) {
      if (remainder < 10) result += ones[remainder]
      else if (remainder < 20) result += teens[remainder - 10]
      else result += tens[Math.floor(remainder / 10)] + " " + ones[remainder % 10]
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

      {/* Invoice Template */}
      <div className="w-full max-w-4xl mx-auto bg-white print:max-w-none print:mx-0">
        <style jsx>{`
          @media print {
            body { margin: 0; }
            .print\\:max-w-none { max-width: none !important; }
            .print\\:mx-0 { margin-left: 0 !important; margin-right: 0 !important; }
            .print\\:hidden { display: none !important; }
            table { page-break-inside: avoid; }
            .invoice-table { font-size: 10px; }
          }
          .invoice-table {
            border-collapse: collapse;
            width: 100%;
            font-family: "Liberation Sans", Arial, sans-serif;
            font-size: 12px;
          }
          .invoice-table td {
            border: 1px solid #000;
            padding: 4px;
            vertical-align: middle;
          }
          .header-blue {
            background-color: #B4C6E7;
          }
          .border-2 {
            border-width: 2px !important;
          }
        `}</style>

        <table className="invoice-table">
          <colgroup>
            {Array.from({ length: 16 }, (_, i) => (
              <col key={i} width="85" />
            ))}
          </colgroup>

          {/* Header */}
          <tr>
            <td className="border-2" colSpan={16} style={{ textAlign: "right", fontWeight: "bold" }}>
              Original for Buyer
            </td>
          </tr>

          {/* Company Name */}
          <tr>
            <td className="border-2" colSpan={16} style={{ textAlign: "center", fontWeight: "bold", fontSize: "16px" }}>
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
          <tr>
            <td
              className="border-2 header-blue"
              colSpan={16}
              style={{ textAlign: "center", fontWeight: "bold", fontSize: "18px", height: "34px" }}
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
              Invoice date: {new Date(invoice.date).toLocaleDateString("en-IN")}
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
            <td className="border-2 header-blue" colSpan={7} style={{ textAlign: "center", fontWeight: "bold" }}>
              Bill to Party
            </td>
            <td className="border-2 header-blue" colSpan={9} style={{ textAlign: "center", fontWeight: "bold" }}>
              Ship to Party
            </td>
          </tr>

          {/* Client Details */}
          <tr>
            <td className="border-2" colSpan={7} style={{ height: "60px", verticalAlign: "top", padding: "8px" }}>
              <div style={{ fontWeight: "bold" }}>{client.name}</div>
              <div>{client.address}</div>
              <div>
                {client.city}, {client.state} - {client.pincode}
              </div>
              {client.phone && <div>Ph: {client.phone}</div>}
              {client.email && <div>Email: {client.email}</div>}
            </td>
            <td className="border-2" colSpan={9} style={{ height: "60px", verticalAlign: "top", padding: "8px" }}>
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
            <td className="border-2 header-blue" style={{ textAlign: "center", fontWeight: "bold" }}>
              S. No.
            </td>
            <td className="border-2 header-blue" style={{ textAlign: "center", fontWeight: "bold" }}>
              Product Description
            </td>
            <td className="border-2 header-blue" style={{ textAlign: "center", fontWeight: "bold" }}>
              HSN / SAC code
            </td>
            <td className="border-2 header-blue" style={{ textAlign: "center", fontWeight: "bold" }}>
              Qty
            </td>
            <td className="border-2 header-blue" style={{ textAlign: "center", fontWeight: "bold" }}>
              Rate
            </td>
            <td className="border-2 header-blue" style={{ textAlign: "center", fontWeight: "bold" }}>
              Amount
            </td>
            <td className="border-2 header-blue" style={{ textAlign: "center", fontWeight: "bold" }}>
              Disc.
            </td>
            <td className="border-2 header-blue" style={{ textAlign: "center", fontWeight: "bold" }}>
              Taxable Value
            </td>
            <td className="border-2 header-blue" colSpan={3} style={{ textAlign: "center", fontWeight: "bold" }}>
              CGST
            </td>
            <td className="border-2 header-blue" colSpan={2} style={{ textAlign: "center", fontWeight: "bold" }}>
              SGST
            </td>
            <td className="border-2 header-blue" colSpan={2} style={{ textAlign: "center", fontWeight: "bold" }}>
              IGST
            </td>
            <td className="border-2 header-blue" style={{ textAlign: "center", fontWeight: "bold" }}>
              Total
            </td>
          </tr>

          <tr>
            <td className="border-2 header-blue"></td>
            <td className="border-2 header-blue"></td>
            <td className="border-2 header-blue"></td>
            <td className="border-2 header-blue"></td>
            <td className="border-2 header-blue"></td>
            <td className="border-2 header-blue"></td>
            <td className="border-2 header-blue"></td>
            <td className="border-2 header-blue"></td>
            <td className="border-2 header-blue" style={{ textAlign: "center", fontWeight: "bold" }}>
              Rate
            </td>
            <td className="border-2 header-blue" colSpan={2} style={{ textAlign: "center", fontWeight: "bold" }}>
              Amount
            </td>
            <td className="border-2 header-blue" style={{ textAlign: "center", fontWeight: "bold" }}>
              Rate
            </td>
            <td className="border-2 header-blue" style={{ textAlign: "center", fontWeight: "bold" }}>
              Amount
            </td>
            <td className="border-2 header-blue" style={{ textAlign: "center", fontWeight: "bold" }}>
              Rate
            </td>
            <td className="border-2 header-blue" style={{ textAlign: "center", fontWeight: "bold" }}>
              Amount
            </td>
            <td className="border-2 header-blue"></td>
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

          {/* Empty rows to fill space */}
          {Array.from({ length: Math.max(0, 10 - items.length) }, (_, i) => (
            <tr key={`empty-${i}`}>
              {Array.from({ length: 16 }, (_, j) => (
                <td key={j} className="border-2" style={{ height: "17px" }}>
                  &nbsp;
                </td>
              ))}
            </tr>
          ))}

          {/* Total Row */}
          <tr>
            <td className="border-2 header-blue" colSpan={3} style={{ textAlign: "center", fontWeight: "bold" }}>
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
            <td className="border-2 header-blue" colSpan={8} style={{ textAlign: "center", fontWeight: "bold" }}>
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
              style={{ textAlign: "center", fontWeight: "bold", verticalAlign: "middle", padding: "8px" }}
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

          {/* Footer Section */}
          <tr>
            <td className="border-2 header-blue" colSpan={5} style={{ textAlign: "center", fontWeight: "bold" }}>
              Bank Details
            </td>
            <td className="border-2" colSpan={3} rowSpan={7} style={{ textAlign: "center", verticalAlign: "middle" }}>
              {/* QR Code placeholder */}
              <div
                style={{
                  width: "100px",
                  height: "100px",
                  border: "1px solid #ccc",
                  margin: "0 auto",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                QR Code
              </div>
            </td>
            <td className="border-2 header-blue" colSpan={5} style={{ textAlign: "center", fontWeight: "bold" }}>
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
            <td className="border-2" colSpan={8} style={{ textAlign: "center", fontSize: "10px" }}>
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
              rowSpan={4}
              style={{ textAlign: "center", verticalAlign: "bottom", fontWeight: "bold" }}
            >
              <div style={{ marginBottom: "20px" }}>
                {/* Signature placeholder */}
                <div style={{ width: "120px", height: "50px", border: "1px solid #ccc", margin: "0 auto 10px" }}></div>
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
            <td className="border-2" colSpan={5} style={{ fontWeight: "bold" }}>
              Terms & conditions
            </td>
          </tr>

          <tr>
            <td className="border-2" colSpan={5}>
              Interest @ 18% after due date.
            </td>
          </tr>

          <tr>
            <td className="border-2" colSpan={5}>
              All disputes are subject to UP Jurisdiction.
            </td>
            <td className="border-2" colSpan={3} style={{ textAlign: "center", fontWeight: "bold" }}>
              Common Seal
            </td>
            <td className="border-2" colSpan={8} style={{ textAlign: "center", fontWeight: "bold" }}>
              Authorised signatory
            </td>
          </tr>
        </table>
      </div>
    </div>
  )
}
