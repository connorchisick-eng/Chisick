/**
 * Percentage insets that align inner screen content with the iPhone 17 Pro
 * bezel cutout in `/public/iphone-frame.svg` (a flattened Figma export, 450×920).
 *
 * If the source bezel image is ever swapped for a different phone model,
 * retune these values so the screen content lines up under the cutout.
 */
export const PHONE_INSETS = {
  top: "2.6%",
  bottom: "2.6%",
  left: "5.6%",
  right: "5.6%",
  /** Approx corner radius of the iPhone screen cutout, as a % of the inset
   *  box width (≈ 8.5% on iPhone 17 Pro). */
  radius: "9%",
} as const;

/** Aspect ratio of the bezel SVG — outer phone shell should match. */
export const PHONE_ASPECT = "450 / 920" as const;

/** Public path to the bezel image. */
export const PHONE_FRAME_SRC = "/iphone-frame.svg" as const;
