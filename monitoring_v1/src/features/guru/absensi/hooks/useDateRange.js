// src/features/guru/absensi/hooks/useDateRange.js

import { useState, useEffect } from 'react';
import { AbsensiService } from '../../../../services/Guru/absensi/AbsensiService';
import toast from 'react-hot-toast';

export const useDateRange = () => {
  const [dateRange, setDateRange] = useState({
    tanggal_mulai: null,
    tanggal_berakhir: null,
    today: new Date().toISOString().split('T')[0],
    tahun_ajaran: null,
    semester: null,
    tahun_ajaran_id: null,
    semester_status: 'active', // Default 'active' to prevent flash of warning
    info_message: null
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDateRange = async () => {
      try {
        setIsLoading(true);
        const response = await AbsensiService.getDateRange();
        
        // Convert ISO timestamps to yyyy-MM-dd format (WIB timezone aware)
        const formatDate = (dateStr) => {
          if (!dateStr) return null;
          // If already in yyyy-MM-dd format, return as is
          if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
          
          // Convert ISO timestamp to yyyy-MM-dd with proper timezone handling
          // Create Date object from ISO string
          const date = new Date(dateStr);
          
          // Get date components in local timezone (WIB)
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          
          return `${year}-${month}-${day}`;
        };

        const tanggalMulai = formatDate(response.data.tanggal_mulai);
        const tanggalBerakhir = formatDate(response.data.tanggal_selesai); // API uses 'tanggal_selesai'
        const today = formatDate(response.data.today) || (() => {
          // Fallback: get current date in local timezone
          const now = new Date();
          const year = now.getFullYear();
          const month = String(now.getMonth() + 1).padStart(2, '0');
          const day = String(now.getDate()).padStart(2, '0');
          return `${year}-${month}-${day}`;
        })();
        
        // Get semester_status from API (new format) or fallback to old is_semester_aktif
        let semesterStatus = 'active'; // Default
        
        if (response.data.semester_status) {
          // New API format: "not_started" | "active" | "ended"
          semesterStatus = response.data.semester_status;
        } else if (response.data.is_semester_aktif !== undefined) {
          // Old API format fallback: boolean
          semesterStatus = response.data.is_semester_aktif ? 'active' : 'not_started';
        } else {
          // Frontend calculation fallback
          if (today < tanggalMulai) {
            semesterStatus = 'not_started';
          } else if (today > tanggalBerakhir) {
            semesterStatus = 'ended';
          } else {
            semesterStatus = 'active';
          }
        }
        
        const dateRangeData = {
          tanggal_mulai: tanggalMulai,
          tanggal_berakhir: tanggalBerakhir,
          today: today,
          tahun_ajaran: response.data.tahun_ajaran,
          semester: response.data.semester,
          tahun_ajaran_id: response.data.tahun_ajaran_id,
          semester_status: semesterStatus,
          info_message: response.data.info_message || null
        };
        
        console.log('📅 Date Range Loaded:', dateRangeData);
        console.log('🔍 Semester Status:', {
          today,
          tanggalMulai,
          tanggalBerakhir,
          semesterStatus,
          infoMessage: response.data.info_message,
          fromAPI: response.data.semester_status !== undefined
        });
        console.log('🌐 RAW API Response:', {
          tanggal_mulai_raw: response.data.tanggal_mulai,
          tanggal_selesai_raw: response.data.tanggal_selesai,
          today_raw: response.data.today
        });
        
        setDateRange(dateRangeData);
      } catch (error) {
        console.error('Error loading date range:', error);
        // Fallback to current date if API fails (WIB timezone)
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const today = `${year}-${month}-${day}`;
        
        setDateRange({
          tanggal_mulai: today,
          tanggal_berakhir: today,
          today: today,
          tahun_ajaran: null,
          semester: null,
          tahun_ajaran_id: null,
          semester_status: 'active', // Assume active on error
          info_message: null
        });
        toast.error('Gagal memuat periode tahun ajaran', { id: 'absensi-date-range-error' });
      } finally {
        setIsLoading(false);
      }
    };

    loadDateRange();
  }, []);

  return {
    dateRange,
    isLoading
  };
};

