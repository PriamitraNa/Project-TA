import { useState, useEffect } from 'react';
import CustomModal from '../../../ui/CustomModal';
import Button from '../../../ui/Button';
import { FaStickyNote, FaSave, FaTimes, FaSmile, FaMeh, FaFrown } from 'react-icons/fa';
import { CatatanService } from '../../../../services/Guru/catatan/CatatanService';
import toast from 'react-hot-toast';

export default function TambahCatatanModal({ isOpen, onClose, onSuccess, editData = null }) {
  // Detect edit mode
  const isEditMode = editData !== null;
  
  // Form state
  const [formData, setFormData] = useState({
    siswa_id: '',
    kelas_id: '',
    kategori: '',
    jenis: '',
    mata_pelajaran_id: '',
    isi_catatan: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingKelas, setIsLoadingKelas] = useState(false);
  const [isLoadingSiswa, setIsLoadingSiswa] = useState(false);
  const [isLoadingMapel, setIsLoadingMapel] = useState(false);

  // Dropdown options
  const [kelasOptions, setKelasOptions] = useState([]);
  const [siswaOptions, setSiswaOptions] = useState([]);
  const [mataPelajaranOptions, setMataPelajaranOptions] = useState([]);

  // Static options
  const kategoriOptions = [
    { value: 'Positif', label: '😊 Positif', icon: FaSmile, color: 'text-green-600' },
    { value: 'Negatif', label: '☹️ Negatif', icon: FaFrown, color: 'text-red-600' },
    { value: 'Netral', label: '😐 Netral', icon: FaMeh, color: 'text-gray-600' }
  ];

  const jenisOptions = [
    { value: 'Akademik', label: 'Akademik' },
    { value: 'Perilaku', label: 'Perilaku' },
    { value: 'Kehadiran', label: 'Kehadiran' },
    { value: 'Prestasi', label: 'Prestasi' },
    { value: 'Lainnya', label: 'Lainnya' }
  ];

  // Reset form when modal opens OR populate form in edit mode
  useEffect(() => {
    if (isOpen) {
      if (isEditMode && editData) {
        // EDIT MODE: Populate form with editData
        populateFormForEdit(editData);
      } else {
        // ADD MODE: Reset form
        resetForm();
        loadDropdownOptions();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, isEditMode]);

  const resetForm = () => {
    setFormData({
      siswa_id: '',
      kelas_id: '',
      kategori: '',
      jenis: '',
      mata_pelajaran_id: '',
      isi_catatan: ''
    });
  };

  const populateFormForEdit = async (data) => {
    // Set form data immediately
    setFormData({
      siswa_id: data.siswa_id?.toString() || '',
      kelas_id: data.kelas_id?.toString() || '',
      kategori: data.kategori || '',
      jenis: data.jenis || '',
      mata_pelajaran_id: data.mapel_id?.toString() || '',
      isi_catatan: data.isi_catatan || ''
    });

    // Load all dropdown options
    await loadKelasOptions();
    
    // Load cascading dropdowns based on selected kelas
    if (data.kelas_id) {
      await loadSiswaOptions(data.kelas_id.toString());
      await loadMataPelajaranOptions(data.kelas_id.toString());
    }
  };

  const loadDropdownOptions = async () => {
    // Load kelas only (mata pelajaran will be loaded when kelas is selected)
    await loadKelasOptions();
  };

  const loadKelasOptions = async () => {
    setIsLoadingKelas(true);
    try {
      const response = await CatatanService.getKelas();
      const kelas = response.data || [];
      
      // Map to dropdown format
      const kelasDropdown = kelas.map(k => ({
        value: k.kelas_id.toString(),
        label: `${k.nama_kelas} (${k.total_siswa} siswa)`
      }));
      
      setKelasOptions(kelasDropdown);
    } catch (error) {
      console.error('Error loading kelas:', error);
      if (error.response?.status === 403) {
        toast.error('Anda tidak mengampu kelas apapun');
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Gagal memuat data kelas');
      }
      setKelasOptions([]);
    } finally {
      setIsLoadingKelas(false);
    }
  };

  const loadSiswaOptions = async (kelasId) => {
    if (!kelasId) {
      setSiswaOptions([]);
      return;
    }

    setIsLoadingSiswa(true);
    try {
      const response = await CatatanService.getSiswa(kelasId);
      const siswa = response.data || [];
      
      // Map to dropdown format
      const siswaDropdown = siswa.map(s => ({
        value: s.siswa_id.toString(),
        label: `${s.nama_lengkap} - ${s.nisn}`
      }));
      
      setSiswaOptions(siswaDropdown);
    } catch (error) {
      console.error('Error loading siswa:', error);
      if (error.response?.status === 400) {
        // Error 400: tidak ada siswa di kelas ini
        toast.error(error.response.data?.message || 'Tidak ada siswa di kelas ini');
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Gagal memuat data siswa');
      }
      setSiswaOptions([]);
    } finally {
      setIsLoadingSiswa(false);
    }
  };

  const loadMataPelajaranOptions = async (kelasId) => {
    if (!kelasId) {
      setMataPelajaranOptions([
        { value: '', label: '- (Tidak terkait mapel tertentu)' }
      ]);
      return;
    }

    setIsLoadingMapel(true);
    try {
      const response = await CatatanService.getMataPelajaran(kelasId);
      const mapel = response.data || [];
      
      // Map to dropdown format with empty option
      const mapelDropdown = [
        { value: '', label: '- (Tidak terkait mapel tertentu)' },
        ...mapel.map(m => ({
          value: m.mapel_id.toString(),
          label: m.nama_mapel
        }))
      ];
      
      setMataPelajaranOptions(mapelDropdown);
    } catch (error) {
      console.error('Error loading mata pelajaran:', error);
      if (error.response?.status === 400) {
        // Guru tidak mengajar mapel di kelas ini (hanya wali kelas)
        console.log(`Guru tidak mengajar mata pelajaran di kelas ${kelasId}`);
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Gagal memuat data mata pelajaran');
      }
      // Set default empty option even on error
      setMataPelajaranOptions([
        { value: '', label: '- (Tidak terkait mapel tertentu)' }
      ]);
    } finally {
      setIsLoadingMapel(false);
    }
  };

  // Handle input change
  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Cascading dropdown: when kelas changes, load siswa & mata pelajaran
    if (field === 'kelas_id') {
      // Reset siswa & mata pelajaran selection
      setFormData(prev => ({
        ...prev,
        siswa_id: '',
        mata_pelajaran_id: ''
      }));
      // Load siswa & mata pelajaran for selected kelas
      loadSiswaOptions(value);
      loadMataPelajaranOptions(value);
    }
  };

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.siswa_id) {
      toast.error('Pilih siswa terlebih dahulu');
      return;
    }
    if (!formData.kategori) {
      toast.error('Pilih kategori catatan');
      return;
    }
    if (!formData.jenis) {
      toast.error('Pilih jenis catatan');
      return;
    }
    if (!formData.isi_catatan.trim()) {
      toast.error('Isi catatan tidak boleh kosong');
      return;
    }
    
    if (formData.isi_catatan.trim().length < 10) {
      toast.error('Isi catatan minimal 10 karakter');
      return;
    }

    setIsLoading(true);
    try {
      // Prepare API payload
      const payload = {
        siswa_id: parseInt(formData.siswa_id),
        kelas_id: parseInt(formData.kelas_id),
        kategori: formData.kategori,
        jenis: formData.jenis,
        isi_catatan: formData.isi_catatan.trim()
      };
      
      // Add mapel_id if selected
      if (formData.mata_pelajaran_id) {
        payload.mapel_id = parseInt(formData.mata_pelajaran_id);
      }
      
      let response;
      if (isEditMode) {
        // UPDATE: Call PUT API
        response = await CatatanService.update(editData.id, payload);
        toast.success(response.message || 'Catatan berhasil diperbarui');
      } else {
        // CREATE: Call POST API
        response = await CatatanService.create(payload);
        toast.success(response.message || 'Catatan berhasil ditambahkan');
      }
      
      // Success
      resetForm();
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving catatan:', error);
      
      if (error.response?.status === 400) {
        // Validation errors
        toast.error(error.response.data?.message || 'Data tidak valid');
      } else if (error.response?.status === 403) {
        // Time limit exceeded
        toast.error('Waktu edit sudah habis. Catatan hanya dapat diedit dalam 15 menit setelah dibuat.');
      } else if (error.response?.status === 404) {
        toast.error('Catatan tidak ditemukan');
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error(isEditMode ? 'Gagal memperbarui catatan' : 'Gagal menambahkan catatan');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <CustomModal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? "Edit Catatan Siswa" : "Tambah Catatan Siswa"}
      description={isEditMode ? "Perbarui catatan perkembangan dan perilaku siswa" : "Catat perkembangan dan perilaku siswa"}
      icon={<FaStickyNote className="text-emerald-600 text-xl" />}
      size="2xl"
      isLoading={isLoading}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Row 1: Kelas & Siswa (2 columns) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Kelas Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Kelas <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.kelas_id}
              onChange={(e) => handleChange('kelas_id', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
              disabled={isEditMode || isLoadingKelas}
            >
              <option value="">
                {isLoadingKelas ? 'Memuat kelas...' : 'Pilih Kelas'}
              </option>
              {kelasOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {isEditMode && (
              <p className="text-xs text-blue-600 mt-1">
                Kelas tidak dapat diubah saat mengedit catatan
              </p>
            )}
            {!isEditMode && kelasOptions.length === 0 && !isLoadingKelas && (
              <p className="text-xs text-gray-500 mt-1">
                Tidak ada kelas tersedia
              </p>
            )}
          </div>

          {/* Siswa Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Siswa <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.siswa_id}
              onChange={(e) => handleChange('siswa_id', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
              disabled={isEditMode || !formData.kelas_id || isLoadingSiswa}
            >
              <option value="">
                {isLoadingSiswa 
                  ? 'Memuat siswa...' 
                  : !formData.kelas_id 
                    ? 'Pilih kelas terlebih dahulu' 
                    : 'Pilih Siswa'}
              </option>
              {siswaOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {isEditMode && (
              <p className="text-xs text-blue-600 mt-1">
                Siswa tidak dapat diubah saat mengedit catatan
              </p>
            )}
            {!isEditMode && !formData.kelas_id && (
              <p className="text-xs text-gray-500 mt-1">
                Pilih kelas untuk melihat daftar siswa
              </p>
            )}
            {!isEditMode && formData.kelas_id && siswaOptions.length === 0 && !isLoadingSiswa && (
              <p className="text-xs text-gray-500 mt-1">
                Tidak ada siswa di kelas ini
              </p>
            )}
          </div>
        </div>

        {/* Kategori Radio Buttons */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Kategori <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            {kategoriOptions.map(option => {
              const Icon = option.icon;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleChange('kategori', option.value)}
                  className={`flex items-center justify-center gap-2 px-3 py-2 border-2 rounded-lg transition-all text-sm font-medium ${
                    formData.kategori === option.value
                      ? option.value === 'Positif'
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : option.value === 'Negatif'
                        ? 'border-red-500 bg-red-50 text-red-700'
                        : 'border-gray-500 bg-gray-50 text-gray-700'
                      : 'border-gray-300 bg-white text-gray-600 hover:border-gray-400'
                  }`}
                >
                  <Icon className="text-base" />
                  <span>{option.value}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Row 2: Jenis & Mata Pelajaran (2 columns) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Jenis Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Jenis Catatan <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.jenis}
              onChange={(e) => handleChange('jenis', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            >
              <option value="">Pilih Jenis Catatan</option>
              {jenisOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Mata Pelajaran Dropdown (Optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mata Pelajaran <span className="text-gray-400 text-xs">(opsional)</span>
            </label>
            <select
              value={formData.mata_pelajaran_id}
              onChange={(e) => handleChange('mata_pelajaran_id', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              disabled={!formData.kelas_id || isLoadingMapel}
            >
              {isLoadingMapel ? (
                <option value="">Memuat mata pelajaran...</option>
              ) : !formData.kelas_id ? (
                <option value="">Pilih kelas terlebih dahulu</option>
              ) : (
                mataPelajaranOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))
              )}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Kosongkan jika tidak terkait mata pelajaran tertentu
            </p>
          </div>
        </div>

        {/* Isi Catatan Textarea */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Isi Catatan <span className="text-red-500">*</span>
          </label>
          <textarea
            value={formData.isi_catatan}
            onChange={(e) => handleChange('isi_catatan', e.target.value)}
            rows={4}
            placeholder="Tuliskan catatan tentang siswa..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
            minLength={10}
            required
          />
          <p className={`text-xs mt-1 ${formData.isi_catatan.length < 10 ? 'text-red-500' : 'text-gray-500'}`}>
            {formData.isi_catatan.length}/10 karakter minimum
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t">
          <Button
            type="button"
            variant="secondary"
            icon={<FaTimes />}
            onClick={onClose}
            disabled={isLoading}
            className="flex-1"
          >
            Batal
          </Button>
          <Button
            type="submit"
            variant="primary"
            icon={<FaSave />}
            loading={isLoading}
            disabled={isLoading}
            className="flex-1"
          >
            {isEditMode ? 'Perbarui Catatan' : 'Simpan Catatan'}
          </Button>
        </div>
      </form>
    </CustomModal>
  );
}

