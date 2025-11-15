import PropTypes from 'prop-types';
import Button from "../../../../components/ui/Button";
import { FaTrash } from "react-icons/fa";
import { IoCheckmarkCircle } from "react-icons/io5";

export default function ActionButtons({ item, onToggleStatus, onDelete }) {
    return (
        <div className="flex gap-2">
            <Button
                variant={item.status === 'aktif' ? 'secondary' : 'primary'}
                size="sm"
                icon={<IoCheckmarkCircle />}
                onClick={() => onToggleStatus(item.id)}
                ariaLabel={item.status === 'aktif' ? 'Nonaktifkan' : 'Aktifkan'}
                title={item.status === 'aktif' 
                    ? 'Ubah menjadi tidak aktif' 
                    : 'Ubah menjadi aktif'
                }
            />
            <Button
                variant="danger"
                size="sm"
                icon={<FaTrash />}
                onClick={() => onDelete(item.id)}
                ariaLabel="Hapus"
                title={item.status === 'aktif' 
                    ? "Tahun ajaran aktif tidak dapat dihapus"
                    : "Hapus tahun ajaran"
                }
            />
        </div>
    );
}

ActionButtons.propTypes = {
    item: PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        status: PropTypes.string.isRequired
    }).isRequired,
    onToggleStatus: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired
};