import { useState, useCallback, useMemo } from 'react';
import { ChatService } from '../../../../services/Guru/chat/ChatService';
import toast from 'react-hot-toast';

export function useSiswaList() {
  const [siswaList, setSiswaList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showOnlyNoConversation, setShowOnlyNoConversation] = useState(false);

  const loadSiswaList = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await ChatService.getSiswaList(searchQuery);
      setSiswaList(response.data || []);
    } catch (error) {
      console.error('Error loading siswa list:', error);
      if (error.response?.status === 404) {
        toast.error('Tidak ada siswa yang diampu');
        setSiswaList([]);
      } else {
        toast.error('Gagal memuat daftar siswa');
      }
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery]);

  const filteredSiswa = useMemo(() => {
    let filtered = siswaList;

    if (showOnlyNoConversation) {
      filtered = filtered.filter(s => !s.has_conversation);
    }

    return filtered;
  }, [siswaList, showOnlyNoConversation]);

  const handleSearch = useCallback((query) => {
    setSearchQuery(query);
  }, []);

  const toggleFilter = useCallback(() => {
    setShowOnlyNoConversation(prev => !prev);
  }, []);

  const resetSearch = useCallback(() => {
    setSearchQuery('');
  }, []);

  const siswaWithConversation = useMemo(() => {
    return siswaList.filter(s => s.has_conversation).length;
  }, [siswaList]);

  const siswaWithoutConversation = useMemo(() => {
    return siswaList.filter(s => !s.has_conversation).length;
  }, [siswaList]);

  return {
    siswaList: filteredSiswa,
    isLoading,
    searchQuery,
    showOnlyNoConversation,
    siswaWithConversation,
    siswaWithoutConversation,
    loadSiswaList,
    handleSearch,
    toggleFilter,
    resetSearch,
  };
}

