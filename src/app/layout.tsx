import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Waffle Forever - Random Offer Generator",
  description: "Get amazing offers from Waffle Forever - Free Waffles, Pancakes, and more!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
