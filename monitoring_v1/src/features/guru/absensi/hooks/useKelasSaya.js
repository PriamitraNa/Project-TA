// src/features/guru/absensi/hooks/useKelasSaya.js

import { useState, useEffect, useCallback } from 'react';
import { AbsensiService } from '../../../../services/Guru/absensi/AbsensiService';
import toast from 'react-hot-toast';

export const useKelasSaya = () => {
  const [kelasList, setKelasList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isWaliKelas, setIsWaliKelas] = useState(null);
  const [defaultKelasId, setDefaultKelasId] = useState(null);

  const loadKelas = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await AbsensiService.getKelasSaya();
      const kelas = response.data || [];
      
      setKelasList(kelas);
      
      // Auto-detect: Jika hanya 1 kelas → wali kelas
      setIsWaliKelas(kelas.length === 1 && kelas[0].role_guru === 'Wali Kelas');
      
      // Set default kelas_id (untuk wali kelas atau first kelas untuk guru mapel)
      if (kelas.length > 0) {
        setDefaultKelasId(kelas[0].kelas_id);
      }
    } catch (error) {
      console.error('Error loading kelas:', error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Gagal memuat data kelas');
      }
      setKelasList([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadKelas();
  }, [loadKelas]);

  return {
    kelasList,
    isLoading,
    isWaliKelas,
    defaultKelasId,
    loadKelas
  };
};

