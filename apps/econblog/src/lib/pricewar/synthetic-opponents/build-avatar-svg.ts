/** Parametric portrait SVG — one unique look per pool index (0–49). */
export function buildSyntheticAvatarSvg(index: number): string {
  const i = index % 50;
  const bgHue = (i * 41 + 210) % 360;
  const skinLight = 72 + (i % 9);
  const skinChroma = 0.04 + (i % 5) * 0.008;
  const skinHue = 48 + (i % 18);
  const hairHue = (i * 23) % 360;
  const hairChroma = i % 3 === 0 ? 0.02 : 0.08;
  const shirtHue = (i * 57 + 120) % 360;
  const hairStyle = i % 4;
  const glasses = i % 7 === 0;

  const hairPath =
    hairStyle === 0
      ? `<path d="M 30 36 C 30 22, 70 22, 70 36 L 70 40 L 30 40 Z" fill="oklch(0.22 0.04 ${hairHue})"/>`
      : hairStyle === 1
        ? `<path d="M 28 50 C 28 38, 34 32, 38 32 L 38 36 C 33 38, 30 44, 30 52 Z" fill="oklch(0.88 0.01 55)"/>
           <path d="M 72 50 C 72 38, 66 32, 62 32 L 62 36 C 67 38, 70 44, 70 52 Z" fill="oklch(0.88 0.01 55)"/>
           <path d="M 30 42 C 30 36, 36 32, 42 32 L 58 32 C 64 32, 70 36, 70 42 C 66 38, 60 36, 50 36 C 40 36, 34 38, 30 42 Z" fill="oklch(0.22 0.04 ${hairHue})"/>`
        : hairStyle === 2
          ? `<path d="M 30 40 C 30 22, 70 22, 70 40" fill="none" stroke="oklch(0.28 0.03 ${hairHue})" stroke-width="3" stroke-linecap="round"/>`
          : `<rect x="22" y="40" width="8" height="12" rx="3" fill="oklch(0.28 0.03 ${hairHue})"/>
             <rect x="70" y="40" width="8" height="12" rx="3" fill="oklch(0.28 0.03 ${hairHue})"/>
             <path d="M 30 36 C 30 22, 70 22, 70 36 L 70 40 L 30 40 Z" fill="oklch(0.22 0.04 ${hairHue})"/>`;

  const glassesMarkup = glasses
    ? `<circle cx="40" cy="50" r="5" fill="none" stroke="#111" stroke-width="1.4"/>
       <circle cx="60" cy="50" r="5" fill="none" stroke="#111" stroke-width="1.4"/>
       <path d="M 45 50 L 55 50" stroke="#111" stroke-width="1.4"/>`
    : `<circle cx="43" cy="48" r="1.6" fill="#111"/>
       <circle cx="57" cy="48" r="1.6" fill="#111"/>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" role="img" aria-hidden="true">
  <rect width="100" height="100" rx="14" fill="oklch(0.66 0.09 ${bgHue})"/>
  <path d="M 18 96 C 22 72, 78 72, 82 96 L 82 100 L 18 100 Z" fill="oklch(0.30 0.06 ${shirtHue})"/>
  <path d="M 45 76 L 50 92 L 55 76 Z" fill="oklch(0.92 0.02 ${shirtHue})"/>
  <rect x="44" y="58" width="12" height="14" fill="oklch(${skinLight} ${skinChroma} ${skinHue})"/>
  <ellipse cx="50" cy="46" rx="20" ry="22" fill="oklch(${skinLight} ${skinChroma} ${skinHue})"/>
  ${hairPath}
  ${glassesMarkup}
  <path d="M 44 58 Q 50 62, 56 58" fill="none" stroke="#111" stroke-width="1.4" stroke-linecap="round"/>
</svg>`;
}

export function syntheticAvatarPath(id: string): string {
  return `/pricewar/synthetic-avatars/${id}.svg`;
}
