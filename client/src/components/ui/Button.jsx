import clsx from 'clsx';

const variants = {
  primary: 'bg-amber-500 text-slate-950 hover:bg-amber-400 focus-visible:ring-amber-500',
  secondary: 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 focus-visible:ring-slate-400',
  ghost: 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus-visible:ring-slate-400',
  danger: 'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-600',
};

const sizes = {
  sm: 'min-h-9 px-3 text-sm',
  md: 'min-h-11 px-4 text-sm',
  lg: 'min-h-12 px-5 text-base',
};

const Button = ({
  as: Component = 'button',
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className,
  children,
  type,
  ...props
}) => (
  <Component
    type={Component === 'button' ? (type || 'button') : undefined}
    disabled={Component === 'button' ? disabled || loading : undefined}
    aria-busy={loading || undefined}
    className={clsx(
      'inline-flex items-center justify-center gap-2 rounded-xl font-semibold shadow-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
      variants[variant],
      sizes[size],
      className
    )}
    {...props}
  >
    {loading && <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent" aria-hidden="true" />}
    {children}
  </Component>
);

export default Button;
