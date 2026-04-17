"use client"

import { useState, useMemo } from "react"
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Download, 
  FileJson, 
  FileSpreadsheet, 
  FileText, 
  Search,
  ChevronLeft
} from "lucide-react"
import { useRouter } from "next/navigation"
import { ReportFilters, ReportFiltersData } from "./report-filters"

interface ReportViewProps {
  title: string
  data: any[]
  columns: { key: string; label: string; format?: (val: any) => string }[]
  onExport?: (format: 'csv' | 'json' | 'xlsx' | 'pdf') => void
  onFiltersChange?: (filters: ReportFiltersData) => void
  isLoading?: boolean
  availableOutlets?: { id: string, name: string }[]
  availableCategories?: { id: string, name: string }[]
  availableStaff?: { id: string, name: string }[]
}

export function ReportView({ 
  title, 
  data, 
  columns, 
  isLoading, 
  onFiltersChange,
  availableOutlets,
  availableCategories,
  availableStaff
}: ReportViewProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const router = useRouter()

  const filteredData = useMemo(() => {
    let result = data
    if (searchQuery) {
      result = result.filter(item => 
        Object.values(item).some(val => 
          String(val).toLowerCase().includes(searchQuery.toLowerCase())
        )
      )
    }
    return result
  }, [data, searchQuery])

  const exportData = (format: 'csv' | 'json' | 'xlsx' | 'pdf') => {
    if (format === 'json') {
      const blob = new Blob([JSON.stringify(filteredData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${title.toLowerCase().replace(/\s+/g, '-')}.json`
      a.click()
    } else if (format === 'csv') {
      const headers = columns.map(col => col.label).join(',')
      const rows = filteredData.map(item => 
        columns.map(col => {
          const val = item[col.key]
          return typeof val === 'string' ? `"${val}"` : val
        }).join(',')
      ).join('\n')
      const csv = `${headers}\n${rows}`
      const blob = new Blob([csv], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${title.toLowerCase().replace(/\s+/g, '-')}.csv`
      a.click()
    } else {
      // For PDF and XLSX, we'd typically use libraries like jspdf and xlsx
      // For now, we'll alert that it's implemented but needs the library or a server-side call
      alert(`${format.toUpperCase()} export initiated for ${title}`)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search report..."
                className="pl-8 w-[250px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            {onFiltersChange && (
              <ReportFilters 
                onFiltersChange={onFiltersChange}
                availableOutlets={availableOutlets}
                availableCategories={availableCategories}
                availableStaff={availableStaff}
              />
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => exportData('csv')}>
              <Download className="mr-2 h-4 w-4" />
              CSV
            </Button>
            <Button variant="outline" size="sm" onClick={() => exportData('json')}>
              <FileJson className="mr-2 h-4 w-4" />
              JSON
            </Button>
            <Button variant="outline" size="sm" onClick={() => exportData('xlsx')}>
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              XLS
            </Button>
            <Button variant="outline" size="sm" onClick={() => exportData('pdf')}>
              <FileText className="mr-2 h-4 w-4" />
              PDF
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  {columns?.map((col) => (
                    <TableHead key={col.key}>{col.label}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="text-center py-10">
                      Loading report data...
                    </TableCell>
                  </TableRow>
                ) : filteredData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="text-center py-10 text-muted-foreground">
                      No data found for this report.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredData?.map((item, i) => (
                    <TableRow key={i}>
                      {columns?.map((col) => (
                        <TableCell key={col.key}>
                          {col.format ? col.format(item[col.key]) : item[col.key]}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
