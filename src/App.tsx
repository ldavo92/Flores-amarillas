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
import { Bracket } from "@/features/bracket/Bracket";
import { Settings } from "@/features/settings/Settings";
import { Eliminated } from "@/features/eliminated/Eliminated";
import { Achievements } from "@/features/achievements/Achievements";
import { AppShell } from "@/components/BottomNav";
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
        {/* Flujos full-screen (sin barra inferior) */}
        <Route path="/" element={<Welcome />} />
        <Route path="/select" element={<TeamSelect />} />
        <Route path="/mascot/:teamId" element={<MascotReveal />} />
        <Route path="/predict/:idx" element={<Predict />} />
        <Route path="/match/:idx" element={<LiveMatch />} />
        <Route path="/result/:idx" element={<Result />} />
        <Route path="/eliminated" element={<Eliminated />} />

        {/* Pantallas internas con navegación inferior */}
        <Route path="/hub" element={<AppShell><Hub /></AppShell>} />
        <Route path="/groups" element={<AppShell><Groups /></AppShell>} />
        <Route path="/bracket" element={<AppShell><Bracket /></AppShell>} />
        <Route path="/album" element={<AppShell><Album /></AppShell>} />
        <Route path="/achievements" element={<AppShell><Achievements /></AppShell>} />
        <Route path="/settings" element={<AppShell><Settings /></AppShell>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
}
