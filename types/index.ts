export interface Client {
  _id?: string
  id?: string
  name: string
  email?: string
  phone?: string
  address: string
  city: string
  state: string
  pincode: string
  gstin?: string
  stateCode?: string
  createdAt?: Date
  updatedAt?: Date
}

export interface InvoiceItem {
  description: string
  hsnCode: string
  quantity: number
  rate: number
  cgst: number
  sgst: number
  igst: number
}

export interface Invoice {
  _id?: string
  id?: string
  invoiceNumber: string
  clientId: string
  date: Date
  items: InvoiceItem[]
  subtotal: number
  totalTax: number
  grandTotal: number
  status: "draft" | "sent" | "paid" | "overdue"
  transportMode?: string
  vehicleNumber?: string
  poNumber?: string
  poDate?: Date
  createdAt?: Date
  updatedAt?: Date
}
