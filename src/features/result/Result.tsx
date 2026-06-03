import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getTeam } from "@/data/teams";
import { teamSchedule } from "@/data/matches";
import { useGameStore } from "@/store/useGameStore";
import { ShareCard } from "@/features/share/ShareCard";
import { Button } from "@/components/Button";
import { Chip } from "@/components/Chip";
import { nodeToPng, downloadDataUrl, shareImage } from "@/lib/share";

export function Result() {
  const { idx } = useParams();
  const nav = useNavigate();
  const { t } = useTranslation();
  const teamId = useGameStore((s) => s.teamId);
  const predictions = useGameStore((s) => s.predictions);
  const status = useGameStore((s) => s.status);
  const mascotName = useGameStore((s) => s.mascotName);

  const team = teamId ? getTeam(teamId) : null;
  const i = parseInt(idx ?? "0", 10);
  const schedule = team ? teamSchedule(team.id) : [];
  const match = schedule[i];
  const rival = match ? getTeam(match.h === team?.id ? match.a : match.h) : null;

  const [format, setFormat] = useState<"story" | "square">("square");
  const [busy, setBusy] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  if (!team || !match || !rival) return null;

  const pred = predictions[match.iso];
  const youScore = pred?.ph ?? 1;
  const rivScore = pred?.pa ?? 0;
  const predPts = pred?.points ?? 0;
  const exact = predPts === 50;
  const correct = predPts >= 20;

  const onShare = async () => {
    if (!cardRef.current || busy) return;
    setBusy(true);
    try {
      const png = await nodeToPng(cardRef.current);
      await shareImage(png, `mundialgo-${team.id}.png`, `${team.name} ${youScore}-${rivScore} ${rival.name} · MundialGo`);
    } finally {
      setBusy(false);
    }
  };
  const onDownload = async () => {
    if (!cardRef.current || busy) return;
    setBusy(true);
    try {
      const png = await nodeToPng(cardRef.current);
      downloadDataUrl(png, `mundialgo-${team.id}.png`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-stadium pb-10">
      <div className="max-w-md mx-auto px-4 py-6">
        <button onClick={() => nav("/hub")} className="text-muted text-sm mb-4">
          ← {t("result.hub")}
        </button>

        <motion.h2 initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="font-display text-3xl mb-1">
          {status === "advanced" ? t("result.advanced") : status === "eliminated" ? t("result.eliminated") : t("result.result")}
        </motion.h2>
        <p className="text-muted text-sm mb-4">{t("result.shareCardSub")}</p>

        <div className="flex gap-2 mb-4">
          <button onClick={() => setFormat("square")}>
            <Chip color={format === "square" ? "#16e07a" : "#9ba6c2"}>{t("result.square")}</Chip>
          </button>
          <button onClick={() => setFormat("story")}>
            <Chip color={format === "story" ? "#16e07a" : "#9ba6c2"}>{t("result.story")}</Chip>
          </button>
        </div>

        <div className="mb-5">
          <ShareCard
            ref={cardRef}
            team={team}
            mascotName={mascotName}
            rival={rival}
            scoreYou={youScore}
            scoreRival={rivScore}
            city={match.city}
            predResult={{ exact, correct, points: predPts }}
            format={format}
          />
        </div>

        <div className="flex gap-2">
          <Button size="md" variant="gold" className="flex-1" disabled={busy} onClick={onShare}>
            {t("result.share")}
          </Button>
          <Button size="md" variant="ghost" disabled={busy} onClick={onDownload}>
            {t("result.download")}
          </Button>
          <Button size="md" variant="ghost" onClick={() => nav("/hub")}>
            {t("result.hub")}
          </Button>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <Stat
            label={t("result.predictionStat")}
            value={exact ? t("result.statExact") : correct ? t("result.statResult") : t("result.statMiss")}
            hint={`+${predPts} XP`}
          />
          <Stat
            label={t("result.statusStat")}
            value={
              status === "advanced"
                ? t("result.statAdvanced")
                : status === "eliminated"
                  ? t("result.statEliminated")
                  : t("result.statActive")
            }
            hint={team.name}
          />
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-xl bg-white/[0.04] ring-1 ring-white/10 p-3">
      <div className="text-[10px] uppercase tracking-widest text-muted">{label}</div>
      <div className="font-display text-xl">{value}</div>
      {hint && <div className="text-xs text-muted">{hint}</div>}
    </div>
  );
}
