import { forwardRef } from "react";

const PageHeader = forwardRef(({
  icon,
  title,
  description,
  className = "",
  iconSize = "text-xl sm:text-2xl lg:text-3xl",
  titleSize = "text-lg sm:text-xl md:text-2xl lg:text-3xl",
  iconBgColor = "from-emerald-500 to-emerald-600",
  iconTextColor = "text-white",
  ...props
}, ref) => {
  return (
    <div ref={ref} className={`mb-4 sm:mb-6 lg:mb-8 ${className}`} {...props}>
      <div
        className="
          flex flex-col sm:flex-row
          sm:items-center sm:justify-start
          gap-3 sm:gap-4
          text-center sm:text-left
        "
      >
        {/* Icon */}
        <div
          className={`
            mx-auto sm:mx-0
            p-2 sm:p-3 lg:p-4
            bg-gradient-to-br ${iconBgColor}
            rounded-lg sm:rounded-xl
            shadow-md
            flex items-center justify-center
          `}
        >
          <span className={`${iconSize} ${iconTextColor}`}>
            {icon}
          </span>
        </div>

        {/* Title & Description */}
        <div className="min-w-0 flex-1">
          <h1
            className={`
              ${titleSize}
              font-bold text-slate-800
              leading-snug sm:leading-tight
              break-words
            `}
          >
            {title}
          </h1>
          {description && (
            <p
              className="
                text-xs sm:text-sm md:text-base
                text-slate-600
                mt-1 sm:mt-0.5
                leading-relaxed break-words
              "
            >
              {description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
});

PageHeader.displayName = "PageHeader";

export default PageHeader;
