import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { format } from 'date-fns';
import { 
  Receipt, 
  Plus, 
  Trash2, 
  CreditCard, 
  Calendar, 
  User, 
  DollarSign, 
  X,
  Check,
  ArrowRight,
  FileImage,
  Users,
  Car,
  MapPin
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/components/auth/AuthProvider';
import { useTrekCommunity } from '@/hooks/useTrekCommunity';
import { 
  useExpenseSplitting, 
  Expense, 
  ExpenseShare, 
  CreateExpenseInput 
} from '@/hooks/useExpenseSplitting';
import { formatCurrency } from '@/lib/utils';

interface ExpenseSplittingProps {
  trekId?: string;
  isAdmin?: boolean;
}

export const ExpenseSplitting: React.FC<ExpenseSplittingProps> = ({ 
  trekId: propTrekId,
  isAdmin = false
}) => {
  const { id: routeTrekId } = useParams<{ id: string }>();
  const actualTrekId = propTrekId || routeTrekId;
  const { user } = useAuth();
  const { participants } = useTrekCommunity(actualTrekId);
  
  const {
    expenses,
    myExpenses,
    expensesSharedWithMe,
    summary,
    loading,
    submitting,
    createExpense,
    updateExpenseShareStatus,
    deleteExpense,
    refreshExpenses
  } = useExpenseSplitting(actualTrekId);

  // Create expense form state
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [newExpenseForm, setNewExpenseForm] = useState({
    expenseType: '',
    amount: '',
    description: '',
    expenseDate: new Date().toISOString().substring(0, 10),
    receipt: null as File | null,
    splitMethod: 'equal' as 'equal' | 'custom',
  });
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
  const [customShares, setCustomShares] = useState<Record<string, string>>({});

  // Pay expense dialog state
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [selectedShare, setSelectedShare] = useState<{
    shareId: number;
    expenseId: number;
    amount: number;
    description: string;
    creatorName: string;
  } | null>(null);
  const [paymentMethod, setPaymentMethod] = useState('');

  // Reset form when dialog closes
  useEffect(() => {
    if (!showAddExpense) {
      setNewExpenseForm({
        expenseType: '',
        amount: '',
        description: '',
        expenseDate: new Date().toISOString().substring(0, 10),
        receipt: null,
        splitMethod: 'equal',
      });
      setSelectedParticipants([]);
      setCustomShares({});
    }
  }, [showAddExpense]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setNewExpenseForm(prev => ({
        ...prev,
        receipt: e.target.files![0]
      }));
    }
  };

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setNewExpenseForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const toggleParticipantSelection = (userId: string) => {
    setSelectedParticipants(prev => {
      if (prev.includes(userId)) {
        return prev.filter(id => id !== userId);
      } else {
        return [...prev, userId];
      }
    });
  };

  const handleCustomShareChange = (userId: string, value: string) => {
    setCustomShares(prev => ({
      ...prev,
      [userId]: value
    }));
  };

  const calculateEqualShares = (): Record<string, number> => {
    if (selectedParticipants.length === 0) return {};
    
    const totalAmount = parseFloat(newExpenseForm.amount || '0');
    if (isNaN(totalAmount) || totalAmount <= 0) return {};
    
    const shareAmount = totalAmount / (selectedParticipants.length + 1); // +1 for the user
    
    const shares: Record<string, number> = {
      [user?.id || '']: shareAmount,
    };
    
    selectedParticipants.forEach(userId => {
      shares[userId] = shareAmount;
    });
    
    return shares;
  };

  const validateCustomShares = (): { valid: boolean; shares: Record<string, number> } => {
    const totalAmount = parseFloat(newExpenseForm.amount || '0');
    if (isNaN(totalAmount) || totalAmount <= 0) {
      return { valid: false, shares: {} };
    }
    
    const shares: Record<string, number> = {};
    let sumShares = 0;
    
    // Process custom shares for selected participants
    selectedParticipants.forEach(userId => {
      const shareAmount = parseFloat(customShares[userId] || '0');
      if (isNaN(shareAmount) || shareAmount <= 0) {
        return;
      }
      shares[userId] = shareAmount;
      sumShares += shareAmount;
    });
    
    // Calculate what's left for the user
    const userShare = totalAmount - sumShares;
    if (userShare < 0) {
      return { valid: false, shares: {} }; // Shares exceed total
    }
    
    shares[user?.id || ''] = userShare;
    return { valid: true, shares };
  };

  const handleSubmitExpense = async () => {
    if (!user || !actualTrekId) return;
    
    const totalAmount = parseFloat(newExpenseForm.amount || '0');
    if (isNaN(totalAmount) || totalAmount <= 0) {
      toast({ 
        title: 'Invalid amount', 
        description: 'Please enter a valid expense amount', 
        variant: 'destructive' 
      });
      return;
    }
    
    if (!newExpenseForm.expenseType) {
      toast({ 
        title: 'Missing expense type', 
        description: 'Please select an expense type', 
        variant: 'destructive' 
      });
      return;
    }
    
    if (!newExpenseForm.description.trim()) {
      toast({ 
        title: 'Missing description', 
        description: 'Please provide a description for the expense', 
        variant: 'destructive' 
      });
      return;
    }
    
    if (selectedParticipants.length === 0) {
      toast({ 
        title: 'No participants selected', 
        description: 'Please select at least one participant to share the expense with', 
        variant: 'destructive' 
      });
      return;
    }
    
    let shares: Record<string, number> = {};
    
    if (newExpenseForm.splitMethod === 'equal') {
      shares = calculateEqualShares();
    } else {
      const result = validateCustomShares();
      if (!result.valid) {
        toast({ 
          title: 'Invalid shares', 
          description: 'The sum of shares must equal the total expense amount', 
          variant: 'destructive' 
        });
        return;
      }
      shares = result.shares;
    }
    
    // Filter out the user's own share
    const shareWithUsers = Object.entries(shares)
      .filter(([id]) => id !== user.id)
      .map(([userId, amount]) => ({ userId, amount }));
    
    const expenseData: CreateExpenseInput = {
      trekId: parseInt(actualTrekId),
      expenseType: newExpenseForm.expenseType,
      amount: totalAmount,
      description: newExpenseForm.description,
      expenseDate: newExpenseForm.expenseDate,
      receipt: newExpenseForm.receipt,
      shareWithUsers
    };
    
    const success = await createExpense(expenseData);
    if (success) {
      setShowAddExpense(false);
    }
  };

  const handleOpenPaymentDialog = (expenseId: number, shareId: number, amount: number, description: string, creatorName: string) => {
    setSelectedShare({
      shareId,
      expenseId,
      amount,
      description,
      creatorName
    });
    setShowPaymentDialog(true);
  };

  const handlePayExpense = async () => {
    if (!selectedShare) return;
    
    const success = await updateExpenseShareStatus(
      selectedShare.shareId, 
      'paid', 
      paymentMethod || 'Other'
    );
    
    if (success) {
      setShowPaymentDialog(false);
      setSelectedShare(null);
      setPaymentMethod('');
    }
  };

  const handleRejectExpense = async (shareId: number) => {
    await updateExpenseShareStatus(shareId, 'rejected');
  };

  const handleDeleteExpense = async (expenseId: number) => {
    if (confirm('Are you sure you want to delete this expense? This action cannot be undone.')) {
      await deleteExpense(expenseId);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending</Badge>;
      case 'paid':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Paid</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">Rejected</Badge>;
      default:
        return <Badge variant="outline" className="bg-gray-100 text-gray-800">Unknown</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-semibold">Expense Splitting</h3>
        </div>
        <div className="animate-pulse space-y-4">
          <div className="h-20 bg-gray-200 rounded-md"></div>
          <div className="h-64 bg-gray-200 rounded-md"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold flex items-center">
          <Receipt className="h-5 w-5 mr-2 text-primary" />
          Expense Splitting
        </h3>
        <Button 
          onClick={() => setShowAddExpense(true)} 
          size="sm" 
          className="gap-1"
        >
          <Plus className="h-4 w-4" /> Add Expense
        </Button>
      </div>

      {/* Expense Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">You are owed</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(summary.owedToMe)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">You owe</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600">{formatCurrency(summary.iOwe)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Your expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(summary.myExpenses)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Your shares</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(summary.myShares)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Expenses List */}
      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All Expenses ({expenses.length})</TabsTrigger>
          <TabsTrigger value="my-expenses">My Expenses ({myExpenses.length})</TabsTrigger>
          <TabsTrigger value="shared-with-me">Shared With Me ({expensesSharedWithMe.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="pt-4">
          {expenses.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Receipt className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No expenses found.</p>
              <Button 
                variant="outline" 
                className="mt-4" 
                onClick={() => setShowAddExpense(true)}
              >
                <Plus className="h-4 w-4 mr-2" /> Add your first expense
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {expenses.map(expense => (
                <ExpenseCard 
                  key={expense.id} 
                  expense={expense} 
                  currentUserId={user?.id || ''} 
                  onPayExpense={handleOpenPaymentDialog}
                  onRejectExpense={handleRejectExpense}
                  onDeleteExpense={handleDeleteExpense}
                />
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="my-expenses" className="pt-4">
          {myExpenses.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Receipt className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>You haven't created any expenses yet.</p>
              <Button 
                variant="outline" 
                className="mt-4" 
                onClick={() => setShowAddExpense(true)}
              >
                <Plus className="h-4 w-4 mr-2" /> Add expense
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {myExpenses.map(expense => (
                <ExpenseCard 
                  key={expense.id} 
                  expense={expense} 
                  currentUserId={user?.id || ''} 
                  onPayExpense={handleOpenPaymentDialog}
                  onRejectExpense={handleRejectExpense}
                  onDeleteExpense={handleDeleteExpense}
                />
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="shared-with-me" className="pt-4">
          {expensesSharedWithMe.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No expenses have been shared with you yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {expensesSharedWithMe.map(expense => (
                <ExpenseCard 
                  key={expense.id} 
                  expense={expense} 
                  currentUserId={user?.id || ''} 
                  onPayExpense={handleOpenPaymentDialog}
                  onRejectExpense={handleRejectExpense}
                  onDeleteExpense={handleDeleteExpense}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Add Expense Dialog */}
      <Dialog open={showAddExpense} onOpenChange={setShowAddExpense}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Expense</DialogTitle>
            <DialogDescription>
              Share expenses with other trek participants.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Basic Expense Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expenseType">Expense Type</Label>
                <Select 
                  name="expenseType" 
                  value={newExpenseForm.expenseType} 
                  onValueChange={value => setNewExpenseForm(prev => ({ ...prev, expenseType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select expense type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Food">Food</SelectItem>
                    <SelectItem value="Transport">Transport</SelectItem>
                    <SelectItem value="Accommodation">Accommodation</SelectItem>
                    <SelectItem value="Activities">Activities</SelectItem>
                    <SelectItem value="Equipment">Equipment</SelectItem>
                    <SelectItem value="Misc">Miscellaneous</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="amount">Amount (₹)</Label>
                <Input
                  id="amount"
                  name="amount"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={newExpenseForm.amount}
                  onChange={handleFormChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="expenseDate">Date</Label>
                <Input
                  id="expenseDate"
                  name="expenseDate"
                  type="date"
                  value={newExpenseForm.expenseDate}
                  onChange={handleFormChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="receipt">Receipt (Optional)</Label>
                <Input
                  id="receipt"
                  name="receipt"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </div>
              
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Describe the expense..."
                  value={newExpenseForm.description}
                  onChange={handleFormChange}
                  rows={2}
                />
              </div>
            </div>
            
            {/* Split Method Selection */}
            <div className="space-y-2">
              <Label>Split Method</Label>
              <div className="flex gap-4">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={newExpenseForm.splitMethod === 'equal'}
                    onChange={() => setNewExpenseForm(prev => ({ ...prev, splitMethod: 'equal' }))}
                    className="form-radio"
                  />
                  <span>Equal Split</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={newExpenseForm.splitMethod === 'custom'}
                    onChange={() => setNewExpenseForm(prev => ({ ...prev, splitMethod: 'custom' }))}
                    className="form-radio"
                  />
                  <span>Custom Split</span>
                </label>
              </div>
            </div>
            
            {/* Participant Selection */}
            <div className="space-y-2">
              <Label>Share With</Label>
              <div className="border rounded-md p-2 max-h-60 overflow-y-auto">
                {participants.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">No other participants found.</p>
                ) : (
                  <div className="space-y-2">
                    {participants
                      .filter(p => p.id !== user?.id)
                      .map(participant => (
                        <div key={participant.id} className="flex justify-between items-center p-2 hover:bg-muted rounded-sm">
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              id={`participant-${participant.id}`}
                              checked={selectedParticipants.includes(participant.id)}
                              onChange={() => toggleParticipantSelection(participant.id)}
                              className="form-checkbox h-4 w-4"
                            />
                            <label 
                              htmlFor={`participant-${participant.id}`}
                              className="flex items-center gap-2 cursor-pointer"
                            >
                              <Avatar className="h-6 w-6">
                                <AvatarImage src={participant.avatar || undefined} />
                                <AvatarFallback className="text-xs">
                                  {participant.name ? participant.name.substring(0, 2).toUpperCase() : 'U'}
                                </AvatarFallback>
                              </Avatar>
                              <span>{participant.name || 'Unknown User'}</span>
                            </label>
                          </div>
                          
                          {newExpenseForm.splitMethod === 'custom' && selectedParticipants.includes(participant.id) && (
                            <div className="flex items-center">
                              <span className="mr-2">₹</span>
                              <Input
                                type="number"
                                min="0"
                                step="0.01"
                                className="w-20 h-8"
                                value={customShares[participant.id] || ''}
                                onChange={e => handleCustomShareChange(participant.id, e.target.value)}
                              />
                            </div>
                          )}
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
            
            {/* Split Preview */}
            {selectedParticipants.length > 0 && (
              <div className="bg-muted p-4 rounded-md">
                <h4 className="font-medium mb-2">Split Preview</h4>
                <div className="space-y-2">
                  {newExpenseForm.amount && (
                    <>
                      <div className="flex justify-between">
                        <span className="flex items-center">
                          <User className="h-4 w-4 mr-1 text-primary" />
                          <span>You</span>
                        </span>
                        <span className="font-medium">
                          {newExpenseForm.splitMethod === 'equal' ? 
                            formatCurrency(parseFloat(newExpenseForm.amount) / (selectedParticipants.length + 1)) :
                            formatCurrency(parseFloat(newExpenseForm.amount) - selectedParticipants.reduce((sum, id) => sum + (parseFloat(customShares[id] || '0') || 0), 0))
                          }
                        </span>
                      </div>
                      
                      {selectedParticipants.map(userId => {
                        const participant = participants.find(p => p.id === userId);
                        return (
                          <div key={userId} className="flex justify-between">
                            <span>{participant?.name || 'Unknown User'}</span>
                            <span className="font-medium">
                              {newExpenseForm.splitMethod === 'equal' ? 
                                formatCurrency(parseFloat(newExpenseForm.amount) / (selectedParticipants.length + 1)) :
                                formatCurrency(parseFloat(customShares[userId] || '0') || 0)
                              }
                            </span>
                          </div>
                        );
                      })}
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddExpense(false)}>Cancel</Button>
            <Button 
              onClick={handleSubmitExpense} 
              disabled={submitting}
            >
              {submitting ? 'Adding...' : 'Add Expense'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payment Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Mark as Paid</DialogTitle>
            <DialogDescription>
              Record your payment for this expense.
            </DialogDescription>
          </DialogHeader>
          
          {selectedShare && (
            <div className="space-y-4 py-2">
              <div className="bg-muted p-3 rounded-md">
                <p className="text-sm text-muted-foreground">Expense</p>
                <p className="font-medium">{selectedShare.description}</p>
                <div className="flex justify-between mt-2">
                  <span className="text-sm text-muted-foreground">Added by {selectedShare.creatorName || 'Unknown'}</span>
                  <span className="font-bold">{formatCurrency(selectedShare.amount)}</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="paymentMethod">Payment Method</Label>
                <Select 
                  value={paymentMethod} 
                  onValueChange={setPaymentMethod}
                >
                  <SelectTrigger id="paymentMethod">
                    <SelectValue placeholder="How did you pay?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Cash">Cash</SelectItem>
                    <SelectItem value="UPI">UPI</SelectItem>
                    <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPaymentDialog(false)}>Cancel</Button>
            <Button 
              onClick={handlePayExpense} 
              disabled={!paymentMethod || submitting}
            >
              Mark as Paid
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

interface ExpenseCardProps {
  expense: Expense;
  currentUserId: string;
  onPayExpense: (expenseId: number, shareId: number, amount: number, description: string, creatorName: string) => void;
  onRejectExpense: (shareId: number) => void;
  onDeleteExpense: (expenseId: number) => void;
}

const ExpenseCard: React.FC<ExpenseCardProps> = ({ 
  expense, 
  currentUserId,
  onPayExpense,
  onRejectExpense,
  onDeleteExpense
}) => {
  const isCreator = expense.creator_id === currentUserId;
  const myShare = expense.shares.find(share => share.user_id === currentUserId);
  
  // Get expense icon based on type
  const getExpenseIcon = () => {
    switch (expense.expense_type.toLowerCase()) {
      case 'food':
        return <Receipt className="h-5 w-5 text-amber-500" />;
      case 'transport':
        return <Car className="h-5 w-5 text-blue-500" />;
      case 'accommodation':
        return <Buildings className="h-5 w-5 text-purple-500" />;
      case 'activities':
        return <MapPin className="h-5 w-5 text-green-500" />;
      case 'equipment':
        return <Package className="h-5 w-5 text-red-500" />;
      default:
        return <Receipt className="h-5 w-5 text-gray-500" />;
    }
  };
  
  // Status badge helper function
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending</Badge>;
      case 'paid':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Paid</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">Rejected</Badge>;
      default:
        return <Badge variant="outline" className="bg-gray-100 text-gray-800">Unknown</Badge>;
    }
  };
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between">
          <div className="flex items-start gap-2">
            <div className="mt-1">
              {getExpenseIcon()}
            </div>
            <div>
              <CardTitle className="text-base">{expense.description}</CardTitle>
              <CardDescription className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>{format(new Date(expense.expense_date), 'MMM d, yyyy')}</span>
                <span className="mx-1">•</span>
                <span>{expense.creator_name || 'Unknown'}</span>
              </CardDescription>
            </div>
          </div>
          <div className="text-right">
            <div className="font-bold">{formatCurrency(expense.amount)}</div>
            <div className="text-xs text-muted-foreground">{expense.expense_type}</div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pb-2">
        <div className="text-sm">
          <h4 className="font-medium mb-1">Split with</h4>
          <div className="space-y-1">
            {expense.shares.map(share => (
              <div key={share.id} className="flex justify-between items-center">
                <span className="flex items-center gap-1.5">
                  {share.user_id === currentUserId && (
                    <Badge variant="secondary" className="text-xs h-5">You</Badge>
                  )}
                  <span>{share.user_name || 'Unknown'}</span>
                </span>
                <div className="flex items-center gap-2">
                  {getStatusBadge(share.status)}
                  <span className="font-medium">{formatCurrency(share.amount)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {expense.receipt_url && (
          <div className="mt-2">
            <a 
              href={expense.receipt_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xs text-primary flex items-center hover:underline"
            >
              <FileImage className="h-3 w-3 mr-1" />
              View Receipt
            </a>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="pt-2 justify-between">
        {isCreator ? (
          <Button 
            variant="outline" 
            size="sm" 
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={() => onDeleteExpense(expense.id)}
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Delete
          </Button>
        ) : (
          <div></div> // Empty div to maintain layout with justify-between
        )}
        
        {myShare && myShare.status === 'pending' && !isCreator && (
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={() => onRejectExpense(myShare.id)}
            >
              <X className="h-4 w-4 mr-1" />
              Reject
            </Button>
            <Button 
              size="sm"
              className="bg-green-600 hover:bg-green-700 text-white"
              onClick={() => onPayExpense(
                expense.id, 
                myShare.id, 
                myShare.amount, 
                expense.description,
                expense.creator_name || 'Unknown'
              )}
            >
              <Check className="h-4 w-4 mr-1" />
              Pay
            </Button>
          </div>
        )}
      </CardFooter>
    </Card>
  );
};

// Missing icons from the import list
const Buildings = (props: any) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    {...props}
  >
    <rect width="8" height="12" x="3" y="8" rx="2" />
    <rect width="8" height="16" x="13" y="4" rx="2" />
    <path d="M5 21h14" />
  </svg>
);

const Package = (props: any) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    {...props}
  >
    <path d="m7.5 4.27 9 5.15" />
    <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
    <path d="m3.3 7 8.7 5 8.7-5" />
    <path d="M12 12v9" />
  </svg>
); 