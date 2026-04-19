import { clsx } from "clsx";

type P = { className?: string; width?: number; height?: number; stroke?: string };

/** Hand-drawn squiggle underline. Animates draw-in via strokeDashoffset. */
export function Squiggle({
  className,
  width = 280,
  height = 28,
  stroke = "rgb(255, 124, 97)",
}: P) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 280 28"
      className={clsx(className)}
      fill="none"
      aria-hidden
    >
      <path
        d="M4 18 Q 30 4, 60 14 T 120 14 T 180 14 T 240 12 T 278 18"
        stroke={stroke}
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Custom arrow — curved tail instead of straight. */
export function Arrow({ className, width = 28, height = 14, stroke = "currentColor" }: P) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 28 14"
      className={clsx(className)}
      fill="none"
      aria-hidden
    >
      <path
        d="M1 7 Q 14 5, 26 7 L20 2 M26 7 L20 12"
        stroke={stroke}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

/** "NO VENMO" stamp-style seal. */
export function NoVenmoStamp({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 180 180"
      className={clsx(className)}
      aria-hidden
    >
      <defs>
        <path
          id="stampArc"
          d="M 90,90 m -68,0 a 68,68 0 1,1 136,0 a 68,68 0 1,1 -136,0"
        />
      </defs>
      <g transform="rotate(-12 90 90)">
        <circle
          cx="90"
          cy="90"
          r="82"
          fill="none"
          stroke="rgb(255, 124, 97)"
          strokeWidth="2.5"
          strokeDasharray="2 5"
        />
        <circle
          cx="90"
          cy="90"
          r="58"
          fill="none"
          stroke="rgb(255, 124, 97)"
          strokeWidth="2"
        />
        <text
          fontFamily="'Cabinet Grotesk', system-ui"
          fontSize="11"
          fontWeight="700"
          fill="rgb(255, 124, 97)"
          letterSpacing="3"
        >
          <textPath href="#stampArc" startOffset="0">
            EST. 2026 · NO VENMO NEEDED · EST. 2026 · NO VENMO NEEDED ·
          </textPath>
        </text>
        <text
          x="90"
          y="84"
          textAnchor="middle"
          fontFamily="'Cabinet Grotesk', system-ui"
          fontSize="18"
          fontWeight="700"
          fill="rgb(255, 124, 97)"
          letterSpacing="2"
        >
          ENJOY
        </text>
        <text
          x="90"
          y="106"
          textAnchor="middle"
          fontFamily="'Cabinet Grotesk', system-ui"
          fontSize="18"
          fontWeight="700"
          fontStyle="italic"
          fill="rgb(255, 124, 97)"
        >
          the meal.
        </text>
      </g>
    </svg>
  );
}

/** Small paw print. */
export function Paw({ className, size = 22 }: { className?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={clsx(className)}
      aria-hidden
    >
      <ellipse cx="12" cy="16" rx="5" ry="4" fill="currentColor" />
      <circle cx="6" cy="10" r="2" fill="currentColor" />
      <circle cx="10" cy="6" r="2" fill="currentColor" />
      <circle cx="14" cy="6" r="2" fill="currentColor" />
      <circle cx="18" cy="10" r="2" fill="currentColor" />
    </svg>
  );
}

/** Fork + knife — hero decoration */
export function ForkKnife({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" className={clsx(className)} fill="none" aria-hidden>
      <g stroke="rgb(14,14,14)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        {/* fork */}
        <path d="M36 20 L36 50" />
        <path d="M30 20 L30 40" />
        <path d="M42 20 L42 40" />
        <path d="M30 40 Q33 48 36 48 Q39 48 42 40" />
        <path d="M36 50 L36 100" />
        {/* knife */}
        <path d="M78 20 Q84 20 88 30 Q90 40 86 55 L82 55 L82 100" />
      </g>
    </svg>
  );
}

/** Torn-paper receipt edge — used as section break */
export function ReceiptEdge({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 1440 24"
      preserveAspectRatio="none"
      className={clsx(className)}
      aria-hidden
    >
      <path
        d="M0 0 L1440 0 L1440 14 L1410 24 L1380 14 L1350 24 L1320 14 L1290 24 L1260 14 L1230 24 L1200 14 L1170 24 L1140 14 L1110 24 L1080 14 L1050 24 L1020 14 L990 24 L960 14 L930 24 L900 14 L870 24 L840 14 L810 24 L780 14 L750 24 L720 14 L690 24 L660 14 L630 24 L600 14 L570 24 L540 14 L510 24 L480 14 L450 24 L420 14 L390 24 L360 14 L330 24 L300 14 L270 24 L240 14 L210 24 L180 14 L150 24 L120 14 L90 24 L60 14 L30 24 L0 14 Z"
        fill="currentColor"
      />
    </svg>
  );
}
