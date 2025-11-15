// src/features/guru/absensi/hooks/useRekapAbsensi.js

import { useState, useCallback, useMemo } from 'react';
import { AbsensiService } from '../../../../services/Guru/absensi/AbsensiService';
import toast from 'react-hot-toast';

export const useRekapAbsensi = (kelasId) => {
  const [rekapData, setRekapData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [periode, setPeriode] = useState({
    start_date: null,
    end_date: null,
    total_pertemuan: 0
  });
  const [summary, setSummary] = useState({
    total_hadir: 0,
    total_sakit: 0,
    total_izin: 0,
    total_alpha: 0
  });

  // Load rekap data (with specific dates)
  const loadRekapData = useCallback(async (startDate, endDate) => {
    if (!kelasId) return;
    
    setIsLoading(true);
    try {
      const response = await AbsensiService.getRekapAbsensi(
        kelasId,
        startDate,
        endDate
      );
      
      // Map API response to frontend format
      const apiData = response.data;
      
      const rekapSiswa = apiData.rekap.map(siswa => ({
        siswa_id: siswa.siswa_id,
        nisn: siswa.nisn,
        nama_lengkap: siswa.nama_siswa,
        hadir: siswa.hadir,
        sakit: siswa.sakit,
        izin: siswa.izin,
        alpha: siswa.alpha,
        total_kehadiran: siswa.total_kehadiran,
        persentase_hadir: siswa.persentase_kehadiran
      }));
      
      setRekapData(rekapSiswa);
      
      // Set periode with total_pertemuan
      setPeriode({
        start_date: apiData.periode.tanggal_mulai,
        end_date: apiData.periode.tanggal_akhir,
        total_pertemuan: apiData.periode.total_pertemuan
      });
      
      // Set summary statistics from API response
      // Backend provides: total_hadir, total_sakit, total_izin, total_alpha
      const newSummary = {
        total_hadir: apiData.statistik.total_hadir || 0,
        total_sakit: apiData.statistik.total_sakit || 0,
        total_izin: apiData.statistik.total_izin || 0,
        total_alpha: apiData.statistik.total_alpha || 0
      };
      setSummary(newSummary);
    } catch (error) {
      console.error('Error loading rekap data:', error);
      
      // Suppress validation errors (already handled by HTML5 datepicker)
      const errorMessage = error.response?.data?.message || '';
      const isValidationError = errorMessage.toLowerCase().includes('tanggal') || 
                                errorMessage.toLowerCase().includes('periode');
      
      if (!isValidationError) {
        // Only show non-validation errors
        if (error.response?.data?.message) {
          toast.error(error.response.data.message);
        } else {
          toast.error('Gagal memuat rekap absensi');
        }
      } else {
        console.log('⚠️ Validation error suppressed:', errorMessage);
      }
      
      setRekapData([]);
      setSummary({
        total_hadir: 0,
        total_sakit: 0,
        total_izin: 0,
        total_alpha: 0
      });
    } finally {
      setIsLoading(false);
    }
  }, [kelasId]);

  // Don't auto-load on mount - wait for parent to set correct dates via updatePeriode
  // This prevents calling API with null/hardcoded dates before semester range is loaded
  // Data is loaded via updatePeriode() when parent sets correct start/end dates

  // Update periode and reload data
  const updatePeriode = useCallback((startDate, endDate) => {
    setPeriode(prev => ({
      ...prev,
      start_date: startDate,
      end_date: endDate
    }));
    loadRekapData(startDate, endDate);
  }, [loadRekapData]);

  // Rekap summary cards
  const rekapSummary = useMemo(() => {
    return {
      totalPertemuan: periode.total_pertemuan,
      totalHadir: summary.total_hadir,
      totalSakit: summary.total_sakit,
      totalIzin: summary.total_izin,
      totalAlpha: summary.total_alpha
    };
  }, [periode, summary]);

  return {
    rekapData,
    isLoading,
    periode,
    rekapSummary,
    updatePeriode,
    loadRekapData
  };
};

