import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { GROUPS, TEAMS, teamsByGroup, type Team } from "@/data/teams";
import { Button } from "@/components/Button";

export function TeamSelect() {
  const nav = useNavigate();
  const { t } = useTranslation();
  const [picked, setPicked] = useState<Team | null>(null);
  const [filter, setFilter] = useState("");

  const filtered = filter
    ? TEAMS.filter((team) => team.name.toLowerCase().includes(filter.toLowerCase()))
    : null;

  return (
    <div className="min-h-screen bg-stadium px-4 pt-6 pb-32">
      <div className="max-w-4xl mx-auto">
        <motion.h2
          initial={{ y: -8, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="font-display text-3xl mb-2"
        >
          {t("select.title")}
        </motion.h2>
        <p className="text-muted mb-5">{t("select.subtitle")}</p>

        <input
          type="text"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder={t("select.search")}
          aria-label={t("select.search")}
          className="w-full mb-6 px-4 py-3 rounded-xl bg-white/[0.05] ring-1 ring-white/10 focus:ring-grass focus:outline-none"
        />

        {filtered ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {filtered.map((team) => (
              <TeamCard
                key={team.id}
                team={team}
                selected={picked?.id === team.id}
                onPick={setPicked}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-7">
            {GROUPS.map((g) => (
              <section key={g}>
                <div className="flex items-baseline gap-3 mb-2.5">
                  <span className="font-display text-2xl">
                    {t("common.group")} {g}
                  </span>
                  <span className="text-xs uppercase tracking-widest text-muted">
                    {t("select.teamsCount", { count: teamsByGroup(g).length })}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {teamsByGroup(g).map((team) => (
                    <TeamCard
                      key={team.id}
                      team={team}
                      selected={picked?.id === team.id}
                      onPick={setPicked}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {picked && (
          <motion.div
            initial={{ y: 80 }}
            animate={{ y: 0 }}
            exit={{ y: 80 }}
            transition={{ type: "spring", damping: 22 }}
            className="fixed bottom-0 left-0 right-0 z-40 p-4 pb-6 bg-gradient-to-t from-night to-night/80 backdrop-blur ring-1 ring-white/10"
          >
            <div className="max-w-4xl mx-auto flex items-center gap-4">
              <span className="text-3xl">{picked.flag}</span>
              <div className="flex-1 min-w-0">
                <div className="font-display text-xl truncate">{picked.name}</div>
                <div className="text-xs text-muted">
                  {t("common.group")} {picked.group}
                </div>
              </div>
              <Button onClick={() => nav(`/mascot/${picked.id}`)}>
                {t("select.createMascot")}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function TeamCard({
  team,
  selected,
  onPick,
}: {
  team: Team;
  selected: boolean;
  onPick: (t: Team) => void;
}) {
  const { t } = useTranslation();
  return (
    <motion.button
      whileHover={{ y: -3, scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      onClick={() => onPick(team)}
      className={`relative rounded-2xl p-3.5 text-left ring-1 transition-colors ${
        selected ? "ring-grass bg-grass/15" : "ring-white/10 bg-white/[0.04] hover:bg-white/[0.08]"
      }`}
      style={{
        boxShadow: selected
          ? `0 0 0 1px ${team.c[0]}, 0 0 22px color-mix(in srgb, ${team.c[0]} 40%, transparent)`
          : undefined,
      }}
    >
      <div className="flex items-start gap-2.5">
        <span className="text-3xl leading-none">{team.flag}</span>
        <div className="flex-1 min-w-0">
          <div className="font-bold truncate">{team.name}</div>
          <div className="text-[10px] uppercase tracking-widest text-muted">
            {t("common.group")} {team.group}
          </div>
        </div>
      </div>
      <div className="mt-2.5 flex gap-1.5">
        {team.c.map((color, i) => (
          <span
            key={i}
            className="w-5 h-1.5 rounded-full"
            style={{ background: color }}
            aria-hidden
          />
        ))}
      </div>
    </motion.button>
  );
}
