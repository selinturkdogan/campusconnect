interface TagProps {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "muted";
  className?: string;
}

export function Tag({ children, variant = "muted", className = "" }: TagProps) {
  const variants = {
    primary: "bg-primary/10 text-primary",
    secondary: "bg-secondary/10 text-secondary",
    muted: "bg-muted text-muted-foreground",
  };

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
