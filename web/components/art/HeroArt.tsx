/**
 * HeroArt — the Royal Clouds home-hero scene: a violet cloud platform with a
 * server stack, orbiting trust chips (SSL, uptime, deploy), gold accents.
 * Original hand-built SVG, decorative (aria-hidden), motion gated on
 * prefers-reduced-motion via CSS.
 */
export function HeroArt() {
  return (
    <div className="hero-art-scene" aria-hidden="true">
      <svg viewBox="0 0 520 440" fill="none" role="presentation" focusable="false">
        <defs>
          <linearGradient id="ha-cloud" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#7d59d9" />
            <stop offset="100%" stopColor="#5025d1" />
          </linearGradient>
          <linearGradient id="ha-rack" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3b2686" />
            <stop offset="100%" stopColor="#231252" />
          </linearGradient>
          <linearGradient id="ha-gold" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#ffd97a" />
            <stop offset="100%" stopColor="#ffc94b" />
          </linearGradient>
        </defs>

        {/* backdrop halo */}
        <ellipse cx="260" cy="230" rx="235" ry="200" fill="#673de6" opacity="0.14" />
        <ellipse cx="260" cy="230" rx="170" ry="145" fill="#673de6" opacity="0.12" />

        {/* orbit ring */}
        <circle className="ha-orbit" cx="260" cy="230" r="188" stroke="#9b85ff" strokeOpacity="0.5" strokeWidth="1.5" strokeDasharray="4 8" />

        {/* cloud platform */}
        <g className="ha-float-slow">
          <path
            d="M150 130c-8-34 16-62 46-64 10-26 40-42 70-36 26 5 44 22 50 44 26-2 48 16 50 40 24 4 40 22 38 44-2 24-24 40-52 40H178c-30 0-52-18-52-44 0-24 20-42 44-44Z"
            fill="url(#ha-cloud)"
          />
          <path
            d="M150 130c-8-34 16-62 46-64 10-26 40-42 70-36 26 5 44 22 50 44 26-2 48 16 50 40 24 4 40 22 38 44-2 24-24 40-52 40H178c-30 0-52-18-52-44 0-24 20-42 44-44Z"
            stroke="#faf7ff" strokeOpacity="0.35" strokeWidth="2"
          />
          {/* uplink dots on the cloud */}
          <circle cx="220" cy="120" r="5" fill="#ffc94b" />
          <circle cx="260" cy="105" r="5" fill="#faf7ff" opacity="0.8" />
          <circle cx="300" cy="120" r="5" fill="#faf7ff" opacity="0.5" />
        </g>

        {/* server stack */}
        <g className="ha-float">
          <rect x="185" y="230" width="150" height="118" rx="14" fill="url(#ha-rack)" stroke="#7d59d9" strokeWidth="2" />
          {[0, 1, 2].map((row) => (
            <g key={row}>
              <rect x="200" y={248 + row * 30} width="120" height="20" rx="5" fill="#2f1c6a" stroke="#6b5b9e" strokeWidth="1" />
              <circle cx="210" cy={258 + row * 30} r="4" fill={row === 1 ? "#ffc94b" : "#009e81"} />
              <rect x="222" y={255 + row * 30} width="60" height="6" rx="3" fill="#57489c" />
              <rect x="290" y={255 + row * 30} width="22" height="6" rx="3" fill="#57489c" opacity="0.6" />
            </g>
          ))}
        </g>

        {/* deploy rocket chip */}
        <g className="ha-float-fast">
          <rect x="330" y="150" width="120" height="56" rx="16" fill="#faf7ff" />
          <circle cx="358" cy="178" r="16" fill="#673de6" />
          <path d="M358 170c4 3 6 7 6 11s-2 7-4 9h-4c-2-2-4-5-4-9s2-8 6-11Z" fill="#ffc94b" />
          <rect x="382" y="168" width="52" height="8" rx="4" fill="#e9e4f7" />
          <rect x="382" y="182" width="36" height="8" rx="4" fill="#f0edff" />
        </g>

        {/* SSL chip */}
        <g className="ha-float">
          <rect x="70" y="240" width="112" height="52" rx="14" fill="#faf7ff" />
          <rect x="84" y="254" width="20" height="16" rx="4" fill="none" stroke="#009e81" strokeWidth="2.5" />
          <path d="M88 254v-4a6 6 0 0 1 12 0v4" fill="none" stroke="#009e81" strokeWidth="2.5" />
          <rect x="112" y="256" width="54" height="7" rx="3.5" fill="#e9e4f7" />
          <rect x="112" y="268" width="34" height="7" rx="3.5" fill="#f0edff" />
        </g>

        {/* uptime chip */}
        <g className="ha-float-slow">
          <rect x="96" y="330" width="128" height="52" rx="14" fill="#2f1c6a" stroke="#57489c" strokeWidth="1.5" />
          <path d="M112 356h10l4-8 5 14 4-6h9" fill="none" stroke="#ffc94b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <rect x="152" y="344" width="56" height="7" rx="3.5" fill="#57489c" />
          <rect x="152" y="358" width="38" height="7" rx="3.5" fill="#3d2f75" />
        </g>

        {/* speed gauge chip */}
        <g className="ha-float-fast">
          <rect x="330" y="320" width="118" height="52" rx="14" fill="#faf7ff" />
          <path d="M346 352a14 14 0 1 1 28 0" fill="none" stroke="#673de6" strokeWidth="3" strokeLinecap="round" />
          <path d="M360 352l8-9" stroke="#2f1c6a" strokeWidth="2.5" strokeLinecap="round" />
          <rect x="386" y="336" width="46" height="7" rx="3.5" fill="#e9e4f7" />
          <rect x="386" y="348" width="30" height="7" rx="3.5" fill="#f0edff" />
        </g>

        {/* ground shadow */}
        <ellipse cx="260" cy="380" rx="150" ry="16" fill="#231252" opacity="0.35" />
      </svg>
    </div>
  );
}
