/**
 * ProductArt — per-product spot illustrations, keyed by product kind.
 * Original hand-built SVG scenes in the violet/night/gold brand language.
 * Decorative only (aria-hidden); no text inside art.
 */

export type ProductKind =
  | "shared"
  | "wordpress"
  | "vps"
  | "dedicated"
  | "cloud"
  | "cyberpanel"
  | "reseller"
  | "generic";

const STROKE = { stroke: "#faf7ff", strokeOpacity: 0.35, strokeWidth: 2 } as const;

function Window({ x, y, w, h, fill = "#2f1c6a" }: { x: number; y: number; w: number; h: number; fill?: string }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={10} fill={fill} stroke="#57489c" strokeWidth={1.5} />
      <circle cx={x + 14} cy={y + 12} r={3} fill="#57489c" />
      <circle cx={x + 24} cy={y + 12} r={3} fill="#57489c" />
      <circle cx={x + 34} cy={y + 12} r={3} fill="#ffc94b" />
    </g>
  );
}

function Shared() {
  return (
    <svg viewBox="0 0 400 320" fill="none" role="presentation" focusable="false">
      <ellipse cx="200" cy="170" rx="180" ry="140" fill="#673de6" opacity="0.12" />
      {/* three sites sharing one platform */}
      <Window x={60} y={70} w={120} h={90} />
      <Window x={210} y={60} w={130} h={100} fill="#3b2686" />
      <Window x={130} y={120} w={140} h={100} fill="#231252" />
      <rect x={150} y={150} width={100} height={8} rx={4} fill="#57489c" />
      <rect x={150} y={166} width={70} height={8} rx={4} fill="#3d2f75" />
      {/* shared platform bar */}
      <rect x={70} y={240} width={260} height={34} rx={12} fill="url(#pa-grad)" {...STROKE} />
      <circle cx={92} cy={257} r={6} fill="#ffc94b" />
      <rect x={110} y={251} width={120} height={7} rx={3.5} fill="#faf7ff" opacity={0.7} />
      <rect x={110} y={262} width={80} height={6} rx={3} fill="#faf7ff" opacity={0.4} />
      <defs>
        <linearGradient id="pa-grad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#5025d1" />
          <stop offset="100%" stopColor="#7d59d9" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function Wordpress() {
  return (
    <svg viewBox="0 0 400 320" fill="none" role="presentation" focusable="false">
      <ellipse cx="200" cy="170" rx="180" ry="140" fill="#673de6" opacity="0.12" />
      <Window x={90} y={60} w={220} h={160} />
      {/* editor layout: sidebar + blocks */}
      <rect x={104} y={84} width={44} height={120} rx={6} fill="#231252" />
      <rect x={112} y={94} width={28} height={6} rx={3} fill="#57489c" />
      <rect x={112} y={106} width={28} height={6} rx={3} fill="#57489c" />
      <rect x={112} y={118} width={20} height={6} rx={3} fill="#3d2f75" />
      <rect x={158} y={84} width={140} height={16} rx={5} fill="#57489c" />
      <rect x={158} y={108} width={140} height={40} rx={6} fill="#3d2f75" />
      <rect x={158} y={156} width={90} height={12} rx={6} fill="#673de6" />
      {/* cache bolt chip */}
      <g>
        <rect x={240} y={200} width={110} height={48} rx={12} fill="#faf7ff" />
        <path d="M262 214l8-12-3 8h7l-8 12 3-8z" fill="#673de6" />
        <rect x={276} y={216} width={56} height={7} rx={3.5} fill="#e9e4f7" />
        <rect x={276} y={228} width={38} height={7} rx={3.5} fill="#f0edff" />
      </g>
      {/* update refresh chip */}
      <g>
        <circle cx={82} cy={230} r={26} fill="#ffc94b" />
        <path d="M82 218a12 12 0 1 1-12 12M82 218v-6m0 6-5-4m5 4 5-4" stroke="#2f1c6a" strokeWidth={2.5} strokeLinecap="round" fill="none" transform="translate(-2 2)" />
      </g>
    </svg>
  );
}

function Vps() {
  return (
    <svg viewBox="0 0 400 320" fill="none" role="presentation" focusable="false">
      <ellipse cx="200" cy="170" rx="180" ry="140" fill="#673de6" opacity="0.12" />
      {/* terminal window */}
      <Window x={70} y={60} w={200} h={130} fill="#17112b" />
      <path d="M92 100l14 10-14 10" stroke="#ffc94b" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <rect x={116} y={112} width={60} height={7} rx={3.5} fill="#a8a8b3" />
      <rect x={92} y={130} width={140} height={7} rx={3.5} fill="#57489c" />
      <rect x={92} y={146} width={100} height={7} rx={3.5} fill="#57489c" />
      <rect x={92} y={162} width={120} height={7} rx={3.5} fill="#009e81" opacity={0.8} />
      {/* root key chip */}
      <g>
        <rect x={250} y={150} width={110} height={52} rx={12} fill="#faf7ff" />
        <circle cx={272} cy={176} r={9} fill="none" stroke="#673de6" strokeWidth={2.5} />
        <path d="M278 182l10 10m-4-1-4-3m-4-1-4-3" stroke="#673de6" strokeWidth={2.5} strokeLinecap="round" />
        <rect x={292} y={164} width={52} height={7} rx={3.5} fill="#e9e4f7" />
        <rect x={292} y={178} width={34} height={7} rx={3.5} fill="#f0edff" />
      </g>
      {/* gauge chip */}
      <g>
        <rect x={60} y={210} width={130} height={60} rx={12} fill="#faf7ff" />
        <path d="M78 250a22 22 0 1 1 44 0" fill="none" stroke="#e9e4f7" strokeWidth={5} strokeLinecap="round" />
        <path d="M78 250a22 22 0 0 1 30-20" fill="none" stroke="#673de6" strokeWidth={5} strokeLinecap="round" />
        <path d="M100 250l10-12" stroke="#2f1c6a" strokeWidth={2.5} strokeLinecap="round" />
        <rect x={136} y={228} width={42} height={7} rx={3.5} fill="#e9e4f7" />
        <rect x={136} y={240} width={28} height={7} rx={3.5} fill="#f0edff" />
      </g>
    </svg>
  );
}

function Dedicated() {
  return (
    <svg viewBox="0 0 400 320" fill="none" role="presentation" focusable="false">
      <ellipse cx="200" cy="170" rx="180" ry="140" fill="#673de6" opacity="0.12" />
      {/* rack */}
      <rect x={130} y={50} width={140} height={220} rx={14} fill="#17112b" stroke="#57489c" strokeWidth={1.5} />
      {[0, 1, 2, 3, 4].map((row) => (
        <g key={row}>
          <rect x={144} y={64 + row * 40} width={112} height={28} rx={6} fill="#2f1c6a" stroke="#57489c" strokeWidth={1} />
          <circle cx={156} cy={78 + row * 40} r={5} fill={row === 2 ? "#ffc94b" : "#009e81"} />
          <rect x={168} y={74 + row * 40} width={56} height={7} rx={3.5} fill="#57489c" />
          <rect x={232} y={74 + row * 40} width={16} height={7} rx={3.5} fill="#3d2f75" />
        </g>
      ))}
      {/* single-tenant badge */}
      <g>
        <rect x={196} y={230} width={150} height={48} rx={12} fill="#faf7ff" />
        <path d="M216 244l4 4 8-8" stroke="#009e81" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <circle cx={220} cy={254} r={14} fill="none" stroke="#673de6" strokeWidth={2} opacity={0.4} />
        <rect x={244} y={244} width={80} height={7} rx={3.5} fill="#e9e4f7" />
        <rect x={244} y={256} width={56} height={7} rx={3.5} fill="#f0edff" />
      </g>
    </svg>
  );
}

function Cloud() {
  return (
    <svg viewBox="0 0 400 320" fill="none" role="presentation" focusable="false">
      <ellipse cx="200" cy="170" rx="180" ry="140" fill="#673de6" opacity="0.12" />
      {/* globe */}
      <circle cx={200} cy={150} r={80} fill="#231252" stroke="#7d59d9" strokeWidth={2} />
      <ellipse cx={200} cy={150} rx={80} ry={34} fill="none" stroke="#57489c" strokeWidth={1.5} />
      <ellipse cx={200} cy={150} rx={34} ry={80} fill="none" stroke="#57489c" strokeWidth={1.5} />
      <path d="M120 150h160M200 70v160" stroke="#57489c" strokeWidth={1.5} />
      {/* region nodes */}
      {[
        [160, 110],
        [240, 100],
        [255, 165],
        [150, 185],
        [205, 205],
      ].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={7} fill={i === 2 ? "#ffc94b" : "#673de6"} stroke="#faf7ff" strokeWidth={2} />
      ))}
      {/* scale arrow chip */}
      <g>
        <rect x={250} y={220} width={120} height={48} rx={12} fill="#faf7ff" />
        <path d="M268 252l10-10m0 0h-6m6 0v6" stroke="#673de6" strokeWidth={2.5} strokeLinecap="round" />
        <path d="M262 236l10-10m0 0h-6m6 0v6" stroke="#673de6" strokeWidth={2.5} strokeLinecap="round" opacity={0.5} />
        <rect x={286} y={234} width={66} height={7} rx={3.5} fill="#e9e4f7" />
        <rect x={286} y={246} width={44} height={7} rx={3.5} fill="#f0edff" />
      </g>
    </svg>
  );
}

