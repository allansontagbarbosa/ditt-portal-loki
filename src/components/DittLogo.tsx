export function DittLogo({ className = "" }: { className?: string }) {
  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
        D
      </div>
      <span className="text-lg font-bold tracking-tight">Ditt</span>
      <span className="text-xs font-medium text-muted-foreground">Lojista</span>
    </div>
  );
}
