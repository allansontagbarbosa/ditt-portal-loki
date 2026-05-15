import logoLight from "@/assets/ditt-logo-light.png";
import logoDark from "@/assets/ditt-logo-dark.png";

export function DittLogo({ className = "" }: { className?: string }) {
  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <img src={logoLight} alt="Ditt" className="h-7 w-auto block dark:hidden" />
      <img src={logoDark} alt="Ditt" className="h-7 w-auto hidden dark:block" />
      <span className="text-xs font-medium text-muted-foreground">Lojista</span>
    </div>
  );
}
