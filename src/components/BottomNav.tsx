import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";

const TABS = [
  { to: "/hub", key: "hub", icon: "🏠" },
  { to: "/groups", key: "groups", icon: "🏟️" },
  { to: "/bracket", key: "bracket", icon: "🏆" },
  { to: "/album", key: "album", icon: "🦄" },
  { to: "/settings", key: "settings", icon: "⚙️" },
] as const;

export function BottomNav() {
  const { t } = useTranslation();
  return (
    <nav
      aria-label={t("nav.hub")}
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-night/90 backdrop-blur"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="mx-auto flex max-w-2xl items-stretch justify-around">
        {TABS.map((tab) => (
          <li key={tab.key} className="flex-1">
            <NavLink
              to={tab.to}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 py-2 text-[10px] uppercase tracking-wide transition-colors ${
                  isActive ? "text-[color:var(--team-1)]" : "text-muted hover:text-ink"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className="text-xl leading-none"
                    style={isActive ? { filter: "drop-shadow(0 0 6px var(--team-1))" } : undefined}
                  >
                    {tab.icon}
                  </span>
                  <span>{t(`nav.${tab.key}`)}</span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/** Envoltura para pantallas internas: deja espacio para la barra inferior. */
export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="pb-16">{children}</div>
      <BottomNav />
    </>
  );
}
