import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { VoiceInput } from '../components/VoiceInput';
import { RecordTable } from '../components/RecordTable';
import { CustomerSelect } from '../components/CustomerSelect';
import { DailyTotals } from '../components/DailyTotals';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BookOpen, Users, BarChart3 } from 'lucide-react';
import { toast } from 'sonner';

export interface DairyRecord {
  id: string;
  date: string;
  customerName: string;
  quantity: number;
  amount: number;
  paymentStatus: 'paid' | 'due';
  timestamp: number;
}

const Index = () => {
  const [records, setRecords] = useState<DairyRecord[]>([]);
  const [customers, setCustomers] = useState<string[]>(['Ram', 'Sita', 'Mohan', 'Radha']);
  const [currentRecord, setCurrentRecord] = useState({
    customerName: '',
    quantity: '',
    amount: '',
    paymentStatus: 'due' as 'paid' | 'due'
  });
  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    const savedRecords = localStorage.getItem('dairyRecords');
    if (savedRecords) {
      setRecords(JSON.parse(savedRecords));
    }
    
    const savedCustomers = localStorage.getItem('dairyCustomers');
    if (savedCustomers) {
      setCustomers(JSON.parse(savedCustomers));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('dairyRecords', JSON.stringify(records));
  }, [records]);

  useEffect(() => {
    localStorage.setItem('dairyCustomers', JSON.stringify(customers));
  }, [customers]);

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

  const handleVoiceResult = (transcript: string) => {
    console.log('Voice result received:', transcript);
    const parsed = parseVoiceInput(transcript);
    
    if (parsed) {
      setCurrentRecord({
        customerName: parsed.customerName || '',
        quantity: parsed.quantity?.toString() || '',
        amount: parsed.amount?.toString() || '',
        paymentStatus: parsed.paymentStatus || 'due'
      });
      
      if (parsed.customerName && !customers.includes(parsed.customerName)) {
        setCustomers(prev => [...prev, parsed.customerName!]);
      }
      
      toast.success('रिकॉर्ड पार्स हो गया! / Record parsed successfully!');
    } else {
      toast.error('समझ नहीं आया। कृपया फिर से बोलें। / Could not understand. Please try again.');
    }
  };

  const addRecord = () => {
    if (!currentRecord.customerName || !currentRecord.amount) {
      toast.error('कृपया नाम और रकम भरें / Please fill name and amount');
      return;
    }

    // Enhanced validation
    const amount = parseFloat(currentRecord.amount);
    const quantity = parseFloat(currentRecord.quantity) || 0;

    if (amount > 1000) {
      if (!confirm(`Large amount: ₹${amount}. Are you sure? / बड़ी रकम: ₹${amount}। क्या आप सुनिश्चित हैं?`)) {
        return;
      }
    }

    if (quantity > 20) {
      if (!confirm(`Large quantity: ${quantity}L. Are you sure? / बड़ी मात्रा: ${quantity}L। क्या आप सुनिश्चित हैं?`)) {
        return;
      }
    }

    const newRecord: DairyRecord = {
      id: Date.now().toString(),
      date: new Date().toLocaleDateString('en-IN'),
      customerName: currentRecord.customerName,
      quantity: quantity,
      amount: amount,
      paymentStatus: currentRecord.paymentStatus,
      timestamp: Date.now()
    };

    setRecords(prev => [newRecord, ...prev]);
    setCurrentRecord({
      customerName: '',
      quantity: '',
      amount: '',
      paymentStatus: 'due'
    });
    
    toast.success('रिकॉर्ड सेव हो गया! / Record saved!');
  };

  const getTodaysRecords = () => {
    const today = new Date().toLocaleDateString('en-IN');
    return records.filter(record => record.date === today);
  };

  const deleteRecord = (id: string) => {
    setRecords(prev => prev.filter(record => record.id !== id));
    toast.success('रिकॉर्ड डिलीट हो गया / Record deleted');
  };

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
            <p>"Ram ko 5 litre ₹200" या "Sita 300 paid" बोलें</p>
          </div>
        </Card>

        {/* Manual Entry Form */}
        <Card className="p-6 border-2 border-green-200">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            ✏️ Manual Entry / मैन्युअल एंट्री
          </h2>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="customer">Customer / ग्राहक</Label>
              <CustomerSelect
                customers={customers}
                value={currentRecord.customerName}
                onValueChange={(value) => setCurrentRecord(prev => ({...prev, customerName: value}))}
                onAddCustomer={(name) => setCustomers(prev => [...prev, name])}
              />
            </div>

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

            <Button onClick={addRecord} className="w-full bg-orange-500 hover:bg-orange-600 text-lg py-3">
              Add Record / रिकॉर्ड जोड़ें
            </Button>
          </div>
        </Card>

        {/* Daily Totals */}
        <DailyTotals records={getTodaysRecords()} />

        {/* Today's Records */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            📋 Today's Records / आज के रिकॉर्ड ({getTodaysRecords().length})
          </h2>
          <RecordTable 
            records={getTodaysRecords().slice(0, 5)} 
            onDelete={deleteRecord}
          />
          {getTodaysRecords().length === 0 && (
            <p className="text-gray-500 text-center py-4">
              कोई रिकॉर्ड नहीं / No records today
            </p>
          )}
          {getTodaysRecords().length > 5 && (
            <div className="text-center mt-4">
              <Link to="/ledger">
                <Button variant="outline" size="sm">
                  View All / सभी देखें ({getTodaysRecords().length})
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
