
-- Create dairy_records table to store all dairy transactions
CREATE TABLE public.dairy_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL,
  customer_name TEXT NOT NULL,
  quantity DECIMAL(10,2) DEFAULT 0,
  amount DECIMAL(10,2) NOT NULL,
  payment_status TEXT NOT NULL CHECK (payment_status IN ('paid', 'due')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create customers table for better customer management
CREATE TABLE public.customers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  phone TEXT,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX idx_dairy_records_date ON public.dairy_records(date);
CREATE INDEX idx_dairy_records_customer ON public.dairy_records(customer_name);
CREATE INDEX idx_dairy_records_payment_status ON public.dairy_records(payment_status);
CREATE INDEX idx_customers_name ON public.customers(name);

-- Enable Row Level Security (for future auth implementation)
ALTER TABLE public.dairy_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (can be restricted later with auth)
CREATE POLICY "Allow all operations on dairy_records" ON public.dairy_records
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on customers" ON public.customers
  FOR ALL USING (true) WITH CHECK (true);

-- Insert some default customers from the existing app
INSERT INTO public.customers (name) VALUES 
  ('Ram'),
  ('Sita'),
  ('Mohan'),
  ('Radha')
ON CONFLICT (name) DO NOTHING;
