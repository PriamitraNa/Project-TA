import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { NilaiService } from "../../../../services/Guru/nilai/NilaiService";

// Mock data untuk development (sebelum API ready)
const MOCK_DATA = [
  {
    id: 1,
    siswa_id: 1,
    nama_siswa: "Ahmad Fauzi",
    // LM1
    lm1_tp1: 85, lm1_tp2: 90, lm1_tp3: 88, lm1_tp4: 92,
    lm1_ulangan: 87,
    // LM2
    lm2_tp1: 78, lm2_tp2: 82, lm2_tp3: 80, lm2_tp4: 85,
    lm2_ulangan: 81,
    // LM3
    lm3_tp1: 90, lm3_tp2: 88, lm3_tp3: 92, lm3_tp4: 89,
    lm3_ulangan: 90,
    // LM4
    lm4_tp1: 82, lm4_tp2: 85, lm4_tp3: 83, lm4_tp4: 87,
    lm4_ulangan: 84,
    // LM5
    lm5_tp1: 88, lm5_tp2: 90, lm5_tp3: 85, lm5_tp4: 89,
    lm5_ulangan: 88,
    // Sumatif Akhir
    uts: 86,
    uas: 88
  },
  {
    id: 2,
    siswa_id: 2,
    nama_siswa: "Siti Aminah",
    // LM1
    lm1_tp1: 75, lm1_tp2: 78, lm1_tp3: 76, lm1_tp4: 80,
    lm1_ulangan: 77,
    // LM2
    lm2_tp1: 82, lm2_tp2: 85, lm2_tp3: 83, lm2_tp4: 87,
    lm2_ulangan: 84,
    // LM3
    lm3_tp1: 88, lm3_tp2: 90, lm3_tp3: 86, lm3_tp4: 89,
    lm3_ulangan: 88,
    // LM4
    lm4_tp1: 79, lm4_tp2: 82, lm4_tp3: 80, lm4_tp4: 84,
    lm4_ulangan: 81,
    // LM5
    lm5_tp1: 85, lm5_tp2: 87, lm5_tp3: 84, lm5_tp4: 88,
    lm5_ulangan: 86,
    // Sumatif Akhir
    uts: 83,
    uas: 85
  },
  {
    id: 3,
    siswa_id: 3,
    nama_siswa: "Budi Santoso",
    // LM1
    lm1_tp1: 65, lm1_tp2: 68, lm1_tp3: 70, lm1_tp4: 72,
    lm1_ulangan: 69,
    // LM2
    lm2_tp1: 70, lm2_tp2: 73, lm2_tp3: 71, lm2_tp4: 75,
    lm2_ulangan: 72,
    // LM3
    lm3_tp1: 75, lm3_tp2: 78, lm3_tp3: 76, lm3_tp4: 80,
    lm3_ulangan: 77,
    // LM4
    lm4_tp1: 68, lm4_tp2: 71, lm4_tp3: 69, lm4_tp4: 73,
    lm4_ulangan: 70,
    // LM5
    lm5_tp1: 72, lm5_tp2: 75, lm5_tp3: 73, lm5_tp4: 77,
    lm5_ulangan: 74,
    // Sumatif Akhir
    uts: 72,
    uas: 74
  },
  {
    id: 4,
    siswa_id: 4,
    nama_siswa: "Dewi Lestari",
    // LM1
    lm1_tp1: 92, lm1_tp2: 95, lm1_tp3: 93, lm1_tp4: 96,
    lm1_ulangan: 94,
    // LM2
    lm2_tp1: 88, lm2_tp2: 91, lm2_tp3: 89, lm2_tp4: 93,
    lm2_ulangan: 90,
    // LM3
    lm3_tp1: 95, lm3_tp2: 97, lm3_tp3: 94, lm3_tp4: 98,
    lm3_ulangan: 96,
    // LM4
    lm4_tp1: 90, lm4_tp2: 93, lm4_tp3: 91, lm4_tp4: 95,
    lm4_ulangan: 92,
    // LM5
    lm5_tp1: 93, lm5_tp2: 96, lm5_tp3: 94, lm5_tp4: 97,
    lm5_ulangan: 95,
    // Sumatif Akhir
    uts: 93,
    uas: 95
  },
  {
    id: 5,
    siswa_id: 5,
    nama_siswa: "Eko Prasetyo",
    // LM1
    lm1_tp1: 50, lm1_tp2: 55, lm1_tp3: 52, lm1_tp4: 58,
    lm1_ulangan: 54,
    // LM2
    lm2_tp1: 58, lm2_tp2: 62, lm2_tp3: 60, lm2_tp4: 65,
    lm2_ulangan: 61,
    // LM3
    lm3_tp1: 62, lm3_tp2: 65, lm3_tp3: 63, lm3_tp4: 68,
    lm3_ulangan: 65,
    // LM4
    lm4_tp1: 55, lm4_tp2: 59, lm4_tp3: 57, lm4_tp4: 62,
    lm4_ulangan: 58,
    // LM5
    lm5_tp1: 60, lm5_tp2: 64, lm5_tp3: 62, lm5_tp4: 67,
    lm5_ulangan: 63,
    // Sumatif Akhir
    uts: 60,
    uas: 62
  }
];

