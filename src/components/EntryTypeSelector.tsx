
import { Button } from '@/components/ui/button';

interface EntryTypeSelectorProps {
  value: 'milk' | 'payment' | 'absent';
  onChange: (value: 'milk' | 'payment' | 'absent') => void;
}

export const EntryTypeSelector = ({ value, onChange }: EntryTypeSelectorProps) => {
  return (
    <div className="grid grid-cols-3 gap-2">
      <Button
        variant={value === 'milk' ? 'default' : 'outline'}
        onClick={() => onChange('milk')}
        className="flex-1 text-xs"
      >
        🥛 Milk Sale
      </Button>
      <Button
        variant={value === 'payment' ? 'default' : 'outline'}
        onClick={() => onChange('payment')}
        className="flex-1 text-xs"
      >
        💰 Payment
      </Button>
      <Button
        variant={value === 'absent' ? 'default' : 'outline'}
        onClick={() => onChange('absent')}
        className="flex-1 text-xs"
      >
        ❌ Absent
      </Button>
    </div>
  );
};
