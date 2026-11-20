/**
 * Subtle curved wave shapes along the bottom of the screen.
 * Two low-contrast layers measured from the reference:
 *   back  (#DCE3FA): left y≈719 · dips to ≈767 centre · rises to ≈663 right
 *   front (#E8ECFB): left y≈783 · dips to ≈830 centre · rises to ≈755 right
 * (393 × 852 viewport coordinates; both layers stay below the Record circle.)
 */
export default function Waves() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
    >
      <svg
        className="absolute bottom-0 left-0 h-[190px] w-full"
        viewBox="0 0 393 190"
        preserveAspectRatio="none"
        fill="none"
      >
        <path
          d="M0 57 C 40 62, 70 83, 110 90 C 155 98, 175 105, 200 105 C 230 105, 255 78, 290 52 C 325 26, 360 6, 393 1 L 393 190 L 0 190 Z"
          fill="#DCE3FA"
        />
      </svg>
      <svg
        className="absolute bottom-0 left-0 h-[110px] w-full"
        viewBox="0 0 393 110"
        preserveAspectRatio="none"
        fill="none"
      >
        <path
          d="M0 41 C 45 52, 90 78, 150 86 C 190 91, 230 84, 275 62 C 315 43, 355 22, 393 13 L 393 110 L 0 110 Z"
          fill="#E8ECFB"
        />
      </svg>
    </div>
  );
}
