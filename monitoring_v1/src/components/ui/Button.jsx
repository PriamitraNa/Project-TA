import { forwardRef } from "react";

const Button = forwardRef(({
  children,
  variant = "primary",
  size = "md",
  rounded = "md",
  disabled = false,
  loading = false,
  icon,
  iconPosition = "left",
  fullWidth = false,
  iconOnly = false,
  as = "button",
  href,
  target,
  ariaLabel,
  className = "",
  ...props
}, ref) => {
  // Base styles
  const base = `
    inline-flex items-center justify-center font-medium transition-all duration-200 
    focus:outline-none focus:ring-2 focus:ring-offset-2 
    disabled:opacity-50 disabled:cursor-not-allowed
    ${fullWidth ? 'w-full' : ''}
  `;

  // Rounded variants
  const roundedVariants = {
    sm: "rounded-sm",
    md: "rounded-md",
    lg: "rounded-lg",
    full: "rounded-full",
  };

  // Size variants
  const sizes = {
    sm: iconOnly ? "p-1.5 text-sm" : "px-3 py-1.5 text-sm",
    md: iconOnly ? "p-2 text-sm" : "px-4 py-2 text-sm",
    lg: iconOnly ? "p-3 text-base" : "px-6 py-3 text-base",
    xl: iconOnly ? "p-4 text-lg" : "px-8 py-4 text-lg",
  };

  // Color variants
  const variants = {
    primary: `
      bg-emerald-600 text-white hover:bg-emerald-700 
      focus:ring-emerald-500 shadow-md hover:shadow-lg
      active:bg-emerald-800
    `,
    secondary: `
      bg-slate-200 text-slate-800 hover:bg-slate-300 
      focus:ring-slate-500 shadow-sm hover:shadow-md
      active:bg-slate-400
    `,
    outline: `
      border-2 border-emerald-600 text-emerald-600 bg-transparent 
      hover:bg-emerald-600 hover:text-white
      focus:ring-emerald-500
      active:bg-emerald-700
    `,
    ghost: `
      text-emerald-600 bg-transparent hover:bg-emerald-50 
      focus:ring-emerald-500
      active:bg-emerald-100
    `,
    danger: `
      bg-red-600 text-white hover:bg-red-700 
      focus:ring-red-500 shadow-md hover:shadow-lg
      active:bg-red-800
    `,
    warning: `
      bg-yellow-500 text-white hover:bg-yellow-600 
      focus:ring-yellow-400 shadow-md hover:shadow-lg
      active:bg-yellow-700
    `,
    info: `
      bg-blue-600 text-white hover:bg-blue-700 
      focus:ring-blue-500 shadow-md hover:shadow-lg
      active:bg-blue-800
    `,
  };

  const LoadingSpinner = () => (
    <svg
      className="animate-spin -ml-1 mr-2 h-4 w-4"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
  );

  const IconComponent = ({ icon, position }) => {
    if (!icon) return null;
    
    const iconClasses = position === "left" ? "mr-2" : "ml-2";
    return (
      <span className={`inline-flex items-center ${iconClasses}`}>
        {icon}
      </span>
    );
  };

  const isLink = as === "a" || href;
  const Component = isLink ? "a" : "button";

  const accessibilityProps = {
    ...(iconOnly && ariaLabel && { "aria-label": ariaLabel }),
    ...(iconOnly && !ariaLabel && { "aria-label": children?.toString() || "Button" }),
    ...(disabled && { "aria-disabled": true }),
    ...(loading && { "aria-busy": true }),
  };

  const linkProps = isLink ? {
    href: href || "#",
    target,
    rel: target === "_blank" ? "noopener noreferrer" : undefined,
  } : {};

  return (
    <Component
      ref={ref}
      disabled={!isLink && (disabled || loading)}
      className={`
        ${base} 
        ${sizes[size]} 
        ${variants[variant]} 
        ${roundedVariants[rounded]}
        ${className}
      `.trim()}
      {...accessibilityProps}
      {...linkProps}
      {...props}
    >
      {loading && <LoadingSpinner />}
      {/* DIUBAH: Tambahkan '!iconOnly' agar tidak dieksekusi bersamaan */}
      {!loading && icon && iconPosition === "left" && !iconOnly && (
        <IconComponent icon={icon} position="left" />
      )}
      {!iconOnly && children}
      {/* DIUBAH: Tambahkan '!iconOnly' agar tidak dieksekusi bersamaan */}
      {!loading && icon && iconPosition === "right" && !iconOnly && (
        <IconComponent icon={icon} position="right" />
      )}
      {iconOnly && !loading && icon && (
        <span className="inline-flex items-center">
          {icon}
        </span>
      )}
    </Component>
  );
});

Button.displayName = "Button";

export default Button;