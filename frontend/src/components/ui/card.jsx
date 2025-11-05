export function Card({ children, className = "" }) {
  return (
    <div className={`rounded-xl border bg-white shadow-sm p-4 ${className}`}>
      {children}
    </div>
  );
}

export function CardHeader({ children }) {
  return <div className="mb-2">{children}</div>;
}

export function CardTitle({ children }) {
  return <h2 className="text-lg font-semibold mb-1">{children}</h2>;
}

export function CardContent({ children }) {
  return <div>{children}</div>;
}
