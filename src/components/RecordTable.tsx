
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Trash2 } from 'lucide-react';
import { DairyRecord } from '../pages/Index';

interface RecordTableProps {
  records: DairyRecord[];
  onDelete: (id: string) => void;
}

export const RecordTable = ({ records, onDelete }: RecordTableProps) => {
  if (records.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      {records.map((record) => (
        <Card key={record.id} className="p-4">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold text-gray-800">{record.customerName}</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  record.paymentStatus === 'paid' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {record.paymentStatus === 'paid' ? 'Paid / दिया' : 'Due / बाकी'}
                </span>
              </div>
              
              <div className="grid grid-cols-3 gap-4 text-sm text-gray-600">
                <div>
                  <span className="block font-medium">Quantity</span>
                  <span>{record.quantity > 0 ? `${record.quantity}L` : '-'}</span>
                </div>
                <div>
                  <span className="block font-medium">Amount</span>
                  <span>₹{record.amount}</span>
                </div>
                <div>
                  <span className="block font-medium">Time</span>
                  <span>{new Date(record.timestamp).toLocaleTimeString('en-IN', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}</span>
                </div>
              </div>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(record.id)}
              className="ml-2 text-red-500 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
};
