export default function ContentWrapper({ title, children, className = "" }) {
  return (
    <div
      className={`bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200 p-6 space-y-6 ${className}`}
    >
      {title && (
        <h1 className="text-2xl font-bold text-slate-800 mb-2">{title}</h1>
      )}
      {children}
    </div>
  );
}
