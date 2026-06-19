import { forwardRef } from 'react';

/**
 * @typedef {Object} TextareaProps
 * @property {string} [value]
 * @property {(e: React.ChangeEvent<HTMLTextAreaElement>) => void} [onChange]
 * @property {string} [placeholder]
 * @property {number} [rows=3]
 * @property {boolean} [autoFocus]
 * @property {string} [className]
 */

/**
 * Reusable Textarea component with dark mode glass styling and focus animations.
 */
const Textarea = forwardRef(
  (
    /** @type {TextareaProps & React.TextareaHTMLAttributes<HTMLTextAreaElement>} */
    {
      value,
      onChange,
      placeholder,
      rows = 3,
      autoFocus,
      className = '',
      ...props
    },
    ref
  ) => {
    return (
      <textarea
        ref={ref}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        autoFocus={autoFocus}
        className={`w-full bg-white/5 backdrop-blur-sm border border-white/10 rounded-squircle-md p-4 text-text focus:outline-none focus:border-accent resize-none transition-all placeholder:text-dim/30 text-sm md:text-base ${className}`}
        {...props}
      />
    );
  }
);

Textarea.displayName = 'Textarea';

export default Textarea;
