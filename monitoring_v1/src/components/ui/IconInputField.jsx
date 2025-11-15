const DEFAULT_PROPS = {
  type: "text",
  required: false,
  disabled: false,
  className: "",
};

const INPUT_STYLES = {
  base: "w-full pl-12 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 bg-white transition-colors",
  default: "border-slate-300 focus:ring-emerald-500",
  disabled: "bg-gray-100 cursor-not-allowed",
  error: "border-red-500 focus:ring-red-500",
};

export default function IconInputField({ 
  icon, 
  type = DEFAULT_PROPS.type, 
  value, 
  onChange, 
  placeholder, 
  required = DEFAULT_PROPS.required,
  disabled = DEFAULT_PROPS.disabled,
  error = "",
  className = DEFAULT_PROPS.className,
  name,
  id,
  ...props
}) {
  const inputId = id || name || placeholder?.toLowerCase().replace(/\s+/g, "-");
  const hasError = Boolean(error);

  const inputClasses = `
    ${INPUT_STYLES.base}
    ${hasError ? INPUT_STYLES.error : INPUT_STYLES.default}
    ${disabled ? INPUT_STYLES.disabled : ""}
    ${className}
  `.trim();

  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        {icon}
      </div>
      <input
        id={inputId}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={inputClasses}
        required={required}
        disabled={disabled}
        {...props}
      />
      {hasError && (
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-red-500 text-sm">
          ⚠
        </span>
      )}
      {hasError && (
        <p className="text-xs text-red-500 mt-1 ml-1">{error}</p>
      )}
    </div>
  );
}