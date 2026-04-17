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
import { Target, Megaphone, Mail, Smartphone } from "lucide-react"

export default function CampaignsPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-serif font-bold italic">Marketing Campaigns</h1>
        <p className="text-muted-foreground">Plan and execute customer engagement strategies.</p>
      </div>

      <CRMNavigation />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email Marketing
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground mb-4">Send newsletters and personalized offers.</p>
            <Button size="sm" className="w-full">Create Email</Button>
          </CardContent>
        </Card>
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Smartphone className="h-4 w-4" />
              SMS/Push
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground mb-4">Urgent alerts and mobile-first promos.</p>
            <Button size="sm" className="w-full">New Message</Button>
          </CardContent>
        </Card>
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="h-4 w-4" />
              Automations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground mb-4">Set up triggered customer journeys.</p>
            <Button size="sm" className="w-full">Manage Flows</Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Megaphone className="h-5 w-5" />
            Recent Campaigns
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Campaign Name</TableHead>
                <TableHead>Channel</TableHead>
                <TableHead>Audience</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>ROI</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[
                { name: "Lapsed Customer Win-back", channel: "Email", audience: "Inactive > 30d", status: "Running", roi: "4.5x" },
                { name: "New Menu Launch", channel: "Push", audience: "All Members", status: "Completed", roi: "3.2x" },
                { name: "Birthday Specials", channel: "Automated", audience: "Birthday Today", status: "Active", roi: "8.1x" },
              ].map((campaign, i) => (
                <TableRow key={i}>
                  <TableCell className="font-medium">{campaign.name}</TableCell>
                  <TableCell>{campaign.channel}</TableCell>
                  <TableCell>{campaign.audience}</TableCell>
                  <TableCell>
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                      {campaign.status}
                    </span>
                  </TableCell>
                  <TableCell className="font-bold">{campaign.roi}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">Report</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
