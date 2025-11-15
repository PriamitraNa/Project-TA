import absensiModel from '../../models/guru/absensiModel.js';

// Helper function to get today's date in WIB timezone (UTC+7)
const getTodayWIB = () => {
  const now = new Date();
  // Convert to WIB (UTC+7) by adding 7 hours in milliseconds
  const wibOffset = 7 * 60 * 60 * 1000;
  const wibTime = new Date(now.getTime() + wibOffset);
  return wibTime.toISOString().split('T')[0];
};

// Helper function to convert status to single character
const convertStatusToChar = (status) => {
  if (!status) return null;
  const statusMap = {
    'Hadir': 'H',
    'Sakit': 'S',
    'Izin': 'I',
    'Alpha': 'A'
  };
  return statusMap[status] || status;
};

// Helper function to convert single char to full status
const convertCharToStatus = (char) => {
  const charMap = {
    'H': 'Hadir',
    'S': 'Sakit',
    'I': 'Izin',
    'A': 'Alpha'
  };
  return charMap[char] || char;
};

// Helper function to format date to Indonesian format (DD/MM/YYYY)
const formatDateID = (dateString) => {
  if (!dateString) return null;
  const [year, month, day] = dateString.split('-');
  return `${day}/${month}/${year}`;
};

/**
 * Get daftar siswa dengan status absensi untuk tanggal tertentu
 * UPDATE: Support wali kelas & guru mapel
 */
export const getSiswaAbsensiService = async (tanggal, kelasId, guruId) => {
  try {
    // Validate inputs
    if (!tanggal) {
      throw new Error('Tanggal harus diisi');
    }

    // Convert ISO date to YYYY-MM-DD if needed
    let formattedTanggal = tanggal;
    if (tanggal.includes('T')) {
      // ISO format: "2024-05-31T17:00:00.000Z" -> "2024-05-31"
      formattedTanggal = tanggal.split('T')[0];
    }

  // Validate date format (YYYY-MM-DD)
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(formattedTanggal)) {
    throw new Error(`Format tanggal tidak valid. Received: "${tanggal}"`);
  }

  // Validate tanggal berada dalam range tahun ajaran aktif
  const tahunAjaran = await absensiModel.getDateRangeFromTahunAjaran();
  if (!tahunAjaran) {
    throw new Error('Tidak ada tahun ajaran aktif');
  }

  // Get today for validation (WIB timezone)
  const today = getTodayWIB();

  // Use tanggal from DB directly (already formatted as YYYY-MM-DD by MySQL DATE_FORMAT)
  const tanggalMulai = tahunAjaran.tanggal_mulai;
  const tanggalSelesai = tahunAjaran.tanggal_selesai;

  // Rule 1: Tanggal tidak boleh future (maksimal hari ini)
  if (formattedTanggal > today) {
    throw new Error('Tidak bisa input absensi untuk tanggal yang akan datang');
  }

  // Rule 2: Tanggal harus dalam range semester
  if (formattedTanggal < tanggalMulai || formattedTanggal > tanggalSelesai) {
    throw new Error(
      `Tanggal harus antara ${tanggalMulai} sampai ${tanggalSelesai}`
    );
  }

  // Rule 3: Semester belum dimulai
  if (today < tanggalMulai) {
    return {
      kelas: null,
      tanggal: formattedTanggal,
      semester_status: 'not_started',
      info_message: `Semester ${tahunAjaran.semester} ${tahunAjaran.tahun} belum dimulai. Semester akan dimulai pada ${formatDateID(tanggalMulai)}.`,
      statistics: {
        total: 0,
        hadir: 0,
        sakit: 0,
        izin: 0,
        alpha: 0,
        belum_dipilih: 0
      },
      siswa: []
    };
  }

  if (!guruId) {
    throw new Error('Guru ID tidak ditemukan');
  }

  let kelasInfo;
  let finalKelasId = kelasId;

  // Check if kelas_id provided
  if (kelasId) {
    // Validate kelas_id
    if (isNaN(kelasId)) {
      throw new Error('ID kelas tidak valid');
    }

    // Verify guru mengampu kelas ini (wali kelas atau guru mapel)
    kelasInfo = await absensiModel.getGuruRoleInKelas(kelasId, guruId);
    if (!kelasInfo) {
      throw new Error('Anda tidak mengajar di kelas ini');
    }
  } else {
    // No kelas_id provided, try to auto-detect for wali kelas
    kelasInfo = await absensiModel.getKelasWaliKelas(guruId);
    
    if (!kelasInfo) {
      // Bukan wali kelas, kelas_id wajib
      throw new Error('Parameter kelas_id wajib untuk guru mapel');
    }

    finalKelasId = kelasInfo.kelas_id;
  }

    // Get siswa dengan status absensi
    const siswaList = await absensiModel.getSiswaWithAbsensi(finalKelasId, formattedTanggal);

    // Format response dengan nomor urut dan convert status
    const formattedSiswa = siswaList.map((siswa, index) => ({
      no: index + 1,
      siswa_id: siswa.siswa_id,
      nisn: siswa.nisn,
      nama_siswa: siswa.nama_siswa,
      absensi_id: siswa.absensi_id,
      status: convertStatusToChar(siswa.status_absensi),
      sudah_absen: siswa.absensi_id ? true : false,
      input_by: siswa.input_by_guru_id
    }));

    // Calculate statistics
    const statistics = {
      total: formattedSiswa.length,
      hadir: formattedSiswa.filter(s => s.status === 'H').length,
      sakit: formattedSiswa.filter(s => s.status === 'S').length,
      izin: formattedSiswa.filter(s => s.status === 'I').length,
      alpha: formattedSiswa.filter(s => s.status === 'A').length,
      belum_dipilih: formattedSiswa.filter(s => !s.status).length
    };

    return {
      kelas: {
        kelas_id: finalKelasId,
        nama_kelas: kelasInfo.nama_kelas,
        tahun_ajaran: kelasInfo.tahun,
        semester: kelasInfo.semester,
        role_guru: kelasInfo.role_guru || 'Wali Kelas'
      },
      tanggal: formattedTanggal,
      statistics,
      siswa: formattedSiswa
    };
  } catch (error) {
    console.error('Error in getSiswaAbsensiService:', error);
    throw error;
  }
};

