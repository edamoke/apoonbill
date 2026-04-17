"use client"

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Plus, Minus, ShoppingCart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { createEventBooking } from "@/app/actions/event-booking";
import { useRouter } from "next/navigation";

interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  category_id: string;
  image_url: string | null;
}

interface Category {
  id: string;
  name: string;
}

interface Event {
  id: string;
  title: string;
  price: number;
  event_date: string;
}

export function EventBookingForm({ 
  event, 
  products, 
  categories 
}: { 
  event: Event; 
  products: Product[]; 
  categories: Category[];
}) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    tickets: 1,
  });
  const [cart, setCart] = useState<{ [key: string]: number }>({});
  const { toast } = useToast();
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const updateCart = (productId: string, delta: number) => {
    setCart(prev => {
      const current = prev[productId] || 0;
      const next = Math.max(0, current + delta);
      if (next === 0) {
        const { [productId]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [productId]: next };
    });
  };

  const ticketTotal = event.price * formData.tickets;
  const foodTotal = Object.entries(cart).reduce((total, [id, qty]) => {
    const product = products.find(p => p.id === id);
    return total + (product ? product.price * qty : 0);
  }, 0);
  const grandTotal = ticketTotal + foodTotal;

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const bookingData = {
        event_id: event.id,
        ...formData,
        total_amount: grandTotal,
        items: Object.entries(cart).map(([id, quantity]) => ({
          product_id: id,
          quantity
        }))
      };

      const result = await createEventBooking(bookingData);
      
      if (result.success) {
        toast({
          title: "Booking Initiated",
          description: "Redirecting to payment...",
        });
        // In a real app, redirect to payment gateway or confirmation
        // For now, redirect to a success page or back to event
        router.push(`/events/${event.id}`);
        toast({
            title: "Success",
            description: "Booking created successfully!",
        });
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to create booking",
          variant: "destructive",
        });
      }
    } catch (error) {
        console.error(error);
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Steps Indicator */}
      <div className="flex justify-center mb-8">
        <div className="flex items-center space-x-4">
          <div className={`h-8 w-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>1</div>
          <div className={`h-1 w-12 ${step >= 2 ? 'bg-primary' : 'bg-muted'}`} />
          <div className={`h-8 w-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>2</div>
          <div className={`h-1 w-12 ${step >= 3 ? 'bg-primary' : 'bg-muted'}`} />
          <div className={`h-8 w-8 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>3</div>
        </div>
      </div>

      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Contact Details & Tickets</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" name="name" value={formData.name} onChange={handleInputChange} placeholder="John Doe" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} placeholder="john@example.com" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleInputChange} placeholder="+254..." />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="tickets">Number of Tickets</Label>
              <div className="flex items-center space-x-4">
                <Button variant="outline" size="icon" onClick={() => setFormData(prev => ({ ...prev, tickets: Math.max(1, prev.tickets - 1) }))}>
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="text-xl font-bold w-8 text-center">{formData.tickets}</span>
                <Button variant="outline" size="icon" onClick={() => setFormData(prev => ({ ...prev, tickets: prev.tickets + 1 }))}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
          <CardFooter className="justify-end">
            <Button onClick={() => setStep(2)} disabled={!formData.name || !formData.email || !formData.phone}>
              Next: Pre-order Food
            </Button>
          </CardFooter>
        </Card>
      )}

      {step === 2 && (
        <div className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Pre-order Menu</CardTitle>
              <div className="flex items-center space-x-2">
                <ShoppingCart className="h-5 w-5" />
                <span className="font-bold">KES {foodTotal}</span>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue={categories[0]?.id || "all"}>
                <TabsList className="flex flex-wrap h-auto">
                    <TabsTrigger value="all">All</TabsTrigger>
                  {categories.map(cat => (
                    <TabsTrigger key={cat.id} value={cat.id}>{cat.name}</TabsTrigger>
                  ))}
                </TabsList>
                
                <TabsContent value="all" className="mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {products.map(product => (
                            <ProductItem 
                                key={product.id} 
                                product={product} 
                                quantity={cart[product.id] || 0} 
                                onUpdate={updateCart} 
                            />
                        ))}
                    </div>
                </TabsContent>

                {categories.map(cat => (
                  <TabsContent key={cat.id} value={cat.id} className="mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {products.filter(p => p.category_id === cat.id).map(product => (
                        <ProductItem 
                          key={product.id} 
                          product={product} 
                          quantity={cart[product.id] || 0} 
                          onUpdate={updateCart} 
                        />
                      ))}
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
              <Button onClick={() => setStep(3)}>Next: Review & Pay</Button>
            </CardFooter>
          </Card>
        </div>
      )}

      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <h3 className="font-semibold text-lg">Event Tickets</h3>
              <div className="flex justify-between text-sm">
                <span>{event.title} x {formData.tickets}</span>
                <span>KES {ticketTotal}</span>
              </div>
            </div>

            <Separator />

            {Object.keys(cart).length > 0 && (
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">Pre-ordered Items</h3>
                {Object.entries(cart).map(([id, qty]) => {
                  const product = products.find(p => p.id === id);
                  if (!product) return null;
                  return (
                    <div key={id} className="flex justify-between text-sm">
                      <span>{product.name} x {qty}</span>
                      <span>KES {product.price * qty}</span>
                    </div>
                  );
                })}
                <div className="flex justify-between font-medium pt-2">
                    <span>Food Subtotal</span>
                    <span>KES {foodTotal}</span>
                </div>
              </div>
            )}
             
            <Separator />
            
            <div className="flex justify-between text-xl font-bold">
              <span>Total to Pay</span>
              <span>KES {grandTotal}</span>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
            <Button onClick={handleSubmit} disabled={loading} className="bg-green-600 hover:bg-green-700">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirm Booking & Pay
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}

function ProductItem({ product, quantity, onUpdate }: { product: Product, quantity: number, onUpdate: (id: string, delta: number) => void }) {
  return (
    <div className="flex justify-between items-center p-4 border rounded-lg bg-card shadow-sm">
      <div className="flex-1 pr-4">
        <div className="font-medium">{product.name}</div>
        <div className="text-sm text-muted-foreground line-clamp-1">{product.description}</div>
        <div className="font-semibold text-sm mt-1">KES {product.price}</div>
      </div>
      <div className="flex items-center space-x-2 bg-muted rounded-md p-1">
        <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8" 
            onClick={() => onUpdate(product.id, -1)}
            disabled={quantity === 0}
        >
          <Minus className="h-3 w-3" />
        </Button>
        <span className="w-4 text-center text-sm font-medium">{quantity}</span>
        <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8" 
            onClick={() => onUpdate(product.id, 1)}
        >
          <Plus className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}
