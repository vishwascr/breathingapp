import { forwardRef } from 'react';
import { NavLink } from 'react-router-dom';

/**
 * @typedef {Object} ButtonProps
 * @property {'primary' | 'secondary' | 'danger' | 'ghost' | 'none'} [variant='primary']
 * @property {'sm' | 'md' | 'lg' | 'none'} [size='md']
 * @property {'md' | 'sm' | 'lg' | 'full' | 'none'} [rounded='md']
 * @property {React.ElementType | string} [as='button']
 * @property {boolean} [disabled]
 * @property {string} [className]
 * @property {React.ReactNode} [children]
 * @property {any} [to] - Used when 'as' is NavLink or Link
 */

/**
 * Reusable Button component that conforms to the design system.
 * Uses JSDoc for IDE type checking and autocompletion.
 */
const Button = forwardRef(
  (
    /** @type {ButtonProps & React.ButtonHTMLAttributes<HTMLButtonElement>} */
    {
      variant = 'primary',
      size = 'md',
      rounded = 'md',
      as: Component = 'button',
      disabled,
      className = '',
      children,
      ...props
    },
    ref
  ) => {
    // Base classes
    const baseClasses = 'cursor-pointer transition-all duration-300 flex items-center justify-center gap-2 font-light select-none outline-none';

    // Variant classes
    const variants = {
      primary: 'btn-primary font-medium text-bg bg-accent backdrop-blur-md shadow-lg hover:bg-indicator hover:scale-[1.02] hover:shadow-[0_0_20px_var(--color-accent)] active:scale-[0.98] disabled:opacity-20 disabled:cursor-not-allowed border border-white/10 transition-all duration-300',
      secondary: 'glass-panel text-dim hover:text-white hover:bg-white/10 hover:border-white/25 active:scale-[0.98] disabled:opacity-10 disabled:cursor-not-allowed transition-all duration-300',
      danger: 'bg-red-500/10 border border-red-500/25 text-red-400 hover:bg-red-500/20 active:scale-[0.98] transition-all duration-300',
      ghost: 'text-dim hover:text-white hover:bg-white/5 disabled:opacity-10 disabled:cursor-not-allowed transition-all duration-300',
      none: '',
    };

    // Size classes
    const sizes = {
      sm: 'px-4 py-2 text-xs uppercase tracking-wider',
      md: 'px-6 py-3 text-sm uppercase tracking-widest',
      lg: 'py-6 px-10 text-lg uppercase tracking-widest',
      none: '',
    };

    // Rounded classes
    const roundedStyles = {
      md: 'rounded-squircle-md',
      sm: 'rounded-squircle-sm',
      lg: 'rounded-squircle-lg',
      full: 'rounded-full',
      none: '',
    };

    const combinedClasses = [
      variant !== 'none' ? baseClasses : '',
      variants[variant],
      sizes[size],
      roundedStyles[rounded],
      className,
    ]
      .filter(Boolean)
      .join(' ');

    // Handle React Router NavLink specially if active styling is needed
    if (Component === NavLink) {
      return (
        <NavLink
          ref={ref}
          className={combinedClasses}
          disabled={disabled}
          {...props}
        >
          {children}
        </NavLink>
      );
    }

    return (
      <Component
        ref={ref}
        className={combinedClasses}
        disabled={disabled}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

Button.displayName = 'Button';

export default Button;
