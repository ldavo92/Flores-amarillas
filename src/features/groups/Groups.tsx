import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { GROUPS, teamsByGroup } from "@/data/teams";
import { HOST_CITIES } from "@/data/cities";
import { useGameStore } from "@/store/useGameStore";
import { Chip } from "@/components/Chip";

export function Groups() {
  const teamId = useGameStore((s) => s.teamId);
  const nav = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-stadium pb-12">
      <div className="max-w-4xl mx-auto px-4 pt-6">
        <button onClick={() => nav("/hub")} className="text-muted text-sm mb-3">
          ← {t("nav.hub")}
        </button>
        <h2 className="font-display text-3xl mb-1">{t("groups.title")}</h2>
        <p className="text-muted mb-5">{t("groups.subtitle")}</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-8">
          {GROUPS.map((g, gi) => (
            <motion.section
              key={g}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: gi * 0.04 }}
              className="rounded-2xl bg-white/[0.04] ring-1 ring-white/10 p-3.5"
            >
              <div className="font-display text-2xl mb-2">
                {t("common.group")} {g}
              </div>
              <ul className="space-y-1.5">
                {teamsByGroup(g).map((team) => {
                  const isYours = team.id === teamId;
                  return (
                    <li
                      key={team.id}
                      className={`flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm ${
                        isYours ? "bg-grass/15 ring-1 ring-grass" : ""
                      }`}
                    >
                      <span className="text-xl">{team.flag}</span>
                      <span className="flex-1 truncate">{team.name}</span>
                      {isYours && (
                        <span className="text-[10px] uppercase tracking-widest text-grass">
                          {t("common.you")}
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </motion.section>
          ))}
        </div>

        <h3 className="font-display text-2xl mb-2">{t("groups.citiesTitle")}</h3>
        <div className="flex flex-wrap gap-2">
          {HOST_CITIES.map((c) => (
            <Chip
              key={c.name}
              color={c.country === "MX" ? "#0a8f4f" : c.country === "CA" ? "#d4264b" : "#3c4a9e"}
            >
              {c.country === "MX" ? "🇲🇽" : c.country === "CA" ? "🇨🇦" : "🇺🇸"} {c.name}
            </Chip>
          ))}
        </div>
      </div>
    </div>
  );
}
