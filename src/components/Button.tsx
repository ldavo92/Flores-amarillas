import type { ButtonHTMLAttributes, ReactNode } from "react";
import { motion } from "framer-motion";

type Variant = "primary" | "ghost" | "gold" | "danger";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: "sm" | "md" | "lg";
  children: ReactNode;
}

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-[color:var(--team-1)] text-black hover:brightness-110 shadow-[0_8px_24px_color-mix(in_srgb,var(--team-1)_40%,transparent)]",
  ghost:
    "bg-white/5 text-ink ring-1 ring-white/15 hover:bg-white/10",
  gold:
    "bg-gold text-black hover:brightness-110 shadow-[0_8px_24px_rgba(255,210,74,0.35)]",
  danger:
    "bg-red-500/90 text-white hover:bg-red-500",
};

const SIZES = {
  sm: "px-3 py-1.5 text-sm rounded-lg",
  md: "px-5 py-3 text-base rounded-xl",
  lg: "px-7 py-4 text-lg rounded-2xl",
};

export function Button({
  variant = "primary",
  size = "md",
  children,
  className = "",
  ...rest
}: Props) {
  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      whileHover={{ y: -1 }}
      className={`inline-flex items-center justify-center gap-2 font-bold tracking-wide uppercase font-body ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...(rest as React.ComponentProps<typeof motion.button>)}
    >
      {children}
    </motion.button>
  );
}
