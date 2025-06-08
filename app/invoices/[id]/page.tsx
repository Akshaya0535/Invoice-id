"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Printer, FileEdit, AlertCircle } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import type { Invoice } from "@/types"

export default function InvoiceDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/invoices/${params.id}`)

        if (!response.ok) {
          if (response.status === 404) {
            setError("Invoice not found. The requested invoice may have been deleted or does not exist.")
          } else {
            const errorData = await response.json()
            setError(errorData.error || "Failed to load invoice data")
          }
          return
        }

        const data = await response.json()
        console.log("Fetched invoice data:", data) // Debug log
        setInvoice(data)
      } catch (err) {
        console.error("Error fetching invoice:", err)
        setError("An unexpected error occurred while loading the invoice")
      } finally {
        setLoading(false)
      }
    }

    fetchInvoice()
  }, [params.id])

  const handlePrint = () => {
    window.print()
  }

  const handleEdit = () => {
    router.push(`/invoices/edit/${params.id}`)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-lg animate-pulse">Loading invoice data...</div>
      </div>
    )
  }

  if (error || !invoice) {
    return (
      <div className="container mx-auto py-8">
        <Button onClick={() => router.back()} variant="outline" className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Invoices
        </Button>

        <Card className="border-red-200 bg-red-50 dark:bg-red-900/10">
          <CardHeader>
            <CardTitle className="flex items-center text-red-600 dark:text-red-400">
              <AlertCircle className="mr-2 h-5 w-5" />
              Invoice Not Found
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 dark:text-gray-300">{error || "The requested invoice could not be found"}</p>
            <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">Invoice ID: {params.id}</p>
            <div className="mt-6">
              <Button onClick={() => router.push("/invoices/create")} variant="outline">
                Create New Invoice
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <Button onClick={() => router.back()} variant="outline" className="mb-6 print:hidden">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Invoices
      </Button>

      {/* Invoice content would go here */}
      <Card>
        <CardHeader>
          <CardTitle>Invoice #{invoice.invoiceNumber}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium">Client</h3>
                <p>{invoice.client?.name || "Client information not available"}</p>
                <p>{invoice.client?.address || ""}</p>
              </div>
              <div>
                <h3 className="font-medium">Details</h3>
                <p>Date: {new Date(invoice.invoiceDate).toLocaleDateString()}</p>
                <p>Invoice #: {invoice.invoiceNumber}</p>
                {invoice.poNumber && <p>PO #: {invoice.poNumber}</p>}
              </div>
            </div>

            <div className="mt-6">
              <h3 className="font-medium mb-2">Items</h3>
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Description</th>
                    <th className="text-right py-2">HSN</th>
                    <th className="text-right py-2">Qty</th>
                    <th className="text-right py-2">Rate</th>
                    <th className="text-right py-2">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items?.map((item, index) => (
                    <tr key={index} className="border-b">
                      <td className="py-2">{item.description}</td>
                      <td className="text-right py-2">{item.hsnCode}</td>
                      <td className="text-right py-2">{item.quantity}</td>
                      <td className="text-right py-2">{formatCurrency(item.rate)}</td>
                      <td className="text-right py-2">{formatCurrency(item.quantity * item.rate)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={4} className="text-right font-medium py-2">
                      Subtotal:
                    </td>
                    <td className="text-right py-2">{formatCurrency(invoice.subtotal)}</td>
                  </tr>
                  {invoice.cgstTotal > 0 && (
                    <tr>
                      <td colSpan={4} className="text-right py-2">
                        CGST:
                      </td>
                      <td className="text-right py-2">{formatCurrency(invoice.cgstTotal)}</td>
                    </tr>
                  )}
                  {invoice.sgstTotal > 0 && (
                    <tr>
                      <td colSpan={4} className="text-right py-2">
                        SGST:
                      </td>
                      <td className="text-right py-2">{formatCurrency(invoice.sgstTotal)}</td>
                    </tr>
                  )}
                  {invoice.igstTotal > 0 && (
                    <tr>
                      <td colSpan={4} className="text-right py-2">
                        IGST:
                      </td>
                      <td className="text-right py-2">{formatCurrency(invoice.igstTotal)}</td>
                    </tr>
                  )}
                  <tr>
                    <td colSpan={4} className="text-right font-bold py-2">
                      Total:
                    </td>
                    <td className="text-right font-bold py-2">{formatCurrency(invoice.total)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {invoice.transportMode && (
              <div className="mt-4">
                <p>
                  <strong>Transport Mode:</strong> {invoice.transportMode}
                </p>
                {invoice.vehicleNumber && (
                  <p>
                    <strong>Vehicle Number:</strong> {invoice.vehicleNumber}
                  </p>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="mt-6 flex space-x-4 print:hidden">
        <Button onClick={handlePrint}>
          <Printer className="mr-2 h-4 w-4" />
          Print Invoice
        </Button>
        <Button onClick={handleEdit} variant="outline">
          <FileEdit className="mr-2 h-4 w-4" />
          Edit Invoice
        </Button>
      </div>
    </div>
  )
}
