// src/features/guru/absensi/hooks/useAbsensi.js

import { useState, useEffect, useCallback, useMemo } from 'react';
import { AbsensiService } from '../../../../services/Guru/absensi/AbsensiService';
import toast from 'react-hot-toast';

export const useAbsensi = (kelasId, onAbsensiSaved = null) => {
  const [siswaData, setSiswaData] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditable, setIsEditable] = useState(true);

  // Load siswa and existing absensi for selected date
  const loadAbsensiData = useCallback(async () => {
    // Don't load if kelasId is not set yet
    if (!kelasId) {
      setSiswaData([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const response = await AbsensiService.getSiswaForAbsensi(selectedDate, kelasId);
      
      // Map API response to frontend format
      const siswaList = response.data.siswa.map(s => ({
        id: s.siswa_id,
        nisn: s.nisn,
        nama_lengkap: s.nama_siswa,
        status: s.status // H, S, I, A, atau null
      }));
      
      setSiswaData(siswaList);
      setIsEditable(true); // TODO: Get from API response if available
    } catch (error) {
      console.error('Error loading absensi data:', error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Gagal memuat data absensi');
      }
      setSiswaData([]);
    } finally {
      setIsLoading(false);
    }
  }, [kelasId, selectedDate]);

  // Load data when date changes (only if kelasId exists)
  useEffect(() => {
    if (kelasId) {
      loadAbsensiData();
    }
  }, [loadAbsensiData, kelasId]);

  // Handle status change for a student
  const handleStatusChange = useCallback((siswaId, newStatus) => {
    setSiswaData(prev => prev.map(siswa => 
      siswa.id === siswaId ? { ...siswa, status: newStatus } : siswa
    ));
  }, []);

  // Mark all students as present
  const handleMarkAllPresent = useCallback(() => {
    setSiswaData(prev => prev.map(siswa => ({ ...siswa, status: 'H' })));
    toast.success('Semua siswa ditandai hadir');
  }, []);

  // Save absensi
  const handleSaveAbsensi = useCallback(async () => {
    // Validate all students have status
    const emptyStatus = siswaData.filter(s => !s.status);
    if (emptyStatus.length > 0) {
      toast.error(`Masih ada ${emptyStatus.length} siswa yang belum diabsen`);
      return;
    }

    setIsSaving(true);
    try {
      const absensiData = siswaData.map(siswa => ({
        siswa_id: siswa.id,
        status: siswa.status
      }));

      const response = await AbsensiService.saveAbsensi(selectedDate, absensiData);
      toast.success(response.message || 'Absensi berhasil disimpan');
      
      // Reload data to get updated state
      await loadAbsensiData();
      
      // Trigger callback to reload rekap (if provided)
      if (onAbsensiSaved) {
        onAbsensiSaved();
      }
    } catch (error) {
      console.error('Error saving absensi:', error);
      toast.error(error.response?.data?.message || 'Gagal menyimpan absensi');
    } finally {
      setIsSaving(false);
    }
  }, [siswaData, selectedDate, loadAbsensiData, onAbsensiSaved]);

  // Calculate summary
  const summary = useMemo(() => {
    const total = siswaData.length;
    const hadir = siswaData.filter(s => s.status === 'H').length;
    const sakit = siswaData.filter(s => s.status === 'S').length;
    const izin = siswaData.filter(s => s.status === 'I').length;
    const alpha = siswaData.filter(s => s.status === 'A').length;
    const belum = total - (hadir + sakit + izin + alpha);
    
    return { total, hadir, sakit, izin, alpha, belum };
  }, [siswaData]);

  return {
    siswaData,
    selectedDate,
    setSelectedDate,
    isLoading,
    isSaving,
    isEditable,
    summary,
    handleStatusChange,
    handleMarkAllPresent,
    handleSaveAbsensi,
    loadAbsensiData
  };
};

