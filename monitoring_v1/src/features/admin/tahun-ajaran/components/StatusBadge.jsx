import PropTypes from 'prop-types';

export default function StatusBadge({ status }) {
    return (
        <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${
                status === 'aktif' 
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                    : 'bg-slate-100 text-slate-600 border border-slate-200'
            }`}>
                <span className={`w-2 h-2 rounded-full ${
                    status === 'aktif' ? 'bg-emerald-500' : 'bg-slate-400'
                }`}></span>
                {status === 'aktif' ? 'Aktif' : 'Tidak Aktif'}
            </span>
        </div>
    );
}

StatusBadge.propTypes = {
    status: PropTypes.string.isRequired
};