
export interface DairyRecord {
  id: string;
  date: string;
  customerName: string;
  quantity: number;
  amount: number;
  paymentStatus: 'paid' | 'due';
  timestamp?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Customer {
  id: string;
  name: string;
  phone?: string;
  address?: string;
  created_at?: string;
  updated_at?: string;
}
