import { forwardRef } from 'react';

/**
 * @typedef {Object} CheckboxProps
 * @property {boolean} checked
 * @property {(e: React.ChangeEvent<HTMLInputElement>) => void} onChange
 * @property {React.ReactNode} [label]
 * @property {string} [id]
 * @property {string} [className]
 */

/**
 * Reusable Checkbox component with design system colors and layouts.
 */
const Checkbox = forwardRef(
  (
    /** @type {CheckboxProps & React.InputHTMLAttributes<HTMLInputElement>} */
    {
      checked,
      onChange,
      label,
      id,
      className = '',
      ...props
    },
    ref
  ) => {
    const inputId = id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <label
        htmlFor={inputId}
        className={`flex items-center gap-2 text-dim text-sm cursor-pointer select-none hover:text-text transition-colors duration-200 ${className}`}
      >
        <input
          ref={ref}
          id={inputId}
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="w-4 h-4 rounded bg-white/5 border-white/10 text-accent focus:ring-accent focus:ring-offset-0 cursor-pointer accent-accent"
          {...props}
        />
        {label && <span>{label}</span>}
      </label>
    );
  }
);

Checkbox.displayName = 'Checkbox';

export default Checkbox;
