import { getCRMClients } from "@/app/actions/crm-clients"
import { CRMNavigation } from "@/components/admin/crm/crm-navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, UserPlus } from "lucide-react"
import Link from "next/link"

export default async function ClientsPage() {
  const clients = await getCRMClients()

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-serif font-bold italic">Client Management</h1>
        <p className="text-muted-foreground">View and manage your customer database.</p>
      </div>

      <CRMNavigation />

      <div className="flex justify-between items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search clients..."
            className="pl-8"
          />
        </div>
        <Button asChild>
          <Link href="/admin/users">
            <UserPlus className="h-4 w-4 mr-2" />
            Add / Manage Users
          </Link>
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Points</TableHead>
                <TableHead>Lifetime Spend</TableHead>
                <TableHead>Last Visit</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.length > 0 ? (
                clients.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell className="font-medium uppercase">{client.full_name || "Guest"}</TableCell>
                    <TableCell>{client.email || "N/A"}</TableCell>
                    <TableCell className="font-bold text-primary">{client.loyalty_points || 0}</TableCell>
                    <TableCell>KSh {Number(client.lifetime_spend || 0).toLocaleString()}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {client.last_visit ? new Date(client.last_visit).toLocaleDateString() : "Never"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" asChild>
                         <Link href={`/admin/users?id=${client.id}`}>View</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground italic">
                    No customers found in the database.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
