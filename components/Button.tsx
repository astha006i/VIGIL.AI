import Link from 'next/link';

type ButtonProps = {
  as?: 'button' | 'a';
  href?: string;
  variant?: 'primary' | 'outline';
  type?: 'button' | 'submit';
  className?: string;
  children: React.ReactNode;
};

const baseClasses =
  'inline-flex items-center gap-2 rounded-xl px-8 py-4 font-semibold shadow-sm transition-all';

const variants: Record<'primary' | 'outline', string> = {
  primary: 'bg-primary text-white shadow-md hover:bg-primary/90',
  outline:
    'border border-outline bg-white text-primary hover:bg-surface-variant',
};

export default function Button({
  as = 'button',
  href,
  variant = 'primary',
  type = 'button',
  className = '',
  children,
}: ButtonProps) {
  const classes = `${baseClasses} ${variants[variant]} ${className}`;

  if (as === 'a' && href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} className={classes}>
      {children}
    </button>
  );
}