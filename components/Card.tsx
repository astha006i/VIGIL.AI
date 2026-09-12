type CardProps = {
  className?: string;
  children: React.ReactNode;
};

export default function Card({ className = '', children }: CardProps) {
  return (
    <div
      className={`rounded-2xl border border-outline-variant bg-white shadow-lg ${className}`}
    >
      {children}
    </div>
  );
}