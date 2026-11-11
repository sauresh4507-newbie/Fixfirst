import { Inbox } from 'lucide-react';

const EmptyState = ({
  icon: Icon = Inbox,
  title = 'Nothing here yet',
  description = '',
  action = null,
  size = 'md',
}) => {
  const sizes = {
    sm: { wrap: 'py-10 px-6', box: 'w-12 h-12 rounded-xl', icon: 'w-5 h-5' },
    md: { wrap: 'py-16 px-8', box: 'w-16 h-16 rounded-2xl', icon: 'w-7 h-7' },
    lg: { wrap: 'py-24 px-8', box: 'w-20 h-20 rounded-3xl', icon: 'w-9 h-9' },
  };
  const s = sizes[size];

  return (
    <div className={`flex flex-col items-center justify-center text-center ${s.wrap}`}>
      <div className={`${s.box} bg-brand-gradient-soft border border-brand-100 flex items-center justify-center mb-4`}>
        <Icon className={`${s.icon} text-brand-400`} strokeWidth={1.5} />
      </div>
      <h3 className="text-sm font-semibold text-ink mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-ink-tertiary max-w-xs leading-relaxed">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
};

export default EmptyState;
