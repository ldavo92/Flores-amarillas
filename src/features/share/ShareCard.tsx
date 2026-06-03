import { forwardRef } from "react";
import { useTranslation } from "react-i18next";
import { Mascot } from "@/mascots/Mascot";
import type { Team } from "@/data/teams";

interface Props {
  team: Team;
  mascotName: string;
  rival: Team;
  scoreYou: number;
  scoreRival: number;
  city: string;
  predResult?: { exact: boolean; correct: boolean; points: number };
  format?: "story" | "square";
}

export const ShareCard = forwardRef<HTMLDivElement, Props>(function ShareCard(
  { team, mascotName, rival, scoreYou, scoreRival, city, predResult, format = "square" },
  ref,
) {
  const { t } = useTranslation();
  const aspect = format === "story" ? "aspect-[9/16]" : "aspect-square";
  const won = scoreYou > scoreRival;
  const drew = scoreYou === scoreRival;
  const headline = won ? t("share.takesIt") : drew ? t("share.draw") : t("share.prideClose");

  return (
    <div
      ref={ref}
      className={`relative w-full ${aspect} rounded-2xl overflow-hidden flex flex-col bg-stadium`}
      style={{
        background: `radial-gradient(120% 70% at 50% 0%, color-mix(in srgb, ${team.c[0]} 30%, transparent), transparent 70%), linear-gradient(180deg, var(--night), #060916)`,
      }}
    >
      <div className="absolute top-3 left-3 right-3 flex justify-between items-center z-10">
        <div className="font-display text-xl tracking-wider">
          MUNDIAL<span style={{ color: team.c[0] }}>GO</span>
        </div>
        <div className="text-[10px] uppercase tracking-widest text-muted">{city}</div>
      </div>

      <div className="flex-1 flex items-center justify-center relative">
        <Mascot team={team} mood={won ? "euphoric" : drew ? "idle" : "sad"} size={220} bob={false} />
      </div>

      <div className="px-5 pb-5 pt-3 space-y-3 z-10">
        <div className="font-display text-2xl text-center" style={{ color: team.c[1] }}>
          {headline}
        </div>
        <div className="flex items-center justify-center gap-4 text-3xl font-display">
          <span className="flex items-center gap-2">
            <span className="text-2xl">{team.flag}</span>
            <span style={{ color: team.c[0] }}>{scoreYou}</span>
          </span>
          <span className="text-muted">—</span>
          <span className="flex items-center gap-2">
            <span style={{ color: rival.c[0] }}>{scoreRival}</span>
            <span className="text-2xl">{rival.flag}</span>
          </span>
        </div>
        <p className="text-center text-sm text-muted">
          {mascotName} · {city} · {t("common.vs")} {rival.name}
        </p>
        {predResult && (
          <div className="text-center text-xs uppercase tracking-wider">
            {predResult.exact ? (
              <span className="text-grass">{t("share.exactPred", { points: predResult.points })}</span>
            ) : predResult.correct ? (
              <span className="text-gold">{t("share.correctPred", { points: predResult.points })}</span>
            ) : (
              <span className="text-muted">{t("share.missPred")}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
});
