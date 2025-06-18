
import { Card } from '@/components/ui/card';
import { DairyRecord } from '../types/dairy';

interface CustomerSummaryProps {
  customerName: string;
  records: DairyRecord[];
}

export const CustomerSummary = ({ customerName, records }: CustomerSummaryProps) => {
  const customerRecords = records.filter(r => r.customerName === customerName);
  
  const totalMilk = customerRecords
    .filter(r => r.quantity > 0)
    .reduce((sum, record) => sum + record.quantity, 0);
  
  const totalAmount = customerRecords.reduce((sum, record) => sum + record.amount, 0);
  
  const paidAmount = customerRecords
    .filter(r => r.paymentStatus === 'paid')
    .reduce((sum, record) => sum + record.amount, 0);
  
  const dueAmount = totalAmount - paidAmount;
  
  const absentDays = customerRecords.filter(r => r.quantity === 0 && r.amount === 0).length;

  return (
    <Card className="p-4">
      <h3 className="font-semibold text-lg mb-3">{customerName}</h3>
      
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{totalMilk.toFixed(1)}L</div>
          <div className="text-xs text-gray-600">Total Milk</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">₹{totalAmount}</div>
          <div className="text-xs text-gray-600">Total Amount</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">₹{paidAmount}</div>
          <div className="text-xs text-gray-600">Paid</div>
        </div>
        
        <div className="text-center">
          <div className={`text-2xl font-bold ${dueAmount > 0 ? 'text-red-600' : 'text-green-600'}`}>
            ₹{dueAmount}
          </div>
          <div className="text-xs text-gray-600">
            {dueAmount > 0 ? 'Due / बाकी' : 'Clear / साफ'}
          </div>
        </div>
      </div>

      {absentDays > 0 && (
        <div className="mt-3 p-2 bg-yellow-50 rounded-lg text-center">
          <span className="text-sm text-yellow-700">
            {absentDays} absent days / {absentDays} दिन गैरहाजिर
          </span>
        </div>
      )}
    </Card>
  );
};