/**
 * Get daftar kelas yang diampu guru
 * Untuk dropdown (wali kelas = 1 kelas, guru mapel = multiple)
 */
export const getKelasSayaService = async (guruId) => {
  try {
    if (!guruId) {
      throw new Error('Guru ID tidak ditemukan');
    }

    const kelasList = await absensiModel.getKelasByGuru(guruId);

    // Return empty array instead of error for better UX
    if (!kelasList || kelasList.length === 0) {
      return {
        is_wali_kelas: false,
        kelas_list: [],
        message: 'Anda belum di-assign ke kelas manapun. Silakan hubungi admin.'
      };
    }

    // Format response
    const formattedKelas = kelasList.map(kelas => {
      let label;
      if (kelas.role_guru === 'Wali Kelas') {
        label = `${kelas.nama_kelas} (Wali Kelas)`;
      } else {
        // Guru Mapel
        const mapel = kelas.mata_pelajaran || 'Mapel';
        label = `${kelas.nama_kelas} (${mapel})`;
      }

      return {
        kelas_id: kelas.kelas_id,
        nama_kelas: kelas.nama_kelas,
        role_guru: kelas.role_guru,
        mata_pelajaran: kelas.mata_pelajaran,
        total_siswa: Number(kelas.total_siswa),
        label
      };
    });

    return formattedKelas;
  } catch (error) {
    console.error('Error in getKelasSayaService:', error);
    throw error;
  }
};

/**
 * Save/update absensi siswa
 * Hanya untuk wali kelas
 */
