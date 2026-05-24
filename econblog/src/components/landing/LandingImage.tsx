import Image, { type ImageProps } from "next/image";

type LandingImageProps = Omit<ImageProps, "alt"> & {
  alt?: string;
  src: string;
};

/** Optimized landing image — skips the optimizer for inline data URLs. */
export function LandingImage({
  src,
  alt = "",
  quality = 75,
  ...props
}: LandingImageProps) {
  const isDataUrl = src.startsWith("data:");

  return (
    <Image
      src={src}
      alt={alt}
      quality={quality}
      unoptimized={isDataUrl}
      {...props}
    />
  );
}
