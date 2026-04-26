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
import { Settings, Plus, Check, X, ExternalLink } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { 
  getLoyaltyConfig, 
  updateLoyaltyConfig, 
  approveSocialPost,
  getLoyaltyRewards
} from "@/app/actions/loyalty-actions"
import { revalidatePath } from "next/cache"

export default async function LoyaltyPage() {
  const supabase = await createClient()
  const config = await getLoyaltyConfig()
  const rewards = await getLoyaltyRewards()

  // Fetch pending social posts
  const { data: pendingPosts } = await supabase
    .from("social_posts")
    .select("*, profiles(full_name)")
    .eq("status", "pending")
    .order("created_at", { ascending: false })

  // Fetch recent transactions
  const { data: recentTransactions } = await supabase
    .from("loyalty_transactions")
    .select("*, profiles(full_name)")
    .order("created_at", { ascending: false })
    .limit(10)

  async function handleSaveConfig(formData: FormData) {
    "use server"
    const newConfig = {
      points_per_100_kes: Number(formData.get("points_per_100")),
      min_spend_for_points: Number(formData.get("min_spend")),
      social_bonus_points: Number(formData.get("social_bonus")),
    }
    await updateLoyaltyConfig(newConfig)
  }

  return (
    <div className="p-6 space-y-6">
      <CRMNavigation />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Settings */}
        <Card className="lg:col-span-1 h-fit">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Earning Rules
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form action={handleSaveConfig} className="space-y-4">
              <div className="space-y-2">
                <Label>Points per KSh 100 spent</Label>
                <Input name="points_per_100" type="number" defaultValue={config.points_per_100_kes} />
              </div>
              <div className="space-y-2">
                <Label>Minimum spend to earn (KSh)</Label>
                <Input name="min_spend" type="number" defaultValue={config.min_spend_for_points} />
              </div>
              <div className="space-y-2">
                <Label>Social Media Bonus Points</Label>
                <Input name="social_bonus" type="number" defaultValue={config.social_bonus_points} />
              </div>
              <Button type="submit" className="w-full">Save Changes</Button>
            </form>
          </CardContent>
        </Card>

        {/* Pending Moderation */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Social Post Moderation
              <span className="text-xs font-normal bg-orange-100 text-orange-800 px-2 py-1 rounded-full">
                {pendingPosts?.length || 0} Pending
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Platform</TableHead>
                  <TableHead>Link</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingPosts?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                      No pending social posts to review
                    </TableCell>
                  </TableRow>
                )}
                {pendingPosts?.map((post) => (
                  <TableRow key={post.id}>
                    <TableCell className="font-medium">{(post.profiles as any)?.full_name || 'User'}</TableCell>
                    <TableCell className="capitalize">{post.platform}</TableCell>
                    <TableCell>
                      <a href={post.post_url} target="_blank" rel="noopener noreferrer" className="flex items-center text-primary hover:underline gap-1">
                        View Post <ExternalLink className="h-3 w-3" />
                      </a>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <form action={async () => {
                        "use server"
                        await approveSocialPost(post.id)
                      }} className="inline">
                        <Button size="sm" variant="outline" className="text-green-600 hover:text-green-700">
                          <Check className="h-4 w-4" />
                        </Button>
                      </form>
                      <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                        <X className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
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
                {rewards?.map((reward) => (
                  <TableRow key={reward.id}>
                    <TableCell className="font-medium">{(reward.menu_items as any)?.name}</TableCell>
                    <TableCell>{reward.points_cost} pts</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        reward.is_available ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                      }`}>
                        {reward.is_available ? "Active" : "Inactive"}
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

        {/* Recent Transactions */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {recentTransactions?.map((tx) => (
                <div key={tx.id} className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{(tx.profiles as any)?.full_name || 'User'}</p>
                    <p className="text-xs text-muted-foreground">{tx.description}</p>
                  </div>
                  <div className={`text-sm font-bold ${tx.points_change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {tx.points_change > 0 ? '+' : ''}{tx.points_change}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
