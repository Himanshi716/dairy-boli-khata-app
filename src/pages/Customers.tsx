
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, User, TrendingUp, Calendar } from 'lucide-react';
import { DairyRecord } from './Index';

interface CustomerSummary {
  name: string;
  totalMilk: number;
  totalAmount: number;
  paidAmount: number;
  dueAmount: number;
  lastTransaction: string;
  transactionCount: number;
}

const Customers = () => {
  const [records, setRecords] = useState<DairyRecord[]>([]);
  const [customerSummaries, setCustomerSummaries] = useState<CustomerSummary[]>([]);

  useEffect(() => {
    const savedRecords = localStorage.getItem('dairyRecords');
    if (savedRecords) {
      const parsedRecords = JSON.parse(savedRecords);
      setRecords(parsedRecords);
      
      // Calculate customer summaries
      const summaries = calculateCustomerSummaries(parsedRecords);
      setCustomerSummaries(summaries);
    }
  }, []);

  const calculateCustomerSummaries = (records: DairyRecord[]): CustomerSummary[] => {
    const customerMap = new Map<string, CustomerSummary>();

    records.forEach(record => {
      const existing = customerMap.get(record.customerName) || {
        name: record.customerName,
        totalMilk: 0,
        totalAmount: 0,
        paidAmount: 0,
        dueAmount: 0,
        lastTransaction: record.date,
        transactionCount: 0
      };

      existing.totalMilk += record.quantity;
      existing.totalAmount += record.amount;
      existing.transactionCount += 1;

      if (record.paymentStatus === 'paid') {
        existing.paidAmount += record.amount;
      } else {
        existing.dueAmount += record.amount;
      }

      // Update last transaction date
      if (new Date(record.date) > new Date(existing.lastTransaction)) {
        existing.lastTransaction = record.date;
      }

      customerMap.set(record.customerName, existing);
    });

    return Array.from(customerMap.values()).sort((a, b) => b.totalAmount - a.totalAmount);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-green-50 p-4">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Link to="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back / वापस
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-orange-600">👥 Customers</h1>
          <div className="w-16"></div>
        </div>

        {/* Summary */}
        <Card className="p-4 bg-gradient-to-r from-blue-50 to-purple-50">
          <h2 className="text-lg font-semibold text-gray-800 mb-3 text-center">
            📊 Customer Overview / ग्राहक विवरण
          </h2>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-white p-3 rounded-lg shadow-sm">
              <div className="text-2xl font-bold text-blue-600">{customerSummaries.length}</div>
              <div className="text-xs text-gray-600">Total Customers</div>
            </div>
            <div className="bg-white p-3 rounded-lg shadow-sm">
              <div className="text-2xl font-bold text-green-600">
                {customerSummaries.filter(c => c.dueAmount === 0).length}
              </div>
              <div className="text-xs text-gray-600">Paid Up</div>
            </div>
            <div className="bg-white p-3 rounded-lg shadow-sm">
              <div className="text-2xl font-bold text-red-600">
                {customerSummaries.filter(c => c.dueAmount > 0).length}
              </div>
              <div className="text-xs text-gray-600">Have Dues</div>
            </div>
          </div>
        </Card>

        {/* Customer List */}
        <div className="space-y-3">
          {customerSummaries.map((customer) => (
            <Card key={customer.name} className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center">
                  <User className="h-5 w-5 text-gray-500 mr-2" />
                  <h3 className="font-semibold text-gray-800">{customer.name}</h3>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  customer.dueAmount === 0 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {customer.dueAmount === 0 ? 'Clear / साफ' : `₹${customer.dueAmount} Due`}
                </span>
              </div>
              
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="text-center">
                  <div className="font-semibold text-blue-600">{customer.totalMilk}L</div>
                  <div className="text-xs text-gray-600">Total Milk</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-purple-600">₹{customer.totalAmount}</div>
                  <div className="text-xs text-gray-600">Total Amount</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-orange-600">{customer.transactionCount}</div>
                  <div className="text-xs text-gray-600">Transactions</div>
                </div>
              </div>

              <div className="flex items-center justify-between mt-3 pt-3 border-t">
                <div className="flex items-center text-xs text-gray-500">
                  <Calendar className="h-3 w-3 mr-1" />
                  Last: {customer.lastTransaction}
                </div>
                <div className="text-xs">
                  <span className="text-green-600">₹{customer.paidAmount} paid</span>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {customerSummaries.length === 0 && (
          <Card className="p-8 text-center">
            <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">
              कोई ग्राहक नहीं मिला / No customers found
            </p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Customers;
