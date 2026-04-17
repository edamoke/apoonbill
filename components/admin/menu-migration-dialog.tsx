"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, AlertTriangle, RefreshCw, CheckCircle2 } from "lucide-react"
import { clearAndLoadNewMenu } from "@/app/actions/product-actions"
import { useToast } from "@/hooks/use-toast"
import { Progress } from "@/components/ui/progress"

export function MenuMigrationDialog() {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const { toast } = useToast()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleMigrate = async () => {
    if (!file) return

    try {
      setLoading(true)
      const text = await file.text()
      const data = JSON.parse(text)

      if (!data.categories || !data.products) {
        throw new Error("Invalid menu data format. Requires 'categories' and 'products' arrays.")
      }

      const result = await clearAndLoadNewMenu(data.categories, data.products)

      if (result.success) {
        toast({
          title: "Menu Migrated",
          description: "Existing menu deleted and new menu loaded successfully.",
        })
        setOpen(false)
        window.location.reload() // Force reload to ensure all state is fresh
      } else {
        throw new Error(result.error)
      }
    } catch (error: any) {
      toast({
        title: "Migration Failed",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="rounded-full px-6 font-bold uppercase tracking-widest text-xs h-12 border-red-200 hover:bg-red-50 text-red-600">
          <RefreshCw className="mr-2 h-4 w-4" />
          Migrate Menu
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Nuclear Menu Reset
          </DialogTitle>
          <DialogDescription className="font-medium pt-2">
            This action will <span className="text-red-600 font-bold uppercase underline">delete all existing products and categories</span> and replace them with the data from your uploaded file.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="menu-file" className="font-bold uppercase text-[10px] tracking-widest">Menu JSON File</Label>
            <Input
              id="menu-file"
              type="file"
              accept=".json"
              onChange={handleFileChange}
              className="cursor-pointer"
            />
          </div>
          {loading && (
            <div className="space-y-2">
              <p className="text-xs font-bold text-center animate-pulse">Processing Migration...</p>
              <Progress value={45} className="h-1" />
            </div>
          )}
        </div>
        <DialogFooter>
          <Button 
            variant="destructive" 
            onClick={handleMigrate} 
            disabled={!file || loading}
            className="w-full rounded-xl font-bold uppercase tracking-widest h-12"
          >
            {loading ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
            Confirm & Replace Everything
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
