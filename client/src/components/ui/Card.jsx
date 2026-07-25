import clsx from 'clsx';

const Card = ({ as: Component = 'section', className, children, ...props }) => (
  <Component
    className={clsx('rounded-2xl border border-slate-200/80 bg-white shadow-sm', className)}
    {...props}
  >
    {children}
  </Component>
);

export default Card;
