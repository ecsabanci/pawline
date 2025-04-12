import { SelectHTMLAttributes, forwardRef } from 'react';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectOptionGroup {
  label: string;
  options: SelectOption[];
}

export type SelectOptions = (SelectOption | SelectOptionGroup)[];

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  label?: string;
  error?: string;
  options: SelectOptions;
  onChange: (value: string) => void;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className = '', onChange, ...props }, ref) => {
    const isOptionGroup = (option: SelectOption | SelectOptionGroup): option is SelectOptionGroup => {
      return 'options' in option;
    };

    return (
      <div>
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>
        )}
        <select
          ref={ref}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-300 disabled:bg-gray-100 disabled:cursor-not-allowed ${
            error ? 'border-red-500' : ''
          } ${className}`}
          {...props}
        >
          {options.map((option, index) => 
            isOptionGroup(option) ? (
              <optgroup key={`group-${index}`} label={option.label}>
                {option.options.map((subOption, subIndex) => (
                  <option key={`${index}-${subIndex}`} value={subOption.value}>
                    {subOption.label}
                  </option>
                ))}
              </optgroup>
            ) : (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            )
          )}
        </select>
        {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Select; 