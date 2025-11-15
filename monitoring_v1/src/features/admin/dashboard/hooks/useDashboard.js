import { useState, useEffect, useCallback } from 'react';
import { DashboardService } from '../../../../services/Admin/dashboard/DashboardService';
import toast from 'react-hot-toast';

const INITIAL_STATISTICS = {
  total_guru: 0,
  total_siswa: 0,
  total_ortu: 0,
};

const INITIAL_GENDER_DATA = [
  { name: "Laki-laki", value: 0 },
  { name: "Perempuan", value: 0 },
];

const ERROR_MESSAGES = {
  SUMMARY: 'Gagal memuat statistik ringkasan',
  GENDER: 'Gagal memuat data gender siswa',
  CLASS: 'Gagal memuat data siswa per kelas',
};

export const useDashboard = () => {
  const [statistics, setStatistics] = useState(INITIAL_STATISTICS);
  const [genderData, setGenderData] = useState([]);
  const [classData, setClassData] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [isLoadingGender, setIsLoadingGender] = useState(true);
  const [isLoadingClass, setIsLoadingClass] = useState(true);

  const loadSummary = useCallback(async () => {
    try {
      setIsLoadingStats(true);
      const response = await DashboardService.getSummary();
      
      if (response.status === 'success') {
        setStatistics({
          total_guru: response.data.total_guru || 0,
          total_siswa: response.data.total_siswa || 0,
          total_ortu: response.data.total_orangtua || 0,
        });
      }
    } catch (error) {
      console.error('Error loading summary:', error);
      toast.error(ERROR_MESSAGES.SUMMARY);
      setStatistics(INITIAL_STATISTICS);
    } finally {
      setIsLoadingStats(false);
    }
  }, []);

  const loadGenderData = useCallback(async () => {
    try {
      setIsLoadingGender(true);
      const response = await DashboardService.getSiswaGender();
      
      if (response.status === 'success') {
        const formattedData = [
          { name: "Laki-laki", value: response.data.laki_laki || 0 },
          { name: "Perempuan", value: response.data.perempuan || 0 },
        ];
        setGenderData(formattedData);
      }
    } catch (error) {
      console.error('Error loading gender data:', error);
      toast.error(ERROR_MESSAGES.GENDER);
      setGenderData(INITIAL_GENDER_DATA);
    } finally {
      setIsLoadingGender(false);
    }
  }, []);

  const loadClassData = useCallback(async () => {
    try {
      setIsLoadingClass(true);
      const response = await DashboardService.getSiswaPerKelas();
      
      if (response.status === 'success') {
        setClassData(response.data || []);
      }
    } catch (error) {
      console.error('Error loading class data:', error);
      toast.error(ERROR_MESSAGES.CLASS);
      setClassData([]);
    } finally {
      setIsLoadingClass(false);
    }
  }, []);

  const loadDashboardData = useCallback(async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        loadSummary(),
        loadGenderData(),
        loadClassData(),
      ]);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [loadSummary, loadGenderData, loadClassData]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  return {
    statistics,
    genderData,
    classData,
    isLoading,
    isLoadingStats,
    isLoadingGender,
    isLoadingClass,
    loadSummary,
    loadGenderData,
    loadClassData,
    loadDashboardData,
  };
};
