'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/hooks/use-toast';
import { calculateSuggestedEquipment } from '@/lib/catering-utils';
import { submitCateringRequest } from '@/app/actions/catering-actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

const mealOptions = [
  'Breakfast',
  'Morning Snack',
  'Lunch',
  'Afternoon Snack',
  'Dinner',
  'Late Night Snack',
] as const;

const formSchema = z.z.object({
  customerName: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  customerEmail: z.string().email({ message: 'Invalid email address.' }),
  customerPhone: z.string().optional(),
  eventDate: z.string().min(1, { message: 'Event date is required.' }),
  eventTime: z.string().min(1, { message: 'Event time is required.' }),
  location: z.string().min(5, { message: 'Location must be at least 5 characters.' }),
  totalPeople: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: 'Total people must be a positive number.',
  }),
  mealTypes: z.array(z.string()).min(1, { message: 'Select at least one meal type.' }),
  mealDetails: z.string().min(10, { message: 'Please provide some meal details.' }),
  drinkDetails: z.string().min(5, { message: 'Please provide some drink details.' }),
});

export function CateringRequestForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [calculations, setCalculations] = useState<any>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customerName: '',
      customerEmail: '',
      customerPhone: '',
      eventDate: '',
      eventTime: '',
      location: '',
      totalPeople: '',
      mealTypes: [],
      mealDetails: '',
      drinkDetails: '',
    },
  });

  const totalPeople = form.watch('totalPeople');

  useEffect(() => {
    const people = Number(totalPeople);
    if (people > 0) {
      setCalculations(calculateSuggestedEquipment(people));
    } else {
      setCalculations(null);
    }
  }, [totalPeople]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      const result = await submitCateringRequest(values);
      if (result.success) {
        toast({
          title: 'Request Submitted',
          description: 'We have received your catering request and will get back to you with a quotation shortly.',
        });
        form.reset();
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to submit request. Please try again.',
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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div className="md:col-span-2">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="customerName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="customerEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="john@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="customerPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="+254..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="totalPeople"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total Number of People</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="50" {...field} />
                    </FormControl>
                    <FormDescription>Equipment needs will be calculated based on this.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Event Location</FormLabel>
                  <FormControl>
                    <Input placeholder="Physical address or landmark" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="eventDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Event Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="eventTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Event Time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="mealTypes"
              render={() => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel className="text-base">Meal Types</FormLabel>
                    <FormDescription>Select the types of meals you need.</FormDescription>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {mealOptions.map((option) => (
                      <FormField
                        key={option}
                        control={form.control}
                        name="mealTypes"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={option}
                              className="flex flex-row items-start space-x-3 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(option)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...field.value, option])
                                      : field.onChange(
                                          field.value?.filter((value) => value !== option)
                                        );
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">{option}</FormLabel>
                            </FormItem>
                          );
                        }}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="mealDetails"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Meal Details / Menu Preferences</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="List specific dishes, dietary requirements, etc."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="drinkDetails"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Drink Details</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Soft drinks, juices, water, etc."
                      className="min-h-[80px]"
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
                  Submitting Request...
                </>
              ) : (
                'Request for Quotation'
              )}
            </Button>
          </form>
        </Form>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Equipment Suggestions</CardTitle>
            <CardDescription>
              Automatically calculated based on {totalPeople || 0} people.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {calculations ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-muted-foreground">Tents (50-seater)</span>
                  <span className="font-bold">{calculations.suggestedTents}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-muted-foreground">Chairs</span>
                  <span className="font-bold">{calculations.suggestedChairs}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-muted-foreground">Tables</span>
                  <span className="font-bold">{calculations.suggestedTables}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-muted-foreground">Plates</span>
                  <span className="font-bold">{calculations.suggestedPlates}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-muted-foreground">Spoons</span>
                  <span className="font-bold">{calculations.suggestedSpoons}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-muted-foreground">Knives</span>
                  <span className="font-bold">{calculations.suggestedKnives}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-muted-foreground">Forks</span>
                  <span className="font-bold">{calculations.suggestedForks}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-4 italic">
                  * These are initial estimates. Our team will provide a refined list in the final quotation.
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Enter the number of people to see equipment suggestions.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
