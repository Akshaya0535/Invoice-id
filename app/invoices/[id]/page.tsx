"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, AlertCircle } from "lucide-react"
import { InvoiceTemplate } from "@/components/invoice-template"
import type { Invoice, InvoiceItem, Client } from "@/types"

export default function InvoiceDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [client, setClient] = useState<Client | null>(null)
  const [items, setItems] = useState<InvoiceItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchInvoiceData = async () => {
      try {
        setLoading(true)

        // Fetch invoice data
        const invoiceResponse = await fetch(`/api/invoices/${params.id}`)

        if (!invoiceResponse.ok) {
          if (invoiceResponse.status === 404) {
            setError("Invoice not found. The requested invoice may have been deleted or does not exist.")
          } else {
            const errorData = await invoiceResponse.json()
            setError(errorData.error || "Failed to load invoice data")
          }
          return
        }

        const invoiceData = await invoiceResponse.json()
        console.log("Fetched invoice data:", invoiceData)

        setInvoice(invoiceData)
        setItems(invoiceData.items || [])

        // Fetch client data if clientId exists
        if (invoiceData.clientId || invoiceData.client?._id) {
          const clientId = invoiceData.clientId || invoiceData.client._id
          const clientResponse = await fetch(`/api/clients/${clientId}`)

          if (clientResponse.ok) {
            const clientData = await clientResponse.json()
            setClient(clientData)
          } else {
            // If client fetch fails, use embedded client data if available
            if (invoiceData.client) {
              setClient(invoiceData.client)
            } else {
              console.warn("Could not fetch client data")
            }
          }
        } else if (invoiceData.client) {
          // Use embedded client data
          setClient(invoiceData.client)
        }
      } catch (err) {
        console.error("Error fetching invoice data:", err)
        setError("An unexpected error occurred while loading the invoice")
      } finally {
        setLoading(false)
      }
    }

    fetchInvoiceData()
  }, [params.id])

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
            <div className="mt-6 space-x-4">
              <Button onClick={() => router.push("/invoices")} variant="outline">
                View All Invoices
              </Button>
              <Button onClick={() => router.push("/invoices/create")}>Create New Invoice</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!client) {
    return (
      <div className="container mx-auto py-8">
        <Button onClick={() => router.back()} variant="outline" className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Invoices
        </Button>

        <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-900/10">
          <CardHeader>
            <CardTitle className="flex items-center text-yellow-600 dark:text-yellow-400">
              <AlertCircle className="mr-2 h-5 w-5" />
              Client Data Missing
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 dark:text-gray-300">
              Invoice found but client information is missing. Please ensure the client data is properly linked.
            </p>
            <div className="mt-6 space-x-4">
              <Button onClick={() => router.push("/invoices")} variant="outline">
                View All Invoices
              </Button>
              <Button onClick={() => router.push(`/invoices/edit/${params.id}`)}>Edit Invoice</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      {/* Back Button - Hidden during print */}
      <div className="mb-6 print:hidden">
        <Button onClick={() => router.back()} variant="outline" className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Invoices
        </Button>
      </div>

      {/* Use the exact invoice template */}
      <InvoiceTemplate
        invoice={{
          ...invoice,
          invoiceDate: invoice.invoiceDate || invoice.date || new Date(),
          date: invoice.invoiceDate || invoice.date || new Date(),
        }}
        client={client}
        items={items}
      />
    </div>
  )
}