// Mock kelas data
const MOCK_KELAS = [
  { id: 1, nama_kelas: "5A", total_siswa: 25 },
  { id: 2, nama_kelas: "5B", total_siswa: 23 },
  { id: 3, nama_kelas: "6A", total_siswa: 27 }
];

// Mock mata pelajaran data
const MOCK_MAPEL = [
  { id: 1, nama_mapel: "Matematika" },
  { id: 2, nama_mapel: "Bahasa Indonesia" },
  { id: 3, nama_mapel: "IPA" },
  { id: 4, nama_mapel: "IPS" }
];

export function useNilai() {
    // State untuk filter
    const [selectedKelas, setSelectedKelas] = useState("");
    const [selectedMapel, setSelectedMapel] = useState("");
    const [kelasList, setKelasList] = useState([]);
    const [mapelList, setMapelList] = useState([]);

    // State untuk data nilai
    const [nilaiData, setNilaiData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // State untuk metadata (tahun ajaran & semester)
    const [tahunAjaranId, setTahunAjaranId] = useState(null);
    const [semester, setSemester] = useState(null);

    // State untuk track perubahan (manual save only)
    const [changedCells, setChangedCells] = useState(new Set());

    // Load dropdown data (kelas & mapel)
    useEffect(() => {
        loadDropdownData();
    }, []);

    // Load nilai data when filters change
    useEffect(() => {
        if (selectedKelas && selectedMapel) {
            loadNilaiData();
        } else {
            setNilaiData([]);
        }
    }, [selectedKelas, selectedMapel]); // eslint-disable-line react-hooks/exhaustive-deps

    // Load dropdown data
    const loadDropdownData = async () => {
        try {
            // Load kelas yang diampu guru
            const kelasResponse = await NilaiService.getKelas();
            if (kelasResponse.status === 'success') {
                setKelasList(kelasResponse.data);
            }
        } catch (error) {
            console.error('Error loading dropdown data:', error);
            if (error.response?.data?.message) {
                toast.error(error.response.data.message);
            } else {
                toast.error('Gagal memuat data kelas');
            }
        }
    };

    // Load nilai data
    const loadNilaiData = async () => {
        setIsLoading(true);
        try {
            const response = await NilaiService.getSiswa(selectedKelas, selectedMapel);
            if (response.status === 'success') {
                const { siswa, tahun_ajaran } = response.data;
                
                console.log('📊 Nilai Data from API:', siswa);
                console.log('✅ nilai_akhir included:', siswa?.[0]?.nilai_akhir !== undefined);
                
                // Store siswa data (nilai_akhir already included from API)
                setNilaiData(siswa || []);
                
                // Store metadata untuk auto-save
                if (tahun_ajaran) {
                    setTahunAjaranId(tahun_ajaran.tahun_ajaran_id);
                    setSemester(tahun_ajaran.semester);
                }
            }
        } catch (error) {
            console.error('Error loading nilai:', error);
            if (error.response?.data?.message) {
                toast.error(error.response.data.message);
            } else {
                toast.error('Gagal memuat data nilai');
            }
            setNilaiData([]);
        } finally {
            setIsLoading(false);
        }
    };

    // Calculate Rata Formatif (average of all TPs)
    const calculateRataFormatif = useCallback((row) => {
        const allTP = [
            row.lm1_tp1, row.lm1_tp2, row.lm1_tp3, row.lm1_tp4,
            row.lm2_tp1, row.lm2_tp2, row.lm2_tp3, row.lm2_tp4,
            row.lm3_tp1, row.lm3_tp2, row.lm3_tp3, row.lm3_tp4,
            row.lm4_tp1, row.lm4_tp2, row.lm4_tp3, row.lm4_tp4,
            row.lm5_tp1, row.lm5_tp2, row.lm5_tp3, row.lm5_tp4,
        ];
        
        const values = allTP.map(v => {
            if (v == null || v === '' || v === undefined) return 0;
            const parsed = parseFloat(v);
            return isNaN(parsed) ? 0 : parsed;
        });
        
        const hasAnyValue = allTP.some(v => v != null && v !== '' && v !== undefined && !isNaN(parseFloat(v)));
        if (!hasAnyValue) return null;
        
        const sum = values.reduce((acc, v) => acc + v, 0);
        return Math.round((sum / 20) * 100) / 100;
    }, []);

    // Calculate Rata Sumatif LM (average of all ulangan)
    const calculateRataSumatifLM = useCallback((row) => {
        const allUlangan = [
            row.lm1_ulangan,
            row.lm2_ulangan,
            row.lm3_ulangan,
            row.lm4_ulangan,
            row.lm5_ulangan
        ];
        
        const values = allUlangan.map(v => {
            if (v == null || v === '' || v === undefined) return 0;
            const parsed = parseFloat(v);
            return isNaN(parsed) ? 0 : parsed;
        });
        
        const hasAnyValue = allUlangan.some(v => v != null && v !== '' && v !== undefined && !isNaN(parseFloat(v)));
        if (!hasAnyValue) return null;
        
        const sum = values.reduce((acc, v) => acc + v, 0);
        return Math.round((sum / 5) * 100) / 100;
    }, []);

    // Calculate Nilai Akhir
    const calculateNilaiAkhir = useCallback((rataFormatif, rataSumatifLM, uts, uas) => {
        const hasAnyValue = 
            (rataFormatif != null && rataFormatif !== '') ||
            (rataSumatifLM != null && rataSumatifLM !== '') ||
            (uts != null && uts !== '') ||
            (uas != null && uas !== '');
        
        if (!hasAnyValue) return null;
        
        const formatifValue = (rataFormatif == null || rataFormatif === '') ? 0 : parseFloat(rataFormatif);
        const sumatifLMValue = (rataSumatifLM == null || rataSumatifLM === '') ? 0 : parseFloat(rataSumatifLM);
        const utsValue = (uts == null || uts === '') ? 0 : parseFloat(uts);
        const uasValue = (uas == null || uas === '') ? 0 : parseFloat(uas);
        
        const result = 
            (formatifValue * 0.4) + 
            (sumatifLMValue * 0.2) + 
            (utsValue * 0.2) + 
            (uasValue * 0.2);
        return Math.round(result * 100) / 100;
    }, []);

    // Get grade letter (A/B/C/D)
    const getGrade = useCallback((nilaiAkhir) => {
        if (nilaiAkhir == null) return '-';
        if (nilaiAkhir >= 85) return 'A';
        if (nilaiAkhir >= 70) return 'B';
        if (nilaiAkhir >= 55) return 'C';
        return 'D';
    }, []);

    // Handle cell change (no auto-save, manual only)
    const handleCellChange = useCallback((siswaId, field, value) => {
        setNilaiData(prevData => {
            const newData = prevData.map(row => {
                if (row.siswa_id === siswaId) {
                    return { ...row, [field]: value };
                }
                return row;
            });
            return newData;
        });

        // Track changed cell (for manual save)
        const cellKey = `${siswaId}-${field}`;
        setChangedCells(prev => new Set(prev).add(cellKey));
    }, []);


    // Manual save all (loop through changed cells)
    const handleSaveAll = async () => {
        if (!selectedKelas || !selectedMapel) {
            toast.error('Pilih kelas dan mata pelajaran terlebih dahulu');
            return;
        }

        if (changedCells.size === 0) {
            toast.success('Tidak ada perubahan untuk disimpan');
            return;
        }

        setIsSaving(true);
        
        try {
            // Save all changed cells one by one
            const changedCellsArray = Array.from(changedCells);
            let successCount = 0;
            let failedCount = 0;

            for (const cellKey of changedCellsArray) {
                const [siswaId, field] = cellKey.split('-');
                
                // Find the student data
                const siswa = nilaiData.find(s => s.siswa_id === parseInt(siswaId));
                if (!siswa) continue;

                try {
                    const payload = {
                        siswa_id: parseInt(siswaId),
                        kelas_id: parseInt(selectedKelas),
                        mapel_id: parseInt(selectedMapel),
                        tahun_ajaran_id: tahunAjaranId,
                        semester: semester,
                        field: field,
                        nilai: siswa[field]
                    };

                    await NilaiService.saveSingleCell(payload);
                    successCount++;
                } catch (err) {
                    console.error(`Error saving ${cellKey}:`, err);
                    failedCount++;
                }
            }

            // Show result
            if (failedCount === 0) {
                toast.success(`Semua nilai berhasil disimpan (${successCount} nilai)`);
                setChangedCells(new Set());
            } else {
                toast.error(`${successCount} nilai tersimpan, ${failedCount} gagal`);
            }
        } catch (error) {
            console.error('Error saving all nilai:', error);
            toast.error('Gagal menyimpan nilai');
        } finally {
            setIsSaving(false);
        }
    };

    // Handle kelas change
    const handleKelasChange = async (kelasId) => {
        setSelectedKelas(kelasId);
        setSelectedMapel(''); // Reset mapel
        setMapelList([]); // Clear mapel list
        setNilaiData([]);
        setChangedCells(new Set());

        // Load mata pelajaran untuk kelas ini (cascading)
        if (kelasId) {
            try {
                const response = await NilaiService.getMataPelajaran(kelasId);
                if (response.status === 'success') {
                    setMapelList(response.data);
                }
            } catch (error) {
                console.error('Error loading mata pelajaran:', error);
                if (error.response?.data?.message) {
                    toast.error(error.response.data.message);
                } else {
                    toast.error('Gagal memuat data mata pelajaran');
                }
                setMapelList([]);
            }
        }
    };

    // Handle mapel change
    const handleMapelChange = (mapelId) => {
        setSelectedMapel(mapelId);
        setNilaiData([]);
        setChangedCells(new Set());
    };


    return {
        // Filter state
        selectedKelas,
        selectedMapel,
        kelasList,
        mapelList,
        handleKelasChange,
        handleMapelChange,

        // Data state
        nilaiData,
        isLoading,
        isSaving,
        changedCells,

        // Handlers
        handleCellChange,
        handleSaveAll,

        // Calculations
        calculateRataFormatif,
        calculateRataSumatifLM,
        calculateNilaiAkhir,
        getGrade
    };
}

