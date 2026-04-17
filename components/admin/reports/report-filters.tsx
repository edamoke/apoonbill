"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover"
import { Filter, X, Calendar as CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"

export type ReportFiltersData = {
  startDate?: string
  endDate?: string
  outletId?: string
  categoryId?: string
  staffId?: string
  paymentMethod?: string
  status?: string
  minAmount?: number
  maxAmount?: number
}

interface ReportFiltersProps {
  onFiltersChange: (filters: ReportFiltersData) => void
  availableOutlets?: { id: string, name: string }[]
  availableCategories?: { id: string, name: string }[]
  availableStaff?: { id: string, name: string }[]
}

export function ReportFilters({ 
  onFiltersChange,
  availableOutlets = [],
  availableCategories = [],
  availableStaff = []
}: ReportFiltersProps) {
  const [filters, setFilters] = useState<ReportFiltersData>({})
  const [isOpen, setIsOpen] = useState(false)

  const updateFilter = (key: keyof ReportFiltersData, value: any) => {
    const newFilters = { ...filters, [key]: value }
    if (value === "all" || value === "" || value === undefined) {
      delete newFilters[key]
    }
    setFilters(newFilters)
  }

  const applyFilters = () => {
    onFiltersChange(filters)
    setIsOpen(false)
  }

  const resetFilters = () => {
    setFilters({})
    onFiltersChange({})
  }

  const activeFilterCount = Object.keys(filters).length

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="relative">
          <Filter className="mr-2 h-4 w-4" />
          Advanced Filters
          {activeFilterCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-[10px] rounded-full w-5 h-5 flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-4" align="start">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium leading-none">Filters</h4>
            <Button variant="ghost" size="sm" onClick={resetFilters}>
              Reset
            </Button>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-medium">Start Date</label>
              <Input 
                type="date" 
                value={filters.startDate || ""} 
                onChange={(e) => updateFilter("startDate", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium">End Date</label>
              <Input 
                type="date" 
                value={filters.endDate || ""} 
                onChange={(e) => updateFilter("endDate", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium">Outlet</label>
            <Select 
              value={filters.outletId || "all"} 
              onValueChange={(val) => updateFilter("outletId", val)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Outlets" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Outlets</SelectItem>
                {availableOutlets.map(o => (
                  <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-medium">Category</label>
              <Select 
                value={filters.categoryId || "all"} 
                onValueChange={(val) => updateFilter("categoryId", val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {availableCategories.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium">Staff</label>
              <Select 
                value={filters.staffId || "all"} 
                onValueChange={(val) => updateFilter("staffId", val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Staff" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Staff</SelectItem>
                  {availableStaff.map(s => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-medium">Payment Method</label>
              <Select 
                value={filters.paymentMethod || "all"} 
                onValueChange={(val) => updateFilter("paymentMethod", val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Methods" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Methods</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="mpesa">M-Pesa</SelectItem>
                  <SelectItem value="card">Card</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium">Status</label>
              <Select 
                value={filters.status || "all"} 
                onValueChange={(val) => updateFilter("status", val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-medium">Min Amount</label>
              <Input 
                type="number" 
                placeholder="0"
                value={filters.minAmount || ""} 
                onChange={(e) => updateFilter("minAmount", e.target.value ? Number(e.target.value) : undefined)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium">Max Amount</label>
              <Input 
                type="number" 
                placeholder="Any"
                value={filters.maxAmount || ""} 
                onChange={(e) => updateFilter("maxAmount", e.target.value ? Number(e.target.value) : undefined)}
              />
            </div>
          </div>

          <Button className="w-full" onClick={applyFilters}>
            Apply Deep Analysis
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
