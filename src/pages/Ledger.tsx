
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RecordTable } from '../components/RecordTable';
import { ArrowLeft, Download, Calendar, Search, Filter } from 'lucide-react';
import { DairyRecord } from './Index';
import { toast } from 'sonner';

const Ledger = () => {
  const [records, setRecords] = useState<DairyRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<DairyRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('today');
  const [paymentFilter, setPaymentFilter] = useState('all');

  useEffect(() => {
    const savedRecords = localStorage.getItem('dairyRecords');
    if (savedRecords) {
      const parsedRecords = JSON.parse(savedRecords);
      setRecords(parsedRecords);
      setFilteredRecords(parsedRecords);
    }
  }, []);

  useEffect(() => {
    let filtered = [...records];

    // Date filter
    const today = new Date();
    const todayStr = today.toLocaleDateString('en-IN');

    switch (dateFilter) {
      case 'today':
        filtered = filtered.filter(record => record.date === todayStr);
        break;
      case 'last3days':
        const threeDaysAgo = new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000);
        filtered = filtered.filter(record => {
          const recordDate = new Date(record.date);
          return recordDate >= threeDaysAgo;
        });
        break;
      case 'thisweek':
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        filtered = filtered.filter(record => {
          const recordDate = new Date(record.date);
          return recordDate >= weekAgo;
        });
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

  const deleteRecord = (id: string) => {
    const updatedRecords = records.filter(record => record.id !== id);
    setRecords(updatedRecords);
    localStorage.setItem('dairyRecords', JSON.stringify(updatedRecords));
    toast.success('रिकॉर्ड डिलीट हो गया / Record deleted');
  };

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
        <Card className="p-4">
          <h2 className="text-lg font-semibold mb-4">🔍 Filters / फिल्टर</h2>
          
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
                    <SelectItem value="last3days">Last 3 Days / पिछले 3 दिन</SelectItem>
                    <SelectItem value="thisweek">This Week / इस सप्ताह</SelectItem>
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

        {/* Summary */}
        <Card className="p-4 bg-gradient-to-r from-green-50 to-orange-50">
          <h2 className="text-lg font-semibold text-gray-800 mb-3 text-center">
            📊 Summary / सारांश ({filteredRecords.length} records)
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
            <div className="bg-white p-2 rounded-lg shadow-sm">
              <div className="text-xl font-bold text-blue-600">{totalMilk}L</div>
              <div className="text-xs text-gray-600">Milk / दूध</div>
            </div>
            
            <div className="bg-white p-2 rounded-lg shadow-sm">
              <div className="text-xl font-bold text-purple-600">₹{totalMoney}</div>
              <div className="text-xs text-gray-600">Total / कुल</div>
            </div>
            
            <div className="bg-white p-2 rounded-lg shadow-sm">
              <div className="text-xl font-bold text-green-600">₹{paidAmount}</div>
              <div className="text-xs text-gray-600">Paid / मिला</div>
            </div>
            
            <div className="bg-white p-2 rounded-lg shadow-sm">
              <div className="text-xl font-bold text-red-600">₹{dueAmount}</div>
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
