import type { Metadata } from "next";
import type { ReactNode } from "react";
import "../redesign.css";

export const metadata: Metadata = {
  title: {
    default: "Gallo — AI Product & Product Design",
    template: "%s — Gallo",
  },
  description:
    "Gallo designs how AI enters human life through Joi, Joi Map, and product experiments at the boundary of technology and people.",
  metadataBase: new URL("https://gallo233.github.io/joi-doorway"),
  openGraph: {
    title: "Gallo — AI Product & Product Design",
    description: "I design how AI enters human life.",
    images: ["/media/gallo-home-brief.png"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
