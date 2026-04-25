import { redirect } from "next/navigation";

// /products redirects to /shop — the "Product" nav link
export default function ProductsIndexPage() {
  redirect("/shop");
}
