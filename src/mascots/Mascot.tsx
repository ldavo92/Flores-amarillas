import { motion } from "framer-motion";
import type { Team } from "@/data/teams";
import type { MascotMood } from "@/store/useGameStore";

interface Props {
  team: Team;
  mood?: MascotMood;
  size?: number;
  bob?: boolean;
}

/** Mascota paramétrica original — IP 100% propia (§6 del brief).
 *  Body color tomado de team.c[0]; acento de c[1]; ojos de c[2].
 *  El rasgo distintivo se dibuja según team.trait. */
export function Mascot({ team, mood = "idle", size = 180, bob = true }: Props) {
  const [body, accent, eyes] = team.c;
  const isCelebrating = mood === "euphoric";
  const isSad = mood === "sad";
  const isNervous = mood === "nervous";

  // Expresiones por humor
  const eyeOpenY = isSad ? 4 : isNervous ? 1 : 0;
  const mouthD = isCelebrating
    ? "M 70 130 Q 100 158 130 130"
    : isSad
      ? "M 72 138 Q 100 118 128 138"
      : "M 78 132 Q 100 142 122 132";

  return (
    <motion.svg
      viewBox="0 0 200 200"
      width={size}
      height={size}
      role="img"
      aria-label={`Mascota original de ${team.name}`}
      style={{ overflow: "visible" }}
      animate={bob ? { y: [0, -6, 0] } : undefined}
      transition={bob ? { duration: 2.4, repeat: Infinity, ease: "easeInOut" } : undefined}
    >
      <defs>
        <radialGradient id={`g-${team.id}`} cx="50%" cy="40%" r="65%">
          <stop offset="0%" stopColor={accent} stopOpacity="0.9" />
          <stop offset="60%" stopColor={body} />
          <stop offset="100%" stopColor={shadeHex(body, -25)} />
        </radialGradient>
        <linearGradient id={`acc-${team.id}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={accent} />
          <stop offset="100%" stopColor={shadeHex(accent, -15)} />
        </linearGradient>
        <filter id={`glow-${team.id}`} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="4" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* sombra suelo */}
      <ellipse cx="100" cy="186" rx="58" ry="8" fill="#000" opacity="0.28" />

      {/* rasgo distintivo (detrás del cuerpo si aplica) */}
      {team.trait === "horns" && (
        <>
          <path d="M 58 60 Q 48 28 70 22 L 78 52 Z" fill={accent} stroke={shadeHex(accent, -25)} strokeWidth="2" />
          <path d="M 142 60 Q 152 28 130 22 L 122 52 Z" fill={accent} stroke={shadeHex(accent, -25)} strokeWidth="2" />
        </>
      )}
      {team.trait === "ears" && (
        <>
          <ellipse cx="58" cy="52" rx="14" ry="22" fill={body} stroke={shadeHex(body, -25)} strokeWidth="2" transform="rotate(-18 58 52)" />
          <ellipse cx="142" cy="52" rx="14" ry="22" fill={body} stroke={shadeHex(body, -25)} strokeWidth="2" transform="rotate(18 142 52)" />
          <ellipse cx="58" cy="58" rx="6" ry="12" fill={accent} transform="rotate(-18 58 58)" />
          <ellipse cx="142" cy="58" rx="6" ry="12" fill={accent} transform="rotate(18 142 58)" />
        </>
      )}
      {team.trait === "crest" && (
        <path
          d="M 70 38 L 84 18 L 92 38 L 100 12 L 108 38 L 116 18 L 130 38 Z"
          fill={`url(#acc-${team.id})`}
          stroke={shadeHex(accent, -30)}
          strokeWidth="2"
          strokeLinejoin="round"
        />
      )}
      {team.trait === "antenna" && (
        <>
          <line x1="100" y1="48" x2="100" y2="14" stroke={accent} strokeWidth="3" strokeLinecap="round" />
          <motion.circle
            cx="100"
            cy="12"
            r="7"
            fill={accent}
            filter={`url(#glow-${team.id})`}
            animate={{ scale: [1, 1.25, 1] }}
            transition={{ duration: 1.6, repeat: Infinity }}
          />
        </>
      )}
      {team.trait === "star" && (
        <motion.g
          animate={{ rotate: 360 }}
          transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
          style={{ transformOrigin: "100px 30px" }}
        >
          <path
            d="M 100 8 L 108 26 L 128 28 L 113 42 L 118 62 L 100 52 L 82 62 L 87 42 L 72 28 L 92 26 Z"
            fill={accent}
            stroke={shadeHex(accent, -30)}
            strokeWidth="1.5"
            filter={`url(#glow-${team.id})`}
          />
        </motion.g>
      )}
      {team.trait === "round" && (
        <circle cx="100" cy="34" r="14" fill={accent} stroke={shadeHex(accent, -30)} strokeWidth="2" />
      )}

      {/* Cuerpo principal */}
      <motion.g
        animate={
          isCelebrating
            ? { rotate: [0, -6, 6, -4, 4, 0] }
            : isNervous
              ? { x: [0, -1, 1, -1, 0] }
              : undefined
        }
        transition={
          isCelebrating
            ? { duration: 0.8, repeat: Infinity }
            : isNervous
              ? { duration: 0.4, repeat: Infinity }
              : undefined
        }
        style={{ transformOrigin: "100px 110px" }}
      >
        {/* cuerpo huevo */}
        <ellipse cx="100" cy="115" rx="56" ry="62" fill={`url(#g-${team.id})`} stroke={shadeHex(body, -30)} strokeWidth="2.5" />

        {/* panza */}
        <ellipse cx="100" cy="130" rx="36" ry="40" fill={accent} opacity="0.35" />

        {/* brazos */}
        <motion.g
          animate={isCelebrating ? { rotate: [-30, -10, -30] } : { rotate: [-5, 5, -5] }}
          transition={{ duration: isCelebrating ? 0.5 : 2.4, repeat: Infinity, ease: "easeInOut" }}
          style={{ transformOrigin: "60px 120px" }}
        >
          <ellipse cx="46" cy="128" rx="13" ry="22" fill={body} stroke={shadeHex(body, -30)} strokeWidth="2" transform="rotate(-18 46 128)" />
        </motion.g>
        <motion.g
          animate={isCelebrating ? { rotate: [30, 10, 30] } : { rotate: [5, -5, 5] }}
          transition={{ duration: isCelebrating ? 0.5 : 2.4, repeat: Infinity, ease: "easeInOut" }}
          style={{ transformOrigin: "140px 120px" }}
        >
          <ellipse cx="154" cy="128" rx="13" ry="22" fill={body} stroke={shadeHex(body, -30)} strokeWidth="2" transform="rotate(18 154 128)" />
        </motion.g>

        {/* pies */}
        <ellipse cx="78" cy="178" rx="14" ry="6" fill={shadeHex(body, -35)} />
        <ellipse cx="122" cy="178" rx="14" ry="6" fill={shadeHex(body, -35)} />

        {/* cara: ojos */}
        <motion.g
          animate={{ scaleY: [1, 1, 0.1, 1] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          style={{ transformOrigin: "100px 100px" }}
        >
          <ellipse cx="80" cy={100 + eyeOpenY} rx="9" ry="11" fill="#fff" />
          <ellipse cx="120" cy={100 + eyeOpenY} rx="9" ry="11" fill="#fff" />
          <circle cx={isNervous ? 78 : 82} cy={102 + eyeOpenY} r="4.5" fill={eyes} />
          <circle cx={isNervous ? 118 : 122} cy={102 + eyeOpenY} r="4.5" fill={eyes} />
          <circle cx={isNervous ? 80 : 84} cy={100 + eyeOpenY} r="1.6" fill="#fff" />
          <circle cx={isNervous ? 120 : 124} cy={100 + eyeOpenY} r="1.6" fill="#fff" />
        </motion.g>

        {/* mejillas */}
        <circle cx="70" cy="120" r="6" fill={accent} opacity="0.55" />
        <circle cx="130" cy="120" r="6" fill={accent} opacity="0.55" />

        {/* boca */}
        <path d={mouthD} stroke="#1a1010" strokeWidth="3" fill="none" strokeLinecap="round" />

        {/* lágrima (si triste) */}
        {isSad && (
          <motion.path
            d="M 80 113 Q 78 124 84 128 Q 90 124 88 113"
            fill="#8ecbff"
            initial={{ opacity: 0, y: -2 }}
            animate={{ opacity: [0, 1, 0], y: [0, 18, 24] }}
            transition={{ duration: 2.2, repeat: Infinity }}
          />
        )}
      </motion.g>
    </motion.svg>
  );
}

// Util: oscurecer/aclarar hex color
function shadeHex(hex: string, percent: number): string {
  const f = parseInt(hex.replace("#", ""), 16);
  const t = percent < 0 ? 0 : 255;
  const p = Math.abs(percent) / 100;
  const R = (f >> 16) & 0xff;
  const G = (f >> 8) & 0xff;
  const B = f & 0xff;
  const r = Math.round((t - R) * p) + R;
  const g = Math.round((t - G) * p) + G;
  const b = Math.round((t - B) * p) + B;
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}
