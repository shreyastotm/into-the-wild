import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlusCircle, Trash2, IndianRupee } from 'lucide-react';
import { StepProps } from './types';

interface TrekCost {
  id?: number;
  cost_type: string;
  description: string;
  amount: number;
  url?: string;
  file_url?: string;
  pay_by_date?: string;
}

interface CostsStepProps extends StepProps {
  costs: TrekCost[];
  onCostsChange: (costs: TrekCost[]) => void;
  isLoadingExistingData?: boolean;
}

export const CostsStep: React.FC<CostsStepProps> = ({
  formData,
  setFormData,
  errors,
  costs,
  onCostsChange,
  isLoadingExistingData = false
}) => {
  const [newCost, setNewCost] = useState<Partial<TrekCost>>({
    cost_type: 'ACCOMMODATION',
    description: '',
    amount: 0,
    url: '',
    pay_by_date: ''
  });

  const costTypes = [
    { value: 'ACCOMMODATION', label: 'Accommodation' },
    { value: 'TICKETS', label: 'Tickets & Permits' },
    { value: 'LOCAL_VEHICLE', label: 'Local Vehicle' },
    { value: 'GUIDE', label: 'Guide Services' },
    { value: 'OTHER', label: 'Other' }
  ];

  const addCost = () => {
    if (!newCost.description?.trim() || !newCost.amount || newCost.amount <= 0) {
      return;
    }

    const cost: TrekCost = {
      cost_type: newCost.cost_type || 'OTHER',
      description: newCost.description.trim(),
      amount: newCost.amount,
      url: newCost.url?.trim() || undefined,
      pay_by_date: newCost.pay_by_date || undefined
    };

    onCostsChange([...costs, cost]);
    
    // Reset form
    setNewCost({
      cost_type: 'ACCOMMODATION',
      description: '',
      amount: 0,
      url: '',
      pay_by_date: ''
    });
  };

  const removeCost = (index: number) => {
    const updatedCosts = costs.filter((_, i) => i !== index);
    onCostsChange(updatedCosts);
  };

  const totalAmount = costs.reduce((sum, cost) => sum + cost.amount, 0);

  if (isLoadingExistingData) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        <span className="ml-2">Loading existing costs...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold">Fixed Costs</h3>
        <p className="text-sm text-muted-foreground">
          Add any fixed costs for this {formData.event_type?.toLowerCase()} (transportation, accommodation, etc.)
        </p>
      </div>

      {/* Add New Cost Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Add New Cost</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cost_type">Cost Type</Label>
              <Select 
                value={newCost.cost_type} 
                onValueChange={(value) => setNewCost({ ...newCost, cost_type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select cost type" />
                </SelectTrigger>
                <SelectContent>
                  {costTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount (₹)</Label>
              <Input
                id="amount"
                type="number"
                min="0"
                step="0.01"
                value={newCost.amount || ''}
                onChange={(e) => setNewCost({ ...newCost, amount: parseFloat(e.target.value) || 0 })}
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={newCost.description || ''}
              onChange={(e) => setNewCost({ ...newCost, description: e.target.value })}
              placeholder="Describe this cost item..."
              rows={2}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="url">Reference URL (optional)</Label>
              <Input
                id="url"
                type="url"
                value={newCost.url || ''}
                onChange={(e) => setNewCost({ ...newCost, url: e.target.value })}
                placeholder="https://..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pay_by_date">Payment Due Date (optional)</Label>
              <Input
                id="pay_by_date"
                type="date"
                value={newCost.pay_by_date || ''}
                onChange={(e) => setNewCost({ ...newCost, pay_by_date: e.target.value })}
              />
            </div>
          </div>

          <Button 
            onClick={addCost} 
            className="w-full"
            disabled={!newCost.description?.trim() || !newCost.amount || newCost.amount <= 0}
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Cost
          </Button>
        </CardContent>
      </Card>

      {/* Current Costs List */}
      {costs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center">
              <IndianRupee className="h-4 w-4 mr-2" />
              Current Costs ({costs.length} items)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {costs.map((cost, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-muted-foreground">{costTypes.find(t => t.value === cost.cost_type)?.label}</span>
                      <span className="text-lg font-semibold text-green-600">₹{cost.amount.toFixed(2)}</span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate" title={cost.description}>{cost.description}</p>
                    {cost.pay_by_date && (
                      <p className="text-xs text-blue-600">Due: {new Date(cost.pay_by_date).toLocaleDateString()}</p>
                    )}
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => removeCost(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t">
              <div className="flex justify-between items-center text-lg font-semibold">
                <span>Total Fixed Costs:</span>
                <span className="text-green-600">₹{totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {costs.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <IndianRupee className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No fixed costs added yet</p>
          <p className="text-sm">Add transportation, accommodation, or other fixed costs above</p>
        </div>
      )}
    </div>
  );
};
