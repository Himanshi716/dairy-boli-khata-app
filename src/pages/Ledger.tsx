import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RecordTable } from '../components/RecordTable';
import { FilterControls } from '../components/FilterControls';
import { ArrowLeft, Download } from 'lucide-react';
import { toast } from 'sonner';
import { useDairyRecords } from '../hooks/useDairyRecords';
import { DairyRecord } from '../types/dairy';

const Ledger = () => {
  const { records, loading, deleteRecord } = useDairyRecords();
  const [filteredRecords, setFilteredRecords] = useState<DairyRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('today');
  const [paymentFilter, setPaymentFilter] = useState('all');

  useEffect(() => {
    let filtered = [...records];

    // Date filter
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    switch (dateFilter) {
      case 'today':
        filtered = filtered.filter(record => record.date === todayStr);
        break;
      case 'yesterday':
        const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        filtered = filtered.filter(record => record.date === yesterdayStr);
        break;
      case 'last3days':
        const threeDaysAgo = new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000);
        const threeDaysAgoStr = threeDaysAgo.toISOString().split('T')[0];
        filtered = filtered.filter(record => record.date >= threeDaysAgoStr);
        break;
      case 'thisweek':
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        const weekAgoStr = weekAgo.toISOString().split('T')[0];
        filtered = filtered.filter(record => record.date >= weekAgoStr);
        break;
      case 'thismonth':
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const startOfMonthStr = startOfMonth.toISOString().split('T')[0];
        filtered = filtered.filter(record => record.date >= startOfMonthStr);
        break;
      case 'lastmonth':
        const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
        const startOfLastMonthStr = startOfLastMonth.toISOString().split('T')[0];
        const endOfLastMonthStr = endOfLastMonth.toISOString().split('T')[0];
        filtered = filtered.filter(record => 
          record.date >= startOfLastMonthStr && record.date <= endOfLastMonthStr
        );
        break;
    }

    // Payment status filter
    if (paymentFilter !== 'all') {
      filtered = filtered.filter(record => record.paymentStatus === paymentFilter);
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(record =>
        record.customerName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredRecords(filtered);
  }, [records, searchTerm, dateFilter, paymentFilter]);

  const exportData = () => {
    const dataStr = JSON.stringify(filteredRecords, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `dairy-records-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    toast.success('डेटा एक्सपोर्ट हो गया / Data exported successfully!');
  };

  const totalMilk = filteredRecords.reduce((sum, record) => sum + record.quantity, 0);
  const totalMoney = filteredRecords.reduce((sum, record) => sum + record.amount, 0);
  const paidAmount = filteredRecords.filter(r => r.paymentStatus === 'paid').reduce((sum, record) => sum + record.amount, 0);
  const dueAmount = filteredRecords.filter(r => r.paymentStatus === 'due').reduce((sum, record) => sum + record.amount, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl">📋</div>
          <div className="mt-2 text-gray-600">Loading ledger...</div>
        </div>
      </div>
    );
  }

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
          <h1 className="text-2xl font-bold text-orange-600">📋 Daily Ledger</h1>
          <Button onClick={exportData} variant="outline" size="sm">
            <Download className="h-4 w-4" />
          </Button>
        </div>

        {/* Filters */}
        <FilterControls
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          dateFilter={dateFilter}
          setDateFilter={setDateFilter}
          paymentFilter={paymentFilter}
          setPaymentFilter={setPaymentFilter}
          recordCount={filteredRecords.length}
        />

        {/* Summary */}
        <Card className="p-4 bg-gradient-to-r from-green-50 to-orange-50">
          <h2 className="text-lg font-semibold text-gray-800 mb-3 text-center">
            📊 Summary / सारांश ({filteredRecords.length} records)
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
            <div className="bg-white p-2 rounded-lg shadow-sm">
              <div className="text-xl font-bold text-blue-600">{totalMilk.toFixed(1)}L</div>
              <div className="text-xs text-gray-600">Milk / दूध</div>
            </div>
            
            <div className="bg-white p-2 rounded-lg shadow-sm">
              <div className="text-xl font-bold text-purple-600">₹{totalMoney.toFixed(0)}</div>
              <div className="text-xs text-gray-600">Total / कुल</div>
            </div>
            
            <div className="bg-white p-2 rounded-lg shadow-sm">
              <div className="text-xl font-bold text-green-600">₹{paidAmount.toFixed(0)}</div>
              <div className="text-xs text-gray-600">Paid / मिला</div>
            </div>
            
            <div className="bg-white p-2 rounded-lg shadow-sm">
              <div className="text-xl font-bold text-red-600">₹{dueAmount.toFixed(0)}</div>
              <div className="text-xs text-gray-600">Due / बाकी</div>
            </div>
          </div>
        </Card>

        {/* Records */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            📝 Records / रिकॉर्ड
          </h2>
          <RecordTable 
            records={filteredRecords} 
            onDelete={deleteRecord}
          />
          {filteredRecords.length === 0 && (
            <p className="text-gray-500 text-center py-4">
              कोई रिकॉर्ड नहीं मिला / No records found
            </p>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Ledger;
