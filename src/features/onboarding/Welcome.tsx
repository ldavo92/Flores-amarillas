import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/Button";

export function Welcome() {
  const nav = useNavigate();
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-stadium flex items-center justify-center px-6 py-10">
      <div className="max-w-md w-full text-center">
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", damping: 12 }}
          className="text-8xl mb-4"
        >
          ⚽
        </motion.div>
        <motion.h1
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="font-display text-6xl leading-none tracking-tight mb-2"
        >
          MUNDIAL<span className="text-grass">GO</span>
        </motion.h1>
        <motion.p
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-muted text-lg mb-8"
        >
          {t("welcome.tagline")}
        </motion.p>

        <div className="grid grid-cols-3 gap-3 mb-8">
          {[
            { e: "🦄", t: t("welcome.mascot") },
            { e: "🗺️", t: t("welcome.venues") },
            { e: "🔥", t: t("welcome.live") },
          ].map((x, i) => (
            <motion.div
              key={x.t}
              initial={{ y: 16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 + i * 0.1 }}
              className="rounded-xl bg-white/[0.04] ring-1 ring-white/10 p-3"
            >
              <div className="text-3xl mb-1">{x.e}</div>
              <div className="text-xs uppercase tracking-wider text-muted">{x.t}</div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.9 }}
        >
          <Button size="lg" onClick={() => nav("/select")} className="w-full">
            {t("welcome.start")}
          </Button>
        </motion.div>

        <p className="mt-6 text-xs text-muted">{t("welcome.footer")}</p>
      </div>
    </div>
  );
}
