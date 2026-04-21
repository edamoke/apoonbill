"use client"

import { useState, useEffect } from "react"
import { Trophy, Gift, ArrowRight, Zap, Info } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { redeemReward, getLoyaltyRewards } from "@/app/actions/loyalty-actions"
import { toast } from "@/hooks/use-toast"
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export function LoyaltyCard({ profile }: { profile: any }) {
  const [rewards, setRewards] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const points = profile?.loyalty_points || 0
  const nextMilestone = 1000
  const progress = Math.min(100, (points / nextMilestone) * 100)

  useEffect(() => {
    async function loadRewards() {
      const data = await getLoyaltyRewards()
      setRewards(data || [])
    }
    loadRewards()
  }, [])

  async function handleRedeem(rewardId: string) {
    setLoading(true)
    try {
      const res = await redeemReward(rewardId)
      if (res.success) {
        toast({ title: "Gift Claimed!", description: "Your free food order has been sent to the kitchen." })
      } else {
        toast({ title: "Redemption Failed", description: res.error, variant: "destructive" })
      }
    } catch (err) {
      toast({ title: "Error", description: "An error occurred during redemption", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="border-none bg-gradient-to-br from-red-600 to-red-800 text-white shadow-2xl rounded-[32px] overflow-hidden relative group">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-white/20 transition-all duration-700" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full -ml-12 -mb-12 blur-xl" />

      <CardContent className="p-8 space-y-6 relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-md border border-white/30">
              <Trophy className="h-6 w-6 text-yellow-300 shadow-sm" />
            </div>
            <div>
              <h3 className="text-xl font-black uppercase tracking-tighter italic">Spoonbill Elite</h3>
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">Member Rewards System</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-3xl font-black tracking-tighter leading-none">{points}</p>
            <p className="text-[10px] font-black uppercase tracking-widest opacity-80 mt-1">Total Points</p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-end">
            <p className="text-xs font-black uppercase tracking-widest">Next Milestone: 1,000 Pts</p>
            <p className="text-[10px] font-bold opacity-80">{Math.floor(progress)}% Complete</p>
          </div>
          <Progress value={progress} className="h-2 bg-white/20 border-none shadow-inner" />
        </div>

        <div className="flex items-center gap-4 pt-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button className="flex-1 rounded-2xl bg-white text-red-700 hover:bg-slate-100 font-black uppercase tracking-widest text-[10px] h-12 shadow-xl shadow-black/20 gap-2">
                <Gift className="h-4 w-4" />
                Redeem Free Gifts
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl rounded-[32px] p-8 border-none bg-slate-50">
              <DialogHeader className="mb-6">
                <DialogTitle className="text-2xl font-black uppercase tracking-tighter flex items-center gap-3">
                  <Zap className="h-6 w-6 text-red-600" />
                  Your Reward Catalog
                </DialogTitle>
              </DialogHeader>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {rewards.length > 0 ? rewards.map((reward) => (
                  <Card key={reward.id} className="border-none shadow-md rounded-2xl p-4 flex flex-col justify-between hover:shadow-xl transition-all">
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center">
                          <Utensils className="h-6 w-6 text-red-600" />
                       </div>
                       <div>
                          <p className="font-bold text-slate-900 uppercase text-xs tracking-tight">{reward.menu_items.name}</p>
                          <p className="text-[10px] text-muted-foreground font-black uppercase mt-0.5">{reward.points_cost} Points</p>
                       </div>
                    </div>
                    <Button 
                      className="mt-4 w-full rounded-xl font-bold uppercase text-[10px]" 
                      variant={points >= reward.points_cost ? "default" : "secondary"}
                      disabled={points < reward.points_cost || loading}
                      onClick={() => handleRedeem(reward.id)}
                    >
                      {points >= reward.points_cost ? "Redeem Now" : "Need more points"}
                    </Button>
                  </Card>
                )) : (
                  <div className="col-span-full py-10 text-center text-muted-foreground italic">
                    No active rewards at the moment. Points will keep accumulating!
                  </div>
                )}
              </div>
              
              <div className="mt-8 flex items-start gap-3 bg-blue-50 p-4 rounded-2xl text-blue-800">
                 <Info className="h-5 w-5 mt-0.5" />
                 <p className="text-xs font-medium">
                   Claiming a reward will instantly place a free order for the item. Point deductions are final once confirmed.
                 </p>
              </div>
            </DialogContent>
          </Dialog>
          
          <Button variant="outline" className="w-12 h-12 p-0 rounded-2xl border-white/30 bg-white/10 hover:bg-white/20 text-white">
            <ArrowRight className="h-5 w-5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function Utensils(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
      <path d="M7 2v20" />
      <path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
    </svg>
  )
}