function Cyberpanel() {
  return (
    <svg viewBox="0 0 400 320" fill="none" role="presentation" focusable="false">
      <ellipse cx="200" cy="170" rx="180" ry="140" fill="#673de6" opacity="0.12" />
      <Window x={80} y={60} w={240} h={170} fill="#17112b" />
      {/* dashboard: chart + stats */}
      <rect x={96} y={84} width={96} height={70} rx={8} fill="#231252" />
      <path d="M104 140l14-12 12 8 16-18 14 10 14-8" stroke="#673de6" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <rect x={204} y={84} width={100} height={10} rx={5} fill="#57489c" />
      <rect x={204} y={102} width={76} height={10} rx={5} fill="#3d2f75" />
      <rect x={204} y={122} width={88} height={10} rx={5} fill="#3d2f75" />
      <circle cx={110} cy={196} r={8} fill="#009e81" />
      <rect x={126} y={190} width={60} height={7} rx={3.5} fill="#57489c" />
      <rect x={96} y={212} width={208} height={6} rx={3} fill="#231252" />
      <rect x={96} y={212} width={140} height={6} rx={3} fill="#673de6" />
      {/* free badge */}
      <g>
        <rect x={40} y={200} width={104} height={44} rx={12} fill="#ffc94b" />
        <path d="M58 216l4 4 8-8" stroke="#2f1c6a" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <rect x={76} y={212} width={52} height={7} rx={3.5} fill="#2f1c6a" opacity={0.7} />
        <rect x={76} y={224} width={34} height={7} rx={3.5} fill="#2f1c6a" opacity={0.45} />
      </g>
    </svg>
  );
}

