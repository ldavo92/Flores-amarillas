import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { TEAMS } from "@/data/teams";
import { useGameStore } from "@/store/useGameStore";
import { Mascot } from "@/mascots/Mascot";

export function Album() {
  const nav = useNavigate();
  const { t } = useTranslation();
  const unlocked = useGameStore((s) => s.unlocked);

  return (
    <div className="min-h-screen bg-stadium pb-12">
      <div className="max-w-4xl mx-auto px-4 pt-6">
        <button onClick={() => nav("/hub")} className="text-muted text-sm mb-3">
          ← {t("nav.hub")}
        </button>
        <h2 className="font-display text-3xl mb-1">{t("album.title")}</h2>
        <p className="text-muted mb-5">{t("album.progress", { n: unlocked.length })}</p>

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
          {TEAMS.map((team, i) => {
            const got = unlocked.includes(team.id);
            return (
              <motion.div
                key={team.id}
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.02 }}
                className={`relative rounded-2xl ring-1 p-2 flex flex-col items-center text-center ${
                  got ? "bg-white/[0.05] ring-white/10" : "bg-black/30 ring-white/5"
                }`}
                style={
                  got
                    ? { boxShadow: `0 0 18px color-mix(in srgb, ${team.c[0]} 30%, transparent)` }
                    : undefined
                }
              >
                <div className={got ? "" : "opacity-15 grayscale"}>
                  <Mascot team={team} mood="idle" size={64} bob={false} />
                </div>
                <div className="text-[11px] mt-1 font-bold leading-tight">
                  {got ? team.name : "?"}
                </div>
                <div className="text-[9px] uppercase text-muted">
                  {t("common.group")} {team.group}
                </div>
                {!got && (
                  <div className="absolute inset-0 flex items-center justify-center text-2xl">🔒</div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
