"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { InvoiceTemplate } from "@/components/invoice-template"
import type { Invoice, InvoiceItem, Client } from "@/types"

export default function InvoiceDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [client, setClient] = useState<Client | null>(null)
  const [items, setItems] = useState<InvoiceItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchInvoiceData = async () => {
      try {
        // Fetch invoice data
        const invoiceResponse = await fetch(`/api/invoices/${params.id}`)
        if (invoiceResponse.ok) {
          const invoiceData = await invoiceResponse.json()
          setInvoice(invoiceData)
          setItems(invoiceData.items || [])

          // Fetch client data
          if (invoiceData.clientId) {
            const clientResponse = await fetch(`/api/clients/${invoiceData.clientId}`)
            if (clientResponse.ok) {
              const clientData = await clientResponse.json()
              setClient(clientData)
            }
          }
        }
      } catch (error) {
        console.error("Error fetching invoice data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchInvoiceData()
  }, [params.id])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading invoice...</div>
      </div>
    )
  }

  if (!invoice || !client) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-red-600">Invoice not found</div>
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

      {/* Invoice Template */}
      <InvoiceTemplate invoice={invoice} client={client} items={items} />
    </div>
  )
}