export const saveAbsensiService = async (tanggal, absensiData, guruId) => {
  try {
    // Validate inputs
    if (!tanggal) {
      throw new Error('Tanggal harus diisi');
    }

    // Convert ISO date to YYYY-MM-DD if needed
    let formattedTanggal = tanggal;
    if (tanggal.includes('T')) {
      formattedTanggal = tanggal.split('T')[0];
    }

  // Validate date format
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(formattedTanggal)) {
    throw new Error('Format tanggal tidak valid');
  }

  if (!absensiData || absensiData.length === 0) {
    throw new Error('Data absensi tidak boleh kosong');
  }

  if (!guruId) {
    throw new Error('Guru ID tidak ditemukan');
  }

  // Verify guru adalah wali kelas
  const kelasInfo = await absensiModel.getKelasWaliKelas(guruId);
  if (!kelasInfo) {
    throw new Error('Hanya wali kelas yang dapat input absensi');
  }

  // Validate tanggal berada dalam range tahun ajaran aktif
  const tahunAjaran = await absensiModel.getDateRangeFromTahunAjaran();
  if (!tahunAjaran) {
    throw new Error('Tidak ada tahun ajaran aktif');
  }

  // Get today for validation (WIB timezone)
  const today = getTodayWIB();

  // Use tanggal from DB directly (already formatted as YYYY-MM-DD by MySQL DATE_FORMAT)
  const tanggalMulai = tahunAjaran.tanggal_mulai;
  const tanggalSelesai = tahunAjaran.tanggal_selesai;

  // Rule 1: Semester belum dimulai
  if (today < tanggalMulai) {
    throw new Error(
      `Semester ${tahunAjaran.semester} ${tahunAjaran.tahun} belum dimulai. Semester akan dimulai pada ${formatDateID(tanggalMulai)}.`
    );
  }

  // Rule 2: Tanggal tidak boleh future (maksimal hari ini)
  if (formattedTanggal > today) {
    throw new Error('Tidak bisa menyimpan absensi untuk tanggal yang akan datang');
  }

  // Rule 3: Tanggal harus dalam range semester
  if (formattedTanggal < tanggalMulai || formattedTanggal > tanggalSelesai) {
    throw new Error(
      `Tanggal absensi harus antara ${tanggalMulai} sampai ${tanggalSelesai}`
    );
  }

    const kelasId = kelasInfo.kelas_id;

    // Validate status values
    const validStatuses = ['H', 'S', 'I', 'A'];
    const invalidStatuses = absensiData.filter(item => !validStatuses.includes(item.status));
    if (invalidStatuses.length > 0) {
      throw new Error('Status tidak valid. Harus: H, S, I, atau A');
    }

    // Check for belum dipilih (null)
    const belumDipilih = absensiData.filter(item => !item.status);
    if (belumDipilih.length > 0) {
      throw new Error(`Masih ada ${belumDipilih.length} siswa yang belum dipilih`);
    }

    // Verify all siswa ada di kelas
    for (const item of absensiData) {
      const exists = await absensiModel.verifySiswaInKelas(item.siswa_id, kelasId);
      if (!exists) {
        throw new Error(`Siswa dengan ID ${item.siswa_id} tidak ditemukan di kelas Anda`);
      }
    }

    // Save absensi
    let insertCount = 0;
    let updateCount = 0;

    for (const item of absensiData) {
      const fullStatus = convertCharToStatus(item.status);
      const result = await absensiModel.saveAbsensi(
        item.siswa_id,
        kelasId,
        formattedTanggal,
        fullStatus,
        guruId
      );

      // Check if INSERT or UPDATE
      if (result.affectedRows === 1) {
        insertCount++;
      } else if (result.affectedRows === 2) {
        updateCount++;
      }
    }

    // Calculate statistics
    const statistics = {
      hadir: absensiData.filter(s => s.status === 'H').length,
      sakit: absensiData.filter(s => s.status === 'S').length,
      izin: absensiData.filter(s => s.status === 'I').length,
      alpha: absensiData.filter(s => s.status === 'A').length
    };

    return {
      total_siswa: absensiData.length,
      inserted: insertCount,
      updated: updateCount,
      statistics,
      kelas: {
        kelas_id: kelasId,
        nama_kelas: kelasInfo.nama_kelas
      },
      tanggal: formattedTanggal
    };
  } catch (error) {
    console.error('Error in saveAbsensiService:', error);
    throw error;
  }
};

