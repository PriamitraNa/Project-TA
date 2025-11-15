import ContentWrapper from '../../../../components/ui/ContentWrapper'
import Button from '../../../../components/ui/Button'
import FilterDropdown from '../../../../components/ui/FilterDropdown'
import { FaFilePdf } from 'react-icons/fa6'

export default function FilterSection({
  tahunAjaranOptions,
  selectedTahun,
  semesterOptions,
  selectedSemester,
  onTahunChange,
  onSemesterChange,
  onDownloadPDF,
  isLoadingOptions,
  isLoadingSemester,
  isDownloading,
  isDataEmpty,
}) {
  return (
    <ContentWrapper>
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end justify-between">
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Tahun Ajaran</label>
            {isLoadingOptions ? (
              <div className="w-full sm:w-44 h-10 bg-gray-100 animate-pulse rounded" />
            ) : (
              <FilterDropdown
                value={selectedTahun}
                onChange={(e) => onTahunChange(e.target.value)}
                options={tahunAjaranOptions}
                className="w-full sm:w-44"
                disabled={isLoadingOptions}
              />
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Semester</label>
            {isLoadingSemester ? (
              <div className="w-full sm:w-44 h-10 bg-gray-100 animate-pulse rounded" />
            ) : (
              <FilterDropdown
                value={selectedSemester}
                onChange={(e) => onSemesterChange(e.target.value)}
                options={semesterOptions}
                className="w-full sm:w-44"
                disabled={isLoadingOptions || isLoadingSemester}
              />
            )}
          </div>
        </div>

        <Button
          variant="primary"
          icon={<FaFilePdf />}
          onClick={onDownloadPDF}
          disabled={isDownloading || isDataEmpty || isLoadingOptions || isLoadingSemester}
          className="w-full sm:w-auto"
        >
          {isDownloading ? 'Mengunduh...' : 'Unduh PDF'}
        </Button>
      </div>
    </ContentWrapper>
  )
}
