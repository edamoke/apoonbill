'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { updateCateringQuotation } from '@/app/actions/catering-actions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

const quoteSchema = z.z.object({
  quotedPrice: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
    message: 'Quoted price must be a valid number.',
  }),
  adminNotes: z.string().min(5, { message: 'Please provide some notes for the customer.' }),
});

export function CateringQuotationForm({ request }: { request: any }) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof quoteSchema>>({
    resolver: zodResolver(quoteSchema),
    defaultValues: {
      quotedPrice: request.quoted_price?.toString() || '',
      adminNotes: request.admin_notes || '',
    },
  });

  async function onSubmit(values: z.infer<typeof quoteSchema>) {
    setIsSubmitting(true);
    try {
      const result = await updateCateringQuotation(request.id, {
        quoted_price: Number(values.quotedPrice),
        admin_notes: values.adminNotes,
      });
      if (result.success) {
        toast({
          title: 'Quotation Updated',
          description: 'The quotation has been sent to the customer.',
        });
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to update quotation.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="sm">
          <Link href="/admin/catering">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to List
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Request Details</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Customer & Event Information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm font-medium text-muted-foreground">Customer</div>
                <div>{request.customer_name}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">Email / Phone</div>
                <div>{request.customer_email} / {request.customer_phone || 'N/A'}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">Date & Time</div>
                <div>{format(new Date(request.event_date), 'PPP')} at {request.event_time}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">Location</div>
                <div>{request.location}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">Total People</div>
                <div>{request.total_people}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">Meal Types</div>
                <div className="flex gap-1 flex-wrap">
                  {request.meal_types.map((type: string) => (
                    <span key={type} className="px-2 py-0.5 bg-secondary text-secondary-foreground rounded text-xs">
                      {type}
                    </span>
                  ))}
                </div>
              </div>
              <div className="col-span-2">
                <div className="text-sm font-medium text-muted-foreground">Meal Details</div>
                <div className="whitespace-pre-wrap text-sm border rounded-md p-2 bg-muted/30">
                  {request.meal_details}
                </div>
              </div>
              <div className="col-span-2">
                <div className="text-sm font-medium text-muted-foreground">Drink Details</div>
                <div className="whitespace-pre-wrap text-sm border rounded-md p-2 bg-muted/30">
                  {request.drink_details}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quotation Response</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="quotedPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Total Quoted Price (KES)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="0.00" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="adminNotes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes for Customer</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Provide pricing breakdown or additional information..."
                            className="min-h-[120px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={isSubmitting} className="w-full">
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving Quotation...
                      </>
                    ) : (
                      'Send Quotation'
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Suggested Equipment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between border-b pb-2">
                <span className="text-sm text-muted-foreground">Tents</span>
                <span className="font-medium">{request.suggested_tents}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-sm text-muted-foreground">Chairs</span>
                <span className="font-medium">{request.suggested_chairs}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-sm text-muted-foreground">Tables</span>
                <span className="font-medium">{request.suggested_tables}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-sm text-muted-foreground">Plates</span>
                <span className="font-medium">{request.suggested_plates}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-sm text-muted-foreground">Spoons</span>
                <span className="font-medium">{request.suggested_spoons}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-sm text-muted-foreground">Knives</span>
                <span className="font-medium">{request.suggested_knives}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-sm text-muted-foreground">Forks</span>
                <span className="font-medium">{request.suggested_forks}</span>
              </div>
              <div className="pt-4 text-xs text-muted-foreground">
                These numbers were automatically generated based on the guest count.
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Status History</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status:</span>
                <span className="font-medium uppercase">{request.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Created:</span>
                <span>{format(new Date(request.created_at), 'PPP p')}</span>
              </div>
              {request.responded_at && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Quoted:</span>
                  <span>{format(new Date(request.responded_at), 'PPP p')}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