/**
 * Get rekap absensi untuk periode tertentu
 * Support wali kelas & guru mapel
 */
export const getRekapAbsensiService = async (tanggalMulai, tanggalAkhir, kelasId, guruId) => {
  try {
    // Validate inputs
    if (!tanggalMulai || !tanggalAkhir) {
      throw new Error('Tanggal mulai dan tanggal akhir harus diisi');
    }

    // Convert ISO date to YYYY-MM-DD if needed
    let formattedTanggalMulai = tanggalMulai;
    let formattedTanggalAkhir = tanggalAkhir;
    
    if (tanggalMulai.includes('T')) {
      formattedTanggalMulai = tanggalMulai.split('T')[0];
    }
    if (tanggalAkhir.includes('T')) {
      formattedTanggalAkhir = tanggalAkhir.split('T')[0];
    }

  // Validate date format
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(formattedTanggalMulai) || !dateRegex.test(formattedTanggalAkhir)) {
    throw new Error('Format tanggal tidak valid');
  }

  // Validate date range
  if (new Date(formattedTanggalMulai) > new Date(formattedTanggalAkhir)) {
    throw new Error('Tanggal mulai tidak boleh lebih besar dari tanggal akhir');
  }

  // Validate periode rekap harus dalam semester aktif
  // Reason: Guru hanya handle 1 semester, data reset saat siswa naik kelas
  const tahunAjaran = await absensiModel.getDateRangeFromTahunAjaran();
  if (!tahunAjaran) {
    throw new Error('Tidak ada tahun ajaran aktif');
  }

  // Get today for validation (WIB timezone)
  const today = getTodayWIB();

  // Use tanggal from DB directly (already formatted as YYYY-MM-DD by MySQL DATE_FORMAT)
  const semesterMulai = tahunAjaran.tanggal_mulai;
  const semesterSelesai = tahunAjaran.tanggal_selesai;

  // Rule 1: Periode harus dalam semester aktif
  if (formattedTanggalMulai < semesterMulai || formattedTanggalAkhir < semesterMulai) {
    throw new Error(
      `Periode rekap harus dalam semester aktif (${semesterMulai} sampai ${today})`
    );
  }

  // Rule 2: Tidak boleh melebihi tanggal selesai semester
  if (formattedTanggalMulai > semesterSelesai || formattedTanggalAkhir > semesterSelesai) {
    throw new Error(
      `Periode rekap tidak boleh melebihi tanggal selesai semester (${semesterSelesai})`
    );
  }

  // Rule 3: Tidak boleh future date (maksimal hari ini)
  if (formattedTanggalMulai > today || formattedTanggalAkhir > today) {
    throw new Error('Tidak bisa membuat rekap untuk tanggal yang akan datang');
  }

  if (!guruId) {
    throw new Error('Guru ID tidak ditemukan');
  }

    let kelasInfo;
    let finalKelasId = kelasId;

    // Check if kelas_id provided
    if (kelasId) {
      // Validate kelas_id
      if (isNaN(kelasId)) {
        throw new Error('ID kelas tidak valid');
      }

      // Verify guru mengampu kelas ini (wali kelas atau guru mapel)
      kelasInfo = await absensiModel.getGuruRoleInKelas(kelasId, guruId);
      if (!kelasInfo) {
        throw new Error('Anda tidak mengajar di kelas ini');
      }
    } else {
      // No kelas_id provided, try to auto-detect for wali kelas
      kelasInfo = await absensiModel.getKelasWaliKelas(guruId);
      
      if (!kelasInfo) {
        // Bukan wali kelas, kelas_id wajib
        throw new Error('Parameter kelas_id wajib untuk guru mapel');
      }

      finalKelasId = kelasInfo.kelas_id;
    }

    // Get rekap absensi
    const rekapData = await absensiModel.getRekapAbsensi(finalKelasId, formattedTanggalMulai, formattedTanggalAkhir);

    // Format response
    const totalPertemuan = rekapData.length > 0 ? Number(rekapData[0].total_pertemuan) : 0;

    const formattedData = rekapData.map((siswa, index) => ({
      no: index + 1,
      siswa_id: siswa.siswa_id,
      nisn: siswa.nisn,
      nama_siswa: siswa.nama_siswa,
      hadir: Number(siswa.hadir),
      sakit: Number(siswa.sakit),
      izin: Number(siswa.izin),
      alpha: Number(siswa.alpha),
      total_kehadiran: Number(siswa.total_kehadiran),
      persentase_kehadiran: totalPertemuan > 0 
        ? Math.round((Number(siswa.hadir) / totalPertemuan) * 100) 
        : 0
    }));

    // Calculate class statistics
    const totalSiswa = formattedData.length;
    const avgKehadiran = totalSiswa > 0
      ? Math.round(formattedData.reduce((sum, s) => sum + s.persentase_kehadiran, 0) / totalSiswa)
      : 0;

    // Calculate total from all students
    const totalHadir = formattedData.reduce((sum, s) => sum + s.hadir, 0);
    const totalSakit = formattedData.reduce((sum, s) => sum + s.sakit, 0);
    const totalIzin = formattedData.reduce((sum, s) => sum + s.izin, 0);
    const totalAlpha = formattedData.reduce((sum, s) => sum + s.alpha, 0);

    return {
      kelas: {
        kelas_id: finalKelasId,
        nama_kelas: kelasInfo.nama_kelas,
        tahun_ajaran: kelasInfo.tahun,
        semester: kelasInfo.semester,
        role_guru: kelasInfo.role_guru || 'Wali Kelas'
      },
      periode: {
        tanggal_mulai: formattedTanggalMulai,
        tanggal_akhir: formattedTanggalAkhir,
        total_pertemuan: totalPertemuan
      },
      statistik: {
        total_siswa: totalSiswa,
        rata_rata_kehadiran: avgKehadiran,
        total_hadir: totalHadir,
        total_sakit: totalSakit,
        total_izin: totalIzin,
        total_alpha: totalAlpha
      },
      rekap: formattedData
    };
  } catch (error) {
    console.error('Error in getRekapAbsensiService:', error);
    throw error;
  }
};

