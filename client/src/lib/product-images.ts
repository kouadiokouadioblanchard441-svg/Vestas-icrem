export function getProductFallbackImage(name?: string | null): string {
  const normalizedName = (name || "").toLowerCase();
  if (normalizedName.includes("asus")) return "/products/asus-prime-z590-p.svg";
  if (normalizedName.includes("intel")) return "/products/intel-core-i3-h510m-k.svg";
  return "/products/device-fallback.svg";
}