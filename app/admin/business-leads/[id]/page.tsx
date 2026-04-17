"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { 
  ArrowLeft, 
  Printer, 
  Send, 
  CheckCircle, 
  FileText, 
  Calendar, 
  MapPin, 
  Mail, 
  Phone,
  Link as LinkIcon
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  getBusinessLead, 
  toggleSystemLink,
  BusinessLead, 
  BusinessLeadItem 
} from "@/app/actions/business-leads"
import Link from "next/link"
import { toast } from "@/hooks/use-toast"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function BusinessLeadDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [lead, setLead] = useState<(BusinessLead & { items: BusinessLeadItem[] }) | null>(null)

  useEffect(() => {
    if (id) fetchLead()
  }, [id])

  async function fetchLead() {
    try {
      setLoading(true)
      const data = await getBusinessLead(id as string)
      setLead(data)
    } catch (error) {
      console.error(error)
      toast({ title: "Error", description: "Failed to load lead details.", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  async function handleToggleLink() {
    if (!lead) return
    try {
      await toggleSystemLink(lead.id, !lead.is_linked_to_system)
      setLead({ ...lead, is_linked_to_system: !lead.is_linked_to_system })
      toast({ 
        title: lead.is_linked_to_system ? "Unlinked" : "Linked", 
        description: lead.is_linked_to_system ? "Lead unlinked from system." : "Lead linked to system." 
      })
    } catch (error) {
      toast({ title: "Error", description: "Operation failed.", variant: "destructive" })
    }
  }

  if (loading) return <div className="p-6 text-center italic">Loading lead details...</div>
  if (!lead) return <div className="p-6 text-center italic text-red-500">Lead not found.</div>

  const DocumentView = ({ title }: { title: string }) => (
    <div className="bg-white text-black p-8 rounded-lg shadow-sm border max-w-4xl mx-auto print:shadow-none print:border-none print:p-0">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-4xl font-serif font-bold italic text-primary">Stars & Garters</h1>
          <p className="text-sm font-black uppercase tracking-widest mt-1">Catering & Events</p>
        </div>
        <div className="text-right">
          <h2 className="text-2xl font-bold uppercase">{title}</h2>
          <p className="font-black"># {lead.document_number}</p>
          <p className="text-xs text-muted-foreground uppercase font-bold">Date: {new Date(lead.created_at).toLocaleDateString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8 mb-12">
        <div>
          <h3 className="text-[10px] font-black uppercase text-muted-foreground mb-2">Billing To:</h3>
          <p className="font-bold text-lg uppercase">{lead.client_name}</p>
          <div className="text-sm space-y-1 mt-2 font-medium">
            {lead.client_email && <p className="flex items-center gap-2"><Mail className="h-3 w-3" /> {lead.client_email}</p>}
            {lead.client_phone && <p className="flex items-center gap-2"><Phone className="h-3 w-3" /> {lead.client_phone}</p>}
          </div>
        </div>
        <div>
          <h3 className="text-[10px] font-black uppercase text-muted-foreground mb-2">Event Details:</h3>
          <div className="text-sm space-y-2 font-bold uppercase">
            {lead.event_date && <p className="flex items-center gap-2"><Calendar className="h-4 w-4 text-primary" /> {new Date(lead.event_date).toDateString()}</p>}
            {lead.event_location && <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" /> {lead.event_location}</p>}
          </div>
        </div>
      </div>

      <table className="w-full mb-12">
        <thead>
          <tr className="border-b-2 border-black">
            <th className="text-left py-3 font-black uppercase text-xs">Description</th>
            <th className="text-center py-3 font-black uppercase text-xs w-24">Qty</th>
            <th className="text-right py-3 font-black uppercase text-xs w-32">Unit Price</th>
            <th className="text-right py-3 font-black uppercase text-xs w-32">Total</th>
          </tr>
        </thead>
        <tbody>
          {lead.items.map((item, i) => (
            <tr key={i} className="border-b border-gray-200">
              <td className="py-4 font-medium uppercase text-sm">{item.description}</td>
              <td className="py-4 text-center font-bold">{item.quantity}</td>
              <td className="py-4 text-right font-medium">KSh {item.unit_price?.toLocaleString()}</td>
              <td className="py-4 text-right font-black">KSh {item.total_price?.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={2}></td>
            <td className="py-6 text-right font-black uppercase text-sm">Grand Total</td>
            <td className="py-6 text-right font-black text-2xl text-primary">KSh {lead.total_amount?.toLocaleString()}</td>
          </tr>
        </tfoot>
      </table>

      {lead.notes && (
        <div className="pt-8 border-t border-gray-100 italic text-sm text-gray-600">
          <p className="font-bold uppercase text-[10px] not-italic text-black mb-1">Notes:</p>
          {lead.notes}
        </div>
      )}

      <div className="mt-20 pt-8 border-t-2 border-gray-100 text-center text-[10px] font-black uppercase tracking-tighter text-gray-400">
        Thank you for choosing Stars & Garters • Stars & Garters Plaza, Nairobi • +254 700 000 000
      </div>
    </div>
  )

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/business-leads">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-serif font-bold italic">{lead.document_number}</h1>
            <p className="text-muted-foreground uppercase text-xs font-black">{lead.client_name}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleToggleLink} className={lead.is_linked_to_system ? "text-green-600 border-green-600" : ""}>
            <LinkIcon className="h-4 w-4 mr-2" />
            {lead.is_linked_to_system ? "Linked to System" : "Link to System"}
          </Button>
          <Button onClick={handlePrint} className="bg-primary hover:bg-primary/90">
            <Printer className="h-4 w-4 mr-2" />
            Print Document
          </Button>
          <Button variant="secondary">
            <Send className="h-4 w-4 mr-2" />
            Send to Client
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 print:hidden">
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm uppercase font-black">Status Control</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full justify-start font-bold" variant={lead.lead_status === 'pending' ? 'default' : 'outline'}>
                <div className={`w-2 h-2 rounded-full mr-3 ${lead.lead_status === 'pending' ? 'bg-white' : 'bg-orange-500'}`} />
                Pending
              </Button>
              <Button className="w-full justify-start font-bold" variant={lead.lead_status === 'quotation_sent' ? 'default' : 'outline'}>
                <div className={`w-2 h-2 rounded-full mr-3 ${lead.lead_status === 'quotation_sent' ? 'bg-white' : 'bg-blue-500'}`} />
                Quotation Sent
              </Button>
              <Button className="w-full justify-start font-bold" variant={lead.lead_status === 'invoice_sent' ? 'default' : 'outline'}>
                <div className={`w-2 h-2 rounded-full mr-3 ${lead.lead_status === 'invoice_sent' ? 'bg-white' : 'bg-purple-500'}`} />
                Invoice Sent
              </Button>
              <Button className="w-full justify-start font-bold" variant={lead.lead_status === 'paid' ? 'default' : 'outline'}>
                <div className={`w-2 h-2 rounded-full mr-3 ${lead.lead_status === 'paid' ? 'bg-white' : 'bg-green-500'}`} />
                Mark as Paid
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-sm uppercase font-black">Client Contacts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {lead.client_email && (
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-muted rounded-full"><Mail className="h-4 w-4" /></div>
                  <div className="text-xs font-bold truncate">{lead.client_email}</div>
                </div>
              )}
              {lead.client_phone && (
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-muted rounded-full"><Phone className="h-4 w-4" /></div>
                  <div className="text-xs font-bold">{lead.client_phone}</div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-3">
          <Tabs defaultValue="quotation" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="quotation" className="font-black uppercase text-xs">Quotation</TabsTrigger>
              <TabsTrigger value="invoice" className="font-black uppercase text-xs">Invoice</TabsTrigger>
              <TabsTrigger value="receipt" className="font-black uppercase text-xs">Receipt</TabsTrigger>
            </TabsList>
            <TabsContent value="quotation">
              <DocumentView title="Quotation" />
            </TabsContent>
            <TabsContent value="invoice">
              <DocumentView title="Tax Invoice" />
            </TabsContent>
            <TabsContent value="receipt">
              <DocumentView title="Official Receipt" />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Simplified Print-only View */}
      <div className="hidden print:block">
        <DocumentView title={
          lead.lead_status === 'paid' ? "Official Receipt" :
          lead.lead_status === 'invoice_sent' ? "Tax Invoice" : "Quotation"
        } />
      </div>
    </div>
  )
}
