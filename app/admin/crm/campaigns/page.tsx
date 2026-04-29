import { CRMNavigation } from "@/components/admin/crm/crm-navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Target, 
  Megaphone, 
  Mail, 
  Smartphone, 
  Plus, 
  Search, 
  Filter,
  ArrowUpRight,
  BarChart2,
  Users
} from "lucide-react"
import { getCampaigns } from "@/app/actions/crm-campaigns"
import { Input } from "@/components/ui/input"

export default async function CampaignsPage() {
  const campaigns = await getCampaigns()

  return (
    <div className="p-6 space-y-6 bg-slate-50/50 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-serif font-bold italic tracking-tight text-primary">Campaign Center</h1>
          <p className="text-muted-foreground text-lg">Scale your reach and drive conversions through targeted marketing.</p>
        </div>
        <Button className="w-fit gap-2 shadow-lg hover:shadow-xl transition-all">
          <Plus className="h-4 w-4" />
          Create New Campaign
        </Button>
      </div>

      <CRMNavigation />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:border-primary/50 transition-colors cursor-pointer group">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-primary transition-colors">Total Reach</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12,482</div>
            <p className="text-xs text-green-600 flex items-center gap-1 mt-1 font-medium">
              <ArrowUpRight className="h-3 w-3" />
              +14% from last month
            </p>
          </CardContent>
        </Card>
        <Card className="hover:border-primary/50 transition-colors cursor-pointer group">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-primary transition-colors">Active Campaigns</CardTitle>
            <Megaphone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground mt-1">Across 3 channels</p>
          </CardContent>
        </Card>
        <Card className="hover:border-primary/50 transition-colors cursor-pointer group">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-primary transition-colors">Avg. CTR</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4.2%</div>
            <p className="text-xs text-green-600 flex items-center gap-1 mt-1 font-medium">
              <ArrowUpRight className="h-3 w-3" />
              +0.8% industry avg
            </p>
          </CardContent>
        </Card>
        <Card className="hover:border-primary/50 transition-colors cursor-pointer group">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-primary transition-colors">ROI (MTS)</CardTitle>
            <BarChart2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5.8x</div>
            <p className="text-xs text-muted-foreground mt-1">Marketing to Sales Ratio</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1 border-primary/10">
          <CardHeader>
            <CardTitle className="text-lg">Quick Launch</CardTitle>
            <CardDescription>Start a new campaign in seconds</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start gap-3 h-12 text-base" size="lg">
              <div className="bg-blue-100 p-2 rounded-lg"><Mail className="h-4 w-4 text-blue-600" /></div>
              Email Campaign
            </Button>
            <Button variant="outline" className="w-full justify-start gap-3 h-12 text-base" size="lg">
              <div className="bg-purple-100 p-2 rounded-lg"><Smartphone className="h-4 w-4 text-purple-600" /></div>
              SMS / Push Alert
            </Button>
            <Button variant="outline" className="w-full justify-start gap-3 h-12 text-base" size="lg">
              <div className="bg-orange-100 p-2 rounded-lg"><Target className="h-4 w-4 text-orange-600" /></div>
              Social Booster
            </Button>
          </CardContent>
        </Card>

        <Card className="md:col-span-2 border-primary/10">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-xl">Campaign Activity</CardTitle>
              <CardDescription>Performance tracking and history</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search..." className="pl-8 h-9 w-[180px] lg:w-[250px]" />
              </div>
              <Button variant="outline" size="icon" className="h-9 w-9">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="rounded-md border-t">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/50">
                    <TableHead className="font-bold">Campaign Details</TableHead>
                    <TableHead className="font-bold">Reach</TableHead>
                    <TableHead className="font-bold">Status</TableHead>
                    <TableHead className="font-bold">Performance</TableHead>
                    <TableHead className="text-right font-bold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {campaigns.map((campaign: any, i: number) => (
                    <TableRow key={i} className="hover:bg-slate-50 transition-colors">
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-800">{campaign.name}</span>
                          <span className="text-[10px] text-muted-foreground uppercase font-black tracking-wider flex items-center gap-1 mt-0.5">
                            {campaign.channel === 'Email' ? <Mail className="h-2.5 w-2.5" /> : 
                             campaign.channel === 'Push' ? <Smartphone className="h-2.5 w-2.5" /> : 
                             <Target className="h-2.5 w-2.5" />}
                            {campaign.channel} • {campaign.audience}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {campaign.reach?.toLocaleString() || '---'}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={campaign.status === 'Running' || campaign.status === 'Active' ? "default" : "secondary"}
                          className={campaign.status === 'Running' || campaign.status === 'Active' ? "bg-green-500 hover:bg-green-600" : ""}
                        >
                          {campaign.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-black text-primary">{campaign.roi} ROI</span>
                          <div className="w-full bg-slate-100 h-1 rounded-full mt-1 overflow-hidden">
                            <div 
                              className="bg-primary h-full rounded-full" 
                              style={{ width: `${Math.min(parseInt(campaign.roi) * 10, 100)}%` }}
                            />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" className="font-bold text-xs uppercase hover:text-primary">
                          Insights
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
