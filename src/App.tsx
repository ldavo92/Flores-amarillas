import { Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import HostPage from "./pages/HostPage";
import ScreenPage from "./pages/ScreenPage";
import JoinPage from "./pages/JoinPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/host/:roomCode" element={<HostPage />} />
      <Route path="/screen/:roomCode" element={<ScreenPage />} />
      <Route path="/join/:roomCode" element={<JoinPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
