
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';

interface DateFilterProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

export const DateFilter = ({ selectedDate, onDateChange }: DateFilterProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const quickDateOptions = [
    { label: 'Today / आज', days: 0 },
    { label: 'Yesterday / कल', days: -1 },
    { label: '3 Days Ago', days: -3 },
    { label: 'Week Ago', days: -7 },
  ];

  const handleQuickDate = (days: number) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    onDateChange(date);
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        {quickDateOptions.map((option) => (
          <Button
            key={option.days}
            variant="outline"
            size="sm"
            onClick={() => handleQuickDate(option.days)}
            className="text-xs"
          >
            {option.label}
          </Button>
        ))}
      </div>
      
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-full justify-start text-left font-normal">
            <CalendarIcon className="mr-2 h-4 w-4" />
            {format(selectedDate, 'PPP')}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => {
              if (date) {
                onDateChange(date);
                setIsOpen(false);
              }
            }}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};
