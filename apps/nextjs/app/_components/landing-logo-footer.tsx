import Image from "next/image";

export function LandingLogoFooter({
  width = 107,
  height = 67,
}: {
  width?: number;
  height?: number;
}) {
  return (
    <Image
      src="/landing/logo-footer.svg"
      alt="homecaf\u00e9"
      width={width}
      height={height}
      priority
    />
  );
}
