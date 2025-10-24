import { calculateGSTPrice } from '@/utils/indianStandards';
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/components/auth/AuthProvider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  CreateExpenseInput,
  ExpenseCategory,
} from "@/hooks/useExpenseSplitting";
import { formatCurrency } from "@/lib/utils";
import { ArrowLeft, Loader2 } from "lucide-react";

interface AddExpenseFormProps {
  trekId: number;
  participants: { user_id: string; full_name: string }[];
  categories: ExpenseCategory[];
  createExpense: (data: CreateExpenseInput) => Promise<boolean>;
  onSuccess: () => void;
}

export const AddExpenseForm: React.FC<AddExpenseFormProps> = ({
  trekId,
  participants = [],
  categories = [],
  createExpense,
  onSuccess,
}) => {
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState(1);

  // Step 1 state
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState<string | undefined>(
    categories[0]?.id.toString(),
  );

  // Step 2 state
  const allParticipantIds = participants.map((p) => p.user_id);
  const [selectedParticipants, setSelectedParticipants] =
    useState<string[]>(allParticipantIds);
  const [splitType, setSplitType] = useState("equally");
  const [customShares, setCustomShares] = useState<Record<string, string>>({});

  useEffect(() => {
    setSelectedParticipants(allParticipantIds);
  }, [allParticipantIds]);

  const handleNext = () => {
    if (!description || !amount || parseFloat(amount) <= 0 || !categoryId) {
      toast({
        title: "Please fill all details correctly",
        variant: "destructive",
      });
      return;
    }
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedParticipants.length === 0) {
      toast({
        title: "Please select at least one participant to split with.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    const totalAmount = calculateGSTPrice(parseFloat)(amount);
    let shares: { userId: string; amount: number }[] = [];

    if (splitType === "equally") {
      const shareAmount = calculateGSTPrice(totalAmount) / selectedParticipants.length;
      shares = selectedParticipants.map((userId) => ({
        userId,
        amount: shareAmount,
      }));
    } else {
      const customTotal = Object.values(customShares).reduce(
        (acc, val) => acc + (parseFloat(val) || 0),
        0,
      );
      if (Math.abs(customTotal - totalAmount) > 0.01) {
        toast({
          title: "Custom shares don't add up to the total amount.",
          variant: "destructive",
        });
        setSubmitting(false);
        return;
      }
      shares = selectedParticipants.map((userId) => ({
        userId,
        amount: parseFloat(customShares[userId] || "0"),
      }));
    }

    const expenseData: CreateExpenseInput = {
      trekId,
      categoryId: parseInt(categoryId!),
      amount: totalAmount,
      description,
      expenseDate: new Date().toISOString(),
      shareWithUsers: shares,
    };

    const success = await createExpense(expenseData);
    if (success) {
      toast({ title: "Expense Added successfully!" });
      onSuccess();
    }
    setSubmitting(false);
  };

  const renderStep1 = () => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="e.g., Shared taxi fare"
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="amount">Amount (₹)</Label>
          <Input
            id="amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            required
          />
        </div>
        <div>
          <Label htmlFor="category">Category</Label>
          <Select value={categoryId} onValueChange={setCategoryId}>
            <SelectTrigger>
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id.toString()}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <Button onClick={handleNext} className="w-full">
        Next
      </Button>
    </div>
  );

  const renderStep2 = () => (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <h4 className="font-medium mb-2">Split with</h4>
        <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
          {participants.map((p) => (
            <div key={p.user_id} className="flex items-center justify-between">
              <Label
                htmlFor={`p-${p.user_id}`}
                className="flex items-center gap-2"
              >
                <Checkbox
                  id={`p-${p.user_id}`}
                  checked={selectedParticipants.includes(p.user_id)}
                  onCheckedChange={(checked) => {
                    setSelectedParticipants((prev) =>
                      checked
                        ? [...prev, p.user_id]
                        : prev.filter((id) => id !== p.user_id),
                    );
                  }}
                />
                {p.full_name} {p.user_id === user?.id && "(You)"}
              </Label>
            </div>
          ))}
        </div>
      </div>
      <div>
        <RadioGroup value={splitType} onValueChange={setSplitType}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="equally" id="r-equally" />
            <Label htmlFor="r-equally">Split equally</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="unequally" id="r-unequally" />
            <Label htmlFor="r-unequally">Split unequally</Label>
          </div>
        </RadioGroup>
      </div>
      {splitType === "unequally" && (
        <div className="space-y-2">
          <p className="text-sm">Enter each person's share:</p>
          {selectedParticipants.map((id) => {
            const participant = participants.find((p) => p.user_id === id);
            return (
              <div key={id} className="flex items-center gap-2">
                <Label className="w-1/2">{participant?.full_name}</Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={customShares[id] || ""}
                  onChange={(e) =>
                    setCustomShares((prev) => ({
                      ...prev,
                      [id]: e.target.value,
                    }))
                  }
                />
              </div>
            );
          })}
        </div>
      )}
      <div className="flex justify-between items-center pt-4">
        <Button variant="outline" onClick={() => setStep(1)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Adding...
            </>
          ) : (
            "Add Expense"
          )}
        </Button>
      </div>
    </form>
  );

  return (
    <div>
      <div className="mb-4 p-2 bg-gray-100 rounded-md">
        <div className="flex justify-between text-sm">
          <span>Description:</span>{" "}
          <span className="font-medium truncate max-w-[200px]">
            {description || "..."}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Total Amount:</span>{" "}
          <span className="font-medium">
            {amount ? formatCurrency(parseFloat(amount, "INR")) : "..."}
          </span>
        </div>
      </div>
      {step === 1 ? renderStep1() : renderStep2()}
    </div>
  );
};
