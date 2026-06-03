import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { GROUPS, teamsByGroup } from "@/data/teams";
import { HOST_CITIES } from "@/data/cities";
import { useGameStore } from "@/store/useGameStore";
import { Chip } from "@/components/Chip";

export function Groups() {
  const teamId = useGameStore((s) => s.teamId);
  const nav = useNavigate();

  return (
    <div className="min-h-screen bg-stadium pb-12">
      <div className="max-w-4xl mx-auto px-4 pt-6">
        <button onClick={() => nav("/hub")} className="text-muted text-sm mb-3">
          ← Hub
        </button>
        <h2 className="font-display text-3xl mb-1">Todos los grupos</h2>
        <p className="text-muted mb-5">12 grupos · 48 selecciones · 16 sedes</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-8">
          {GROUPS.map((g, gi) => (
            <motion.section
              key={g}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: gi * 0.04 }}
              className="rounded-2xl bg-white/[0.04] ring-1 ring-white/10 p-3.5"
            >
              <div className="font-display text-2xl mb-2">Grupo {g}</div>
              <ul className="space-y-1.5">
                {teamsByGroup(g).map((t) => {
                  const isYours = t.id === teamId;
                  return (
                    <li
                      key={t.id}
                      className={`flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm ${
                        isYours ? "bg-grass/15 ring-1 ring-grass" : ""
                      }`}
                    >
                      <span className="text-xl">{t.flag}</span>
                      <span className="flex-1 truncate">{t.name}</span>
                      {isYours && <span className="text-[10px] uppercase tracking-widest text-grass">Tú</span>}
                    </li>
                  );
                })}
              </ul>
            </motion.section>
          ))}
        </div>

        <h3 className="font-display text-2xl mb-2">Las 16 ciudades sede</h3>
        <div className="flex flex-wrap gap-2">
          {HOST_CITIES.map((c) => (
            <Chip key={c.name} color={c.country === "MX" ? "#0a8f4f" : c.country === "CA" ? "#d4264b" : "#3c4a9e"}>
              {c.country === "MX" ? "🇲🇽" : c.country === "CA" ? "🇨🇦" : "🇺🇸"} {c.name}
            </Chip>
          ))}
        </div>
      </div>
    </div>
  );
}