/**
 * Get date range yang tersedia untuk input absensi
 * Berdasarkan tanggal_mulai dan tanggal_selesai tahun ajaran aktif
 * + Semester status (not_started, active, ended)
 */
export const getDateRangeService = async () => {
  try {
    const tahunAjaran = await absensiModel.getDateRangeFromTahunAjaran();

    if (!tahunAjaran) {
      throw new Error('Tidak ada tahun ajaran aktif');
    }

    // Get today's date (WIB timezone)
    const today = getTodayWIB();

    // Use tanggal from DB directly (already formatted as YYYY-MM-DD by MySQL DATE_FORMAT)
    const tanggalMulai = tahunAjaran.tanggal_mulai;
    const tanggalSelesai = tahunAjaran.tanggal_selesai;

    // Determine semester status
    let semesterStatus = 'active';
    let infoMessage = null;

    if (today < tanggalMulai) {
      semesterStatus = 'not_started';
      infoMessage = `Semester ${tahunAjaran.semester} ${tahunAjaran.tahun} belum dimulai. Semester akan dimulai pada ${formatDateID(tanggalMulai)}.`;
    } else if (today > tanggalSelesai) {
      semesterStatus = 'ended';
      infoMessage = `Semester ${tahunAjaran.semester} ${tahunAjaran.tahun} telah berakhir pada ${formatDateID(tanggalSelesai)}. Anda masih bisa input absensi untuk tanggal dalam periode semester.`;
    }

    return {
      tahun_ajaran_id: tahunAjaran.tahun_ajaran_id,
      tahun_ajaran: tahunAjaran.tahun,
      semester: tahunAjaran.semester,
      tanggal_mulai: tanggalMulai,
      tanggal_selesai: tanggalSelesai,
      today: today,
      semester_status: semesterStatus,
      info_message: infoMessage
    };
  } catch (error) {
    console.error('Error in getDateRangeService:', error);
    throw error;
  }
};

export default {
  getSiswaAbsensiService,
  getKelasSayaService,
  saveAbsensiService,
  getRekapAbsensiService,
  getDateRangeService
};
