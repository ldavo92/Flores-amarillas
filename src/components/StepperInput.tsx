import { motion } from "framer-motion";

interface Props {
  value: number;
  onChange: (n: number) => void;
  min?: number;
  max?: number;
  label?: string;
  color?: string;
}

export function StepperInput({
  value,
  onChange,
  min = 0,
  max = 9,
  label,
  color = "var(--team-1)",
}: Props) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      {label && (
        <span className="text-xs uppercase tracking-widest text-muted">{label}</span>
      )}
      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label="restar"
          onClick={() => onChange(Math.max(min, value - 1))}
          className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-xl font-bold leading-none disabled:opacity-30"
          disabled={value <= min}
        >
          −
        </button>
        <motion.div
          key={value}
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.2 }}
          className="w-16 h-16 rounded-2xl flex items-center justify-center font-display text-4xl"
          style={{
            background: `color-mix(in srgb, ${color} 18%, transparent)`,
            color,
            boxShadow: `0 0 24px color-mix(in srgb, ${color} 40%, transparent)`,
          }}
        >
          {value}
        </motion.div>
        <button
          type="button"
          aria-label="sumar"
          onClick={() => onChange(Math.min(max, value + 1))}
          className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-xl font-bold leading-none disabled:opacity-30"
          disabled={value >= max}
        >
          +
        </button>
      </div>
    </div>
  );
}
