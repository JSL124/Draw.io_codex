import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "AI Diagram Generator",
  description:
    "Describe a system in natural language and generate a draw.io diagram response."
};

type RootLayoutProps = Readonly<{
  children: React.ReactNode;
}>;

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
