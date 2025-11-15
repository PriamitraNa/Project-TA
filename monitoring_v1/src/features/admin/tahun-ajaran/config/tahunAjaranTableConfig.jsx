import React from 'react';
import StatusBadge from '../components/StatusBadge';
import ActionButtons from '../components/ActionButtons';

// Table columns configuration
export const tableColumns = [
    { key: 'no', label: 'No', sortable: false },
    { key: 'tahun', label: 'Tahun Ajaran', sortable: false }, 
    { key: 'semester', label: 'Semester', sortable: false },
    { key: 'tanggal_mulai', label: 'Tanggal Mulai', sortable: false },
    { key: 'tanggal_selesai', label: 'Tanggal Selesai', sortable: false },
    { key: 'status', label: 'Status', sortable: false },
    { key: 'actions', label: 'Aksi', sortable: false }
];

// Create table data with proper formatting
export function createTableData(data, startIndex, handlers) {
    const { handleToggleStatus, handleDelete } = handlers;
    
    return data.map((item, index) => ({
        id: item.id,
        no: startIndex + index + 1,
        tahun: item.tahun,
        semester: item.semester,
        tanggal_mulai: item.tanggal_mulai,
        tanggal_selesai: item.tanggal_selesai,
        status: <StatusBadge status={item.status} />,
        actions: (
            <ActionButtons 
                item={item}
                onToggleStatus={handleToggleStatus}
                onDelete={handleDelete}
            />
        )
    }));
}
