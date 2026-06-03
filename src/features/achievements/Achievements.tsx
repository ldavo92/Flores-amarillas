import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { ACHIEVEMENTS } from "@/data/achievements";
import { useGameStore } from "@/store/useGameStore";

export function Achievements() {
  const { t } = useTranslation();
  const unlocked = useGameStore((s) => s.achievements);

  return (
    <div className="min-h-screen bg-stadium px-4 py-6">
      <div className="mx-auto max-w-md">
        <h1 className="font-display text-3xl">{t("achievements.title")}</h1>
        <p className="mb-5 text-muted">
          {t("achievements.subtitle", { n: unlocked.length, total: ACHIEVEMENTS.length })}
        </p>

        <div className="grid grid-cols-2 gap-3">
          {ACHIEVEMENTS.map((a, i) => {
            const got = unlocked.includes(a.id);
            return (
              <motion.div
                key={a.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.04 }}
                className={`rounded-2xl p-4 text-center ring-1 ${
                  got ? "bg-white/[0.05] ring-white/10" : "bg-black/20 ring-white/5"
                }`}
                style={got ? { boxShadow: "0 0 18px rgba(255,210,74,0.25)" } : undefined}
              >
                <div className={`text-4xl ${got ? "" : "opacity-20 grayscale"}`}>{a.icon}</div>
                <div className="mt-2 font-bold">{got ? t(`achievements.${a.id}`) : "???"}</div>
                <div className="text-xs text-muted">
                  {got ? t(`achievements.${a.id}Desc`) : t("achievements.locked")}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
