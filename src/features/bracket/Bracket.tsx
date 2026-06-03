import { useState } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { BRACKET_ROUNDS } from "@/data/bracket";
import { GROUPS, teamsByGroup, getTeam, type Team } from "@/data/teams";
import { useGameStore } from "@/store/useGameStore";
import { Card } from "@/components/Card";
import { Chip } from "@/components/Chip";
import { Mascot } from "@/mascots/Mascot";

export function Bracket() {
  const { t } = useTranslation();
  const championPick = useGameStore((s) => s.championPick);
  const pickChampion = useGameStore((s) => s.pickChampion);
  const [picking, setPicking] = useState(false);
  const champ = championPick ? getTeam(championPick) : null;

  return (
    <div className="min-h-screen bg-stadium px-4 py-6">
      <div className="mx-auto max-w-2xl space-y-4">
        <div>
          <h1 className="font-display text-3xl">{t("bracket.title")}</h1>
          <p className="text-muted">{t("bracket.subtitle")}</p>
        </div>

        {/* Predicción de campeón */}
        <Card>
          <div className="mb-3 text-xs uppercase tracking-widest text-muted">
            {t("bracket.predictChampion")}
          </div>
          {champ ? (
            <button
              onClick={() => setPicking((p) => !p)}
              className="flex w-full items-center gap-3 rounded-xl bg-white/[0.04] p-3 ring-1 ring-white/10"
              style={{ boxShadow: `0 0 18px color-mix(in srgb, ${champ.c[0]} 35%, transparent)` }}
            >
              <Mascot team={champ} mood="euphoric" size={56} bob={false} />
              <div className="flex-1 text-left">
                <div className="font-display text-lg">{champ.flag} {champ.name}</div>
                <div className="text-xs text-muted">{t("bracket.yourPick", { team: champ.name })}</div>
              </div>
              <Chip color="var(--gold)">+100</Chip>
            </button>
          ) : (
            <button
              onClick={() => setPicking(true)}
              className="w-full rounded-xl bg-[color:var(--team-1)] py-3 font-bold uppercase tracking-wide text-black"
            >
              {t("bracket.pickCta")}
            </button>
          )}

          {picking && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mt-3 max-h-72 overflow-y-auto"
            >
              {GROUPS.map((g) => (
                <div key={g} className="mb-2">
                  <div className="mb-1 text-[10px] uppercase tracking-widest text-muted">
                    {t("common.group")} {g}
                  </div>
                  <div className="grid grid-cols-4 gap-1.5">
                    {teamsByGroup(g).map((team) => (
                      <ChampBtn
                        key={team.id}
                        team={team}
                        selected={team.id === championPick}
                        onPick={() => {
                          pickChampion(team.id);
                          setPicking(false);
                        }}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </Card>

        {/* Rondas del bracket */}
        <Card>
          <p className="mb-3 text-xs leading-relaxed text-muted">{t("bracket.note")}</p>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {BRACKET_ROUNDS.map((round) => (
              <div key={round.id} className="min-w-[112px] flex-1">
                <div className="mb-2 text-center">
                  <div className="font-display text-lg">{t(`bracket.${round.id}`)}</div>
                  <Chip color="var(--gold)">+{round.points}</Chip>
                </div>
                <div className="space-y-1.5">
                  {Array.from({ length: round.matches }).map((_, i) => (
                    <div
                      key={i}
                      className="rounded-lg bg-white/[0.03] px-2 py-2 text-center text-[10px] text-muted ring-1 ring-white/5"
                    >
                      {t("bracket.tbd")}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function ChampBtn({
  team,
  selected,
  onPick,
}: {
  team: Team;
  selected: boolean;
  onPick: () => void;
}) {
  return (
    <button
      onClick={onPick}
      title={team.name}
      className={`flex flex-col items-center rounded-lg p-1.5 ring-1 transition-colors ${
        selected ? "ring-[color:var(--team-1)] bg-white/10" : "ring-white/5 hover:bg-white/[0.06]"
      }`}
    >
      <span className="text-xl">{team.flag}</span>
      <span className="mt-0.5 w-full truncate text-center text-[9px] text-muted">{team.name}</span>
    </button>
  );
}
