import { useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { Welcome } from "@/features/onboarding/Welcome";
import { TeamSelect } from "@/features/onboarding/TeamSelect";
import { MascotReveal } from "@/features/onboarding/MascotReveal";
import { Hub } from "@/features/hub/Hub";
import { Predict } from "@/features/prediction/Predict";
import { LiveMatch } from "@/features/live/LiveMatch";
import { Result } from "@/features/result/Result";
import { Groups } from "@/features/groups/Groups";
import { Album } from "@/features/album/Album";
import { useGameStore } from "@/store/useGameStore";
import { getTeam } from "@/data/teams";
import { applyTeamColorsGlobal } from "@/lib/teamColors";

export default function App() {
  const location = useLocation();
  const teamId = useGameStore((s) => s.teamId);

  // Mantener los colores del equipo aplicados globalmente entre rutas
  useEffect(() => {
    applyTeamColorsGlobal(teamId ? getTeam(teamId) ?? null : null);
  }, [teamId]);

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Welcome />} />
        <Route path="/select" element={<TeamSelect />} />
        <Route path="/mascot/:teamId" element={<MascotReveal />} />
        <Route path="/hub" element={<Hub />} />
        <Route path="/predict/:idx" element={<Predict />} />
        <Route path="/match/:idx" element={<LiveMatch />} />
        <Route path="/result/:idx" element={<Result />} />
        <Route path="/groups" element={<Groups />} />
        <Route path="/album" element={<Album />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
}
