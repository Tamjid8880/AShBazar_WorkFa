import "./globals.css";
import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import AuthProvider from "@/components/auth-provider";

const inter = Poppins({
  subsets:  ["latin"],
  weight:   ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins",
  display:  "swap",
});

const interBody = Inter({
  subsets:  ["latin"],
  variable: "--font-inter",
  display:  "swap",
});

export const metadata: Metadata = {
  title: {
    default:  "AshBazar — Fresh Grocery Store",
    template: "%s | AshBazar",
  },
  description: "Shop fresh vegetables, fruits, meat, dairy and more at AshBazar. Quality groceries delivered fast to your door.",
  keywords:    ["grocery", "fresh food", "organic", "vegetables", "fruits", "delivery"],
  openGraph: {
    type:        "website",
    siteName:    "AshBazar",
    title:       "AshBazar — Fresh Grocery Store",
    description: "Quality groceries delivered to your door.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${interBody.variable}`} suppressHydrationWarning>
      <body className="min-h-screen font-sans antialiased" suppressHydrationWarning>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
