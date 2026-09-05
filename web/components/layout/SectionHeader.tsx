import { VStack } from "@astryxdesign/core/Stack";
import { Heading } from "@astryxdesign/core/Heading";
import { Text } from "@astryxdesign/core/Text";
import { emphasize } from "@/lib/emphasize";

/**
 * SectionHeader — eyebrow, heading and lede on the theme's type tokens
 * (Text/Heading read --text-*), capped at `--measure` and centred by
 * default. Titles may carry `<em>` accents (content vocabulary); emphasize()
 * turns them into elements so no HTML is injected.
 */
export interface SectionHeaderProps {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  /** Heading element level; the visual size is always the display-2 token. */
  level?: 1 | 2 | 3;
  align?: "center" | "start";
  /** id for the heading so the Band can be `aria-labelledby` it. */
  titleId?: string;
  className?: string;
  wide?: boolean;
}

export function SectionHeader({
  eyebrow,
  title,
  subtitle,
  level = 2,
  align = "center",
  titleId,
  className,
  wide = false,
}: SectionHeaderProps) {
  if (!eyebrow && !title && !subtitle) return null;
  const classes = ["section-header", align === "center" ? "center" : "", className]
    .filter(Boolean)
    .join(" ");
  return (
    <VStack
      as="header"
      gap={3}
      hAlign={align === "center" ? "center" : "start"}
      maxWidth={wide ? "var(--measure-wide)" : "var(--measure)"}
      className={classes}
      data-reveal=""
    >
      {eyebrow && (
        <Text as="p" type="supporting" weight="bold" className="eyebrow">
          {eyebrow}
        </Text>
      )}
      {title && (
        <Heading
          level={level}
          type="display-2"
          id={titleId}
          justify={align === "center" ? "center" : "start"}
          textWrap="balance"
        >
          {emphasize(title)}
        </Heading>
      )}
      {subtitle && (
        <Text
          as="p"
          type="large"
          weight="normal"
          color="secondary"
          className="lede"
          justify={align === "center" ? "center" : "start"}
        >
          {subtitle}
        </Text>
      )}
    </VStack>
  );
}
