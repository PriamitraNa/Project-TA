export default function DataTable({ columns, data, className = "", forceScroll = false }) {
  // Tentukan apakah perlu scroll berdasarkan jumlah kolom atau force scroll
  // Jika kolom lebih dari 5 atau forceScroll true, aktifkan scroll
  const needsScroll = columns.length > 5 || forceScroll;

  // Responsive wrapper untuk mobile dan desktop
  // Selalu gunakan overflow-x-auto jika needsScroll true, agar scroll terjamin
  const responsiveWrapper = `
    ${needsScroll ? "overflow-x-auto" : "overflow-x-visible"}
  `;

  // Padding dan lebar minimum untuk tabel
  const responsivePadding = `
    px-2 sm:px-0
    ${needsScroll ? "min-w-max" : "min-w-full"}
  `;

  // Responsive table styling
  // Gunakan table-auto agar lebar kolom menyesuaikan konten
  // Beri min-w yang cukup besar agar scroll aktif jika konten lebar
  const responsiveTable = `
    w-full text-sm table-auto
    ${needsScroll ? "min-w-[800px]" : "min-w-full"}
  `;

  // Responsive header styling
  const responsiveHeader = `
    bg-gradient-to-r from-slate-50 to-slate-100
    ${needsScroll ? "w-full" : ""}
  `;

  // Responsive cell styling
  const responsiveCell = (col) => `
    px-3 py-3 text-slate-700
    ${
      col.className ||
      ((col.label || col.Header) === "No" ? "text-center" : "text-left")
    }
    ${
      // Untuk kolom yang panjang, biarkan wrap di mobile
      (col.label || col.Header) === "Tahun Ajaran" ||
      (col.label || col.Header) === "Tanggal Mulai" ||
      (col.label || col.Header) === "Tanggal Selesai" ||
      (col.label || col.Header) === "Nama Kelas" ||
      (col.label || col.Header) === "Wali Kelas"
        ? "whitespace-normal sm:whitespace-nowrap"
        : "whitespace-nowrap"
    }
  `;

  // Responsive header cell styling
  const responsiveHeaderCell = (col) => `
    px-3 py-3 font-semibold text-slate-800 border-b border-slate-200 whitespace-nowrap
    ${
      col.className ||
      ((col.label || col.Header) === "No" ? "text-center" : "text-left")
    }
  `;

  // Responsive body styling
  const responsiveBody = `
    bg-white divide-y divide-slate-100
    ${needsScroll ? "w-full" : ""}
  `;

  // Responsive row styling
  const responsiveRow = `
    hover:bg-slate-50 transition-all duration-200
    ${needsScroll ? "w-full" : ""}
  `;

  // Responsive empty state styling
  const responsiveEmptyState = `
    text-center py-8 bg-white
    ${needsScroll ? "w-full" : ""}
  `;

  // Responsive empty state text styling
  const responsiveEmptyText = `
    text-slate-500 text-sm
    ${needsScroll ? "w-full" : ""}
  `;

  // Responsive container styling
  const responsiveContainer = `
    bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden
    ${needsScroll ? "w-full" : ""}
  `;

  return (
    <div className={`${responsiveContainer} ${className}`}>
      {/* Scroll wrapper untuk tabel dengan header yang full */}
      <div className={responsiveWrapper}>
        <div className={responsivePadding}>
          <table className={responsiveTable}>
            <thead className={responsiveHeader}>
              <tr>
                {columns.map((col, i) => (
                  <th key={i} className={responsiveHeaderCell(col)}>
                    {col.label || col.Header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className={responsiveBody}>
              {data.map((row, rowIndex) => (
                <tr key={rowIndex} className={responsiveRow}>
                  {columns.map((col, colIndex) => (
                    <td key={colIndex} className={responsiveCell(col)}>
                      {row[col.key || col.accessor]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Empty State */}
      {data.length === 0 && (
        <div className={responsiveEmptyState}>
          <p className={responsiveEmptyText}>
            Belum ada data yang tersedia untuk ditampilkan.
          </p>
        </div>
      )}
    </div>
  );
}
