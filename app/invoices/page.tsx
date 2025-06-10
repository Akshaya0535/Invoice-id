"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Search, Eye, FileText, Trash2, Filter, ArrowUpDown, X } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import type { Invoice, Client } from "@/types"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [session, setSession] = useState<any>(null)
  const router = useRouter()

  // Filtering and sorting states
  const [selectedClient, setSelectedClient] = useState<string>("all")
  const [selectedFinancialYear, setSelectedFinancialYear] = useState<string>("all")
  const [startDate, setStartDate] = useState<Date | undefined>(undefined)
  const [endDate, setEndDate] = useState<Date | undefined>(undefined)
  const [sortField, setSortField] = useState<string>("invoiceDate")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [financialYears, setFinancialYears] = useState<string[]>([])

  useEffect(() => {
    fetchSession()
    fetchClients()
  }, [])

  useEffect(() => {
    fetchInvoices()
  }, [selectedClient, selectedFinancialYear, startDate, endDate, sortField, sortOrder])

  const fetchSession = async () => {
    try {
      const response = await fetch("/api/auth/session")
      if (response.ok) {
        const data = await response.json()
        setSession(data.user)
      }
    } catch (error) {
      console.error("Error fetching session:", error)
    }
  }

  const fetchClients = async () => {
    try {
      const response = await fetch("/api/clients")
      if (response.ok) {
        const data = await response.json()
        setClients(data)
      }
    } catch (error) {
      console.error("Error fetching clients:", error)
    }
  }

  const fetchInvoices = async () => {
    try {
      setIsLoading(true)

      // Build query parameters
      const params = new URLSearchParams()

      if (selectedClient !== "all") {
        params.append("client", selectedClient)
      }

      if (selectedFinancialYear !== "all") {
        params.append("financialYear", selectedFinancialYear)
      }

      if (startDate) {
        params.append("startDate", startDate.toISOString())
      }

      if (endDate) {
        params.append("endDate", endDate.toISOString())
      }

      params.append("sortField", sortField)
      params.append("sortOrder", sortOrder)

      const response = await fetch(`/api/invoices?${params.toString()}`)

      if (!response.ok) throw new Error("Failed to fetch invoices")

      const data = await response.json()
      setInvoices(data)

      // Extract unique financial years from invoice numbers
      const years = [
        ...new Set(
          data
            .map((invoice: Invoice) => {
              const match = invoice.invoiceNumber.match(/\/(\d{2}-\d{2})$/)
              return match ? match[1] : null
            })
            .filter(Boolean),
        ),
      ]

      setFinancialYears(years)
    } catch (error) {
      console.error("Error fetching invoices:", error)
      setError("Failed to load invoices")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/invoices/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to delete invoice")
      }

      // Remove the deleted invoice from the state
      setInvoices(invoices.filter((invoice) => invoice._id !== id))
    } catch (error: any) {
      console.error("Error deleting invoice:", error)
      alert(error.message || "Error deleting invoice")
    }
  }

  const toggleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortOrder("asc")
    }
  }

  const resetFilters = () => {
    setSelectedClient("all")
    setSelectedFinancialYear("all")
    setStartDate(undefined)
    setEndDate(undefined)
    setSortField("invoiceDate")
    setSortOrder("desc")
  }

  const filteredInvoices = invoices.filter(
    (invoice) =>
      invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.client.name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const isAdmin = session?.role === "admin"

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Invoices</h1>
        <Link href="/invoices/create">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Invoice
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Invoice List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6 space-y-4 md:flex-row md:items-center md:justify-between">
            {/* Search and Filter Controls */}
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search invoices..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8 gap-1">
                    <Filter className="h-3.5 w-3.5" />
                    <span>Filter</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  <div className="space-y-4 p-2">
                    <h4 className="font-medium">Filter Invoices</h4>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Client</label>
                      <Select value={selectedClient} onValueChange={setSelectedClient}>
                        <SelectTrigger>
                          <SelectValue placeholder="All Clients" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Clients</SelectItem>
                          {clients.map((client) => (
                            <SelectItem key={client._id} value={client._id!}>
                              {client.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Financial Year</label>
                      <Select value={selectedFinancialYear} onValueChange={setSelectedFinancialYear}>
                        <SelectTrigger>
                          <SelectValue placeholder="All Years" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Years</SelectItem>
                          {financialYears.map((year) => (
                            <SelectItem key={year} value={year}>
                              {year}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Start Date</label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" className="w-full justify-start text-left font-normal">
                              {startDate ? format(startDate, "PPP") : "Pick a date"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus />
                          </PopoverContent>
                        </Popover>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">End Date</label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" className="w-full justify-start text-left font-normal">
                              {endDate ? format(endDate, "PPP") : "Pick a date"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar mode="single" selected={endDate} onSelect={setEndDate} initialFocus />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>

                    <Button variant="outline" size="sm" onClick={resetFilters} className="w-full">
                      Reset Filters
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>

              {/* Active filters display */}
              {(selectedClient !== "all" || selectedFinancialYear !== "all" || startDate || endDate) && (
                <div className="flex flex-wrap gap-2">
                  {selectedClient !== "all" && (
                    <div className="flex items-center gap-1 rounded-full bg-secondary px-2 py-1 text-xs">
                      <span>Client: {clients.find((c) => c._id === selectedClient)?.name || "Selected"}</span>
                      <X className="h-3 w-3 cursor-pointer" onClick={() => setSelectedClient("all")} />
                    </div>
                  )}
                  {selectedFinancialYear !== "all" && (
                    <div className="flex items-center gap-1 rounded-full bg-secondary px-2 py-1 text-xs">
                      <span>FY: {selectedFinancialYear}</span>
                      <X className="h-3 w-3 cursor-pointer" onClick={() => setSelectedFinancialYear("all")} />
                    </div>
                  )}
                  {startDate && (
                    <div className="flex items-center gap-1 rounded-full bg-secondary px-2 py-1 text-xs">
                      <span>From: {format(startDate, "dd/MM/yy")}</span>
                      <X className="h-3 w-3 cursor-pointer" onClick={() => setStartDate(undefined)} />
                    </div>
                  )}
                  {endDate && (
                    <div className="flex items-center gap-1 rounded-full bg-secondary px-2 py-1 text-xs">
                      <span>To: {format(endDate, "dd/MM/yy")}</span>
                      <X className="h-3 w-3 cursor-pointer" onClick={() => setEndDate(undefined)} />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-8">Loading invoices...</div>
          ) : filteredInvoices.length === 0 ? (
            <div className="flex justify-center py-8 text-muted-foreground">No invoices found</div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="cursor-pointer" onClick={() => toggleSort("invoiceNumber")}>
                      <div className="flex items-center">
                        Invoice #
                        {sortField === "invoiceNumber" && (
                          <ArrowUpDown className={`ml-1 h-4 w-4 ${sortOrder === "desc" ? "rotate-180" : ""}`} />
                        )}
                      </div>
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => toggleSort("invoiceDate")}>
                      <div className="flex items-center">
                        Date
                        {sortField === "invoiceDate" && (
                          <ArrowUpDown className={`ml-1 h-4 w-4 ${sortOrder === "desc" ? "rotate-180" : ""}`} />
                        )}
                      </div>
                    </TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead className="text-right cursor-pointer" onClick={() => toggleSort("total")}>
                      <div className="flex items-center justify-end">
                        Amount
                        {sortField === "total" && (
                          <ArrowUpDown className={`ml-1 h-4 w-4 ${sortOrder === "desc" ? "rotate-180" : ""}`} />
                        )}
                      </div>
                    </TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInvoices.map((invoice) => (
                    <TableRow key={invoice._id}>
                      <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                      <TableCell>{new Date(invoice.invoiceDate).toLocaleDateString()}</TableCell>
                      <TableCell>{invoice.client.name}</TableCell>
                      <TableCell className="text-right">{formatCurrency(invoice.total)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => router.push(`/invoices/${invoice._id}`)}>
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">View</span>
                          </Button>

                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => router.push(`/invoices/print/${invoice._id}`)}
                          >
                            <FileText className="h-4 w-4" />
                            <span className="sr-only">Print</span>
                          </Button>

                          {isAdmin && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <Trash2 className="h-4 w-4" />
                                  <span className="sr-only">Delete</span>
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Invoice</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete this invoice? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(invoice._id!)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
