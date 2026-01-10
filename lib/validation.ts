import { z } from "zod"

// Simple server-side sanitization function
// Removes HTML tags and dangerous characters
function serverSanitize(input: string): string {
  return input
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/[<>]/g, '') // Remove < and >
    .trim()
}

// Base validation schemas
export const usernameSchema = z
  .string()
  .min(3, "Username must be at least 3 characters")
  .max(50, "Username must be less than 50 characters")
  .regex(/^[a-zA-Z0-9_-]+$/, "Username can only contain letters, numbers, underscores, and hyphens")

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password must be less than 128 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/, "Password must contain at least one special character")

export const emailSchema = z
  .string()
  .email("Invalid email format")
  .max(255, "Email must be less than 255 characters")

// Client validation schema
export const clientSchema = z.object({
  name: z
    .string()
    .min(1, "Client name is required")
    .max(100, "Client name must be less than 100 characters")
    .transform(val => serverSanitize(val)),
  gstin: z
    .string()
    .regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, "Invalid GSTIN format")
    .optional()
    .or(z.literal("")),
  address: z
    .string()
    .min(1, "Address is required")
    .max(500, "Address must be less than 500 characters")
    .transform(val => serverSanitize(val)),
  city: z
    .string()
    .min(1, "City is required")
    .max(50, "City must be less than 50 characters")
    .transform(val => serverSanitize(val)),
  state: z
    .string()
    .min(1, "State is required")
    .max(50, "State must be less than 50 characters")
    .transform(val => serverSanitize(val)),
  pincode: z
    .string()
    .regex(/^[1-9][0-9]{5}$/, "Invalid pincode format")
    .transform(val => val.trim()),
})

// Invoice validation schema
export const invoiceItemSchema = z.object({
  description: z
    .string()
    .min(1, "Item description is required")
    .max(200, "Description must be less than 200 characters")
    .transform(val => serverSanitize(val)),
  hsnCode: z
    .string()
    .regex(/^[0-9]{4,8}$/, "Invalid HSN code format")
    .transform(val => val.trim()),
  quantity: z
    .number()
    .min(0.01, "Quantity must be greater than 0")
    .max(999999, "Quantity must be less than 999,999"),
  rate: z
    .number()
    .min(0, "Rate must be non-negative")
    .max(999999, "Rate must be less than 999,999"),
})

export const invoiceSchema = z.object({
  clientId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid client ID format"),
  invoiceDate: z
    .string()
    .datetime("Invalid date format")
    .transform(val => new Date(val)),
  dueDate: z
    .string()
    .datetime("Invalid date format")
    .transform(val => new Date(val)),
  items: z
    .array(invoiceItemSchema)
    .min(1, "At least one item is required")
    .max(100, "Maximum 100 items allowed"),
  notes: z
    .string()
    .max(1000, "Notes must be less than 1000 characters")
    .optional()
    .transform(val => val ? serverSanitize(val) : ""),
})

// User validation schema
export const userSchema = z.object({
  username: usernameSchema,
  password: passwordSchema,
  role: z.enum(["admin", "read-only", "read-write"], {
    errorMap: () => ({ message: "Invalid role. Must be admin, read-only, or read-write" })
  }),
})

// Login validation schema
export const loginSchema = z.object({
  username: usernameSchema,
  password: z.string().min(1, "Password is required"),
})

// Change password validation schema
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: passwordSchema,
})

// Sanitization utility
export function sanitizeInput(input: string): string {
  return serverSanitize(input)
}

// Rate limiting helper
export function createRateLimiter(maxRequests: number, windowMs: number) {
  const requests = new Map<string, { count: number; resetTime: number }>()
  
  return function isRateLimited(identifier: string): boolean {
    const now = Date.now()
    const userRequests = requests.get(identifier)
    
    if (!userRequests || now > userRequests.resetTime) {
      requests.set(identifier, { count: 1, resetTime: now + windowMs })
      return false
    }
    
    if (userRequests.count >= maxRequests) {
      return true
    }
    
    userRequests.count++
    return false
  }
}