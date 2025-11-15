import SearchBar from '../../../../components/ui/SearchBar'
import { KATEGORI_FILTERS, JENIS_FILTERS } from '../config/constants'

/**
 * FilterSection Component
 * Search dan filter berdasarkan kategori & jenis catatan
 */
export default function FilterSection({
  search,
  kategoriFilter,
  jenisFilter,
  onSearchChange,
  onKategoriChange,
  onJenisChange,
}) {
  return (
    <SearchBar
      search={search}
      setSearch={onSearchChange}
      filter={kategoriFilter}
      setFilter={onKategoriChange}
      filters={KATEGORI_FILTERS}
      secondFilter={jenisFilter}
      setSecondFilter={onJenisChange}
      secondFilters={JENIS_FILTERS}
      placeholder="Cari nama guru atau isi catatan..."
      filterPlaceholder="Pilih Kategori"
      secondFilterPlaceholder="Pilih Jenis"
      showFilter={true}
      showSecondFilter={true}
      showAddButton={false}
    />
  )
}
