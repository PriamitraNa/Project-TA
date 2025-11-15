export default function ProfileAnakCard({ anak, isLoading }) {
  if (isLoading) {
    return (
      <div className="p-6 bg-gradient-to-br from-slate-700 to-slate-800 rounded-2xl shadow-lg animate-pulse">
        <div className="h-8 bg-slate-600 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-slate-600 rounded w-1/2 mb-1"></div>
        <div className="h-3 bg-slate-600 rounded w-1/3"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gradient-to-br from-slate-700 to-slate-800 rounded-2xl shadow-lg text-white">
      <h2 className="text-2xl font-bold">{anak.nama}</h2>
      <p className="text-slate-300 mt-1">Kelas: {anak.kelas}</p>
      <p className="text-sm text-slate-400">NISN: {anak.nisn}</p>
    </div>
  );
}

