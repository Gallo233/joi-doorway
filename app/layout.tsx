import type { Metadata } from "next";
import type { ReactNode } from "react";
import "../styles.css";

export const metadata: Metadata = {
  title: "All Joi Doorway",
  description:
    "All Joi Doorway - cinematic entrance and interactive Joi ecosystem studio.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body data-state="phoneHome">{children}</body>
    </html>
  );
}
