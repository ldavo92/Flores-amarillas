import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useGameStore } from "@/store/useGameStore";
import { applyTheme } from "@/lib/theme";
import i18n, { LANG_LABELS, SUPPORTED_LANGS, type Lang } from "@/lib/i18n";
import { useInstallPrompt } from "@/lib/pwa";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";

export function Settings() {
  const { t } = useTranslation();
  const nav = useNavigate();
  const audioOn = useGameStore((s) => s.audioOn);
  const hapticsOn = useGameStore((s) => s.hapticsOn);
  const lowDataMode = useGameStore((s) => s.lowDataMode);
  const theme = useGameStore((s) => s.theme);
  const toggleAudio = useGameStore((s) => s.toggleAudio);
  const toggleHaptics = useGameStore((s) => s.toggleHaptics);
  const toggleLowData = useGameStore((s) => s.toggleLowData);
  const setTheme = useGameStore((s) => s.setTheme);
  const reset = useGameStore((s) => s.reset);
  const { canInstall, installed, promptInstall } = useInstallPrompt();

  const [lang, setLang] = useState<string>(i18n.resolvedLanguage ?? "es");
  const [confirmReset, setConfirmReset] = useState(false);

  const changeLang = (l: Lang) => {
    void i18n.changeLanguage(l);
    setLang(l);
  };
  const changeTheme = (tm: "dark" | "light") => {
    setTheme(tm);
    applyTheme(tm);
  };

  return (
    <div className="min-h-screen bg-stadium px-4 py-6">
      <div className="mx-auto max-w-md space-y-4">
        <h1 className="font-display text-3xl">{t("settings.title")}</h1>

        {/* Idioma */}
        <Card>
          <div className="mb-2 text-xs uppercase tracking-widest text-muted">
            {t("settings.language")}
          </div>
          <div className="grid grid-cols-3 gap-2">
            {SUPPORTED_LANGS.map((l) => (
              <button
                key={l}
                onClick={() => changeLang(l)}
                className={`rounded-xl py-2.5 text-sm font-semibold ring-1 transition-colors ${
                  lang === l
                    ? "bg-[color:var(--team-1)] text-black ring-transparent"
                    : "bg-white/[0.04] text-ink ring-white/10 hover:bg-white/10"
                }`}
                aria-pressed={lang === l}
              >
                {LANG_LABELS[l]}
              </button>
            ))}
          </div>
        </Card>

        {/* Tema */}
        <Card>
          <div className="mb-2 text-xs uppercase tracking-widest text-muted">
            {t("settings.theme")}
          </div>
          <div className="grid grid-cols-2 gap-2">
            {(["dark", "light"] as const).map((tm) => (
              <button
                key={tm}
                onClick={() => changeTheme(tm)}
                className={`rounded-xl py-2.5 text-sm font-semibold ring-1 transition-colors ${
                  theme === tm
                    ? "bg-[color:var(--team-1)] text-black ring-transparent"
                    : "bg-white/[0.04] text-ink ring-white/10 hover:bg-white/10"
                }`}
                aria-pressed={theme === tm}
              >
                {tm === "dark" ? `🌙 ${t("settings.themeDark")}` : `☀️ ${t("settings.themeLight")}`}
              </button>
            ))}
          </div>
        </Card>

        {/* Toggles */}
        <Card>
          <ToggleRow label={t("settings.audio")} on={audioOn} onToggle={toggleAudio} icon="🔊" />
          <ToggleRow label={t("settings.haptics")} on={hapticsOn} onToggle={toggleHaptics} icon="📳" />
          <ToggleRow
            label={t("settings.lowData")}
            hint={t("settings.lowDataHint")}
            on={lowDataMode}
            onToggle={toggleLowData}
            icon="⚡"
          />
        </Card>

        {/* PWA install */}
        <Card>
          {installed ? (
            <div className="text-center text-sm text-grass">{t("settings.installed")}</div>
          ) : (
            <Button
              variant="ghost"
              className="w-full"
              onClick={() => void promptInstall()}
              disabled={!canInstall}
            >
              📲 {t("settings.install")}
            </Button>
          )}
        </Card>

        {/* About + reset */}
        <Card>
          <p className="mb-4 text-xs leading-relaxed text-muted">{t("settings.about")}</p>
          {confirmReset ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-2"
            >
              <p className="text-sm text-ink">{t("settings.resetConfirm")}</p>
              <div className="flex gap-2">
                <Button
                  variant="danger"
                  className="flex-1"
                  onClick={() => {
                    reset();
                    nav("/");
                  }}
                >
                  {t("settings.resetCta")}
                </Button>
                <Button variant="ghost" onClick={() => setConfirmReset(false)}>
                  {t("settings.cancel")}
                </Button>
              </div>
            </motion.div>
          ) : (
            <Button variant="ghost" className="w-full" onClick={() => setConfirmReset(true)}>
              🗑️ {t("settings.reset")}
            </Button>
          )}
        </Card>
      </div>
    </div>
  );
}

function ToggleRow({
  label,
  hint,
  on,
  onToggle,
  icon,
}: {
  label: string;
  hint?: string;
  on: boolean;
  onToggle: () => void;
  icon: string;
}) {
  return (
    <div className="flex items-center gap-3 py-2.5">
      <span className="text-xl">{icon}</span>
      <div className="flex-1">
        <div className="font-semibold">{label}</div>
        {hint && <div className="text-xs text-muted">{hint}</div>}
      </div>
      <button
        role="switch"
        aria-checked={on}
        aria-label={label}
        onClick={onToggle}
        className={`relative h-7 w-12 rounded-full transition-colors ${
          on ? "bg-[color:var(--team-1)]" : "bg-white/15"
        }`}
      >
        <span
          className="absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-all"
          style={{ left: on ? "calc(100% - 1.625rem)" : "0.125rem" }}
        />
      </button>
    </div>
  );
}
