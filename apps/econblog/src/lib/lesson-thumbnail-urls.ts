/** Optimized WebP served from public/carousel — run sync:carousel after publishing. */
export function catalogThumbnailPath(lessonId: string): string {
  return `/carousel/${lessonId}.webp`;
}
