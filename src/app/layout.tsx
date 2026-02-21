import type { Metadata } from "next";
import { Lato } from "next/font/google"; 
import "./globals.css";

const lato = Lato({
    subsets: ["latin"],
    weight: ["700"],
});

export const metadata = {
  title: "SeedMoney",
  description: "SeedMoney's Grant Application/Campaign Generator Application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${lato} ${lato} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
