
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { DairyRecord } from '../types/dairy';

// Database record type (matches Supabase schema)
interface DatabaseDairyRecord {
  id: string;
  date: string;
  customer_name: string;
  quantity: number | null;
  amount: number;
  payment_status: string;
  created_at?: string;
  updated_at?: string;
}

export const useDairyRecords = () => {
  const [records, setRecords] = useState<DairyRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Convert database record to app record format
  const mapDatabaseRecord = (dbRecord: DatabaseDairyRecord): DairyRecord => ({
    id: dbRecord.id,
    date: dbRecord.date,
    customerName: dbRecord.customer_name,
    quantity: dbRecord.quantity || 0,
    amount: dbRecord.amount,
    paymentStatus: dbRecord.payment_status as 'paid' | 'due',
    created_at: dbRecord.created_at,
    updated_at: dbRecord.updated_at
  });

  // Convert app record to database format
  const mapAppRecord = (appRecord: Omit<DairyRecord, 'id' | 'created_at' | 'updated_at'>) => ({
    date: appRecord.date,
    customer_name: appRecord.customerName,
    quantity: appRecord.quantity,
    amount: appRecord.amount,
    payment_status: appRecord.paymentStatus
  });

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('dairy_records')
        .select('*')
        .order('date', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const mappedRecords = (data || []).map(mapDatabaseRecord);
      setRecords(mappedRecords);
    } catch (err) {
      console.error('Error fetching records:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      toast.error('Failed to fetch records');
    } finally {
      setLoading(false);
    }
  };

  const addRecord = async (record: Omit<DairyRecord, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const dbRecord = mapAppRecord(record);
      const { data, error } = await supabase
        .from('dairy_records')
        .insert([dbRecord])
        .select()
        .single();

      if (error) throw error;
      
      const mappedRecord = mapDatabaseRecord(data);
      setRecords(prev => [mappedRecord, ...prev]);
      toast.success('रिकॉर्ड सेव हो गया! / Record saved!');
      return mappedRecord;
    } catch (err) {
      console.error('Error adding record:', err);
      toast.error('Failed to save record');
      throw err;
    }
  };

  const deleteRecord = async (id: string) => {
    try {
      const { error } = await supabase
        .from('dairy_records')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setRecords(prev => prev.filter(record => record.id !== id));
      toast.success('रिकॉर्ड डिलीट हो गया / Record deleted');
    } catch (err) {
      console.error('Error deleting record:', err);
      toast.error('Failed to delete record');
      throw err;
    }
  };

  const migrateFromLocalStorage = async () => {
    try {
      const savedRecords = localStorage.getItem('dairyRecords');
      if (!savedRecords) return;

      const localRecords = JSON.parse(savedRecords);
      if (!Array.isArray(localRecords) || localRecords.length === 0) return;

      console.log('Migrating', localRecords.length, 'records from localStorage');
      
      // Convert date format from DD/MM/YYYY to YYYY-MM-DD for database
      const recordsToMigrate = localRecords.map(record => {
        let formattedDate = record.date;
        
        // Check if date is in DD/MM/YYYY format and convert to YYYY-MM-DD
        if (record.date && record.date.includes('/')) {
          const [day, month, year] = record.date.split('/');
          formattedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        }
        
        return {
          date: formattedDate,
          customer_name: record.customerName,
          quantity: record.quantity || 0,
          amount: record.amount,
          payment_status: record.paymentStatus,
        };
      });

      const { data, error } = await supabase
        .from('dairy_records')
        .insert(recordsToMigrate)
        .select();

      if (error) throw error;

      console.log('Successfully migrated', data.length, 'records');
      localStorage.removeItem('dairyRecords');
      toast.success(`Migrated ${data.length} records to database`);
      
      await fetchRecords();
    } catch (err) {
      console.error('Error migrating data:', err);
      toast.error('Failed to migrate local data');
    }
  };

  useEffect(() => {
    fetchRecords();
    migrateFromLocalStorage();
  }, []);

  return {
    records,
    loading,
    error,
    addRecord,
    deleteRecord,
    refreshRecords: fetchRecords
  };
};
