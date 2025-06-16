import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Users, TrendingUp } from "lucide-react"
import Link from "next/link"


export default function Dashboard() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Link href="/invoices/create">
        <Card className="hover:bg-accent/50 inset-0 border-2 border-dashed  transition-colors">
          <div className="transform items-end border-2 bg-background transition-colors transition-transform hover:-translate-x-2 hover:-translate-y-2">
            <div className=" transition-opacity group-hover:absolute group-hover:opacity-0 ">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Create Invoice</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <CardDescription>Create a new invoice for your clients</CardDescription>
            </CardContent>
            </div></div>
          </Card>
        </Link>

        <Link href="/clients/create">
          <Card className="hover:bg-accent/50 inset-0 border-2 border-dashed  transition-colors">
          <div className="transform items-end border-2 bg-background transition-colors transition-transform hover:-translate-x-2 hover:-translate-y-2">
            <div className=" transition-opacity group-hover:absolute group-hover:opacity-0 ">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Add Client</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <CardDescription>Add a new client to your database</CardDescription>
            </CardContent>
            </div></div>
          </Card>
        </Link>

        <Link href="/invoices">
          <Card className="hover:bg-accent/50 inset-0 border-2 border-dashed  transition-colors">
          <div className="transform items-end border-2 bg-background transition-colors transition-transform hover:-translate-x-2 hover:-translate-y-2">
            <div className=" transition-opacity group-hover:absolute group-hover:opacity-0 ">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">View Invoices</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <CardDescription>View and manage all your invoices</CardDescription>
            </CardContent>
            </div></div>
          </Card>
        </Link>

      </div>
    </div>
  )
}
