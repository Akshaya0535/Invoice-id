"use client"

import { TableCell } from "@/components/ui/table"

import { TableBody } from "@/components/ui/table"

import { TableHead } from "@/components/ui/table"

import { TableRow } from "@/components/ui/table"

import { TableHeader } from "@/components/ui/table"

import { Table } from "@/components/ui/table"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Client, InvoiceItem } from "@/types"
import { ArrowLeft, Plus, Trash2 } from "lucide-react"
import Link from "next/link"
import { formatCurrency } from "@/lib/utils"

export default function CreateInvoicePage() {
  const router = useRouter()
  const [clients, setClients] = useState<Client[]>([])
  const [selectedClient, setSelectedClient] = useState<string>("")
  const [invoiceDate, setInvoiceDate] = useState<string>(new Date().toISOString().split("T")[0])
  const [transportMode, setTransportMode] = useState<string>("")
  const [vehicleNumber, setVehicleNumber] = useState<string>("")
  const [poNumber, setPoNumber] = useState<string>("")
  const [poDate, setPoDate] = useState<string>("")
  const [items, setItems] = useState<InvoiceItem[]>([
    {
      description: "",
      hsnCode: "",
      quantity: 1,
      rate: 0,
      cgst: 9,
      sgst: 9,
      igst: 0,
      amount: 0,
    },
  ])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [minDate, setMinDate] = useState<string>("")

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await fetch("/api/clients")
        if (!response.ok) throw new Error("Failed to fetch clients")
        const data = await response.json()
        setClients(data)
      } catch (error) {
        console.error("Error fetching clients:", error)
      }
    }

    const fetchLatestInvoiceDate = async () => {
      try {
        const response = await fetch("/api/invoices/latest-date")
        if (!response.ok) throw new Error("Failed to fetch latest invoice date")
        const data = await response.json()

        if (data.latestDate) {
          // Set minimum date to the latest invoice date
          const latestDate = new Date(data.latestDate)
          setMinDate(latestDate.toISOString().split("T")[0])
        }
      } catch (error) {
        console.error("Error fetching latest invoice date:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchClients()
    fetchLatestInvoiceDate()
  }, [])

  const handleItemChange = (index: number, field: keyof InvoiceItem, value: string | number) => {
    const newItems = [...items]

    // Convert string values to numbers for numeric fields
    if (field === "quantity" || field === "rate" || field === "cgst" || field === "sgst" || field === "igst") {
      newItems[index][field] = Number(value)
    } else {
      newItems[index][field] = value as string
    }

    // Calculate amount
    const quantity = newItems[index].quantity
    const rate = newItems[index].rate
    newItems[index].amount = quantity * rate

    setItems(newItems)
  }

  const addItem = () => {
    setItems([
      ...items,
      {
        description: "",
        hsnCode: "",
        quantity: 1,
        rate: 0,
        cgst: 9,
        sgst: 9,
        igst: 0,
        amount: 0,
      },
    ])
  }

  const removeItem = (index: number) => {
    if (items.length > 1) {
      const newItems = [...items]
      newItems.splice(index, 1)
      setItems(newItems)
    }
  }

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + item.amount, 0)
  }

  const calculateTax = (type: "cgst" | "sgst" | "igst") => {
    return items.reduce((sum, item) => {
      const taxRate = item[type]
      return sum + (item.amount * taxRate) / 100
    }, 0)
  }

  const calculateTotal = () => {
    const subtotal = calculateSubtotal()
    const cgst = calculateTax("cgst")
    const sgst = calculateTax("sgst")
    const igst = calculateTax("igst")
    return subtotal + cgst + sgst + igst
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    const selectedClientData = clients.find((client) => client._id === selectedClient)
    if (!selectedClientData) {
      alert("Please select a client")
      setIsSubmitting(false)
      return
    }

    const invoiceData = {
      invoiceDate: new Date(invoiceDate),
      client: selectedClientData,
      items,
      subtotal: calculateSubtotal(),
      cgstTotal: calculateTax("cgst"),
      sgstTotal: calculateTax("sgst"),
      igstTotal: calculateTax("igst"),
      total: calculateTotal(),
      transportMode,
      vehicleNumber,
      poNumber: poNumber || undefined,
      poDate: poDate ? new Date(poDate) : undefined,
    }

    try {
      const response = await fetch("/api/invoices", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(invoiceData),
      })

      if (!response.ok) throw new Error("Failed to create invoice")

      const result = await response.json()
      router.push(`/invoices/${result.id}`)
    } catch (error) {
      console.error("Error creating invoice:", error)
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return <div className="flex justify-center py-8">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Link href="/invoices">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Create Invoice</h1>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Invoice Details</CardTitle>
            <CardDescription>Create a new invoice for your client.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Invoice Header */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="client">Client *</Label>
                <Select value={selectedClient} onValueChange={setSelectedClient} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a client" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client._id} value={client._id!}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="invoiceDate">Invoice Date *</Label>
                <Input
                  id="invoiceDate"
                  type="date"
                  value={invoiceDate}
                  onChange={(e) => setInvoiceDate(e.target.value)}
                  min={minDate}
                  required
                />
              </div>
            </div>

            {/* Transport Details */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="transportMode">Transport Mode</Label>
                <Input id="transportMode" value={transportMode} onChange={(e) => setTransportMode(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vehicleNumber">Vehicle Number</Label>
                <Input id="vehicleNumber" value={vehicleNumber} onChange={(e) => setVehicleNumber(e.target.value)} />
              </div>
            </div>

            {/* PO Details */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="poNumber">PO Number</Label>
                <Input id="poNumber" value={poNumber} onChange={(e) => setPoNumber(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="poDate">PO Date</Label>
                <Input id="poDate" type="date" value={poDate} onChange={(e) => setPoDate(e.target.value)} />
              </div>
            </div>

            {/* Invoice Items */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Invoice Items</h3>
                <Button type="button" variant="outline" size="sm" onClick={addItem}>
                  <Plus className="mr-1 h-4 w-4" />
                  Add Item
                </Button>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Description</TableHead>
                      <TableHead>HSN Code</TableHead>
                      <TableHead>Qty</TableHead>
                      <TableHead>Rate</TableHead>
                      <TableHead>CGST %</TableHead>
                      <TableHead>SGST %</TableHead>
                      <TableHead>IGST %</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Input
                            value={item.description}
                            onChange={(e) => handleItemChange(index, "description", e.target.value)}
                            placeholder="Item description"
                            required
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            value={item.hsnCode}
                            onChange={(e) => handleItemChange(index, "hsnCode", e.target.value)}
                            placeholder="HSN"
                            required
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(index, "quantity", e.target.value)}
                            required
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.rate}
                            onChange={(e) => handleItemChange(index, "rate", e.target.value)}
                            required
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.cgst}
                            onChange={(e) => handleItemChange(index, "cgst", e.target.value)}
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.sgst}
                            onChange={(e) => handleItemChange(index, "sgst", e.target.value)}
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.igst}
                            onChange={(e) => handleItemChange(index, "igst", e.target.value)}
                          />
                        </TableCell>
                        <TableCell className="font-medium">{formatCurrency(item.amount)}</TableCell>
                        <TableCell>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeItem(index)}
                            disabled={items.length === 1}
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Remove</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Invoice Summary */}
            <div className="space-y-2 rounded-md border p-4">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="font-medium">{formatCurrency(calculateSubtotal())}</span>
              </div>
              <div className="flex justify-between">
                <span>CGST:</span>
                <span>{formatCurrency(calculateTax("cgst"))}</span>
              </div>
              <div className="flex justify-between">
                <span>SGST:</span>
                <span>{formatCurrency(calculateTax("sgst"))}</span>
              </div>
              <div className="flex justify-between">
                <span>IGST:</span>
                <span>{formatCurrency(calculateTax("igst"))}</span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="text-lg font-medium">Total:</span>
                <span className="text-lg font-bold">{formatCurrency(calculateTotal())}</span>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" type="button" onClick={() => router.push("/invoices")}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Invoice"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
