import siteData from "@/data/site.json";

/**
 * Aggregate customer rating from data/site.json — one source for the hero,
 * the testimonials header and the trust strip, so the number can never drift
 * between them. Stars are decorative; the text carries the value.
 */
export function RatingBadge({
  compact = false,
  className,
}: {
  compact?: boolean;
  className?: string;
}) {
  const { rating, ratingMax } = siteData;
  const classes = ["rating-badge", compact ? "rating-badge-compact" : "", className ?? ""]
    .filter(Boolean)
    .join(" ");
  return (
    <span className={classes}>
      <span className="rating-stars" aria-hidden="true">
        {[0, 1, 2, 3, 4].map((i) => (
          <svg key={i} viewBox="0 0 20 20" width="15" height="15" focusable="false">
            <path
              d="M10 1.7l2.6 5.2 5.7.8-4.1 4 1 5.7L10 14.7l-5.2 2.7 1-5.7-4.1-4 5.7-.8Z"
              fill="currentColor"
            />
          </svg>
        ))}
      </span>
      <span className="rating-text">
        Rated <strong>{rating}/{ratingMax}</strong>
        {compact ? "" : " by our customers"}
      </span>
    </span>
  );
}
