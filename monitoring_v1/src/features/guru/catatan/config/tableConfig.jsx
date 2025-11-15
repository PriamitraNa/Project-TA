import { FaSmile, FaMeh, FaFrown } from 'react-icons/fa';

/**
 * Table Column Configuration for Catatan
 */

// Badge component for kategori
export const KategoriBadge = ({ value }) => {
  const colors = {
    'Positif': 'bg-green-100 text-green-800',
    'Negatif': 'bg-red-100 text-red-800',
    'Netral': 'bg-gray-100 text-gray-800'
  };
  const icons = {
    'Positif': <FaSmile className="inline mr-1" />,
    'Negatif': <FaFrown className="inline mr-1" />,
    'Netral': <FaMeh className="inline mr-1" />
  };
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[value]}`}>
      {icons[value]}
      {value}
    </span>
  );
};

// Badge component for status
export const StatusBadge = ({ value }) => {
  const colors = {
    'Dibaca': 'bg-blue-100 text-blue-800',
    'Terkirim': 'bg-yellow-100 text-yellow-800'
  };
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[value]}`}>
      {value}
    </span>
  );
};

// Table columns definition
export const columns = [
  { 
    key: 'no', 
    label: 'No',
    sortable: false,
    className: 'w-12 text-center'
  },
  { 
    key: 'tanggal', 
    label: 'Tanggal',
    sortable: true,
    className: 'w-24 text-left'
  },
  { 
    key: 'siswa_nama', 
    label: 'Nama Siswa',
    sortable: true,
    className: 'w-32 text-left'
  },
  { 
    key: 'kelas', 
    label: 'Kelas',
    sortable: true,
    className: 'w-16 text-center'
  },
  { 
    key: 'kategori', 
    label: 'Kategori',
    sortable: true,
    className: 'w-24 text-center',
    render: (value) => <KategoriBadge value={value} />
  },
  { 
    key: 'jenis', 
    label: 'Jenis',
    sortable: true,
    className: 'w-20 text-center'
  },
  { 
    key: 'isi_preview', 
    label: 'Isi Catatan',
    sortable: false,
    className: 'text-left'
  },
  { 
    key: 'status', 
    label: 'Status',
    sortable: true,
    className: 'w-20 text-center',
    render: (value) => <StatusBadge value={value} />
  },
  { 
    key: 'actions', 
    label: 'Aksi',
    sortable: false,
    className: 'w-36 text-center'
  },
];

