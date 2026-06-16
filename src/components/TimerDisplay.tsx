type Props = {
  remaining: number;
  progress: number;
  isCritical: boolean;
  isRunning: boolean;
  size?: "md" | "giant";
};

export default function TimerDisplay({
  remaining,
  progress,
  isCritical,
  isRunning,
  size = "md",
}: Props) {
  const giant = size === "giant";
  const expired = remaining <= 0 && !isRunning;
  const color = expired
    ? "text-red-500"
    : isCritical
      ? "text-red-400 animate-pulse-fast"
      : "text-cyan-300";
  const barColor = isCritical || expired ? "bg-red-500" : "bg-cyan-400";

  return (
    <div className="w-full">
      <div
        className={`text-center font-display font-black tabular-nums ${color} ${
          giant ? "text-[22vw] leading-none sm:text-[16vw] lg:text-[12rem]" : "text-6xl"
        }`}
      >
        {remaining}
      </div>
      <div className={`mt-2 h-3 w-full overflow-hidden rounded-full bg-slate-800 ${giant ? "h-5" : ""}`}>
        <div
          className={`h-full rounded-full transition-[width] duration-200 ${barColor}`}
          style={{ width: `${progress * 100}%` }}
        />
      </div>
    </div>
  );
}
