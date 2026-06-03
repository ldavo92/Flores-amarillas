import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { TEAMS, getTeam, type Team } from "@/data/teams";
import { useGameStore } from "@/store/useGameStore";
import { Mascot } from "@/mascots/Mascot";
import { Card } from "@/components/Card";

export function Eliminated() {
  const { t } = useTranslation();
  const nav = useNavigate();
  const teamId = useGameStore((s) => s.teamId);
  const mascotName = useGameStore((s) => s.mascotName);
  const adoptedTeamId = useGameStore((s) => s.adoptedTeamId);
  const adoptTeam = useGameStore((s) => s.adoptTeam);

  const team = teamId ? getTeam(teamId) : null;
  const adopted = adoptedTeamId ? getTeam(adoptedTeamId) : null;
  if (!team) {
    nav("/select");
    return null;
  }

  const candidates = TEAMS.filter((x) => x.id !== team.id).slice(0, 12);

  return (
    <div className="min-h-screen bg-stadium px-4 py-6">
      <div className="mx-auto max-w-md space-y-4">
        <button onClick={() => nav("/hub")} className="text-sm text-muted hover:text-ink">
          ← {t("common.back")}
        </button>

        <div className="text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mx-auto inline-block"
          >
            <Mascot team={team} mood="sad" size={180} />
          </motion.div>
          <h1 className="mt-2 font-display text-3xl">{t("eliminated.title")}</h1>
          <p className="text-muted">{t("eliminated.subtitle", { mascot: mascotName })}</p>
        </div>

        <Card>
          <div className="mb-1 font-display text-xl">{t("eliminated.adoptTitle")}</div>
          <p className="mb-3 text-sm text-muted">{t("eliminated.adoptSub")}</p>
          {adopted ? (
            <div
              className="flex items-center gap-3 rounded-xl bg-white/[0.04] p-3 ring-1 ring-white/10"
              style={{ boxShadow: `0 0 18px color-mix(in srgb, ${adopted.c[0]} 35%, transparent)` }}
            >
              <Mascot team={adopted} mood="confident" size={48} bob={false} />
              <div className="flex-1 text-sm">
                {t("eliminated.adopted", { team: adopted.name, flag: adopted.flag })}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {candidates.map((c) => (
                <AdoptBtn key={c.id} team={c} onAdopt={() => adoptTeam(c.id)} />
              ))}
            </div>
          )}
        </Card>

        <Card className="text-center">
          <p className="text-sm text-muted">{t("eliminated.keepAlbum")}</p>
          <button
            onClick={() => nav("/album")}
            className="mt-2 font-bold text-[color:var(--team-1)]"
          >
            {t("hub.albumTitle")} →
          </button>
        </Card>
      </div>
    </div>
  );
}

function AdoptBtn({ team, onAdopt }: { team: Team; onAdopt: () => void }) {
  return (
    <button
      onClick={onAdopt}
      title={team.name}
      className="flex flex-col items-center rounded-xl bg-white/[0.04] p-2 ring-1 ring-white/10 hover:bg-white/10"
    >
      <Mascot team={team} mood="idle" size={44} bob={false} />
      <span className="mt-1 w-full truncate text-center text-[10px]">{team.name}</span>
    </button>
  );
}
