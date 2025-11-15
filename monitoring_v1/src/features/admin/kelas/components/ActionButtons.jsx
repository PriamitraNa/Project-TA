import Button from '../../../../components/ui/Button';
import { FaCog, FaEdit, FaTrash } from 'react-icons/fa';

const ActionButtons = ({ 
    onKelola, 
    onEdit, 
    onDelete, 
    className = "flex gap-1 justify-center" 
}) => {
    return (
        <div className={className}>
            <Button
                variant="primary"
                size="sm"
                icon={<FaCog />}
                ariaLabel="Kelola"
                className="text-xs px-2 py-1 min-w-fit"
                onClick={onKelola}
            >
                Kelola
            </Button>
            <Button
                variant="secondary"
                size="sm"
                icon={<FaEdit />}
                ariaLabel="Edit"
                className="text-xs px-2 py-1 min-w-fit"
                onClick={onEdit}
            >
                Edit
            </Button>
            <Button
                variant="danger"
                size="sm"
                icon={<FaTrash />}
                ariaLabel="Hapus"
                className="text-xs px-2 py-1 min-w-fit"
                onClick={onDelete}
            >
                Hapus
            </Button>
        </div>
    );
};

export default ActionButtons;
