import { Icon as AstryxIcon } from "@astryxdesign/core/Icon";
import type { IconName } from "@astryxdesign/core/Icon";

type Size = "xsm" | "sm" | "md" | "lg";
const toSize = (px?: number): Size =>
  px === undefined ? "md" : px <= 16 ? "xsm" : px <= 18 ? "sm" : px <= 20 ? "md" : "lg";

/**
 * Content icons by semantic name ("server", "bolt", …) — resolved through the
 * royal theme's icon registry (theme/icons.tsx), so the glyph set is themeable
 * and the prop stays a serializable string across the RSC boundary.
 * Decorative by default (aria-hidden); pass `label` for a meaningful icon.
 */
export function Icon({
  name,
  size,
  color = "inherit",
  label,
  className,
  style,
}: {
  name?: string;
  /** px size hint — mapped onto Astryx's named sizes (≤16→xsm, 18→sm, 20→md, 24+→lg). */
  size?: number;
  color?:
    | "primary"
    | "secondary"
    | "tertiary"
    | "disabled"
    | "accent"
    | "success"
    | "error"
    | "warning"
    | "inherit";
  /** Accessible name for a meaningful standalone icon. Omit for decorative. */
  label?: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  if (!name) return null;
  return (
    <AstryxIcon
      icon={name as IconName}
      size={toSize(size)}
      color={color}
      label={label}
      className={className}
      style={style}
    />
  );
}
