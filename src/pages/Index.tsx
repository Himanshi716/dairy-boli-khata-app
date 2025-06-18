
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { VoiceInput } from '../components/VoiceInput';
import { RecordTable } from '../components/RecordTable';
import { CustomerSelect } from '../components/CustomerSelect';
import { DailyTotals } from '../components/DailyTotals';
import { EntryTypeSelector } from '../components/EntryTypeSelector';
import { DateFilter } from '../components/DateFilter';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BookOpen, Users, BarChart3 } from 'lucide-react';
import { toast } from 'sonner';
import { useDairyRecords } from '../hooks/useDairyRecords';
import { useCustomers } from '../hooks/useCustomers';
import { DairyRecord } from '../types/dairy';

const Index = () => {
  const { records, loading, addRecord, deleteRecord } = useDairyRecords();
  const { customers, addCustomer } = useCustomers();
  const [currentRecord, setCurrentRecord] = useState({
    customerName: '',
    quantity: '',
    amount: '',
    paymentStatus: 'due' as 'paid' | 'due'
  });
  const [entryType, setEntryType] = useState<'milk' | 'payment' | 'absent'>('milk');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isListening, setIsListening] = useState(false);

  const parseVoiceInput = (transcript: string): Partial<DairyRecord> | null => {
    console.log('Parsing voice input:', transcript);
    
    const text = transcript.toLowerCase().trim();
    
    const patterns = [
      /(\w+)\s*(?:ko|को)?\s*(\d+(?:\.\d+)?)\s*(?:litre|लीटर|liter)\s*(?:doodh|दूध|milk)?\s*(?:₹|rupees|रुपए|rs)?\s*(\d+)/i,
      /(\w+)\s*(\d+(?:\.\d+)?)\s*(?:litre|लीटर|liter)\s*(?:₹|rupees|रुपए|rs)?\s*(\d+)/i,
      /(\w+)\s*(?:₹|rupees|रुपए|rs)\s*(\d+)\s*(?:paid|दे दिया|दिया|pay)/i,
      /(\w+)\s*(?:₹|rupees|रुपए|rs)?\s*(\d+)\s*(?:remaining|बाकी|baaki|due)/i
    ];
    
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        const [, name, quantityOrAmount, amountOrStatus] = match;
        
        if (text.includes('paid') || text.includes('दे दिया') || text.includes('दिया')) {
          return {
            customerName: name.charAt(0).toUpperCase() + name.slice(1),
            quantity: 0,
            amount: parseInt(quantityOrAmount),
            paymentStatus: 'paid'
          };
        }
        
        if (text.includes('litre') || text.includes('लीटर') || text.includes('liter')) {
          return {
            customerName: name.charAt(0).toUpperCase() + name.slice(1),
            quantity: parseFloat(quantityOrAmount),
            amount: parseInt(amountOrStatus),
            paymentStatus: 'due'
          };
        }
        
        return {
          customerName: name.charAt(0).toUpperCase() + name.slice(1),
          quantity: parseFloat(quantityOrAmount) || 0,
          amount: parseInt(amountOrStatus),
          paymentStatus: 'due'
        };
      }
    }
    
    return null;
  };

  const handleVoiceResult = async (transcript: string) => {
    console.log('Voice result received:', transcript);
    const parsed = parseVoiceInput(transcript);
    
    if (parsed) {
      setCurrentRecord({
        customerName: parsed.customerName || '',
        quantity: parsed.quantity?.toString() || '',
        amount: parsed.amount?.toString() || '',
        paymentStatus: parsed.paymentStatus || 'due'
      });
      
      // Auto-detect entry type from voice
      if (transcript.toLowerCase().includes('absent') || transcript.toLowerCase().includes('गैरहाजिर')) {
        setEntryType('absent');
      } else if (transcript.toLowerCase().includes('paid') || transcript.toLowerCase().includes('दिया')) {
        setEntryType('payment');
      } else {
        setEntryType('milk');
      }
      
      if (parsed.customerName && !customers.find(c => c.name === parsed.customerName)) {
        try {
          await addCustomer(parsed.customerName);
        } catch (error) {
          // Customer might already exist, continue
        }
      }
      
      toast.success('रिकॉर्ड पार्स हो गया! / Record parsed successfully!');
    } else {
      toast.error('समझ नहीं आया। कृपया फिर से बोलें। / Could not understand. Please try again.');
    }
  };

  const handleAddRecord = async () => {
    if (!currentRecord.customerName) {
      toast.error('कृपया नाम भरें / Please fill customer name');
      return;
    }

    let quantity = 0;
    let amount = 0;
    let paymentStatus: 'paid' | 'due' = 'due';

    switch (entryType) {
      case 'milk':
        if (!currentRecord.quantity || !currentRecord.amount) {
          toast.error('कृपया दूध की मात्रा और रकम भरें / Please fill milk quantity and amount');
          return;
        }
        quantity = parseFloat(currentRecord.quantity);
        amount = parseFloat(currentRecord.amount);
        paymentStatus = currentRecord.paymentStatus;
        break;
      
      case 'payment':
        if (!currentRecord.amount) {
          toast.error('कृपया रकम भरें / Please fill payment amount');
          return;
        }
        quantity = 0;
        amount = parseFloat(currentRecord.amount);
        paymentStatus = 'paid';
        break;
      
      case 'absent':
        quantity = 0;
        amount = 0;
        paymentStatus = 'due';
        break;
    }

    if (amount > 1000 && entryType !== 'payment') {
      if (!confirm(`Large amount: ₹${amount}. Are you sure? / बड़ी रकम: ₹${amount}। क्या आप सुनिश्चित हैं?`)) {
        return;
      }
    }

    try {
      await addRecord({
        date: selectedDate.toISOString().split('T')[0],
        customerName: currentRecord.customerName,
        quantity: quantity,
        amount: amount,
        paymentStatus: paymentStatus
      });

      setCurrentRecord({
        customerName: '',
        quantity: '',
        amount: '',
        paymentStatus: 'due'
      });
    } catch (error) {
      // Error already handled in the hook
    }
  };

  const getSelectedDateRecords = () => {
    const dateStr = selectedDate.toISOString().split('T')[0];
    return records.filter(record => record.date === dateStr);
  };

  const customerNames = customers.map(c => c.name);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl">🥛</div>
          <div className="mt-2 text-gray-600">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-green-50 p-4">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <div className="text-center py-6">
          <h1 className="text-3xl font-bold text-orange-600 mb-2">
            🥛 Dairy Boli
          </h1>
          <p className="text-gray-600 text-sm">
            बोलो और रिकॉर्ड हो गया! / Speak and Record!
          </p>
        </div>

        {/* Quick Navigation */}
        <div className="grid grid-cols-3 gap-3">
          <Link to="/ledger">
            <Button variant="outline" className="w-full h-16 flex flex-col items-center justify-center">
              <BookOpen className="h-5 w-5 mb-1" />
              <span className="text-xs">Ledger / खाता</span>
            </Button>
          </Link>
          <Link to="/customers">
            <Button variant="outline" className="w-full h-16 flex flex-col items-center justify-center">
              <Users className="h-5 w-5 mb-1" />
              <span className="text-xs">Customers / ग्राहक</span>
            </Button>
          </Link>
          <Button variant="outline" className="w-full h-16 flex flex-col items-center justify-center" disabled>
            <BarChart3 className="h-5 w-5 mb-1" />
            <span className="text-xs">Reports / रिपोर्ट</span>
          </Button>
        </div>

        {/* Date Selection */}
        <Card className="p-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">
            📅 Select Date / तारीख चुनें
          </h2>
          <DateFilter selectedDate={selectedDate} onDateChange={setSelectedDate} />
        </Card>

        {/* Voice Input Section */}
        <Card className="p-6 border-2 border-orange-200">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 text-center">
            🎤 Voice Entry / आवाज़ से एंट्री
          </h2>
          <VoiceInput 
            onResult={handleVoiceResult}
            isListening={isListening}
            setIsListening={setIsListening}
          />
          <div className="mt-4 text-xs text-gray-500 text-center">
            <p>"Ram ko 5 litre ₹200" या "Sita 300 paid" या "Mohan absent" बोलें</p>
          </div>
        </Card>

        {/* Manual Entry Form */}
        <Card className="p-6 border-2 border-green-200">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            ✏️ Manual Entry / मैन्युअल एंट्री
          </h2>
          
          <div className="space-y-4">
            <div>
              <Label>Entry Type / एंट्री का प्रकार</Label>
              <EntryTypeSelector value={entryType} onChange={setEntryType} />
            </div>

            <div>
              <Label htmlFor="customer">Customer / ग्राहक</Label>
              <CustomerSelect
                customers={customerNames}
                value={currentRecord.customerName}
                onValueChange={(value) => setCurrentRecord(prev => ({...prev, customerName: value}))}
                onAddCustomer={async (name) => {
                  try {
                    await addCustomer(name);
                  } catch (error) {
                    // Error already handled in the hook
                  }
                }}
              />
            </div>

            {entryType === 'milk' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="quantity">Litres / लीटर</Label>
                  <Input
                    id="quantity"
                    type="number"
                    step="0.5"
                    value={currentRecord.quantity}
                    onChange={(e) => setCurrentRecord(prev => ({...prev, quantity: e.target.value}))}
                    placeholder="5"
                    className="text-lg"
                  />
                </div>
                <div>
                  <Label htmlFor="amount">Amount / रुपए</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={currentRecord.amount}
                    onChange={(e) => setCurrentRecord(prev => ({...prev, amount: e.target.value}))}
                    placeholder="200"
                    className="text-lg"
                  />
                </div>
              </div>
            )}

            {entryType === 'payment' && (
              <div>
                <Label htmlFor="payment-amount">Payment Amount / भुगतान राशि</Label>
                <Input
                  id="payment-amount"
                  type="number"
                  value={currentRecord.amount}
                  onChange={(e) => setCurrentRecord(prev => ({...prev, amount: e.target.value}))}
                  placeholder="500"
                  className="text-lg"
                />
              </div>
            )}

            {entryType === 'absent' && (
              <div className="p-4 bg-yellow-50 rounded-lg text-center">
                <p className="text-sm text-yellow-700">
                  मार्क करने के लिए केवल ग्राहक का नाम चुनें / Just select customer name to mark absent
                </p>
              </div>
            )}

            {entryType === 'milk' && (
              <div className="flex gap-4">
                <Button
                  variant={currentRecord.paymentStatus === 'due' ? 'default' : 'outline'}
                  onClick={() => setCurrentRecord(prev => ({...prev, paymentStatus: 'due'}))}
                  className="flex-1"
                >
                  Due / बाकी
                </Button>
                <Button
                  variant={currentRecord.paymentStatus === 'paid' ? 'default' : 'outline'}
                  onClick={() => setCurrentRecord(prev => ({...prev, paymentStatus: 'paid'}))}
                  className="flex-1"
                >
                  Paid / दिया
                </Button>
              </div>
            )}

            <Button onClick={handleAddRecord} className="w-full bg-orange-500 hover:bg-orange-600 text-lg py-3">
              Add Record / रिकॉर्ड जोड़ें
            </Button>
          </div>
        </Card>

        {/* Daily Totals */}
        <DailyTotals records={getSelectedDateRecords()} />

        {/* Selected Date Records */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            📋 Records for {selectedDate.toLocaleDateString('en-IN')} ({getSelectedDateRecords().length})
          </h2>
          <RecordTable 
            records={getSelectedDateRecords().slice(0, 5)} 
            onDelete={deleteRecord}
          />
          {getSelectedDateRecords().length === 0 && (
            <p className="text-gray-500 text-center py-4">
              कोई रिकॉर्ड नहीं / No records for this date
            </p>
          )}
          {getSelectedDateRecords().length > 5 && (
            <div className="text-center mt-4">
              <Link to="/ledger">
                <Button variant="outline" size="sm">
                  View All / सभी देखें ({getSelectedDateRecords().length})
                </Button>
              </Link>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Index;
