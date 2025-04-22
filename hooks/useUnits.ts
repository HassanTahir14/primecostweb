import { useState, useEffect } from 'react';
import api from '@/store/api';

interface Unit {
  unitOfMeasurementId: number;
  unitName: string;
  unitDescription: string;
}

export function useUnits() {
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUnits = async () => {
      try {
        const response = await api.get('/units-of-measurement/all');
        if (response.data?.unitsOfMeasurement) {
          setUnits(response.data.unitsOfMeasurement);
        }
      } catch (err) {
        setError('Failed to fetch units of measurement');
        console.error('Error fetching units:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUnits();
  }, []);

  return { units, loading, error };
} 