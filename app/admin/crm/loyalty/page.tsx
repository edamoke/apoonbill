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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Settings, Plus } from "lucide-react"

export default function LoyaltyPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-serif font-bold italic">Loyalty Program</h1>
        <p className="text-muted-foreground">Configure point earning rules and reward catalog.</p>
      </div>

      <CRMNavigation />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Settings */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Earning Rules
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Points per KSh 100 spent</Label>
              <Input type="number" defaultValue="10" />
            </div>
            <div className="space-y-2">
              <Label>Minimum spend to earn</Label>
              <Input type="number" defaultValue="500" />
            </div>
            <div className="space-y-2">
              <Label>Points expiry (days)</Label>
              <Input type="number" defaultValue="365" />
            </div>
            <Button className="w-full">Save Changes</Button>
          </CardContent>
        </Card>

        {/* Rewards Catalog */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Rewards Catalog</CardTitle>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Reward
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reward Item</TableHead>
                  <TableHead>Points Cost</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[
                  { item: "Free House Coffee", cost: 100, status: "Active" },
                  { item: "10% Discount Voucher", cost: 250, status: "Active" },
                  { item: "Free Signature Burger", cost: 800, status: "Active" },
                  { item: "Bottle of Wine", cost: 2500, status: "Inactive" },
                ].map((reward, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-medium">{reward.item}</TableCell>
                    <TableCell>{reward.cost} pts</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        reward.status === "Active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                      }`}>
                        {reward.status}
                      </span>
                    </TableCell>
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
