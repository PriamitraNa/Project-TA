import { GRADE_RANGES } from '../config/constants'

export default function GradeInfo() {
  return (
    <div className="mt-6 pt-4 border-t border-gray-200">
      <p className="text-xs font-semibold text-gray-700 mb-2">Keterangan Predikat:</p>
      <div className="flex flex-wrap gap-3 text-xs text-gray-600">
        {GRADE_RANGES.map((item) => (
          <div key={item.grade} className="flex items-center gap-1.5">
            <span className={`px-2 py-0.5 rounded ${item.color} font-bold`}>{item.grade}</span>
            <span>{item.range}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
