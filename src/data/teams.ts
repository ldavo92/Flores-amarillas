// Datos reales 2026 §5.1 — 48 selecciones confirmadas
// trait: rasgo único de mascota (horns|ears|crest|antenna|star|round)
// c: [primary, secondary, tertiary] colores de bandera
export type MascotTrait = "horns" | "ears" | "crest" | "antenna" | "star" | "round";
export type GroupCode =
  | "A" | "B" | "C" | "D" | "E" | "F"
  | "G" | "H" | "I" | "J" | "K" | "L";

export interface Team {
  readonly id: string;
  readonly name: string;
  readonly flag: string;
  readonly group: GroupCode;
  readonly trait: MascotTrait;
  readonly c: readonly [string, string, string];
}

export const TEAMS: readonly Team[] = [
  // — GRUPO A —
  { id: "mex", name: "México",         flag: "🇲🇽", group: "A", trait: "horns",   c: ["#0a8f4f","#ffffff","#d4264b"] },
  { id: "rsa", name: "Sudáfrica",      flag: "🇿🇦", group: "A", trait: "crest",   c: ["#007a4d","#ffb612","#de3831"] },
  { id: "kor", name: "Corea del Sur",  flag: "🇰🇷", group: "A", trait: "antenna", c: ["#1b53b3","#d4264b","#ffffff"] },
  { id: "cze", name: "Chequia",        flag: "🇨🇿", group: "A", trait: "ears",    c: ["#11457e","#d7141a","#ffffff"] },
  // — GRUPO B —
  { id: "can", name: "Canadá",         flag: "🇨🇦", group: "B", trait: "star",    c: ["#d4264b","#ffffff","#b0b8c4"] },
  { id: "qat", name: "Catar",          flag: "🇶🇦", group: "B", trait: "round",   c: ["#8a1538","#ffffff","#6e1030"] },
  { id: "sui", name: "Suiza",          flag: "🇨🇭", group: "B", trait: "horns",   c: ["#d4264b","#ffffff","#b01b35"] },
  { id: "bih", name: "Bosnia y H.",    flag: "🇧🇦", group: "B", trait: "crest",   c: ["#002395","#ffd100","#ffffff"] },
  // — GRUPO C —
  { id: "bra", name: "Brasil",         flag: "🇧🇷", group: "C", trait: "star",    c: ["#ffd21f","#10a05a","#1b3a8f"] },
  { id: "mar", name: "Marruecos",      flag: "🇲🇦", group: "C", trait: "ears",    c: ["#c1272d","#0a8f4f","#ffffff"] },
  { id: "hai", name: "Haití",          flag: "🇭🇹", group: "C", trait: "antenna", c: ["#00209f","#d21034","#ffffff"] },
  { id: "sco", name: "Escocia",        flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿", group: "C", trait: "horns",   c: ["#0065bf","#ffffff","#0b1f3a"] },
  // — GRUPO D —
  { id: "usa", name: "Estados Unidos", flag: "🇺🇸", group: "D", trait: "star",    c: ["#3c4a9e","#d4264b","#ffffff"] },
  { id: "par", name: "Paraguay",       flag: "🇵🇾", group: "D", trait: "crest",   c: ["#d52b1e","#0038a8","#ffffff"] },
  { id: "aus", name: "Australia",      flag: "🇦🇺", group: "D", trait: "ears",    c: ["#00843d","#ffcd00","#012169"] },
  { id: "tur", name: "Türkiye",        flag: "🇹🇷", group: "D", trait: "round",   c: ["#e30a17","#ffffff","#b00712"] },
  // — GRUPO E —
  { id: "ger", name: "Alemania",       flag: "🇩🇪", group: "E", trait: "crest",   c: ["#1c1c22","#dd0000","#ffce00"] },
  { id: "cuw", name: "Curazao",        flag: "🇨🇼", group: "E", trait: "antenna", c: ["#0038a8","#f9d616","#ffffff"] },
  { id: "civ", name: "Costa de Marfil",flag: "🇨🇮", group: "E", trait: "horns",   c: ["#f77f00","#ffffff","#009e60"] },
  { id: "ecu", name: "Ecuador",        flag: "🇪🇨", group: "E", trait: "star",    c: ["#ffd100","#0072ce","#ef3340"] },
  // — GRUPO F —
  { id: "ned", name: "Países Bajos",   flag: "🇳🇱", group: "F", trait: "horns",   c: ["#ff6c2f","#ffffff","#21468b"] },
  { id: "jpn", name: "Japón",          flag: "🇯🇵", group: "F", trait: "antenna", c: ["#1b3a8f","#ffffff","#bc002d"] },
  { id: "tun", name: "Túnez",          flag: "🇹🇳", group: "F", trait: "round",   c: ["#e70013","#ffffff","#b0000f"] },
  { id: "swe", name: "Suecia",         flag: "🇸🇪", group: "F", trait: "crest",   c: ["#1b53b3","#ffcd00","#0f3a86"] },
  // — GRUPO G —
  { id: "bel", name: "Bélgica",        flag: "🇧🇪", group: "G", trait: "ears",    c: ["#1c1c22","#fdda24","#ef3340"] },
  { id: "egy", name: "Egipto",         flag: "🇪🇬", group: "G", trait: "crest",   c: ["#ce1126","#ffffff","#1c1c22"] },
  { id: "irn", name: "Irán",           flag: "🇮🇷", group: "G", trait: "star",    c: ["#239f40","#ffffff","#da0000"] },
  { id: "nzl", name: "Nueva Zelanda",  flag: "🇳🇿", group: "G", trait: "horns",   c: ["#00247d","#cc142b","#ffffff"] },
  // — GRUPO H —
  { id: "esp", name: "España",         flag: "🇪🇸", group: "H", trait: "crest",   c: ["#d4264b","#ffcf2e","#a01827"] },
  { id: "cpv", name: "Cabo Verde",     flag: "🇨🇻", group: "H", trait: "antenna", c: ["#003893","#ffffff","#cf2027"] },
  { id: "uru", name: "Uruguay",        flag: "🇺🇾", group: "H", trait: "round",   c: ["#6cb6e8","#ffffff","#fcd116"] },
  { id: "ksa", name: "Arabia Saudita", flag: "🇸🇦", group: "H", trait: "star",    c: ["#006c35","#ffffff","#02502a"] },
  // — GRUPO I —
  { id: "fra", name: "Francia",        flag: "🇫🇷", group: "I", trait: "ears",    c: ["#1b3a8f","#ffffff","#d4264b"] },
  { id: "sen", name: "Senegal",        flag: "🇸🇳", group: "I", trait: "crest",   c: ["#00853f","#fdef42","#e31b23"] },
  { id: "nor", name: "Noruega",        flag: "🇳🇴", group: "I", trait: "horns",   c: ["#ba0c2f","#ffffff","#00205b"] },
  { id: "irq", name: "Irak",           flag: "🇮🇶", group: "I", trait: "round",   c: ["#007a3d","#ffffff","#1c1c22"] },
  // — GRUPO J —
  { id: "arg", name: "Argentina",      flag: "🇦🇷", group: "J", trait: "star",    c: ["#6cb6e8","#ffffff","#ffcf2e"] },
  { id: "alg", name: "Argelia",        flag: "🇩🇿", group: "J", trait: "crest",   c: ["#006633","#ffffff","#d21034"] },
  { id: "aut", name: "Austria",        flag: "🇦🇹", group: "J", trait: "ears",    c: ["#ed2939","#ffffff","#c41f2e"] },
  { id: "jor", name: "Jordania",       flag: "🇯🇴", group: "J", trait: "antenna", c: ["#007a3d","#ffffff","#ce1126"] },
  // — GRUPO K —
  { id: "por", name: "Portugal",       flag: "🇵🇹", group: "K", trait: "horns",   c: ["#006233","#d4264b","#ffd100"] },
  { id: "col", name: "Colombia",       flag: "🇨🇴", group: "K", trait: "star",    c: ["#ffcf2e","#1b3a8f","#d4264b"] },
  { id: "uzb", name: "Uzbekistán",     flag: "🇺🇿", group: "K", trait: "crest",   c: ["#1eb53a","#ffffff","#0099b5"] },
  { id: "cod", name: "RD Congo",       flag: "🇨🇩", group: "K", trait: "antenna", c: ["#007fff","#f7d618","#ce1021"] },
  // — GRUPO L —
  { id: "eng", name: "Inglaterra",     flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", group: "L", trait: "crest",   c: ["#dfe6f0","#cf142b","#00247d"] },
  { id: "cro", name: "Croacia",        flag: "🇭🇷", group: "L", trait: "ears",    c: ["#e8294a","#ffffff","#1b3a8f"] },
  { id: "gha", name: "Ghana",          flag: "🇬🇭", group: "L", trait: "star",    c: ["#ce1126","#fcd116","#006b3f"] },
  { id: "pan", name: "Panamá",         flag: "🇵🇦", group: "L", trait: "round",   c: ["#005293","#d21034","#ffffff"] },
] as const;

export const GROUPS: readonly GroupCode[] = ["A","B","C","D","E","F","G","H","I","J","K","L"] as const;

export function getTeam(id: string): Team | undefined {
  return TEAMS.find((t) => t.id === id);
}

export function teamsByGroup(g: GroupCode): readonly Team[] {
  return TEAMS.filter((t) => t.group === g);
}
