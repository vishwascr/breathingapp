import { forwardRef } from 'react';

/**
 * @typedef {Object} CardProps
 * @property {'default' | 'hoverable' | 'accent' | 'dashed' | 'flat' | 'none'} [variant='default']
 * @property {'none' | 'sm' | 'md' | 'lg' | 'xl'} [padding='md']
 * @property {'lg' | 'md' | 'sm' | 'none'} [rounded='lg']
 * @property {React.ElementType | string} [as='div']
 * @property {string} [className]
 * @property {React.ReactNode} [children]
 */

/**
 * Reusable Card component with glassmorphism, accent support, and responsiveness.
 */
const Card = forwardRef(
  (
    /** @type {CardProps & React.HTMLAttributes<HTMLDivElement>} */
    {
      variant = 'default',
      padding = 'md',
      rounded = 'lg',
      as: Component = 'div',
      className = '',
      children,
      ...props
    },
    ref
  ) => {
    // Base classes
    const baseClasses = 'relative backdrop-blur-3xl';

    // Variant classes
    const variants = {
      default: 'glass-panel',
      hoverable: 'glass-panel glass-panel-hover',
      accent: 'bg-accent/[0.03] border border-accent/20 shadow-[0_0_30px_rgba(var(--color-accent),0.15)] transition-all duration-500',
      dashed: 'bg-white/[0.02] border border-white/10 border-dashed backdrop-blur-3xl',
      flat: 'bg-white/[0.015] border border-white/5 shadow-sm backdrop-blur-xl',
      none: '',
    };

    // Padding classes
    const paddings = {
      none: 'p-0',
      sm: 'p-4 md:p-5',
      md: 'p-6 md:p-8',
      lg: 'p-8 md:p-10',
      xl: 'p-6 md:p-12',
    };

    // Rounded classes
    const roundedStyles = {
      lg: 'rounded-squircle-lg',
      md: 'rounded-squircle-md',
      sm: 'rounded-squircle-sm',
      none: 'rounded-none',
    };

    const combinedClasses = [
      variant !== 'none' ? baseClasses : '',
      variants[variant],
      paddings[padding],
      roundedStyles[rounded],
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <Component
        ref={ref}
        className={combinedClasses}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

Card.displayName = 'Card';

export default Card;
