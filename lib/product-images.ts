export type ProductImageRow = { image?: number; url?: string };

export function parseProductImages(images: unknown): ProductImageRow[] {
  if (!Array.isArray(images)) return [];
  return images.filter((row) => row && typeof row === "object") as ProductImageRow[];
}

export function firstProductImageUrl(images: unknown): string | null {
  const rows = parseProductImages(images);
  const url = rows.find((r) => r.url)?.url;
  return url && typeof url === "string" ? url : null;
}
