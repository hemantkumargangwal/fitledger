import { AlertTriangle, Inbox } from 'lucide-react';
import Button from './Button';

const PageState = ({
  type = 'empty',
  title,
  description,
  actionLabel,
  onAction,
}) => {
  const Icon = type === 'error' ? AlertTriangle : Inbox;

  return (
    <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
      <div className="mb-4 rounded-2xl bg-slate-100 p-3 text-slate-600">
        <Icon className="h-6 w-6" aria-hidden="true" />
      </div>
      <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
      {description && <p className="mt-2 max-w-md text-sm text-slate-500">{description}</p>}
      {actionLabel && onAction && (
        <Button className="mt-5" variant={type === 'error' ? 'secondary' : 'primary'} onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default PageState;
