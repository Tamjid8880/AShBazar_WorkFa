export type CartLine = {
  lineId: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  variantId?: string | null;
  variantLabel?: string;
  imageUrl?: string | null;
};
