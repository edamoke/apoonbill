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
import { Button } from "@/components/ui/button"
import { Plus, Tag, Target } from "lucide-react"

export default function OffersPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-serif font-bold italic">Offers & Discounts</h1>
        <p className="text-muted-foreground">Manage promo codes and special offers.</p>
      </div>

      <CRMNavigation />

      <div className="flex justify-end">
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create New Offer
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5" />
              Active Offers
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Offer Name</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Usage</TableHead>
                  <TableHead>Expiry</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[
                  { name: "Welcome Discount", code: "WELCOME10", type: "Percentage", value: "10%", usage: "45/100", expiry: "2026-01-31" },
                  { name: "Weekend Special", code: "WEEKEND20", type: "Percentage", value: "20%", usage: "124/500", expiry: "2026-02-15" },
                  { name: "Christmas Gift", code: "XMAS2025", type: "Fixed Amount", value: "KSh 500", usage: "892/1000", expiry: "2026-01-05" },
                ].map((offer, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-medium">{offer.name}</TableCell>
                    <TableCell><code>{offer.code}</code></TableCell>
                    <TableCell>{offer.type}</TableCell>
                    <TableCell>{offer.value}</TableCell>
                    <TableCell>{offer.usage}</TableCell>
                    <TableCell>{offer.expiry}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">Edit</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
