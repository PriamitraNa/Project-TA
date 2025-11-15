import { forwardRef } from 'react'

const Card = forwardRef(
  (
    {
      // Basic props
      className = '',

      // Content props
      title,
      icon,
      value,
      label,
      trend,
      trendValue,

      // Styling props
      compact = false,
      allowMultiLine = false,

      // Interactive props
      clickable = true,
      onClick,
      onDoubleClick,
      disabled = false,
      loading = false,

      // Accessibility
      ariaLabel,
      role,
      tabIndex,

      ...props
    },
    ref
  ) => {
    // Fixed styling - Gradient background with gray base and blue accent

    // Base classes - Fixed styling dengan warna teks yang kontras
    const baseClasses = `
    relative overflow-hidden transition-all duration-200
    bg-gradient-to-br from-slate-100 via-slate-50 to-blue-50/30
    shadow-lg
    rounded-lg sm:rounded-xl
    p-3 sm:p-4 lg:p-6
    border-slate-200/50 text-slate-800
    ${
      clickable && !disabled
        ? 'cursor-pointer hover:shadow-xl hover:scale-[1.02] hover:from-slate-50 hover:via-blue-50/20 hover:to-blue-50/50 hover:text-slate-900'
        : ''
    }
    ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
    ${loading ? 'animate-pulse' : ''}
  `

    // Loading skeleton
    const LoadingSkeleton = () => (
      <div className="animate-pulse">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-slate-200 rounded-full"></div>
            <div className="space-y-2">
              <div className="h-4 bg-slate-200 rounded w-32"></div>
              <div className="h-3 bg-slate-200 rounded w-24"></div>
            </div>
          </div>
          <div className="text-right space-y-1">
            <div className="h-6 bg-slate-200 rounded w-16"></div>
            <div className="h-3 bg-slate-200 rounded w-12"></div>
          </div>
        </div>
      </div>
    )

    // Horizontal Card Component
    const HorizontalCard = () => (
      <div className="flex items-center justify-between gap-3 sm:gap-4">
        {/* Left: Icon */}
        <div className="flex-shrink-0">
          {icon && (
            <div
              className={`${
                compact ? 'p-2 sm:p-2.5 lg:p-3' : 'p-2.5 sm:p-3 lg:p-4'
              } rounded-full bg-slate-200/50 text-slate-700`}
            >
              {
                <span
                  className={
                    compact ? 'text-base sm:text-lg lg:text-xl' : 'text-xl sm:text-2xl lg:text-3xl'
                  }
                >
                  {icon}
                </span>
              }
            </div>
          )}
        </div>

        {/* Center: Title and Description */}
        <div className="flex-1 min-w-0">
          {title && (
            <h3
              className={`${
                compact ? 'text-sm sm:text-base lg:text-lg' : 'text-base sm:text-lg lg:text-xl'
              } font-semibold text-slate-800 ${
                allowMultiLine || compact ? 'leading-tight break-words' : 'truncate'
              }`}
            >
              {title}
            </h3>
          )}
        </div>

        {/* Right: Value/Stat */}
        <div className="flex-shrink-0 text-right">
          {value && (
            <div
              className={`${
                compact ? 'text-lg sm:text-xl lg:text-2xl' : 'text-xl sm:text-2xl lg:text-3xl'
              } font-bold text-slate-900`}
            >
              {value}
            </div>
          )}
          {label && (
            <div
              className={`${
                compact ? 'text-xs sm:text-sm' : 'text-sm sm:text-base'
              } text-slate-600`}
            >
              {label}
            </div>
          )}
          {trend && (
            <div className={`text-xs mt-1 ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
              {trend === 'up' ? '↗' : '↘'} {trendValue}
            </div>
          )}
        </div>
      </div>
    )

    return (
      <div
        ref={ref}
        className={`${baseClasses} ${className}`}
        onClick={clickable && !disabled ? onClick : undefined}
        onDoubleClick={clickable && !disabled ? onDoubleClick : undefined}
        role={role || (clickable ? 'button' : undefined)}
        tabIndex={tabIndex || (clickable ? 0 : undefined)}
        aria-label={ariaLabel}
        {...props}
      >
        {loading ? <LoadingSkeleton /> : <HorizontalCard />}
      </div>
    )
  }
)

Card.displayName = 'Card'

export default Card
