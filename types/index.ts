export interface Client {
  _id?: string
  name: string
  address: string
  city: string
  state: string
  pincode: string
  gstin?: string
  email?: string
  phone?: string
}

export interface InvoiceItem {
  description: string
  hsnCode: string
  quantity: number
  rate: number
  cgst: number
  sgst: number
  igst: number
  amount: number
}

export interface Invoice {
  _id?: string
  invoiceNumber: string
  invoiceDate: Date
  client: Client
  items: InvoiceItem[]
  subtotal: number
  cgstTotal: number
  sgstTotal: number
  igstTotal: number
  total: number
  transportMode?: string
  vehicleNumber?: string
  poNumber?: string
  poDate?: Date
  createdAt: Date
  updatedAt: Date
}
