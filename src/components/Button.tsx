import { forwardRef } from "react";
import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "success" | "danger" | "warning" | "ghost";
type Size = "sm" | "md" | "lg" | "xl";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  block?: boolean;
};

const VARIANTS: Record<Variant, string> = {
  primary: "bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-cyan-500/20",
  secondary: "bg-violet-500 hover:bg-violet-400 text-white shadow-violet-500/20",
  success: "bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20",
  danger: "bg-red-500 hover:bg-red-400 text-white shadow-red-500/20",
  warning: "bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-amber-400/20",
  ghost: "bg-slate-800 hover:bg-slate-700 text-slate-100",
};

const SIZES: Record<Size, string> = {
  sm: "px-3 py-1.5 text-sm rounded-lg",
  md: "px-4 py-2.5 text-sm rounded-xl",
  lg: "px-5 py-3 text-base rounded-xl",
  xl: "px-6 py-4 text-lg rounded-2xl",
};

const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  { variant = "primary", size = "md", block, className = "", ...rest },
  ref
) {
  return (
    <button
      ref={ref}
      className={`font-semibold shadow-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] ${VARIANTS[variant]} ${SIZES[size]} ${block ? "w-full" : ""} ${className}`}
      {...rest}
    />
  );
});

export default Button;
