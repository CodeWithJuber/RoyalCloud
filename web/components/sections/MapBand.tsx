import { sectionName, sectionTitleId } from "@/lib/section-name";

export interface MapPin {
  label: string;
  x: number;
  y: number;
  live?: boolean;
}

interface MapBandProps {
  id?: string;
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  note?: string;
  pins?: MapPin[];
}

const DEFAULT_PINS: MapPin[] = [
  { label: "New York", x: 22, y: 30, live: true },
  { label: "London", x: 47, y: 20, live: true },
  { label: "Mumbai", x: 67, y: 48, live: true },
  { label: "Singapore", x: 74, y: 58 },
];

/** Keeps pins (and their hover labels) inside the map stage. */
const clamp = (n: number) => Math.min(96, Math.max(4, n));

export function MapBand({
  id,
  eyebrow,
  title,
  subtitle,
  note,
  pins = DEFAULT_PINS,
}: MapBandProps) {
  return (
    <section className="section section-dark mapband" id={id} {...sectionName(id, title)}>
      <div className="site-shell">
        {(eyebrow || title || subtitle) && (
          <header className="section-header center" data-reveal>
            {eyebrow && <p className="eyebrow">{eyebrow}</p>}
            {title && <h2 id={sectionTitleId(id)}>{title}</h2>}
            {subtitle && <p className="lede">{subtitle}</p>}
          </header>
        )}
        <div className="map-grid" data-count={pins.length}>
        <div className="map-stage" data-reveal>
          {/* Decorative markers, not controls: they carry no action, their
              labels are always visible, and every one of them is repeated as
              text in the list below. As buttons they were 36px no-op tab
              stops — four per band, failing WCAG 2.5.8 for nothing. */}
          {pins.map((pin) => (
            <span
              key={pin.label}
              className={`map-pin${pin.live ? " live" : ""}`}
              style={{ left: `${clamp(pin.x)}%`, top: `${clamp(pin.y)}%` }}
              aria-hidden="true"
            >
              {pin.live && <span className="map-pin-pulse" />}
              <span className="map-pin-core" />
              <span className="map-pin-label">
                {pin.label}
                {pin.live && <em>● live</em>}
              </span>
            </span>
          ))}
        </div>
        {/* Named locations beside the map: readable on touch, where pin
            labels have no hover, and honest content for a single-region band. */}
        <ul className="map-locations" data-reveal>
          {pins.map((pin) => (
            <li key={pin.label} className="map-location" data-live={pin.live ? "true" : undefined}>
              <span className="map-location-dot" aria-hidden="true" />
              <span>
                <b>{pin.label}</b>
                <small>{pin.live ? "Live location" : "Planned location"}</small>
              </span>
            </li>
          ))}
        </ul>
        </div>
        {note && <p className="map-note">{note}</p>}
      </div>
    </section>
  );
}
