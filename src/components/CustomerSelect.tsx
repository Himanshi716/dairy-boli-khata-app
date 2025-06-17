
import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus } from 'lucide-react';

interface CustomerSelectProps {
  customers: string[];
  value: string;
  onValueChange: (value: string) => void;
  onAddCustomer: (name: string) => void;
}

export const CustomerSelect = ({ customers, value, onValueChange, onAddCustomer }: CustomerSelectProps) => {
  const [newCustomerName, setNewCustomerName] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleAddCustomer = () => {
    if (newCustomerName.trim()) {
      onAddCustomer(newCustomerName.trim());
      onValueChange(newCustomerName.trim());
      setNewCustomerName('');
      setIsDialogOpen(false);
    }
  };

  return (
    <div className="flex gap-2">
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className="flex-1">
          <SelectValue placeholder="Select customer / ग्राहक चुनें" />
        </SelectTrigger>
        <SelectContent>
          {customers.map((customer) => (
            <SelectItem key={customer} value={customer}>
              {customer}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="icon">
            <Plus className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Customer / नया ग्राहक जोड़ें</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Customer name / ग्राहक का नाम"
              value={newCustomerName}
              onChange={(e) => setNewCustomerName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddCustomer()}
            />
            <Button onClick={handleAddCustomer} className="w-full">
              Add Customer / ग्राहक जोड़ें
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
