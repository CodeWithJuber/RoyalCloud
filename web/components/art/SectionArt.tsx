/**
 * SectionArt — illustration scenes for content-split media slots and heroes.
 * Original SVG art in the brand language; decorative (aria-hidden).
 * Keyed by the content's `art`/`image` field.
 */

export type SectionArtKind =
  | "speed"
  | "shield"
  | "support"
  | "working"
  | "datacenter"
  | "migration"
  | "domains"
  | "generic";

const cardStroke = { stroke: "#e9e4f7", strokeWidth: 1.5 } as const;

function Speed() {
  return (
    <svg viewBox="0 0 460 360" fill="none" role="presentation" focusable="false">
      <rect x="30" y="30" width="400" height="300" rx="24" fill="#ffffff" {...cardStroke} />
      {/* big gauge */}
      <path d="M130 230a90 90 0 1 1 180 0" fill="none" stroke="#f0edff" strokeWidth={14} strokeLinecap="round" />
      <path d="M130 230a90 90 0 0 1 118-86" fill="none" stroke="#673de6" strokeWidth={14} strokeLinecap="round" />
      <path d="M220 230l42-52" stroke="#2f1c6a" strokeWidth={6} strokeLinecap="round" />
      <circle cx="220" cy="230" r="10" fill="#2f1c6a" />
      {/* metric chips */}
      <rect x="70" y="70" width="100" height="40" rx="10" fill="#f0edff" />
      <rect x="84" y="84" width="50" height="8" rx="4" fill="#673de6" />
      <rect x="84" y="96" width="34" height="6" rx="3" fill="#b8a6ff" />
      <rect x="290" y="250" width="110" height="40" rx="10" fill="#ffc94b" />
      <rect x="304" y="264" width="60" height="8" rx="4" fill="#2f1c6a" />
      <rect x="304" y="276" width="40" height="6" rx="3" fill="#2f1c6a" opacity="0.5" />
      {/* speed lines */}
      <path d="M56 150h30M46 170h30M56 190h30" stroke="#b8a6ff" strokeWidth={5} strokeLinecap="round" />
    </svg>
  );
}

function ShieldScene() {
  return (
    <svg viewBox="0 0 460 360" fill="none" role="presentation" focusable="false">
      <rect x="30" y="30" width="400" height="300" rx="24" fill="#2f1c6a" />
      {/* layered shield */}
      <path d="M230 80l86 30v60c0 56-36 92-86 110-50-18-86-54-86-110v-60Z" fill="#3b2686" stroke="#7d59d9" strokeWidth={2.5} />
      <path d="M230 104l62 22v46c0 42-26 70-62 86-36-16-62-44-62-86v-46Z" fill="#231252" />
      <path d="M206 172l18 18 34-36" stroke="#ffc94b" strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      {/* scan lines */}
      <rect x="70" y="100" width="60" height="8" rx="4" fill="#57489c" />
      <rect x="70" y="118" width="40" height="8" rx="4" fill="#3d2f75" />
      <rect x="70" y="240" width="60" height="8" rx="4" fill="#57489c" />
      <rect x="330" y="110" width="60" height="8" rx="4" fill="#57489c" />
      <rect x="340" y="240" width="50" height="8" rx="4" fill="#57489c" />
      {/* status dots */}
      <circle cx="86" cy="70" r="7" fill="#009e81" />
      <circle cx="374" cy="290" r="7" fill="#ffc94b" />
    </svg>
  );
}

function Support() {
  return (
    <svg viewBox="0 0 460 360" fill="none" role="presentation" focusable="false">
      <rect x="30" y="30" width="400" height="300" rx="24" fill="#ffffff" {...cardStroke} />
      {/* chat bubbles */}
      <rect x="70" y="80" width="220" height="56" rx="16" fill="#f0edff" />
      <rect x="90" y="100" width="140" height="8" rx="4" fill="#b8a6ff" />
      <rect x="90" y="116" width="90" height="8" rx="4" fill="#d8cff7" />
      <circle cx="66" cy="136" r="12" fill="#e9e4f7" />
      <rect x="170" y="160" width="220" height="56" rx="16" fill="#673de6" />
      <rect x="190" y="180" width="140" height="8" rx="4" fill="#b8a6ff" />
      <rect x="190" y="196" width="90" height="8" rx="4" fill="#faf7ff" opacity={0.6} />
      <circle cx="394" cy="216" r="12" fill="#5025d1" />
      {/* typing indicator */}
      <rect x="70" y="240" width="80" height="36" rx="14" fill="#f0edff" />
      <circle cx="92" cy="258" r="4" fill="#673de6" />
      <circle cx="110" cy="258" r="4" fill="#673de6" opacity="0.6" />
      <circle cx="128" cy="258" r="4" fill="#673de6" opacity="0.3" />
      {/* headset mark */}
      <circle cx="380" cy="90" r="30" fill="#ffc94b" />
      <path d="M364 92a16 16 0 0 1 32 0m-32 0v6a4 4 0 0 0 4 4h2v-10h-2a4 4 0 0 0-4 4Zm32 0v6a4 4 0 0 1-4 4h-2v-10h2a4 4 0 0 1 4 4Z" stroke="#2f1c6a" strokeWidth={2.5} fill="none" strokeLinecap="round" />
    </svg>
  );
}

