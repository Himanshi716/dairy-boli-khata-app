
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Customer {
  id: string;
  name: string;
  phone?: string;
  address?: string;
  created_at?: string;
  updated_at?: string;
}

export const useCustomers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('name');

      if (error) throw error;
      setCustomers(data || []);
    } catch (err) {
      console.error('Error fetching customers:', err);
      toast.error('Failed to fetch customers');
    } finally {
      setLoading(false);
    }
  };

  const addCustomer = async (name: string) => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .insert([{ name }])
        .select()
        .single();

      if (error) throw error;
      
      setCustomers(prev => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));
      return data;
    } catch (err) {
      console.error('Error adding customer:', err);
      if (err instanceof Error && err.message.includes('duplicate')) {
        toast.error('Customer already exists');
      } else {
        toast.error('Failed to add customer');
      }
      throw err;
    }
  };

  const migrateFromLocalStorage = async () => {
    try {
      const savedCustomers = localStorage.getItem('dairyCustomers');
      if (!savedCustomers) return;

      const localCustomers = JSON.parse(savedCustomers);
      if (!Array.isArray(localCustomers) || localCustomers.length === 0) return;

      console.log('Migrating customers from localStorage');
      
      const customersToMigrate = localCustomers.map(name => ({ name }));

      const { data, error } = await supabase
        .from('customers')
        .insert(customersToMigrate)
        .select();

      if (error && !error.message.includes('duplicate')) {
        throw error;
      }

      localStorage.removeItem('dairyCustomers');
      console.log('Successfully migrated customers');
      
      await fetchCustomers();
    } catch (err) {
      console.error('Error migrating customers:', err);
    }
  };

  useEffect(() => {
    fetchCustomers();
    migrateFromLocalStorage();
  }, []);

  return {
    customers,
    loading,
    addCustomer,
    refreshCustomers: fetchCustomers
  };
};
