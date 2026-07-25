import clsx from 'clsx';

const FormField = ({ id, label, hint, error, required = false, children }) => (
  <div className="space-y-1.5">
    <label htmlFor={id} className="block text-sm font-medium text-slate-700">
      {label}
      {required && <span className="ml-1 text-red-600" aria-hidden="true">*</span>}
    </label>
    {children}
    {(error || hint) && (
      <p
        id={`${id}-description`}
        className={clsx('text-sm', error ? 'text-red-600' : 'text-slate-500')}
        role={error ? 'alert' : undefined}
      >
        {error || hint}
      </p>
    )}
  </div>
);

export default FormField;