function Datacenter() {
  return (
    <svg viewBox="0 0 460 360" fill="none" role="presentation" focusable="false">
      <rect x="30" y="30" width="400" height="300" rx="24" fill="#ffffff" {...cardStroke} />
      {/* facility blocks */}
      <rect x="80" y="120" width="90" height="140" rx="8" fill="#2f1c6a" />
      <rect x="190" y="80" width="110" height="180" rx="8" fill="#3b2686" />
      <rect x="320" y="140" width="70" height="120" rx="8" fill="#231252" />
      {/* windows grid */}
      {[0, 1, 2, 3].map((r) =>
        [0, 1].map((c) => (
          <rect key={`${r}-${c}`} x={94 + c * 40} y={138 + r * 30} width={24} height={14} rx={3} fill="#57489c" opacity={r === 1 && c === 0 ? 1 : 0.7} />
        )),
      )}
      {[0, 1, 2, 3, 4].map((r) =>
        [0, 1, 2].map((c) => (
          <rect key={`b${r}-${c}`} x={206 + c * 30} y={98 + r * 32} width={20} height={14} rx={3} fill={r === 2 && c === 1 ? "#ffc94b" : "#7d59d9"} opacity={r === 2 && c === 1 ? 1 : 0.55} />
        )),
      )}
      {/* ground + signal */}
      <rect x="60" y="262" width="340" height="8" rx="4" fill="#e9e4f7" />
      <path d="M330 100a40 40 0 0 1 30 14M322 88a56 56 0 0 1 42 20" stroke="#673de6" strokeWidth={4} strokeLinecap="round" fill="none" />
      <circle cx="352" cy="128" r="6" fill="#673de6" />
    </svg>
  );
}

function Migration() {
  return (
    <svg viewBox="0 0 460 360" fill="none" role="presentation" focusable="false">
      <rect x="30" y="30" width="400" height="300" rx="24" fill="#ffffff" {...cardStroke} />
      {/* two server tiles + arrow path */}
      <rect x="60" y="110" width="120" height="130" rx="14" fill="#f0edff" stroke="#d8cff7" strokeWidth={1.5} />
      <rect x="80" y="132" width="80" height="10" rx="5" fill="#b8a6ff" />
      <rect x="80" y="152" width="60" height="8" rx="4" fill="#d8cff7" />
      <rect x="80" y="168" width="70" height="8" rx="4" fill="#d8cff7" />
      <rect x="60" y="196" width="120" height="8" fill="#e9e4f7" />
      <rect x="280" y="110" width="120" height="130" rx="14" fill="#2f1c6a" />
      <rect x="300" y="132" width="80" height="10" rx="5" fill="#7d59d9" />
      <rect x="300" y="152" width="60" height="8" rx="4" fill="#57489c" />
      <rect x="300" y="168" width="70" height="8" rx="4" fill="#57489c" />
      <rect x="280" y="196" width="120" height="8" fill="#3b2686" />
      {/* moving packet on a dashed path */}
      <path d="M186 175 C 220 130, 240 130, 274 165" stroke="#673de6" strokeWidth={3} strokeDasharray="6 8" fill="none" strokeLinecap="round" />
      <path d="M262 156l16 8-12 12" fill="#673de6" />
      <circle cx="196" cy="164" r="7" fill="#ffc94b" stroke="#ffffff" strokeWidth={2} />
      {/* zero downtime chip */}
      <rect x="176" y="256" width="108" height="36" rx="18" fill="#e9faf0" />
      <path d="M192 274l4 4 8-8" stroke="#009e81" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <rect x="210" y="270" width="60" height="7" rx="3.5" fill="#0c5700" opacity={0.75} />
    </svg>
  );
}

function Domains() {
  return (
    <svg viewBox="0 0 460 360" fill="none" role="presentation" focusable="false">
      <rect x="30" y="30" width="400" height="300" rx="24" fill="#ffffff" {...cardStroke} />
      {/* tld chips */}
      {[
        [70, 90, 70],
        [170, 90, 84],
        [280, 90, 64],
        [70, 150, 84],
        [190, 150, 70],
      ].map(([x, y, w], i) => (
        <rect key={i} x={x} y={y} width={w} height={34} rx={17} fill={i === 0 ? "#673de6" : "#f0edff"} />
      ))}
      {/* search lens */}
      <circle cx="270" cy="210" r="56" fill="#ffffff" stroke="#673de6" strokeWidth={6} />
      <circle cx="270" cy="210" r="40" fill="#f0edff" />
      <path d="M258 210l10 10 20-20" stroke="#673de6" strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <rect x="308" y="250" width="34" height="12" rx="6" fill="#673de6" transform="rotate(45 308 250)" />
    </svg>
  );
}

function GenericScene() {
  return (
    <svg viewBox="0 0 460 360" fill="none" role="presentation" focusable="false">
      <rect x="30" y="30" width="400" height="300" rx="24" fill="#f0edff" />
      <rect x="90" y="90" width="280" height="180" rx="16" fill="#ffffff" {...cardStroke} />
      <rect x="116" y="120" width="120" height="12" rx="6" fill="#673de6" />
      <rect x="116" y="146" width="200" height="8" rx="4" fill="#e9e4f7" />
      <rect x="116" y="162" width="160" height="8" rx="4" fill="#e9e4f7" />
      <rect x="116" y="200" width="90" height="24" rx="12" fill="#ffc94b" />
      <circle cx="330" cy="240" r="18" fill="#673de6" opacity={0.15} />
      <circle cx="350" cy="100" r="10" fill="#ffc94b" />
    </svg>
  );
}

const SCENES: Record<SectionArtKind, () => React.JSX.Element> = {
  speed: Speed,
  shield: ShieldScene,
  support: Support,
  working: Support,
  datacenter: Datacenter,
  migration: Migration,
  domains: Domains,
  generic: GenericScene,
};

export function SectionArt({ kind = "generic" }: { kind?: SectionArtKind }) {
  const Scene = SCENES[kind] ?? GenericScene;
  return (
    <div className="section-art" aria-hidden="true">
      <Scene />
    </div>
  );
}
