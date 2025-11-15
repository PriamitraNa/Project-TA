import { useState, useEffect, useCallback } from 'react';
import { CatatanService } from '../../../../services/Guru/catatan/CatatanService';
import toast from 'react-hot-toast';

export const useStatistikCatatan = () => {
  const [statistik, setStatistik] = useState({
    total: 0,
    positif: 0,
    negatif: 0,
    netral: 0
  });
  const [isLoading, setIsLoading] = useState(false);

  // Load statistik
  const loadStatistik = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await CatatanService.getStatistik();
      setStatistik(response.data);
    } catch (error) {
      console.error('Error loading statistik:', error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Gagal memuat statistik catatan');
      }
      // Keep default values on error
      setStatistik({
        total: 0,
        positif: 0,
        negatif: 0,
        netral: 0
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load on mount
  useEffect(() => {
    loadStatistik();
  }, [loadStatistik]);

  return {
    statistik,
    isLoadingStatistik: isLoading,
    refreshStatistik: loadStatistik
  };
};

