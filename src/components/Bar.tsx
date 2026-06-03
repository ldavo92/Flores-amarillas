import { motion } from "framer-motion";

interface Props {
  value: number; // 0..100
  color?: string;
  height?: number;
  label?: string;
}

export function Bar({ value, color = "var(--grass)", height = 10, label }: Props) {
  const v = Math.max(0, Math.min(100, value));
  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between text-xs text-muted mb-1">
          <span>{label}</span>
          <span>{Math.round(v)}%</span>
        </div>
      )}
      <div className="w-full bg-white/8 rounded-full overflow-hidden" style={{ height }}>
        <motion.div
          className="h-full rounded-full"
          style={{
            background: `linear-gradient(90deg, ${color}, color-mix(in srgb, ${color} 60%, #fff))`,
            boxShadow: `0 0 16px ${color}`,
          }}
          animate={{ width: `${v}%` }}
          transition={{ duration: 0.25, ease: "linear" }}
        />
      </div>
    </div>
  );
}
