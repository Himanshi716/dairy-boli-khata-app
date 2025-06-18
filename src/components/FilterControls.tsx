
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter } from 'lucide-react';

interface FilterControlsProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  dateFilter: string;
  setDateFilter: (filter: string) => void;
  paymentFilter: string;
  setPaymentFilter: (filter: string) => void;
  recordCount: number;
}

export const FilterControls = ({
  searchTerm,
  setSearchTerm,
  dateFilter,
  setDateFilter,
  paymentFilter,
  setPaymentFilter,
  recordCount
}: FilterControlsProps) => {
  const currentDate = new Date();
  const currentMonth = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const lastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">🔍 Filters / फिल्टर</h2>
        <div className="text-sm text-gray-600">
          {recordCount} records / रिकॉर्ड
        </div>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Search Customer / ग्राहक खोजें</label>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Customer name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Date / तारीख</label>
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today / आज</SelectItem>
                <SelectItem value="yesterday">Yesterday / कल</SelectItem>
                <SelectItem value="last3days">Last 3 Days / पिछले 3 दिन</SelectItem>
                <SelectItem value="thisweek">This Week / इस सप्ताह</SelectItem>
                <SelectItem value="thismonth">{currentMonth}</SelectItem>
                <SelectItem value="lastmonth">{lastMonth}</SelectItem>
                <SelectItem value="all">All / सभी</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Payment / पेमेंट</label>
            <Select value={paymentFilter} onValueChange={setPaymentFilter}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All / सभी</SelectItem>
                <SelectItem value="paid">Paid / दिया</SelectItem>
                <SelectItem value="due">Due / बाकी</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </Card>
  );
};
