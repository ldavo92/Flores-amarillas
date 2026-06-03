import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useGameStore } from "@/store/useGameStore";
import { getTeam } from "@/data/teams";
import { teamSchedule } from "@/data/matches";
import { StepperInput } from "@/components/StepperInput";
import { Button } from "@/components/Button";
import { Chip } from "@/components/Chip";
import { Card } from "@/components/Card";
import { Mascot } from "@/mascots/Mascot";

export function Predict() {
  const { idx } = useParams();
  const nav = useNavigate();
  const { t, i18n } = useTranslation();
  const teamId = useGameStore((s) => s.teamId);
  const savePrediction = useGameStore((s) => s.savePrediction);
  const predictions = useGameStore((s) => s.predictions);
  const team = teamId ? getTeam(teamId) : null;
  const i = parseInt(idx ?? "0", 10);
  const schedule = team ? teamSchedule(team.id) : [];
  const match = schedule[i];
  const rival = match ? getTeam(match.h === team?.id ? match.a : match.h) : null;
  const isHome = team && match ? match.h === team.id : true;
  const stored = match ? predictions[match.iso] : undefined;

  const [you, setYou] = useState(stored?.ph ?? 2);
  const [riv, setRiv] = useState(stored?.pa ?? 1);

  if (!team || !match || !rival) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-stadium text-center">
        <div>
          <p className="text-muted mb-4">{t("predict.notFound")}</p>
          <Button onClick={() => nav("/hub")}>{t("common.back")}</Button>
        </div>
      </div>
    );
  }

  const onSave = () => {
    savePrediction(match.iso, you, riv);
    nav(`/match/${i}`);
  };

  return (
    <div className="min-h-screen bg-stadium px-4 py-6 pb-24">
      <div className="max-w-md mx-auto">
        <button onClick={() => nav("/hub")} className="text-muted text-sm mb-4 hover:text-ink">
          ← {t("common.back")}
        </button>

        <Card>
          <div className="text-center mb-4">
            <Chip color={team.c[1]}>{t("predict.title")}</Chip>
            <h2 className="font-display text-2xl mt-2">{match.city}</h2>
            <p className="text-xs text-muted">{match.st}</p>
            <p className="text-xs text-muted">{fmt(match.iso, i18n.language)}</p>
          </div>

          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex justify-center mb-3">
            <Mascot team={team} mood="confident" size={140} />
          </motion.div>

          <div className="flex items-center justify-center gap-4 my-4">
            <div className="text-center">
              <div className="text-4xl mb-1">{team.flag}</div>
              <div className="text-xs uppercase tracking-widest text-muted mb-2">
                {isHome ? t("predict.home") : t("predict.away")}
              </div>
              <StepperInput value={you} onChange={setYou} color={team.c[0]} label={t("predict.yourTeam")} />
            </div>
            <div className="text-3xl text-muted">–</div>
            <div className="text-center">
              <div className="text-4xl mb-1">{rival.flag}</div>
              <div className="text-xs uppercase tracking-widest text-muted mb-2">
                {isHome ? t("predict.away") : t("predict.home")}
              </div>
              <StepperInput value={riv} onChange={setRiv} color={rival.c[0]} label={t("predict.rival")} />
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-2 my-4">
            <Chip color="#16e07a">{t("predict.exact")}</Chip>
            <Chip color="#ffd24a">{t("predict.result")}</Chip>
            <Chip>{t("predict.miss")}</Chip>
          </div>

          <Button size="lg" className="w-full" onClick={onSave}>
            {t("predict.saveCta")}
          </Button>
        </Card>
      </div>
    </div>
  );
}

function fmt(iso: string, lang: string): string {
  const locale = lang === "en" ? "en-US" : lang === "pt" ? "pt-BR" : "es-MX";
  return new Date(iso).toLocaleString(locale, {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}
