
import { Card } from '@/components/ui/card';
import { DairyRecord } from '../types/dairy';

interface DailyTotalsProps {
  records: DairyRecord[];
}

export const DailyTotals = ({ records }: DailyTotalsProps) => {
  const totalMilk = records.reduce((sum, record) => sum + record.quantity, 0);
  const totalMoney = records.reduce((sum, record) => sum + record.amount, 0);
  const paidAmount = records.filter(r => r.paymentStatus === 'paid').reduce((sum, record) => sum + record.amount, 0);
  const dueAmount = records.filter(r => r.paymentStatus === 'due').reduce((sum, record) => sum + record.amount, 0);

  return (
    <Card className="p-4 bg-gradient-to-r from-green-50 to-orange-50">
      <h2 className="text-lg font-semibold text-gray-800 mb-3 text-center">
        📊 Today's Summary / आज का हिसाब
      </h2>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
        <div className="bg-white p-3 rounded-lg shadow-sm">
          <div className="text-2xl font-bold text-blue-600">{totalMilk}L</div>
          <div className="text-xs text-gray-600">Total Milk / कुल दूध</div>
        </div>
        
        <div className="bg-white p-3 rounded-lg shadow-sm">
          <div className="text-2xl font-bold text-purple-600">₹{totalMoney}</div>
          <div className="text-xs text-gray-600">Total Amount / कुल रकम</div>
        </div>
        
        <div className="bg-white p-3 rounded-lg shadow-sm">
          <div className="text-2xl font-bold text-green-600">₹{paidAmount}</div>
          <div className="text-xs text-gray-600">Paid / मिला</div>
        </div>
        
        <div className="bg-white p-3 rounded-lg shadow-sm">
          <div className="text-2xl font-bold text-red-600">₹{dueAmount}</div>
          <div className="text-xs text-gray-600">Due / बाकी</div>
        </div>
      </div>
    </Card>
  );
};
