import { Loader2 } from "lucide-react";
import type { ButtonHTMLAttributes } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "outline" | "ghost";
  loading?: boolean;
};

/** Botão padrão Connexa — pill roxo com estados de loading/disabled */
export default function Button({
  variant = "primary",
  loading = false,
  className = "",
  children,
  disabled,
  ...props
}: Props) {
  const base =
    "flex w-full items-center justify-center gap-2 rounded-full px-5 py-3.5 text-sm font-semibold transition-transform active:scale-[0.98] disabled:opacity-60 disabled:active:scale-100";

  const variants = {
    primary:
      "bg-gradient-to-br from-primary-light to-primary text-white shadow-lg shadow-primary/30",
    outline: "border-2 border-primary text-primary bg-transparent",
    ghost: "text-muted bg-transparent",
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 size={18} className="animate-spin" />}
      {children}
    </button>
  );
}
