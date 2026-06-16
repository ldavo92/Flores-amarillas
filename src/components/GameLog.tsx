import type { GameLogItem } from "../types/game";

export default function GameLog({ items }: { items: GameLogItem[] }) {
  if (items.length === 0) {
    return <p className="text-sm text-slate-500">Sin eventos todavía.</p>;
  }
  return (
    <ul className="max-h-48 space-y-1 overflow-y-auto pr-1">
      {items.map((item) => (
        <li key={item.id} className="text-sm text-slate-300">
          <span className="text-slate-600">•</span> {item.text}
        </li>
      ))}
    </ul>
  );
}