function Reseller() {
  return (
    <svg viewBox="0 0 400 320" fill="none" role="presentation" focusable="false">
      <ellipse cx="200" cy="170" rx="180" ry="140" fill="#673de6" opacity="0.12" />
      {/* parent panel + child accounts */}
      <Window x={130} y={50} w={140} h={70} fill="#2f1c6a" />
      <rect x={146} y={76} width={70} height={8} rx={4} fill="#57489c" />
      <rect x={146} y={92} width={46} height={7} rx={3.5} fill="#3d2f75" />
      {[
        [40, 190],
        [155, 190],
        [270, 190],
      ].map(([x, y], i) => (
        <g key={i}>
          <path d={`M200 120v30M${x + 55} 150v${y - 150}M200 150H${x + 55}`} stroke="#7d59d9" strokeWidth={2} fill="none" />
          <rect x={x} y={y} width={90} height={56} rx={10} fill="#faf7ff" />
          <circle cx={x + 20} cy={y + 20} r={8} fill={i === 1 ? "#ffc94b" : "#673de6"} opacity={0.85} />
          <rect x={x + 34} y={y + 16} width={44} height={7} rx={3.5} fill="#e9e4f7" />
          <rect x={x + 12} y={y + 36} width={66} height={6} rx={3} fill="#f0edff" />
        </g>
      ))}
    </svg>
  );
}

function Generic() {
  return (
    <svg viewBox="0 0 400 320" fill="none" role="presentation" focusable="false">
      <ellipse cx="200" cy="170" rx="180" ry="140" fill="#673de6" opacity="0.12" />
      <Window x={100} y={70} w={200} h={140} />
      <rect x={120} y={100} width={90} height={10} rx={5} fill="#57489c" />
      <rect x={120} y={120} width={140} height={8} rx={4} fill="#3d2f75" />
      <rect x={120} y={136} width={110} height={8} rx={4} fill="#3d2f75" />
      <rect x={120} y={160} width={70} height={16} rx={8} fill="#673de6" />
      <circle cx={290} cy={210} r={22} fill="#ffc94b" />
      <path d="M282 210l6 6 12-12" stroke="#2f1c6a" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

const SCENES: Record<ProductKind, () => React.JSX.Element> = {
  shared: Shared,
  wordpress: Wordpress,
  vps: Vps,
  dedicated: Dedicated,
  cloud: Cloud,
  cyberpanel: Cyberpanel,
  reseller: Reseller,
  generic: Generic,
};

export function ProductArt({ kind = "generic" }: { kind?: ProductKind }) {
  const Scene = SCENES[kind] ?? Generic;
  return (
    <div className="product-art" aria-hidden="true">
      <Scene />
    </div>
  );
}
