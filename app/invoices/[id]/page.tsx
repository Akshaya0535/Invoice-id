"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Printer, FileEdit } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import type { Invoice } from "@/types"

export default function InvoiceDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [invoice, setInvoice] = useState<Invoice | null>(null)

  useEffect(() => {
    // Fetch invoice data based on params.id
    // Example: setInvoice(fetchInvoice(params.id))
  }, [params.id])

  if (!invoice) {
    return <div>Loading...</div>
  }

  return (
    <div>
      <Button onClick={() => router.back()} variant="outline" className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>
      <Card>
        <CardHeader>
          <CardTitle>Invoice Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <strong>Invoice ID:</strong> {invoice.id}
            </div>
            <div>
              <strong>Amount:</strong> {formatCurrency(invoice.amount)}
            </div>
            <div>
              <strong>Date:</strong> {invoice.date}
            </div>
            {/* Additional invoice details can be added here */}
          </div>
        </CardContent>
      </Card>
      <div className="mt-4 flex space-x-2">
        <Button variant="default">
          <Printer className="mr-2 h-4 w-4" />
          Print
        </Button>
        <Button variant="default">
          <FileEdit className="mr-2 h-4 w-4" />
          Edit
        </Button>
      </div>
    </div>
  )
}
