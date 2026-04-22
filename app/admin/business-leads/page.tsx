"use client"

import { useState, useEffect } from "react"
import { Plus, Search, FileText, CheckCircle, XCircle, MoreVertical, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  getBusinessLeads, 
  deleteBusinessLead, 
  BusinessLead 
} from "@/app/actions/business-leads"
import Link from "next/link"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "@/hooks/use-toast"

export default function BusinessLeadsPage() {
  const [leads, setLeads] = useState<BusinessLead[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    fetchLeads()
  }, [])

  async function fetchLeads() {
    try {
      setLoading(true)
      const data = await getBusinessLeads()
      setLeads(data)
    } catch (error) {
      console.error("Error fetching leads:", error)
      toast({
        title: "Error",
        description: "Failed to load business leads.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this lead?")) return

    try {
      await deleteBusinessLead(id)
      setLeads(leads.filter(l => l.id !== id))
      toast({
        title: "Deleted",
        description: "Business lead deleted successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete lead.",
        variant: "destructive",
      })
    }
  }

  const filteredLeads = leads.filter(lead => 
    lead.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.document_number.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid': return <Badge className="bg-green-500">Paid</Badge>
      case 'cancelled': return <Badge variant="destructive">Cancelled</Badge>
      case 'quotation_sent': return <Badge variant="secondary">Quotation Sent</Badge>
      case 'invoice_sent': return <Badge className="bg-blue-500">Invoice Sent</Badge>
      default: return <Badge variant="outline">Pending</Badge>
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold italic">Business Leads</h1>
          <p className="text-muted-foreground">Comprehensive tracking for Cook outs and events.</p>
        </div>
        <Button asChild className="bg-primary hover:bg-primary/90">
          <Link href="/admin/business-leads/new">
            <Plus className="h-4 w-4 mr-2" />
            New Business Lead
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{leads.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Linked to System</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{leads.filter(l => l.is_linked_to_system).length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <div className="text-sm font-bold text-primary">KSh</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {leads.filter(l => l.lead_status === 'paid').reduce((acc, curr) => acc + (curr.total_amount || 0), 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Leads</CardTitle>
            <XCircle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{leads.filter(l => l.lead_status === 'pending').length}</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search leads..." 
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left p-4 font-bold">Document #</th>
              <th className="text-left p-4 font-bold">Client Name</th>
              <th className="text-left p-4 font-bold">Event Date</th>
              <th className="text-left p-4 font-bold">Status</th>
              <th className="text-left p-4 font-bold">Total Amount</th>
              <th className="text-left p-4 font-bold">System Link</th>
              <th className="text-right p-4 font-bold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="text-center p-8 text-muted-foreground italic">Loading leads...</td>
              </tr>
            ) : filteredLeads.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center p-8 text-muted-foreground italic">No business leads found.</td>
              </tr>
            ) : (
              filteredLeads.map((lead) => (
                <tr key={lead.id} className="border-b hover:bg-muted/30 transition-colors">
                  <td className="p-4 font-black uppercase">{lead.document_number}</td>
                  <td className="p-4 uppercase font-bold">{lead.client_name}</td>
                  <td className="p-4 uppercase text-xs font-black">
                    {lead.event_date ? new Date(lead.event_date).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="p-4">{getStatusBadge(lead.lead_status)}</td>
                  <td className="p-4 font-black text-primary">KSh {lead.total_amount?.toLocaleString()}</td>
                  <td className="p-4">
                    {lead.is_linked_to_system ? (
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        Linked <ExternalLink className="h-3 w-3 ml-1" />
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-muted-foreground">Not Linked</Badge>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/business-leads/${lead.id}`}>View Details</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/business-leads/${lead.id}/edit`}>Edit Lead</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-red-500 focus:text-red-500"
                          onClick={() => handleDelete(lead.id)}
                        >
                          Delete Lead
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
