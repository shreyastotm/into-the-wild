
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from '@/components/auth/AuthProvider';
import { toast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowRight, CalendarCheck, IndianRupee, UserCircle } from 'lucide-react';
import { UpcomingTreks } from '@/components/trek/UpcomingTreks';
import { formatCurrency } from '@/lib/utils';

interface Registration {
  registration_id: number;
  payment_status: string;
  booking_datetime: string;
  trek: {
    trek_id: number;
    trek_name: string;
    start_datetime: string;
    category: string | null;
  };
}

interface Expense {
  expense_id: number;
  description: string;
  amount: number;
  trek_id: number;
  trek_name: string;
  expense_date: string;
  settlement_status: string;
  payer_name: string;
}

export default function Dashboard() {
  const { user, userProfile, loading } = useAuth();
  const navigate = useNavigate();
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loadingRegistrations, setLoadingRegistrations] = useState(true);
  const [loadingExpenses, setLoadingExpenses] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
      return;
    }

    if (user) {
      fetchUserRegistrations();
      fetchUserExpenses();
    }
  }, [user, loading]);

  const fetchUserRegistrations = async () => {
    if (!user) return;

    try {
      setLoadingRegistrations(true);
      
      const { data, error } = await supabase
        .from('registrations')
        .select(`
          registration_id,
          payment_status,
          booking_datetime,
          trek:trek_id (
            trek_id,
            trek_name,
            start_datetime,
            category
          )
        `)
        .eq('user_id', user.id) // user.id is a string UUID
        .eq('payment_status', 'Pending')
        .order('booking_datetime', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      if (data) {
        setRegistrations(data as unknown as Registration[]);
      }
    } catch (error: any) {
      toast({
        title: "Error fetching registrations",
        description: error.message || "Failed to load your trek registrations",
        variant: "destructive",
      });
      console.error("Error fetching registrations:", error);
    } finally {
      setLoadingRegistrations(false);
    }
  };

  const fetchUserExpenses = async () => {
    if (!user) return;
    
    try {
      setLoadingExpenses(true);
      
      const { data: payerExpenses, error: payerError } = await supabase
        .from('expense_sharing')
        .select(`
          expense_id,
          description,
          amount,
          expense_date,
          settlement_status,
          trek_id,
          trek_events(trek_name)
        `)
        .eq('payer_id', user.id) // user.id is a string UUID
        .order('expense_date', { ascending: false });
      
      if (payerError) throw payerError;
      
      if (payerExpenses) {
        const transformedExpenses = payerExpenses.map(expense => ({
          expense_id: expense.expense_id,
          description: expense.description,
          amount: expense.amount,
          trek_id: expense.trek_id,
          trek_name: expense.trek_events?.trek_name || 'Unknown Trek',
          expense_date: expense.expense_date,
          settlement_status: expense.settlement_status,
          payer_name: userProfile?.full_name || user.email || 'You'
        }));
        
        setExpenses(transformedExpenses);
      }
    } catch (error: any) {
      toast({
        title: "Error loading expenses",
        description: error.message || "Failed to load your expenses",
        variant: "destructive",
      });
      console.error("Error fetching expenses:", error);
    } finally {
      setLoadingExpenses(false);
    }
  };

  if (loading) {
    return <div className="container mx-auto px-4 py-8 text-center">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Your Dashboard</h1>
        <Button onClick={() => navigate('/trek-events/create')}>
          Create Trek Event
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Tabs defaultValue="upcoming" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="upcoming">Upcoming Treks</TabsTrigger>
              <TabsTrigger value="registered">Your Registrations</TabsTrigger>
              <TabsTrigger value="expenses">Your Expenses</TabsTrigger>
            </TabsList>
            
            <TabsContent value="upcoming">
              <Card>
                <CardHeader>
                  <CardTitle>Upcoming Trek Events</CardTitle>
                  <CardDescription>
                    Explore these upcoming trek events and join the adventure
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <UpcomingTreks limit={3} />
                  <div className="mt-4 text-center">
                    <Button variant="outline" onClick={() => navigate('/trek-events')}>
                      View All Trek Events
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="registered">
              <Card>
                <CardHeader>
                  <CardTitle>Your Registered Treks</CardTitle>
                  <CardDescription>
                    Manage your current trek registrations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loadingRegistrations ? (
                    <div className="text-center py-4">Loading your registrations...</div>
                  ) : registrations.length === 0 ? (
                    <div className="text-center py-4">
                      <p className="text-gray-500 mb-4">You haven't registered for any treks yet</p>
                      <Button onClick={() => navigate('/trek-events')}>
                        Explore Trek Events
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {registrations.map((reg) => (
                        <div 
                          key={reg.registration_id}
                          className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                          onClick={() => navigate(`/trek-events/${reg.trek.trek_id}`)}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-semibold">{reg.trek.trek_name}</h3>
                            <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                              {reg.payment_status}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600">
                            <p className="flex items-center">
                              <CalendarCheck className="h-4 w-4 mr-2" />
                              {new Date(reg.trek.start_datetime).toLocaleDateString()}
                            </p>
                            {reg.trek.category && (
                              <p className="mt-1">{reg.trek.category}</p>
                            )}
                          </div>
                          <div className="mt-3 flex justify-end">
                            <Button variant="ghost" size="sm" className="text-xs">
                              View Details <ArrowRight className="ml-1 h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="expenses">
              <Card>
                <CardHeader>
                  <CardTitle>Your Expenses</CardTitle>
                  <CardDescription>
                    Track expenses you've shared for treks
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loadingExpenses ? (
                    <div className="text-center py-4">Loading your expenses...</div>
                  ) : expenses.length === 0 ? (
                    <div className="text-center py-4">
                      <p className="text-gray-500 mb-4">You haven't added any expenses yet</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {expenses.map((expense) => (
                        <div 
                          key={expense.expense_id}
                          className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                          onClick={() => navigate(`/trek-events/${expense.trek_id}`)}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-semibold">{expense.description}</h3>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              expense.settlement_status === 'Settled' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {expense.settlement_status}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600">
                            <p className="flex items-center font-medium">
                              <IndianRupee className="h-4 w-4 mr-2" />
                              {formatCurrency(expense.amount)}
                            </p>
                            <p className="mt-1">Trek: {expense.trek_name}</p>
                            <p className="mt-1">Date: {new Date(expense.expense_date).toLocaleDateString()}</p>
                          </div>
                          <div className="mt-3 flex justify-end">
                            <Button variant="ghost" size="sm" className="text-xs">
                              View Details <ArrowRight className="ml-1 h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Your Profile</CardTitle>
              <CardDescription>
                Your personal information and preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center mb-6">
                <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center mb-4">
                  <UserCircle className="h-16 w-16 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold">
                  {userProfile?.full_name || user?.email}
                </h3>
                <p className="text-gray-500 text-sm">{user?.email}</p>
              </div>
              
              <div className="space-y-4">
                <Button variant="outline" className="w-full" onClick={() => navigate('/profile')}>
                  Edit Profile
                </Button>
                
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-2">Subscription Status</h4>
                  <p className="text-sm text-gray-600">
                    {userProfile?.subscription_type || "No active subscription"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
